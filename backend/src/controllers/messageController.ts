import { Response } from 'express';
import Message from '../models/Message';
import Room from '../models/Room';
import User from '../models/User';
import RoomMembership from '../models/RoomMembership';
import { AuthRequest } from '../middlewares/auth';
import { getIO } from '../socket';

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
        const isMember = await RoomMembership.exists({ room: roomId, user: user._id });
        if (!isMember) {
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
        await message.populate('sender', 'displayName photoURL');

        // Emit to room
        try {
            const io = getIO();
            io.to(roomId).emit('new_message', message);
        } catch (err) {
            console.error('Socket emit failed:', err);
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

        const isMember = await RoomMembership.exists({ room: roomId, user: user._id });
        if (!isMember) {
            res.status(403).json({ error: 'Not authorized to view messages in this room' });
            return;
        }

        const messages = await Message.find({ room: roomId })
            .sort({ createdAt: 1 }) // Check client needs. Usually ascending for chat log
            .limit(limit)
            .populate('sender', 'displayName photoURL');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
