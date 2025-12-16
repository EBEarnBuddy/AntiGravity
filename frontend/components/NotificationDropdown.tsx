"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../lib/socket';
import api from '../lib/axios'; // Or create notificationAPI
import { Bell } from 'lucide-react';
import Link from 'next/link';

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

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: INotification) => !n.isRead).length);
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
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
            }
        };

        initSocket();

        return () => {
            if (socketInstance) {
                socketInstance.off('notification');
            }
        };
    }, [currentUser]);

    const markAsRead = async (id: string, currentlyRead: boolean) => {
        if (currentlyRead) return;
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Notifications</h3>
                        <button onClick={fetchNotifications} className="text-xs text-blue-600 hover:underline">Refresh</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => markAsRead(notif._id, notif.isRead)}
                                >
                                    <Link href={notif.link || '#'} className="block" onClick={() => setIsOpen(false)}>
                                        <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
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
