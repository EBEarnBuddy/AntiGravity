"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/lib/socket';
import { useNotification } from '@/contexts/NotificationContext';

export const NotificationListener = () => {
    const { currentUser } = useAuth();
    const { notify } = useNotification();

    // Sound is now handled by NotificationContext

    useEffect(() => {
        if (!currentUser || !socket) return;

        const handleNotification = (notification: any) => {
            // Verify notification is for this user (if backend broadcasts)
            // Note: backend emits to specific room `user:{uid}`, so this check might be redundant but safe.
            if (notification.userId && notification.userId !== currentUser.uid) return;

            // "Remember, a new message in a circle does not count as a notification"
            if (notification.type === 'message' || notification.type === 'chat') return;

            // Map types to brutualist colors/icons supported by context
            let type: 'info' | 'success' | 'error' = 'info';
            if (notification.type === 'job_accepted' || notification.type === 'application_accepted' || notification.type === 'success') type = 'success';
            if (notification.type === 'error' || notification.type === 'rejection') type = 'error';

            // Show Toast (Sound plays automatically)
            // Use 'body' or 'message' field
            notify(notification.body || notification.message || "New Notification", type);
        };

        socket.on('notification:new', handleNotification);

        return () => {
            socket.off('notification:new', handleNotification);
        };
    }, [currentUser, notify]);

    return null; // Headless component
};
