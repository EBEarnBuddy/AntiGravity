import { Request, Response } from 'express';
import Opportunity from '../models/Opportunity';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';
import Room from '../models/Room';
import RoomMembership from '../models/RoomMembership';

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

        // Create an Opportunity Circle (Room) for this opportunity.
        // We keep this generic so it also works for future freelance/project postings.
        const roomName = payload.name || payload.title || 'Opportunity Circle';
        const roomDescription = payload.description || 'Opportunity collaboration space';

        const room = await Room.create({
            name: roomName,
            description: roomDescription,
            isPrivate: true,
            icon: payload.industry,
            createdBy: user._id,
            membersCount: 1,
        });

        await RoomMembership.create({
            room: room._id,
            user: user._id,
            role: 'admin',
        });

        const opportunity = await Opportunity.create({
            ...payload,
            postedBy: user._id,
            room: room._id,
            // For startup opportunities, default startupStatus to active if not explicitly provided
            startupStatus: payload.startupStatus || 'active',
            founderId: payload.founderId || uid,
            founderName: payload.founderName || user.displayName,
            founderAvatar: payload.founderAvatar || user.photoURL,
        });

        res.status(201).json(opportunity);
    } catch (error) {
        console.error('Error creating opportunity:', error);
        res.status(500).json({ error: 'Failed to create opportunity' });
    }
};

// Get All Opportunities (with filters)
export const getOpportunities = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;
        const filter: any = { status: 'open' };
        if (type) filter.type = type;

        const opportunities = await Opportunity.find(filter)
            .populate('postedBy', 'displayName photoURL role') // Populate poster info
            .sort({ createdAt: -1 });

        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Get Single Opportunity
export const getOpportunityById = async (req: Request, res: Response) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('postedBy', 'displayName photoURL role');

        if (!opportunity) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(opportunity);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
