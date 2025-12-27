"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../lib/socket';
import api from '../lib/axios'; // Or create notificationAPI
import { Bell } from 'lucide-react';
import Link from 'next/link';
import useOnClickOutside from '../hooks/useOnClickOutside';

interface INotification {
    _id: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

const NotificationDropdown = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(wrapperRef, () => setIsOpen(false));

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            // Filter out read notifications to simulate "auto-delete on view" behavior for the list
            const unread = res.data.filter((n: INotification) => !n.isRead);
            setNotifications(unread);
            setUnreadCount(unread.length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (!currentUser) return;

        fetchNotifications();

        let socketInstance: any;
        const initSocket = async () => {
            socketInstance = await getSocket();
            if (socketInstance) {
                socketInstance.on('notification', (newNotif: INotification) => {
                    const mappedNotif = { ...newNotif, _id: newNotif._id || Date.now().toString() };
                    setNotifications(prev => [mappedNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
                socketInstance.on('notification:new', (newNotif: any) => {
                    // Handle logical 'new' notification structure, mapping to interface
                    const mapped: INotification = {
                        _id: Date.now().toString(),
                        title: newNotif.title,
                        message: newNotif.body,
                        link: newNotif.link,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    };
                    setNotifications(prev => [mapped, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            }
        };

        initSocket();

        return () => {
            if (socketInstance) {
                socketInstance.off('notification');
                socketInstance.off('notification:new');
            }
        };
    }, [currentUser]);

    const handleNotificationClick = async (id: string, currentlyRead: boolean) => {
        // Optimistic update: Remove from list (Auto-delete behavior)
        setNotifications(prev => prev.filter(n => n._id !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));
        setIsOpen(false);

        if (!currentlyRead && id) {
            try {
                await api.put(`/notifications/${id}/read`);
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
        } catch (err) {
            console.error('Failed to clear all', err);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:text-green-100 transition-all hover:scale-110"
            >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-black text-white bg-red-600 border-2 border-white rounded-none">
                        {unreadCount > 5 ? '5+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-slate-900 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b-2 border-slate-900 bg-slate-50 flex justify-between items-center bg-slate-100">
                        <h3 className="font-black text-slate-900 uppercase tracking-wide text-xs">Notifications</h3>
                        <div className="flex gap-3">
                            <button onClick={handleClearAll} className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wide">Clear All</button>
                            <button onClick={fetchNotifications} className="text-[10px] font-bold text-green-600 hover:text-green-800 uppercase tracking-wide">Refresh</button>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm font-bold">No new notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`p-3 border-b-2 border-slate-100 hover:bg-green-50 transition-colors cursor-pointer bg-white`}
                                    onClick={() => handleNotificationClick(notif._id, notif.isRead)}
                                >
                                    <Link href={notif.link || '#'} className="block">
                                        <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-mono h-4">
                                            {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Just now'}
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
