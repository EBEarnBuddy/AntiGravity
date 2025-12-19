"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, Handshake, Loader2 } from 'lucide-react';
import { collaborationAPI } from '@/lib/axios';

interface CollabRequest {
    _id: string;
    fromCircle: {
        _id: string;
        name: string;
        description?: string;
    };
    toCircle: {
        _id: string;
        name: string;
    };
    fromOwner: {
        _id: string;
        firebaseUid: string;
        displayName: string;
        email: string;
        photoURL?: string;
    };
    message?: string;
    status: string;
    createdAt: Date;
}

interface CollaborationRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CollaborationRequestsModal: React.FC<CollaborationRequestsModalProps> = ({
    isOpen,
    onClose
}) => {
    const [requests, setRequests] = useState<CollabRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
        }
    }, [isOpen]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await collaborationAPI.getPendingRequests();
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch collaboration requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            setProcessingId(requestId);
            await collaborationAPI.acceptRequest(requestId);
            // Remove from list
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            console.error('Failed to accept request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            setProcessingId(requestId);
            await collaborationAPI.rejectRequest(requestId);
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
                    <div className="bg-purple-600 text-white p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Handshake className="w-6 h-6" />
                            <div>
                                <h2 className="text-2xl font-black">Collaboration Requests</h2>
                                <p className="text-purple-100 text-sm font-medium">Pending collaboration invitations</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-purple-700 rounded-lg transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-12">
                                <Handshake className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Pending Requests</h3>
                                <p className="text-slate-500">No one has requested to collaborate with your circles yet.</p>
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
                                        className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 hover:border-purple-500 transition-colors"
                                    >
                                        {/* Request Info */}
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                                                {request.fromOwner.photoURL ? (
                                                    <img
                                                        src={request.fromOwner.photoURL}
                                                        alt={request.fromOwner.displayName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    request.fromOwner.displayName?.charAt(0).toUpperCase() || 'U'
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 mb-1">
                                                    {request.fromOwner.displayName || 'Anonymous User'}
                                                </h4>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    Wants to collaborate <span className="font-bold text-purple-600">{request.fromCircle.name}</span> with your circle <span className="font-bold text-purple-600">{request.toCircle.name}</span>
                                                </p>
                                                {request.message && (
                                                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 italic">
                                                        "{request.message}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(request._id)}
                                                disabled={processingId === request._id}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {processingId === request._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                disabled={processingId === request._id}
                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

export default CollaborationRequestsModal;
