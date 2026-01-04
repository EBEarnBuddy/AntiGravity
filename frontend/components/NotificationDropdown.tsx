"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, Notification } from '../lib/firestore'; // Leaving for Types only if needed, but safer to redefine or import from shared
import { socket } from '../lib/socket';
import api from '../lib/api';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import useOnClickOutside from '../hooks/useOnClickOutside';
import { motion } from 'framer-motion';



interface NotificationDropdownProps {
    isOpen: boolean;
    onToggle: () => void;
}

const NotificationDropdown = ({ isOpen, onToggle }: NotificationDropdownProps) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const wrapperRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(wrapperRef, () => {
        if (isOpen) onToggle();
    });

    useEffect(() => {
        if (!currentUser) return;

        // 1. Initial Fetch
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                const unread = res.data.filter((n: any) => !n.isRead);
                setNotifications(unread); // Or all? Current UI only shows Unread? 
                // Controller returns filtering by Recipient. Doesn't filter isRead in query but UI logic says "setNotifications(unread)".
                // Let's stick to existing behavior: show only unread or all?
                // Existing: "const unread = notifs.filter(n => !n.isRead);"
                // View line 81: "notifications.length === 0 ? 'No new notifications'".
                // So the UI is designed for Unread Only.
                setNotifications(unread);
                setUnreadCount(unread.length);
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        };

        fetchNotifications();

        // 2. Socket Listeners
        if (socket) {
            const handleNotification = (notif: any) => {
                // Backend emits 'notification' with full object
                setNotifications(prev => {
                    // Avoid duplicates
                    if (prev.some(n => n.id === notif.id || n.id === notif._id)) return prev;
                    // Add to top
                    const newNotif = { ...notif, id: notif._id || notif.id }; // Normalize ID
                    return [newNotif, ...prev];
                });
                setUnreadCount(prev => prev + 1);
            };

            socket.on('notification', handleNotification);

            return () => {
                socket.off('notification', handleNotification);
            };
        }
    }, [currentUser]);

    const handleNotificationClick = async (id: string, currentlyRead: boolean) => {
        if (!id) return;
        if (isOpen) onToggle(); // Close on click

        if (!currentlyRead) {
            try {
                await api.put(`/notifications/${id}/read`);
                setNotifications(prev => prev.filter(n => n.id !== id));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error('Failed to mark read', err);
            }
        }
    };

    const handleClearAll = async () => {
        setNotifications([]);
        setUnreadCount(0);
        try {
            await api.put('/notifications/read-all');
        } catch (e) {
            console.error('Failed to clear all', e);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <motion.button
                onClick={onToggle}
                className="relative p-2 text-white hover:text-green-100 transition-colors"
                animate={unreadCount > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
            >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-black text-white bg-red-600 border-2 border-white rounded-none">
                        {unreadCount > 5 ? '5+' : unreadCount}
                    </span>
                )}
            </motion.button>

            {isOpen && (
                <div className="fixed inset-x-0 top-16 md:absolute md:top-full md:right-0 md:left-auto md:w-80 bg-white border-b-2 md:border-2 border-slate-900 shadow-[0_4px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b-2 border-slate-900 bg-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-slate-900 uppercase tracking-wide text-xs">Notifications</h3>
                        <div className="flex gap-3">
                            <button onClick={handleClearAll} className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wide">Clear All</button>
                        </div>
                    </div>
                    <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm font-bold">No new notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-3 border-b-2 border-slate-100 hover:bg-green-50 transition-colors cursor-pointer bg-white`}
                                    onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                                >
                                    <Link href={notif.actionUrl || '#'} className="block">
                                        <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-mono h-4">
                                            {notif.createdAt ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                        </p>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
