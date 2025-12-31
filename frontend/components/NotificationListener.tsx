"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/lib/socket';
import toast from 'react-hot-toast';
import useSound from 'use-sound';

// Simple pop sound
const POP_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const NotificationListener = () => {
    const { currentUser } = useAuth();
    const [play] = useSound(POP_SOUND_URL, { volume: 0.5 });

    useEffect(() => {
        if (!currentUser || !socket) return;

        const handleNotification = (notification: any) => {
            // Verify notification is for this user (if backend broadcasts)
            if (notification.userId && notification.userId !== currentUser.uid) return;

            // "Remember, a new message in a circle does not count as a notification"
            // We assume 'type' field distinguishes messages from other notifications
            if (notification.type === 'message' || notification.type === 'chat') return;

            // "And a person who is not in a circle should not receive the notifications of a circle"
            // Ideally backend handles this filtering. If we receive it here, we assume backend sent it because we are relevant.
            // But if it's a "circle_update" broadcast, we might need to check membership.
            // For now, relying on the 'notifications' collection logic where each doc has a userId.

            // Play sound
            play();

            // Show Toast
            toast(notification.message || "New Notification", {
                icon: '🔔',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        };

        socket.on('notification:new', handleNotification);

        return () => {
            socket.off('notification:new', handleNotification);
        };
    }, [currentUser, play]);

    return null; // Headless component
};
