import { Request, Response } from 'express';
import Room from '../models/Room';
import RoomMembership from '../models/RoomMembership';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Create a Room
export const createRoom = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { name, description, isPrivate, icon } = req.body;

        const room = await Room.create({
            name,
            description,
            isPrivate: !!isPrivate,
            icon,
            createdBy: user._id,
            membersCount: 1, // Creator is first member
        });

        // Add creator as admin member
        await RoomMembership.create({
            room: room._id,
            user: user._id,
            role: 'admin',
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create room' });
    }
};

// Join a Room
export const joinRoom = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { roomId } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const membership = await RoomMembership.findOne({ room: roomId, user: user._id });
        if (membership) {
            res.status(400).json({ error: 'Already a member' });
            return;
        }

        await RoomMembership.create({
            room: roomId,
            user: user._id,
            role: 'member',
        });

        // Increment count
        await Room.findByIdAndUpdate(roomId, { $inc: { membersCount: 1 } });

        res.status(200).json({ message: 'Joined successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join room' });
    }
};

// Get All Rooms
export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await Room.find().sort({ lastMessageAt: -1, createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Get My Rooms
export const getMyRooms = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const memberships = await RoomMembership.find({ user: user._id }).populate('room');
        // Extract room objects
        const rooms = memberships.map(m => m.room);

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
