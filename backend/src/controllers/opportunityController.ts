import { Request, Response } from 'express';
import Opportunity from '../models/Opportunity.js';
import { AuthRequest } from '../middlewares/auth.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import RoomMembership from '../models/RoomMembership.js';
import Message from '../models/Message.js';
import { getIO } from '../socket.js';
import { createNotification } from './notificationController.js';

// Create Opportunity
// For startup opportunities this will also auto-create a private Room
// which acts as the "Opportunity Circle" for collaboration.
export const createOpportunity = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }

        const payload = req.body || {};
        console.log('[createOpportunity] Payload:', JSON.stringify(payload, null, 2));

        // Create an Opportunity Circle (Room) for this opportunity.
        // We keep this generic so it also works for future freelance/project postings.
        const roomName = payload.name || payload.title || 'Opportunity Circle';
        const roomDescription = payload.description || 'Opportunity collaboration space';

        const room = await Room.create({
            name: roomName,
            description: roomDescription,
            isPrivate: true,
            type: 'opportunity',
            icon: payload.industry,
            avatar: payload.image || payload.logo, // Set avatar to startup logo
            createdBy: user._id,
            membersCount: 1,
        });

        await RoomMembership.create({
            room: room._id,
            user: user._id,
            role: 'admin',
            status: 'accepted',
        });

        const opportunity = new Opportunity({
            ...payload,
            postedBy: user._id,
            room: room._id,
            // For startup opportunities, default startupStatus to active if not explicitly provided
            startupStatus: payload.startupStatus || 'active',
            founderName: payload.founderName || user.displayName,
            founderAvatar: payload.founderAvatar || user.photoURL,
            image: payload.image || payload.logo, // Support image field
            slug: payload.slug // Optional custom slug
        });
        await opportunity.save();

        // Populate for immediate frontend use if needed
        await opportunity.populate('postedBy', 'displayName photoURL role');

        // Broadcast System Message to all circles the user is a member of
        try {
            const memberships = await RoomMembership.find({ user: user._id, status: 'accepted' });
            const io = getIO();

            // We can process this asynchronously without blocking the response
            Promise.all(memberships.map(async (membership) => {
                // Skip the circle just created for this opportunity
                if (membership.room.toString() === room._id.toString()) return;

                const siteUrl = process.env.CLIENT_URL?.split(',')[0] || process.env.FRONTEND_URL || 'http://localhost:3000';
                const content = `${user.displayName} has posted a new opportunity "${opportunity.title}" — click here to apply: ${siteUrl}/startups?id=${opportunity._id}`;

                const message = await Message.create({
                    room: membership.room,
                    sender: user._id,
                    content: content,
                    type: 'system'
                });

                // Update room last activity
                await Room.findByIdAndUpdate(membership.room, { lastMessageAt: new Date() });

                // Emit to room
                io.to(membership.room.toString()).emit('new_message', {
                    ...message.toObject(),
                    sender: {
                        _id: user._id,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        firebaseUid: user.firebaseUid
                    }
                });

                // Send Notification to all members of this circle (except poster)
                const roomMembers = await RoomMembership.find({ room: membership.room, user: { $ne: user._id } });
                for (const member of roomMembers) {
                    const recipient = await User.findById(member.user);
                    if (recipient) {
                        await createNotification(
                            recipient.firebaseUid,
                            user.firebaseUid,
                            'opportunity', // Type
                            `${user.displayName} posted an opportunity`,
                            `New Opportunity: ${opportunity.title}`,
                            `/startups?id=${opportunity._id}`
                        );
                    }
                }

            })).catch(err => console.error('Error broadcasting system messages:', err));

        } catch (err) {
            console.error('Failed to broadcast opportunity system messages:', err);
        }

        // Realtime: Emit event
        try {
            const io = getIO();
            io.emit('opportunity_created', opportunity);
        } catch (err) {
            console.error('Socket emission failed:', err);
        }

        res.status(201).json(opportunity);
    } catch (error) {
        console.error('Error creating opportunity:', error);
        if (error instanceof Error) console.error(error.stack);
        res.status(500).json({ error: 'Failed to create opportunity' });
    }
};

// Get All Opportunities (with filters)
export const getOpportunities = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        console.log(`🔥 API HIT: GET /opportunities Type: ${type}`);

        if (!type) {
            console.warn('[Get Opportunities] 400 Bad Request: Missing type');
            res.status(400).json({ error: 'Type parameter is required (startup | freelance)' });
            return;
        }

        let filter: any = { status: 'open' };

        if (type === 'startup') {
            filter.type = 'startup';
        } else if (type === 'freelance') {
            // "freelance" query returns both freelance (Gig) and project (Colancing) types
            filter.type = { $in: ['freelance', 'project'] };
        } else {
            console.warn(`[Get Opportunities] 400 Bad Request: Invalid type '${type}'`);
            res.status(400).json({ error: 'Invalid type parameter' });
            return;
        }

        const opportunities = await Opportunity.find(filter)
            .populate('postedBy', 'displayName photoURL role') // Populate poster info
            .populate('room', 'name isPrivate') // Populate room specific fields for redirection
            .sort({ createdAt: -1 });

        console.log(`[GET /opportunities] Found ${opportunities.length} items for type: ${type}`);
        res.status(200).json(opportunities);
    } catch (error) {
        console.error('[GET /opportunities] Error:', error);
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Get Single Opportunity
export const getOpportunityById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let opportunity;

        // Check if id is a valid ObjectId
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            opportunity = await Opportunity.findById(id).populate('postedBy', 'displayName photoURL role');
        } else {
            // Treat as slug
            opportunity = await Opportunity.findOne({ slug: id }).populate('postedBy', 'displayName photoURL role');
        }

        if (!opportunity) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(opportunity);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
// Update Opportunity Status
export const updateOpportunityStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { id } = req.params;
        // Accept either structure depending on what frontend sends
        const { status } = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const opportunity = await Opportunity.findById(id);
        if (!opportunity) {
            res.status(404).json({ error: 'Opportunity not found' });
            return;
        }

        if (!opportunity.postedBy.equals(user._id)) {
            res.status(403).json({ error: 'Not authorized' });
            return;
        }

        // Map frontend "status" -> "startupStatus" if applicable
        if (status === 'closed') {
            opportunity.startupStatus = 'closed';
            opportunity.status = 'closed';
        } else if (status === 'active' || status === 'open') {
            opportunity.startupStatus = 'active';
            opportunity.status = 'open';
        } else {
            // Fallback
            opportunity.startupStatus = status;
        }

        await opportunity.save();

        // Notify members of the opportunity circle
        if (opportunity.room) {
            const roomMembers = await RoomMembership.find({ room: opportunity.room, user: { $ne: user._id } });
            for (const member of roomMembers) {
                const recipient = await User.findById(member.user);
                if (recipient) {
                    await createNotification(
                        recipient.firebaseUid,
                        user.firebaseUid,
                        'opportunity',
                        `${user.displayName} updated an opportunity`,
                        `${opportunity.title} is now ${opportunity.startupStatus || opportunity.status}`,
                        `/startups?id=${opportunity._id}`
                    );
                }
            }
        }

        res.json(opportunity);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Update failed' });
    }
};

// Delete Opportunity
export const deleteOpportunity = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { id } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const opportunity = await Opportunity.findById(id);
        if (!opportunity) {
            res.status(404).json({ error: 'Opportunity not found' });
            return;
        }

        if (!opportunity.postedBy.equals(user._id)) {
            res.status(403).json({ error: 'Not authorized' });
            return;
        }

        // Cascade delete related resources
        if (opportunity.room) {
            const roomId = opportunity.room;
            await Room.findByIdAndDelete(roomId);
            await RoomMembership.deleteMany({ room: roomId });
            await Message.deleteMany({ room: roomId });
            // Emitting room_deleted event could be useful but frontend handles list refresh via opp methods
        }

        // Delete the opportunity itself
        await Opportunity.findByIdAndDelete(id);

        res.json({ success: true, message: 'Opportunity deleted' });
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
};

// Update Opportunity Details
export const updateOpportunity = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { id } = req.params;
        const payload = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const opportunity = await Opportunity.findById(id);
        if (!opportunity) {
            res.status(404).json({ error: 'Opportunity not found' });
            return;
        }

        if (!opportunity.postedBy.equals(user._id)) {
            res.status(403).json({ error: 'Not authorized' });
            return;
        }

        // Update fields
        // We carefully only allow updating certain fields to prevent overwriting critical ones like `postedBy` or `createdAt`
        // Mongoose generic update or manually setting fields
        const allowedUpdates = [
            'title', 'description', 'requirements', 'location', 'salary',
            'name', 'industry', 'stage', 'funding', 'equity', 'founderName', 'founderAvatar', 'slug', 'startupStatus',
            'roles', 'contact', 'additionalInfo', 'website', 'logo', 'teamSize', 'projectType', 'totalBudget',
            'duration', 'remote', 'benefits', 'urgency', 'featured', 'tags', 'image'
        ];

        Object.keys(payload).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                (opportunity as any)[key] = payload[key];
            }
        });

        await opportunity.save();
        res.json(opportunity);
    } catch (error) {
        console.error('Error updating opportunity:', error);
        res.status(500).json({ error: 'Update failed' });
    }
};
