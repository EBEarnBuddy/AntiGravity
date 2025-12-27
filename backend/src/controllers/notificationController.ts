import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket.js'; // Assuming socket.ts exports a getter for IO

// Get My Notifications
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const { uid } = req.user!;
        const notifications = await Notification.find({ recipient: uid, isHidden: { $ne: true } })
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

        // When user clicks a specific notification, mark read AND remove from view (isHidden=true) per "auto-delete" request?
        // User request: "autodeleted as the user views them"
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: uid },
            { isRead: true, isHidden: true },
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
    type: string, // 'new_message' | 'mention' | 'opportunity'
        title: string,
            message: string,
                link ?: string
    ) => {
    try {
        if (recipientUid === actorUid) return; // Don't notify self

        let notification;
        let isUpdate = false;

        // Aggregation Logic for generic messages
        if (type === 'new_message' && link) {
            // Check for existing unread message notification from this room/context
            // We use 'link' as the unique grouper for a room (e.g. /circles/123)
            const existing = await Notification.findOne({
                recipient: recipientUid,
                type: 'new_message',
                link: link,
                isRead: false
            });

            if (existing) {
                isUpdate = true;
                // Parse existing count if possible, or just increment?
                // Parsing generic titles is brittle. Let's try a simpler approach:
                // If title already starts with a number, increment it. Else start at 2.
                let count = 2;
                const match = existing.title.match(/^(\d+) unread messages/);
                if (match) {
                    count = parseInt(match[1]) + 1;
                }

                // Update existing
                existing.title = `${count} unread messages in circle`; // Simplified title as per request logic "x unread messages in circle: Y"
                // But we need "Y" (Circle Name). 
                // The incoming 'title' often has "New Message from User".
                // Ideally, 'createNotification' should accept 'contextName' (Circle Name).
                // For now, we'll append the latest message snippet.

                // If the original title was "New Message from Bob", we might lose "Bob".
                // But the requirement says: 'x unread messages in circle: Y'.
                // We'll optimistically update the message body to show latest snippet.
                existing.message = `Latest: ${message}`;
                existing.updatedAt = new Date(); // Bump to top
                notification = await existing.save();
            }
        }

        if (!isUpdate) {
            notification = await Notification.create({
                recipient: recipientUid,
                actor: actorUid,
                type,
                title,
                message,
                link
            });
        }

        // Emit via Socket.io
        const io = getIO();
        if (io && notification) {
            // Emit to recipient's room (e.g. "user_UID")
            io.to(`user:${recipientUid}`).emit('notification', notification);
            // Also emit the notification:new event for the navbar hook if completely new or critically updated
            io.to(`user:${recipientUid}`).emit('notification:new', {
                title: notification.title,
                body: notification.message,
                link: notification.link,
                type: notification.type
            });
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
