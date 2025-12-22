import { Request, Response } from 'express';
import Room from '../models/Room';
import RoomMembership from '../models/RoomMembership';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { getIO } from '../socket';

// Create a Room
export const createRoom = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { name, description, isPrivate, icon, avatar } = req.body;

        const room = await Room.create({
            name,
            description,
            isPrivate: !!isPrivate,
            avatar: avatar || icon, // Map to schema's avatar field
            createdBy: user._id,
            membersCount: 1, // Creator is first member
        });

        if (!room) {
            throw new Error('Failed to create room doc');
        }

        // Add creator as admin member with accepted status
        await RoomMembership.create({
            room: room._id,
            user: user._id,
            role: 'admin',
            status: 'accepted',
        });

        // Realtime: Emit event
        try {
            const io = getIO();
            io.emit('room_created', room);
        } catch (err) {
            console.error('Socket emission failed:', err);
        }

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create room' });
    }
};

// Join a Room (Creates pending membership request)
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
            if (membership.status === 'pending') {
                res.status(400).json({ error: 'Request already pending' });
                return;
            }
            if (membership.status === 'accepted') {
                res.status(400).json({ error: 'Already a member' });
                return;
            }
            // If rejected, allow re-requesting by updating status
            membership.status = 'pending';
            await membership.save();

            // Emit socket event for re-request
            try {
                const io = getIO();
                io.emit('membership_created', {
                    roomId,
                    userId: uid, // Use firebaseUid for easier frontend handling
                    status: 'pending'
                });
            } catch (e) { console.error(e) }

            res.status(200).json({ message: 'Request sent', status: 'pending' });
            return;
        }

        // Create pending membership request
        await RoomMembership.create({
            room: roomId,
            user: user._id,
            role: 'member',
            status: 'pending',
        });

        // Emit socket event for new request
        try {
            const io = getIO();
            io.emit('membership_created', {
                roomId,
                userId: uid,
                status: 'pending'
            });
        } catch (e) { console.error(e) }

        res.status(200).json({ message: 'Request sent', status: 'pending' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join room' });
    }
};

// Get All Rooms (Protected, injects membership info)
export const getRooms = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { type } = req.query; // Filter by type: community, collab, opportunity

        console.log(`🔥 API HIT: GET /rooms (All) for UID: ${uid}, type: ${type || 'all'}`);
        const user = await User.findOne({ firebaseUid: uid });

        // Build query filter
        const filter: any = {
            isPrivate: false
        };

        // Add type filter if specified
        if (type && ['community', 'collab', 'opportunity'].includes(type as string)) {
            filter.type = type;
        } else if (!type) {
            // Default: exclude opportunity circles unless explicitly requested
            filter.type = { $ne: 'opportunity' };
        }

        // Fetch rooms based on filter
        const roomsDocs = await Room.find(filter).sort({ lastMessageAt: -1, createdAt: -1 });

        if (!user) {
            // If for some reason user not found, just return rooms without membership info
            res.json(roomsDocs);
            return;
        }

        // Fetch all memberships for this user
        const memberships = await RoomMembership.find({ user: user._id });
        const memberRoomIds = new Set(memberships.filter(m => m.status === 'accepted').map(m => m.room.toString()));
        const pendingRoomIds = new Set(memberships.filter(m => m.status === 'pending').map(m => m.room.toString()));

        // Map rooms with membership info (without expensive per-room queries)
        const roomsWithMembership = roomsDocs.map((room) => {
            const roomObj = room.toObject();
            const isMember = memberRoomIds.has(room._id.toString());
            const isPending = pendingRoomIds.has(room._id.toString());


            return {
                ...roomObj,
                members: isMember ? [uid] : [],
                pendingMembers: isPending ? [uid] : [],
                memberCount: roomObj.membersCount || 0
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

        // Only get accepted memberships
        const memberships = await RoomMembership.find({
            user: user._id,
            status: 'accepted'
        }).populate('room');

        // Extract room objects and add createdByUid
        const rooms = await Promise.all(memberships
            .filter(m => m.room !== null && m.room !== undefined)
            .map(async (m) => {
                const room = (m.room as any).toObject();

                // Get creator's Firebase UID
                const creator = await User.findById(room.createdBy);

                return {
                    ...room,
                    createdByUid: creator?.firebaseUid || null,
                    id: room._id
                };
            }));

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Get Pending Requests for a Room (Owner/Admin only)
export const getPendingRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { roomId } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if user is the room creator OR has admin role
        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const isCreator = room.createdBy.toString() === user._id.toString();

        // If creator, allow access immediately
        if (isCreator) {
            // Continue to fetch pending requests
        } else {
            // Check if user has admin role
            const adminMembership = await RoomMembership.findOne({
                room: roomId,
                user: user._id,
                role: 'admin',
                status: 'accepted'
            });

            if (!adminMembership) {
                res.status(403).json({ error: 'Only room admins can view pending requests' });
                return;
            }
        }

        // Fetch pending memberships with user details
        const pendingRequests = await RoomMembership.find({
            room: roomId,
            status: 'pending'
        }).populate('user');

        res.json(pendingRequests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
};

// Approve or Reject Membership Request (Owner/Admin only)
export const updateMembershipStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { roomId, userId } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            res.status(400).json({ error: 'Invalid status. Must be "accepted" or "rejected"' });
            return;
        }

        const adminUser = await User.findOne({ firebaseUid: uid });
        if (!adminUser) {
            res.status(404).json({ error: 'Admin user not found' });
            return;
        }

        // Check if requester is the room creator OR has admin role
        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const isCreator = room.createdBy.toString() === adminUser._id.toString();
        const adminMembership = await RoomMembership.findOne({
            room: roomId,
            user: adminUser._id,
            role: 'admin',
            status: 'accepted'
        });

        if (!isCreator && !adminMembership) {
            res.status(403).json({ error: 'Only room admins can approve/reject requests' });
            return;
        }

        // Find the target user
        const targetUser = await User.findOne({ firebaseUid: userId });
        if (!targetUser) {
            res.status(404).json({ error: 'Target user not found' });
            return;
        }

        // Find and update the membership
        const membership = await RoomMembership.findOne({
            room: roomId,
            user: targetUser._id,
            status: 'pending'
        });

        if (!membership) {
            res.status(404).json({ error: 'Pending request not found' });
            return;
        }

        membership.status = status as 'accepted' | 'rejected';
        await membership.save();

        // If accepted, increment member count
        if (status === 'accepted') {
            await Room.findByIdAndUpdate(roomId, { $inc: { membersCount: 1 } });
        }

        // Emit socket event
        try {
            const io = getIO();
            io.emit('membership_updated', {
                roomId,
                userId: userId, // target user's firebaseUid
                status,
                adminUid: uid
            });
        } catch (e) {
            console.error('Socket emit failed:', e);
        }

        res.json({ message: `Request ${status}`, membership });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update membership status' });
    }
};
