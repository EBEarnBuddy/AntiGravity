import { Response } from 'express';
import Message from '../models/Message';
import Room from '../models/Room';
import User from '../models/User';
import RoomMembership from '../models/RoomMembership';
import { AuthRequest } from '../middlewares/auth';
import { getIO } from '../socket';
import { createNotification } from './notificationController';

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

        // Emit to room
        try {
            const io = getIO();
            io.to(roomId).emit('new_message', message);

            // Notify offline / inactive members
            // For MVP, we notify all OTHER members. 
            // In a real app, we'd check if they are currently connected to the socket room.
            const memberships = await RoomMembership.find({ room: roomId, user: { $ne: user._id } });

            for (const member of memberships) {
                const recipient = await User.findById(member.user);
                if (recipient) {
                    // Provide a generic title or room name if possible
                    await createNotification(
                        recipient.firebaseUid,
                        user.firebaseUid,
                        'new_message',
                        `New Message from ${user.displayName}`,
                        message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                        `/rooms/${roomId}`
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
        // Pagination (simple setup)
        const limit = 50;

        // Enforce membership check for viewing messages
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

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

        const messages = await Message.find({ room: roomId })
            .sort({ createdAt: 1 }) // Check client needs. Usually ascending for chat log
            .limit(limit)
            .populate('sender', 'displayName photoURL firebaseUid');

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
