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
        console.log('[createOpportunity] Payload:', JSON.stringify(payload, null, 2));

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
