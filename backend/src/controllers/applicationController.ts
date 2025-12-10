import { Response } from 'express';
import Application from '../models/Application';
import Opportunity from '../models/Opportunity';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Apply to an Opportunity
export const applyToOpportunity = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { opportunityId, message } = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            res.status(404).json({ error: 'Opportunity not found' });
            return;
        }

        // Check if already applied
        const existingApp = await Application.findOne({
            opportunity: opportunityId,
            applicant: user._id,
        });

        if (existingApp) {
            res.status(400).json({ error: 'Already applied' });
            return;
        }

        const application = await Application.create({
            opportunity: opportunityId,
            applicant: user._id,
            message,
        });

        // Add to opportunity's applicants list
        opportunity.applicants.push(user._id as any);
        await opportunity.save();

        res.status(201).json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Application failed' });
    }
};

// Get My Applications
export const getMyApplications = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const applications = await Application.find({ applicant: user._id })
            .populate('opportunity', 'title type status');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
