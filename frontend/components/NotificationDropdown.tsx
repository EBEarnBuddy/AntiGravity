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
                className="relative p-2 rounded-none border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all bg-green-800"
            >
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-black text-white bg-red-600 border-2 border-white rounded-none">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-slate-900 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b-2 border-slate-900 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-black text-slate-900 uppercase tracking-wide">Notifications</h3>
                        <button onClick={fetchNotifications} className="text-xs font-bold text-green-600 hover:text-green-800 uppercase tracking-wide">Refresh</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm font-bold">No notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`p-3 border-b-2 border-slate-100 hover:bg-green-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-green-50/50' : ''}`}
                                    onClick={() => markAsRead(notif._id, notif.isRead)}
                                >
                                    <Link href={notif.link || '#'} className="block" onClick={() => setIsOpen(false)}>
                                        <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-mono">{new Date(notif.createdAt).toLocaleDateString()}</p>
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
