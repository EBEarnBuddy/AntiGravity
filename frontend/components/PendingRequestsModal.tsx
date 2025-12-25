"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, Users, RefreshCw } from 'lucide-react';
import { useRooms } from '@/hooks/useFirestore';
import { BrutalistSpinner } from './ui/BrutalistSpinner';

interface PendingRequest {
    _id: string;
    user: {
        _id: string;
        firebaseUid: string;
        displayName: string;
        email: string;
        photoURL?: string;
    };
    room: string;
    status: string;
    joinedAt: Date;
}

interface PendingRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
    roomName: string;
}

const PendingRequestsModal: React.FC<PendingRequestsModalProps> = ({
    isOpen,
    onClose,
    roomId,
    roomName
}) => {
    const { getPendingRequests, approveMembership } = useRooms();
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && roomId) {
            fetchRequests();
        }
    }, [isOpen, roomId]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getPendingRequests(roomId);
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string, requestId: string) => {
        try {
            setProcessingId(requestId);
            await approveMembership(roomId, userId, 'accepted');
            // Remove from list
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Failed to approve request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId: string, requestId: string) => {
        try {
            setProcessingId(requestId);
            await approveMembership(roomId, userId, 'rejected');
            // Remove from list
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Failed to reject request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] w-full max-w-2xl max-h-[80vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-green-400 border-b-4 border-slate-900 text-slate-900 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-widest">Pending Requests</h2>
                                <p className="text-slate-800 text-sm font-black">{roomName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 border-2 border-slate-900 bg-white hover:bg-slate-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <BrutalistSpinner className="w-12 h-12 text-slate-900" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto bg-slate-200 border-2 border-slate-400 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(148,163,184,1)]">
                                    <Users className="w-10 h-10 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide mb-2">No Pending Requests</h3>
                                <p className="text-slate-500 font-bold">All caught up! No one is waiting.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => (
                                    <motion.div
                                        key={request._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="bg-white border-4 border-slate-900 p-4 flex items-center gap-4 hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 border-2 border-slate-900 bg-green-200 flex items-center justify-center text-slate-900 font-black text-lg overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                            {request.user.photoURL ? (
                                                <img
                                                    src={request.user.photoURL}
                                                    alt={request.user.displayName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                request.user.displayName?.charAt(0).toUpperCase() || 'U'
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-900 truncate uppercase tracking-tighter text-lg">
                                                {request.user.displayName || 'Anonymous User'}
                                            </h4>
                                            <p className="text-sm text-slate-500 truncate font-bold">{request.user.email}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleApprove(request.user.firebaseUid, request._id)}
                                                disabled={processingId === request._id}
                                                className="px-4 py-2 bg-green-500 border-2 border-slate-900 text-white font-black uppercase hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                                            >
                                                {processingId === request._id ? (
                                                    <BrutalistSpinner size={16} />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">Accept</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.user.firebaseUid, request._id)}
                                                disabled={processingId === request._id}
                                                className="px-4 py-2 bg-red-500 border-2 border-slate-900 text-white font-black uppercase hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                                            >
                                                {processingId === request._id ? (
                                                    <BrutalistSpinner size={16} />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">Reject</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PendingRequestsModal;
