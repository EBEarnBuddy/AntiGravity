import { Request, Response } from 'express';
import Room from '../models/Room.js';
import RoomMembership from '../models/RoomMembership.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { AuthRequest } from '../middlewares/auth.js';
import { getIO } from '../socket.js';
import RedisService from '../services/RedisService.js';

// Helper to generate slug
const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ''); // Trim hyphens
};

// Create a Room
export const createRoom = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { name, description, isPrivate, icon, avatar, slug } = req.body;

        let finalSlug = slug || generateSlug(name);
        // Ensure uniqueness roughly (in production, we'd loop or catch error, here we'll append random if not provided or just let mongo error if provided)
        // Simple collision avoidance for auto-generated
        if (!slug) {
            const existing = await Room.findOne({ slug: finalSlug });
            if (existing) {
                finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
            }
        }

        const room = await Room.create({
            name,
            slug: finalSlug,
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

        // Redis: Invalidate generic room lists because a new public room might appear
        // Better: Only invalidate if !isPrivate. But simplistic approach for now:
        await RedisService.delPattern('rooms:*');

        // Realtime: Emit event
        try {
            const io = getIO();
            io.emit('room_created', room);
        } catch (err) {
            console.error('Socket emission failed:', err);
        }

        res.status(201).json(room);
    } catch (error) {
        if ((error as any).code === 11000) { // Duplicate key
            res.status(400).json({ error: 'Circle Link ID (Slug) already exists. Please choose another.' });
            return;
        }
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

        // Create membership
        // Always 'pending' as per new requirement (Request-Approval flow)
        const status = 'pending';

        await RoomMembership.create({
            room: roomId,
            user: user._id,
            role: 'member',
            status: status,
        });

        // Redis: Invalidate user's room list/metadata caches?
        // Pending requests usually don't show on main list unless accepted.
        // But let's be safe if we cache "my requests".
        // For 'getRooms', we look up membership info, so new pending request changes that output.
        // Cache key for getRooms includes UID. So invalidate THAT user's cache.
        await RedisService.delPattern(`rooms:${uid}:*`);

        // Emit socket event for new request
        try {
            const io = getIO();
            io.emit('membership_created', {
                roomId,
                userId: uid,
                status: 'pending'
            });

            // Notify Room Owner/Admins
            const roomOwner = await RoomMembership.findOne({ room: roomId, role: 'admin' }).populate('user');
            if (roomOwner && roomOwner.user) {
                const { createNotification } = await import('./notificationController.js');
                await createNotification(
                    (roomOwner.user as any).firebaseUid,
                    user.firebaseUid,
                    'join_request',
                    'New Join Request',
                    `${user.displayName} wants to join ${room.name}`,
                    `/circles/${roomId}`
                );

                // Realtime Notification to owner
                io.to(`user:${(roomOwner.user as any).firebaseUid}`).emit('notification:new', {
                    title: 'New Join Request',
                    body: `${user.displayName} wants to join ${room.name}`,
                    link: `/circles/${roomId}`,
                    type: 'join_request'
                });
            }

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

        // console.log(`🔥 API HIT: GET /rooms (All) for UID: ${uid}, type: ${type || 'all'}`);

        // Redis Cache Check
        const cacheKey = `rooms:${uid}:${type || 'all'}`;
        const cachedRooms = await RedisService.get(cacheKey);

        if (cachedRooms) {
            // console.log(`[Cache] Hit for ${cacheKey}`);
            res.json(cachedRooms);
            return;
        }

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            // If for some reason user not found, just return empty?
            // Fetch rooms based on filter without membership info fallback
            const filter: any = { isPrivate: false };
            if (type && ['community', 'collab', 'opportunity'].includes(type as string)) {
                filter.type = type;
            } else if (!type) {
                filter.type = { $ne: 'opportunity' };
            }
            const roomsDocs = await Room.find(filter).sort({ lastMessageAt: -1, createdAt: -1 });
            res.json(roomsDocs);
            return;
        }

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

        // Fetch all memberships for this user
        const memberships = await RoomMembership.find({ user: user._id });
        const memberRoomIds = new Set(memberships.filter(m => m.status === 'accepted').map(m => m.room.toString()));
        const pendingRoomIds = new Set(memberships.filter(m => m.status === 'pending').map(m => m.room.toString()));

        // Map rooms with membership info (without expensive per-room queries)
        const roomsWithMembership = roomsDocs.map((room) => {
            const roomObj = room.toObject();
            const isCreator = roomObj.createdBy.toString() === user._id.toString();
            // User is a member if they have an accepted membership OR they created the room
            const isMember = memberRoomIds.has(room._id.toString()) || isCreator;
            const isPending = pendingRoomIds.has(room._id.toString());

            return {
                ...roomObj,
                members: isMember ? [uid] : [],
                pendingMembers: isPending ? [uid] : [],
                memberCount: roomObj.membersCount || 0
            };
        });

        // Set Cache (5 minutes)
        await RedisService.set(cacheKey, roomsWithMembership, 300);

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

        const validMemberships = memberships.filter(m => m.room !== null && m.room !== undefined);

        if (validMemberships.length === 0) {
            res.json([]);
            return;
        }

        // Extract room IDs and creator IDs
        const roomIds = validMemberships.map(m => (m.room as any)._id);
        const creatorIds = validMemberships.map(m => (m.room as any).createdBy);

        // Batch query: Get all creators at once
        const creators = await User.find({ _id: { $in: creatorIds } });
        const creatorMap = new Map(creators.map(c => [c._id.toString(), c.firebaseUid]));

        // Batch query: Get all room memberships at once
        const allRoomMemberships = await RoomMembership.find({
            room: { $in: roomIds },
            status: 'accepted'
        }).populate('user');

        // Group memberships by room
        const membershipsByRoom = new Map<string, any[]>();
        allRoomMemberships.forEach(membership => {
            const roomId = membership.room.toString();
            if (!membershipsByRoom.has(roomId)) {
                membershipsByRoom.set(roomId, []);
            }
            membershipsByRoom.get(roomId)!.push(membership);
        });

        // Build room objects with members
        const rooms = validMemberships.map(m => {
            const room = (m.room as any).toObject();
            const roomId = room._id.toString();

            // Get creator UID from map
            const createdByUid = creatorMap.get(room.createdBy.toString()) || null;

            // Get member UIDs from grouped memberships
            const roomMemberships = membershipsByRoom.get(roomId) || [];
            const memberUids = roomMemberships
                .map(membership => (membership.user as any)?.firebaseUid)
                .filter(Boolean);

            // Find my membership for this room
            const myMembership = roomMemberships.find(m => (m.user as any)?.firebaseUid === uid);
            const myRole = myMembership?.role || 'member';

            return {
                ...room,
                createdByUid,
                members: memberUids,
                myRole,
                id: room._id
            };
        });

        res.json(rooms);
    } catch (error) {
        console.error('Error in getMyRooms:', error);
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Get Online Members (REST Wrapper for Socket Presence)
export const getOnlineMembers = async (req: AuthRequest, res: Response) => {
    try {
        const { roomId } = req.params;
        const io = getIO();

        // Fetch all sockets in this room across all instances (via Redis adapter)
        const sockets = await io.in(roomId).fetchSockets();

        // Extract user details
        const onlineUsers = sockets.map(s => s.data.userDetails).filter(u => u);

        // Deduplicate by userId
        const uniqueOnlineUsers = Array.from(new Map(onlineUsers.map(item => [item['userId'], item])).values());

        res.status(200).json(uniqueOnlineUsers);
    } catch (error) {
        console.error('Error fetching online members:', error);
        res.status(500).json({ error: 'Failed to fetch online members' });
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

        // If accepted, increment member count and send system message
        if (status === 'accepted') {
            await Room.findByIdAndUpdate(roomId, { $inc: { membersCount: 1 } });

            // Create system message
            try {
                const io = getIO();
                const content = `${targetUser.displayName} has joined the circle.`;
                const message = await Message.create({
                    room: roomId,
                    sender: targetUser._id,
                    content: content,
                    type: 'system'
                });

                io.to(roomId).emit('new_message', {
                    ...message.toObject(),
                    sender: {
                        _id: targetUser._id,
                        displayName: targetUser.displayName,
                        photoURL: targetUser.photoURL,
                        firebaseUid: targetUser.firebaseUid
                    }
                });
            } catch (e) { console.error('System message failed:', e); }
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

// Update Room Settings (Owner/Admin only)
export const updateRoom = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { roomId } = req.params;
        const { name, description, avatar, slug } = req.body;

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

        // Check if user is creator or admin
        const isCreator = room.createdBy.toString() === user._id.toString();
        const adminMembership = await RoomMembership.findOne({
            room: roomId,
            user: user._id,
            role: 'admin',
            status: 'accepted'
        });

        if (!isCreator && !adminMembership) {
            res.status(403).json({ error: 'Not authorized' });
            return;
        }

        if (name) room.name = name;
        if (description) room.description = description;
        if (avatar) room.avatar = avatar;
        if (slug) room.slug = slug;

        await room.save();

        res.json(room);
    } catch (error) {
        if ((error as any).code === 11000) { // Duplicate key
            res.status(400).json({ error: 'Circle Link ID (Slug) already exists.' });
            return;
        }
        res.status(500).json({ error: 'Failed to update room' });
    }
};

// Delete Room (Creator only)
export const deleteRoom = async (req: AuthRequest, res: Response) => {
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

        // Only creator can delete
        if (room.createdBy.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'Only the circle creator can delete it' });
            return;
        }

        await Room.deleteOne({ _id: roomId });
        await RoomMembership.deleteMany({ room: roomId });
        await Message.deleteMany({ room: roomId });

        res.json({ message: 'Room deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete room' });
    }
};

// Leave Room
export const leaveRoom = async (req: AuthRequest, res: Response) => {
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

        // Prevent creator from leaving (must delete instead)
        if (room.createdBy.toString() === user._id.toString()) {
            res.status(400).json({ error: 'Creators cannot leave their own circle. Delete it instead.' });
            return;
        }

        const deletion = await RoomMembership.findOneAndDelete({
            room: roomId,
            user: user._id,
            status: 'accepted' // Can only leave if accepted member
        });

        if (!deletion) {
            res.status(400).json({ error: 'Not a member' });
            return;
        }

        await Room.findByIdAndUpdate(roomId, { $inc: { membersCount: -1 } });

        // System message
        try {
            const io = getIO();
            const content = `${user.displayName} has left the circle.`;
            const message = await Message.create({
                room: roomId,
                sender: user._id,
                content: content,
                type: 'system'
            });

            // Emit new message
            io.to(roomId).emit('new_message', {
                ...message.toObject(),
                sender: {
                    _id: user._id,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    firebaseUid: user.firebaseUid
                }
            });

            // Emit membership update
            io.emit('membership_updated', {
                roomId,
                userId: uid,
                status: 'left'
            });

        } catch (e) { console.error('System message failed:', e); }

        res.json({ message: 'Left room' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to leave room' });
    }
};
// Get All Members of a Room
export const getRoomMembers = async (req: AuthRequest, res: Response) => {
    try {
        const { roomId } = req.params;

        // Fetch accepted memberships
        const memberships = await RoomMembership.find({
            room: roomId,
            status: 'accepted'
        }).populate('user', 'displayName photoURL username firebaseUid role bio');

        // Extract user objects
        const members = memberships.map(m => {
            const u = m.user as any;
            return {
                _id: u._id,
                uid: u.firebaseUid,
                username: u.username || u.displayName.replace(/\s+/g, '').toLowerCase(), // Fallback
                displayName: u.displayName,
                photoURL: u.photoURL,
                role: m.role // admin or member
            };
        });

        res.json(members);
    } catch (error) {
        console.error('Error fetching room members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
};
