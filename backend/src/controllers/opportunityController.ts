import { Request, Response } from 'express';
import Opportunity from '../models/Opportunity';
import { AuthRequest } from '../middlewares/auth';
import User from '../models/User';

// Create Opportunity
export const createOpportunity = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User profile not found' });
            return;
        }

        const opportunity = await Opportunity.create({
            ...req.body,
            postedBy: user._id,
        });

        res.status(201).json(opportunity);
    } catch (error) {
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
