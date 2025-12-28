import { Response } from 'express';
import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { AuthRequest } from '../middlewares/auth.js';
import Room from '../models/Room.js';
import RoomMembership from '../models/RoomMembership.js';
import { createNotification } from './notificationController.js';
import { getIO } from '../socket.js';

// Apply to an Opportunity
// This endpoint is intentionally flexible to support the current frontend,
// which may send either a simple string `message` or a JSON-encoded payload.
export const applyToOpportunity = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { opportunityId, message, roleId } = req.body;
        console.log('[applyToOpportunity] Request Body:', JSON.stringify(req.body, null, 2));

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

        // Check if already applied (per opportunity per user)
        const existingApp = await Application.findOne({
            opportunity: opportunityId,
            applicant: user._id,
        });

        if (existingApp) {
            res.status(400).json({ error: 'Already applied' });
            return;
        }

        // Try to parse structured application details if message is JSON
        let parsedDetails: any = undefined;
        let finalMessage: string | undefined = undefined;

        if (typeof message === 'string') {
            try {
                const maybeJson = JSON.parse(message);
                if (maybeJson && typeof maybeJson === 'object') {
                    parsedDetails = maybeJson;
                    finalMessage = maybeJson.coverLetter || undefined;
                } else {
                    finalMessage = message;
                }
            } catch {
                finalMessage = message;
            }
        } else if (message && typeof message === 'object') {
            parsedDetails = message;
            finalMessage = message.coverLetter || undefined;
        }

        const application = await Application.create({
            opportunity: opportunityId,
            applicant: user._id,
            message: finalMessage,
            roleId,
            details: parsedDetails,
        });

        // Add to opportunity's applicants list
        opportunity.applicants.push(user._id as any);

        // For startup opportunities, also increment totalApplicants if present
        if (opportunity.totalApplicants !== undefined) {
            opportunity.totalApplicants += 1;
        }

        await opportunity.save();

        // Notify Opportunity Owner
        const owner = await User.findById(opportunity.postedBy);
        if (owner) {
            await createNotification(
                owner.firebaseUid,
                user.firebaseUid,
                'application_received',
                'New Application Received',
                `${user.displayName || 'Someone'} applied to ${opportunity.title}`,
                `/startups?tab=posted&id=${opportunity._id}` // Deep link to manage applications
            );
        }

        // Socket Event
        try {
            const io = getIO();
            // Emit to opportunity-specific room if we had one for events, but global or owner-specific is safer
            // Using a specific event structure that frontend can filter
            const eventPayload = {
                opportunityId: opportunity._id,
                application: application,
                applicantUid: user.firebaseUid
            };
            io.emit('application_created', eventPayload);
        } catch (e) {
            console.error('Socket emit error:', e);
        }

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
            .populate('opportunity'); // Populate all opportunity fields

        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Get all applications for a given opportunity (for the poster / owner)
export const getApplicationsForOpportunity = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { opportunityId } = req.params;

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

        // Ensure only the poster / owner can see applications
        if (!opportunity.postedBy.equals(user._id)) {
            res.status(403).json({ error: 'Not authorized to view applications for this opportunity' });
            return;
        }

        const applications = await Application.find({ opportunity: opportunityId })
            .populate('applicant', 'displayName photoURL skills');

        res.json(applications);
    } catch (error) {
        console.error('Error fetching opportunity applications:', error);
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// Update application status (accept / reject / interviewing)
// When an application is accepted, the applicant is added to the related Opportunity Circle (room).
export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { applicationId } = req.params;
        const { status } = req.body as { status: 'accepted' | 'rejected' | 'interviewing' };

        if (!status || !['accepted', 'rejected', 'interviewing'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const adminUser = await User.findOne({ firebaseUid: uid });
        if (!adminUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }

        const opportunity = await Opportunity.findById(application.opportunity);
        if (!opportunity) {
            res.status(404).json({ error: 'Opportunity not found' });
            return;
        }

        // Only the opportunity owner can update application statuses
        if (!opportunity.postedBy.equals(adminUser._id)) {
            res.status(403).json({ error: 'Not authorized to update this application' });
            return;
        }

        application.status = status;
        await application.save();

        // If accepted and there's a room, ensure the applicant is a member of the Opportunity Circle
        if (status === 'accepted' && opportunity.room) {
            const roomId = opportunity.room.toString();

            const applicant = await User.findById(application.applicant);
            if (applicant) {
                const existingMembership = await RoomMembership.findOne({
                    room: roomId,
                    user: applicant._id,
                });

                if (!existingMembership) {
                    await RoomMembership.create({
                        room: roomId,
                        user: applicant._id,
                        role: 'member',
                        status: 'accepted',
                    });

                    await Room.findByIdAndUpdate(roomId, { $inc: { membersCount: 1 } });

                    // Emit membership update event
                    try {
                        const io = getIO();
                        io.emit('membership_created', {
                            roomId,
                            userId: applicant.firebaseUid
                        });
                    } catch (e) { console.error(e) }
                }
            }
        }

        // Notify Applicant
        const applicantUser = await User.findById(application.applicant);
        if (applicantUser) {
            await createNotification(
                applicantUser.firebaseUid,
                adminUser.firebaseUid,
                status === 'accepted' ? 'application_accepted' : 'application_rejected',
                `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                `Your application for ${opportunity.title} was ${status}.`,
                `/startups?tab=applied&id=${opportunity._id}`
            );
        }

        // Socket Event
        try {
            const io = getIO();
            const eventPayload = {
                applicationId: application._id,
                status: status,
                opportunityId: opportunity._id,
                applicantUid: applicantUser?.firebaseUid
            };
            io.emit('application_status_updated', eventPayload);
        } catch (e) {
            console.error('Socket emit error:', e);
        }

        res.json(application);
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Update failed' });
    }
};
