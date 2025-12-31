import { Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import RoomMembership from '../models/RoomMembership.js';
import { AuthRequest } from '../middlewares/auth.js';
import { getIO } from '../socket.js';
import { createNotification } from './notificationController.js';
import RedisService from '../services/RedisService.js';

// Send Message
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        let { roomId } = req.params;
        const { content, type } = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Resolve Room ID (Handle Slug)
        const mongoose = await import('mongoose');
        let roomDoc = null;
        if (mongoose.isValidObjectId(roomId)) {
            roomDoc = await Room.findById(roomId);
        }
        if (!roomDoc) {
            roomDoc = await Room.findOne({ slug: roomId });
        }

        if (!roomDoc) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }
        const realRoomId = roomDoc._id.toString();

        // Check Local Membership
        const isCreator = roomDoc.createdBy.equals(user._id);
        const isMember = await RoomMembership.exists({ room: realRoomId, user: user._id });

        if (!isMember && !isCreator) {
            res.status(403).json({ error: 'Not a member of this room' });
            return;
        }

        const message = await Message.create({
            room: realRoomId,
            sender: user._id,
            content,
            type: type || 'text',
        });

        // Update room's last activity
        await Room.findByIdAndUpdate(realRoomId, { lastMessageAt: new Date() });

        // Populate sender for immediate frontend display
        await message.populate('sender', 'displayName photoURL firebaseUid username');

        // Redis: Invalidate message cache for this room
        await RedisService.del(`messages:${realRoomId}`);

        // Emit to room
        try {
            const io = getIO();
            io.to(realRoomId).emit('new_message', message);

            // Notify offline / inactive members
            const memberships = await RoomMembership.find({ room: realRoomId, user: { $ne: user._id } });

            // Mention Logic
            const mentionedUserIds = new Set<string>();
            const contentLower = content.toLowerCase();

            // 1. Check for @all
            if (contentLower.includes('@all')) {
                memberships.forEach(m => mentionedUserIds.add(m.user.toString()));
            } else {
                // 2. Check for specific @username
                const mentionRegex = /@([\w.-]+)/g;
                let match;
                const potentialUsernames: string[] = [];
                while ((match = mentionRegex.exec(content)) !== null) {
                    potentialUsernames.push(match[1]);
                }

                if (potentialUsernames.length > 0) {
                    const foundUsers = await User.find({ username: { $in: potentialUsernames } });
                    foundUsers.forEach(u => {
                        const isMember = memberships.some(m => m.user.toString() === u._id.toString());
                        if (isMember) {
                            mentionedUserIds.add(u._id.toString());
                        }
                    });
                }
            }

            for (const member of memberships) {
                const recipient = await User.findById(member.user);
                if (recipient) {
                    const isMentioned = mentionedUserIds.has(member.user.toString());

                    const notifType = isMentioned ? 'mention' : 'new_message';
                    const notifTitle = isMentioned
                        ? `${user.displayName} mentioned you in ${roomDoc.name}`
                        : `New Message from ${user.displayName}`;

                    const linkId = roomDoc.slug || realRoomId;

                    await createNotification(
                        recipient.firebaseUid,
                        user.firebaseUid,
                        notifType,
                        notifTitle,
                        message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                        `/circles/${linkId}`
                    );
                }
            }
        } catch (err) {
            console.error('Socket/Notification failed:', err);
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get Messages
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const before = req.query.before as string; // Timestamp ISO string

        // Enforce membership check for viewing messages
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Resolve Room ID (Handle Slug, ensuring cache key is always ID)
        const mongoose = await import('mongoose');
        let realRoomId = roomId;

        if (!mongoose.isValidObjectId(roomId)) {
            const r = await Room.findOne({ slug: roomId });
            if (!r) {
                return res.status(404).json({ error: 'Room not found' });
            }
            realRoomId = r._id.toString();
        }

        // Validate membership
        const roomDoc = await Room.findById(realRoomId);
        if (!roomDoc) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const isCreator = roomDoc.createdBy.equals(user._id);
        const isMember = await RoomMembership.exists({ room: realRoomId, user: user._id });

        if (!isMember && !isCreator) {
            res.status(403).json({ error: 'Not authorized to view messages in this room' });
            return;
        }

        // Cache Logic (Use realRoomId)
        const cacheKey = `messages:${realRoomId}`;
        /* 
           Ideally, we might want to cache by query params too if 'limit' changes often, 
           but usually the "latest chunk" is standard. 
        */
        if (!before) {
            const cachedMessages = await RedisService.get<any[]>(cacheKey);
            if (cachedMessages) {
                res.json(cachedMessages);
                return;
            }
        }

        // Build Query
        const query: any = { room: realRoomId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 }) // Get newest first (or newest before cursor)
            .limit(limit)
            .populate('sender', 'displayName photoURL firebaseUid username') // Include username for mentions
            .populate('readBy.user', 'displayName photoURL username'); // Include reader details

        // Reorder to ASC for frontend display
        const orderedMessages = messages.reverse();

        // Cache only the latest chunk (no cursor)
        if (!before) {
            await RedisService.set(cacheKey, orderedMessages, 3600);
        }

        res.json(orderedMessages);
    } catch (error) {
        console.error('Fetch messages failed:', error);
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Mark all messages in a room as read
export const markRoomAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { roomId } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Resolve slug to real ID
        let realRoomId = roomId;
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            const r = await Room.findOne({ slug: roomId });
            if (!r) {
                return res.status(404).json({ error: 'Room not found' });
            }
            realRoomId = r._id.toString();
        }

        // Validate membership or ownership using realRoomId
        const roomDoc = await Room.findById(realRoomId);
        if (!roomDoc) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }
        const isCreator = roomDoc.createdBy.equals(user._id);
        const isMember = await RoomMembership.exists({ room: realRoomId, user: user._id });
        if (!isMember && !isCreator) {
            res.status(403).json({ error: 'Not authorized' });
            return;
        }

        const now = new Date();

        // Update messages where user is NOT in readBy
        await Message.updateMany(
            { room: realRoomId, 'readBy.user': { $ne: user._id } },
            {
                $addToSet: {
                    readBy: { user: user._id, readAt: now }
                }
            }
        );

        // Emit event
        try {
            const io = getIO();
            io.to(realRoomId).emit('messages_read', {
                roomId: realRoomId,
                userId: uid,
                readAt: now
            });
        } catch (e) {
            console.error('Socket emit failed:', e);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("markRoomAsRead error:", error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};
// Typing Indicators (REST)
export const startTyping = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { roomId } = req.params;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Resolve slug to real ID for socket room
        let realRoomId = roomId;
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            const r = await Room.findOne({ slug: roomId });
            if (r) realRoomId = r._id.toString();
        }

        // Emit socket event via Redis Adapter to all instances
        const io = getIO();
        io.to(realRoomId).emit('typing', {
            roomId: realRoomId,
            userId: uid,
            userName: user.displayName
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Typing error:', error);
        res.status(500).json({ error: 'Failed to set typing state' });
    }
};

export const stopTyping = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { roomId } = req.params;

        // Resolve slug to real ID for socket room
        let realRoomId = roomId;
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            const r = await Room.findOne({ slug: roomId });
            if (r) realRoomId = r._id.toString();
        }

        // Emit socket event
        const io = getIO();
        io.to(realRoomId).emit('stop_typing', {
            roomId: realRoomId,
            userId: uid
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Stop typing error:', error);
        res.status(500).json({ error: 'Failed to stop typing' });
    }
};

export const updateMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { messageId } = req.params;
        const { content } = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404).json({ error: 'Message not found' });
            return;
        }

        // Only sender can edit
        if (message.sender.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'Not authorized to edit this message' });
            return;
        }

        message.content = content;
        // Optionally mark as edited: message.isEdited = true;
        await message.save();

        // Emit update
        try {
            // Populate sender for consistency in frontend updates
            await message.populate('sender', 'displayName photoURL firebaseUid username');
            const io = getIO();
            io.to(message.room.toString()).emit('message_updated', message);

            // Redis: Invalidate message cache for this room
            await RedisService.del(`messages:${message.room.toString()}`);
        } catch (e) { console.error('Socket emit failed:', e); }

        res.json(message);
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { messageId } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404).json({ error: 'Message not found' });
            return;
        }

        // Only sender can delete (for now)
        if (message.sender.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'Not authorized to delete this message' });
            return;
        }

        const roomId = message.room.toString();
        await Message.deleteOne({ _id: messageId });

        // Emit delete
        try {
            const io = getIO();
            io.to(roomId).emit('message_deleted', { messageId, roomId });

            // Redis: Invalidate message cache
            await RedisService.del(`messages:${roomId}`);
        } catch (e) { console.error('Socket emit failed:', e); }

        res.json({ message: 'Message deleted' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
