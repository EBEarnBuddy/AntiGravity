
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
                    });

                    await Room.findByIdAndUpdate(roomId, { $inc: { membersCount: 1 } });
                }
            }
        }
