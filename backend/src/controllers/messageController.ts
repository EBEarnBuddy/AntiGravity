import { Response } from 'express';
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
        const { roomId } = req.params;
        const { content, type } = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check membership
        // Optimization: Cache room membership check? For now, keep DB check for security.
        const roomDoc = await Room.findById(roomId);
        if (!roomDoc) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const isCreator = roomDoc.createdBy.equals(user._id);
        const isMember = await RoomMembership.exists({ room: roomId, user: user._id });

        if (!isMember && !isCreator) {
            res.status(403).json({ error: 'Not a member of this room' });
            return;
        }

        const message = await Message.create({
            room: roomId,
            sender: user._id,
            content,
            type: type || 'text',
        });

        // Update room's last activity
        await Room.findByIdAndUpdate(roomId, { lastMessageAt: new Date() });

        // Populate sender for immediate frontend display
        await message.populate('sender', 'displayName photoURL firebaseUid');

        // Redis: Invalidate message cache for this room
        await RedisService.del(`messages:${roomId}`);

        // Emit to room
        try {
            const io = getIO();
            io.to(roomId).emit('new_message', message);

            // Notify offline / inactive members
            const memberships = await RoomMembership.find({ room: roomId, user: { $ne: user._id } });

            // Mention Logic
            const mentionedUserIds = new Set<string>();
            const contentLower = content.toLowerCase();

            // 1. Check for @all
            if (contentLower.includes('@all')) {
                memberships.forEach(m => mentionedUserIds.add(m.user.toString()));
            } else {
                // 2. Check for specific @username
                // Regex to find @username (alphanumeric + underscores usually)
                const mentionRegex = /@(\w+)/g;
                let match;
                const potentialUsernames: string[] = [];
                while ((match = mentionRegex.exec(content)) !== null) {
                    potentialUsernames.push(match[1]);
                }

                if (potentialUsernames.length > 0) {
                    const foundUsers = await User.find({ username: { $in: potentialUsernames } });
                    foundUsers.forEach(u => {
                        // verify they are actually in the room?
                        // For a closed circle, yes. For public, maybe not strictly needed but good practice.
                        // Let's filtered by existing memberships to be safe and avoid notifying non-members.
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
                        : `New Message from ${user.displayName}`; // This title might be overwritten by aggregation logic for 'new_message'

                    await createNotification(
                        recipient.firebaseUid,
                        user.firebaseUid,
                        notifType,
                        notifTitle,
                        message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                        `/circles/${roomId}`
                    );

                    // Note: createNotification handles the socket emit internally now
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
        // Pagination (simple setup)
        const limit = 50;

        // Enforce membership check for viewing messages
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Redis: Check Cache
        // Cache key: messages:{roomId}
        // Note: Caching with limit logic is tricky. Simplest is to cache the default page (last 50).
        const cacheKey = `messages:${roomId}`;
        const cachedMessages = await RedisService.get<any[]>(cacheKey);

        const roomDoc = await Room.findById(roomId);
        if (!roomDoc) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const isCreator = roomDoc.createdBy.equals(user._id);
        const isMember = await RoomMembership.exists({ room: roomId, user: user._id });

        if (!isMember && !isCreator) {
            res.status(403).json({ error: 'Not authorized to view messages in this room' });
            return;
        }

        if (cachedMessages) {
            // console.log(`[Cache] Hit for ${cacheKey}`);
            res.json(cachedMessages);
            return;
        }

        const messages = await Message.find({ room: roomId })
            .sort({ createdAt: 1 }) // Check client needs. Usually ascending for chat log
            .limit(limit)
            .populate('sender', 'displayName photoURL firebaseUid');

        // Cache for 1 hour (auto invalidates on new message)
        await RedisService.set(cacheKey, messages, 3600);

        res.json(messages);
    } catch (error) {
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

        // Validate membership or ownership
        const roomDoc = await Room.findById(roomId);
        if (!roomDoc) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }
        const isCreator = roomDoc.createdBy.equals(user._id);
        const isMember = await RoomMembership.exists({ room: roomId, user: user._id });
        if (!isMember && !isCreator) {
            res.status(403).json({ error: 'Not authorized' });
            return;
        }

        const now = new Date();

        // Update messages where user is NOT in readBy
        await Message.updateMany(
            { room: roomId, 'readBy.user': { $ne: user._id } },
            {
                $addToSet: {
                    readBy: { user: user._id, readAt: now }
                }
            }
        );

        // Emit event
        try {
            const io = getIO();
            io.to(roomId).emit('messages_read', {
                roomId,
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

        // Emit socket event via Redis Adapter to all instances
        const io = getIO();
        io.to(roomId).emit('typing', {
            roomId,
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

        // Emit socket event
        const io = getIO();
        io.to(roomId).emit('stop_typing', {
            roomId,
            userId: uid
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Stop typing error:', error);
        res.status(500).json({ error: 'Failed to stop typing' });
    }
};
