import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Notification from '../models/Notification';
import { getIO } from '../socket'; // Assuming socket.ts exports a getter for IO

// Get My Notifications
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const notifications = await Notification.find({ recipient: uid })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Mark as Read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { uid } = req.user!;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: uid },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};

// Helper to Create & Emit Notification (Internal Use)
export const createNotification = async (
    recipientUid: string,
    actorUid: string,
    type: string,
    title: string,
    message: string,
    link?: string
) => {
    try {
        if (recipientUid === actorUid) return; // Don't notify self

        const notification = await Notification.create({
            recipient: recipientUid,
            actor: actorUid,
            type,
            title,
            message,
            link
        });

        // Emit via Socket.io
        const io = getIO();
        if (io) {
            // Emit to recipient's room (e.g. "user_UID")
            io.to(`user_${recipientUid}`).emit('notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
