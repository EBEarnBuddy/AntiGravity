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

// Get All Rooms (Protected, injects membership info)
export const getRooms = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        console.log(`🔥 API HIT: GET /rooms (All) for UID: ${uid}`);
        const user = await User.findOne({ firebaseUid: uid });

        // Fetch all rooms
        // We use .lean() if possible for performance, but basic find is okay.
        // We need to return a plain object to attach 'members' property if it's not in schema.
        const roomsDocs = await Room.find().sort({ lastMessageAt: -1, createdAt: -1 });

        if (!user) {
            // If for some reason user not found, just return rooms without membership info
            res.json(roomsDocs);
            return;
        }

        // Fetch all memberships for this user
        const memberships = await RoomMembership.find({ user: user._id });
        const memberRoomIds = new Set(memberships.map(m => m.room.toString()));

        // Transform response to include a 'members' array mock if the user is a member
        // This satisfies the frontend check: room.members.includes(currentUser.uid)
        const roomsWithMembership = roomsDocs.map(room => {
            const roomObj = room.toObject();
            const isMember = memberRoomIds.has(room._id.toString());

            // We inject the CURRENT user's firebaseUid into the members array if they are a member.
            // This is a minimal implementation to satisfy the frontend requirement.
            // Realistically, the frontend should probably check a 'membershipStatus' field,
            // but we are adhering to the existing frontend logic.
            return {
                ...roomObj,
                members: isMember ? [uid] : [], // Inject UID if member
                // pendingMembers can be handled similarly if we had a request model
            };
        });

        res.json(roomsWithMembership);
    } catch (error) {
        console.error("Error fetching rooms:", error);
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
