import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import CollaborationRequest from '../models/CollaborationRequest';
import Room from '../models/Room';
import User from '../models/User';
import RoomMembership from '../models/RoomMembership';
import Notification from '../models/Notification';

// Send Collaboration Request
export const sendCollaborationRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { fromCircleId, toCircleId, message } = req.body;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Validate circles exist
        const fromCircle = await Room.findById(fromCircleId);
        const toCircle = await Room.findById(toCircleId);

        if (!fromCircle || !toCircle) {
            res.status(404).json({ error: 'One or both circles not found' });
            return;
        }

        // Verify user owns fromCircle
        if (fromCircle.createdBy.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'You can only send collaboration requests from circles you own' });
            return;
        }

        // Can't collaborate with own circle
        if (fromCircleId === toCircleId) {
            res.status(400).json({ error: 'Cannot collaborate with your own circle' });
            return;
        }

        // Check for existing pending request
        const existingRequest = await CollaborationRequest.findOne({
            fromCircle: fromCircleId,
            toCircle: toCircleId,
            status: 'pending'
        });

        if (existingRequest) {
            res.status(400).json({ error: 'A pending collaboration request already exists' });
            return;
        }

        // Create collaboration request
        const collabRequest = await CollaborationRequest.create({
            fromCircle: fromCircleId,
            toCircle: toCircleId,
            fromOwner: user._id,
            toOwner: toCircle.createdBy,
            message,
            status: 'pending'
        });

        // Create notification for recipient
        const toOwnerUser = await User.findById(toCircle.createdBy);
        if (toOwnerUser) {
            await Notification.create({
                recipient: toOwnerUser.firebaseUid,
                actor: user.firebaseUid,
                type: 'collab_request',
                title: 'New Collaboration Request',
                message: `${user.displayName} wants to collaborate "${fromCircle.name}" with "${toCircle.name}"`,
                link: `/circles/${toCircleId}`,
                isRead: false
            });
            console.log('✅ Collaboration request notification sent to:', toOwnerUser.firebaseUid);
        }

        res.status(201).json(collabRequest);
    } catch (error) {
        console.error('Error sending collaboration request:', error);
        res.status(500).json({ error: 'Failed to send collaboration request' });
    }
};

// Get Pending Collaboration Requests
export const getPendingCollaborationRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const requests = await CollaborationRequest.find({
            toOwner: user._id,
            status: 'pending'
        })
            .populate('fromCircle')
            .populate('toCircle')
            .populate('fromOwner')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching collaboration requests:', error);
        res.status(500).json({ error: 'Failed to fetch collaboration requests' });
    }
};

// Accept Collaboration Request
export const acceptCollaborationRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { requestId } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const request = await CollaborationRequest.findById(requestId)
            .populate('fromCircle')
            .populate('toCircle');

        if (!request) {
            res.status(404).json({ error: 'Collaboration request not found' });
            return;
        }

        // Verify user is the recipient
        if (request.toOwner.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'Only the recipient can accept this request' });
            return;
        }

        if (request.status !== 'pending') {
            res.status(400).json({ error: 'Request has already been processed' });
            return;
        }

        // Create new collab circle
        const fromCircle = request.fromCircle as any;
        const toCircle = request.toCircle as any;

        const collabCircle = await Room.create({
            name: `${fromCircle.name} × ${toCircle.name}`,
            description: `Collaboration between ${fromCircle.name} and ${toCircle.name}`,
            createdBy: request.fromOwner,
            type: 'collab',
            collaborators: [request.fromOwner, request.toOwner],
            isPrivate: false,
            membersCount: 2
        });

        // Add both owners as admins
        await RoomMembership.create([
            {
                room: collabCircle._id,
                user: request.fromOwner,
                role: 'admin',
                status: 'accepted'
            },
            {
                room: collabCircle._id,
                user: request.toOwner,
                role: 'admin',
                status: 'accepted'
            }
        ]);

        // Update request status
        request.status = 'accepted';
        await request.save();

        // Create notification for requester
        const fromOwnerUser = await User.findById(request.fromOwner);
        await Notification.create({
            recipient: fromOwnerUser?.firebaseUid || '',
            actor: user.firebaseUid,
            type: 'collab_accepted',
            title: 'Collaboration Accepted!',
            message: `${user.displayName} accepted your collaboration request. Check out "${collabCircle.name}"`,
            link: `/circles/${collabCircle._id}`,
            isRead: false
        });

        res.json({
            message: 'Collaboration request accepted',
            collabCircle
        });
    } catch (error) {
        console.error('Error accepting collaboration request:', error);
        res.status(500).json({ error: 'Failed to accept collaboration request' });
    }
};

// Reject Collaboration Request
export const rejectCollaborationRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const { requestId } = req.params;

        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const request = await CollaborationRequest.findById(requestId);

        if (!request) {
            res.status(404).json({ error: 'Collaboration request not found' });
            return;
        }

        // Verify user is the recipient
        if (request.toOwner.toString() !== user._id.toString()) {
            res.status(403).json({ error: 'Only the recipient can reject this request' });
            return;
        }

        if (request.status !== 'pending') {
            res.status(400).json({ error: 'Request has already been processed' });
            return;
        }

        // Update request status
        request.status = 'rejected';
        await request.save();

        // Create notification for requester
        const fromOwnerUser = await User.findById(request.fromOwner);
        await Notification.create({
            recipient: fromOwnerUser?.firebaseUid || '',
            actor: user.firebaseUid,
            type: 'collab_rejected',
            title: 'Collaboration Request Declined',
            message: `${user.displayName} declined your collaboration request`,
            link: `/circles`,
            isRead: false
        });

        res.json({
            message: 'Collaboration request rejected',
            request
        });
    } catch (error) {
        console.error('Error rejecting collaboration request:', error);
        res.status(500).json({ error: 'Failed to reject collaboration request' });
    }
};
