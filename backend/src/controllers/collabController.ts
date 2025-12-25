import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import CollabRequest from '../models/CollabRequest.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import RoomMembership from '../models/RoomMembership.js';
import Event from '../models/Event.js';

// Create a Collaboration Request
export const createCollabRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { fromCircleId, toCircleId, proposal, eventName, eventDate } = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify user is admin of the 'fromCircle' (Simplified: or just a member?) context implies circle itself sends it.
        // For now, assume any member can initiate, or strictly admins. Let's say Admins.
        const membership = await RoomMembership.findOne({ room: fromCircleId, user: user._id, role: 'admin' });
        if (!membership) {
            res.status(403).json({ error: 'Only admins can initiate collaboration' });
            return;
        }

        const request = await CollabRequest.create({
            fromCircle: fromCircleId,
            toCircle: toCircleId,
            proposal,
            eventName,
            eventDate,
            initiatedBy: user._id,
        });

        res.status(201).json(request);
    } catch (error) {
        console.error('Create Collab Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// Accept Request
export const acceptCollabRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { requestId } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) return;

        const request = await CollabRequest.findById(requestId);
        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        if (request.status !== 'pending') {
            res.status(400).json({ error: 'Request already processed' });
            return;
        }

        // Verify user is admin of 'toCircle' (the receiving circle)
        const membership = await RoomMembership.findOne({ room: request.toCircle, user: user._id, role: 'admin' });
        if (!membership) {
            res.status(403).json({ error: 'Not authorized to accept' });
            return;
        }

        // 1. Update Request
        request.status = 'accepted';
        await request.save();

        // 2. Create Event Circle (Temporary Room)
        const eventRoom = await Room.create({
            name: `Event: ${request.eventName}`,
            description: `Official event circle for ${request.eventName}`,
            isPrivate: true,
            isTemporary: true,
            createdBy: user._id,
            membersCount: 0,
        });

        // 3. Create Event
        const event = await Event.create({
            name: request.eventName,
            description: request.proposal,
            date: request.eventDate,
            hostCircles: [request.fromCircle, request.toCircle],
            eventCircle: eventRoom._id,
            createdBy: request.initiatedBy,
        });

        // 4. Add members from BOTH circles to the new Event Circle
        // Fetch all members from Circle A and Circle B
        const membersA = await RoomMembership.find({ room: request.fromCircle });
        const membersB = await RoomMembership.find({ room: request.toCircle });

        const uniqueUserIds = new Set([
            ...membersA.map(m => m.user.toString()),
            ...membersB.map(m => m.user.toString())
        ]);

        const newMemberships = Array.from(uniqueUserIds).map(userId => ({
            room: eventRoom._id,
            user: userId,
            role: 'member'
        }));

        if (newMemberships.length > 0) {
            await RoomMembership.insertMany(newMemberships);
            // Update count
            eventRoom.membersCount = newMemberships.length;
            await eventRoom.save();
        }

        res.status(200).json({ message: 'Collaboration accepted, Event Created', event, room: eventRoom });

    } catch (error) {
        console.error('Accept Collab Error:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

export const getMyRequests = async (req: AuthRequest, res: Response) => {
    // Fetch requests involving circles where I am an admin
    // This is complex, for simple MVP just return all pending? No, security.
    // Sketch:
    // 1. Get my admin rooms.
    // 2. Find CollabRequests where toCircle IN (myRooms) AND status='pending'.
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) return; // Error handle properly

        const adminMemberships = await RoomMembership.find({ user: user._id, role: 'admin' });
        const adminRoomIds = adminMemberships.map(m => m.room);

        const requests = await CollabRequest.find({
            toCircle: { $in: adminRoomIds },
            status: 'pending'
        }).populate('fromCircle').populate('toCircle');

        res.json(requests);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
};
