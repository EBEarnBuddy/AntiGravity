"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, Users, Loader2 } from 'lucide-react';
import { useRooms } from '@/hooks/useFirestore';

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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-slate-900"
                >
                    {/* Header */}
                    <div className="bg-green-600 text-white p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6" />
                            <div>
                                <h2 className="text-2xl font-black">Pending Requests</h2>
                                <p className="text-green-100 text-sm font-medium">{roomName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-green-700 rounded-lg transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Pending Requests</h3>
                                <p className="text-slate-500">All caught up! No one is waiting to join.</p>
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
                                        className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-green-500 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
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
                                            <h4 className="font-bold text-slate-900 truncate">
                                                {request.user.displayName || 'Anonymous User'}
                                            </h4>
                                            <p className="text-sm text-slate-500 truncate">{request.user.email}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleApprove(request.user.firebaseUid, request._id)}
                                                disabled={processingId === request._id}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {processingId === request._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.user.firebaseUid, request._id)}
                                                disabled={processingId === request._id}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {processingId === request._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                Reject
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
