"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, Users, RefreshCw } from 'lucide-react';
import { FirestoreService, CollaborationRequest } from '@/lib/firestore';
import { BrutalistSpinner } from '@/components/ui/BrutalistSpinner';

// Use Firestore type directly or extend if needed
type CollabRequest = CollaborationRequest;

interface CollaborationRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId?: string;
}

const CollaborationRequestsModal: React.FC<CollaborationRequestsModalProps> = ({
    isOpen,
    onClose,
    roomId
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
        if (!roomId) return;
        try {
            setLoading(true);
            const data = await FirestoreService.getCollaborationRequests(roomId);
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch collaboration requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            setProcessingId(requestId);
            await FirestoreService.updateCollaborationRequest(requestId, 'accepted');
            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error('Failed to accept request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            setProcessingId(requestId);
            await FirestoreService.updateCollaborationRequest(requestId, 'rejected');
            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== requestId));
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
                    className="bg-white rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-2xl w-full max-h-[80vh] overflow-hidden border-4 border-slate-900"
                >
                    {/* Header */}
                    <div className="bg-purple-600 text-white p-6 flex items-center justify-between border-b-4 border-slate-900">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Collaboration Requests</h2>
                                <p className="text-purple-100 text-sm font-bold">Pending collaboration invitations</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-purple-700 transition border-2 border-transparent hover:border-white"
                        >
                            <X className="w-6 h-6" strokeWidth={3} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <BrutalistSpinner size={32} className="text-purple-600 border-purple-600" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-12 border-4 border-dashed border-slate-300 bg-white">
                                <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">No Pending Requests</h3>
                                <p className="text-slate-500 font-bold">No one has requested to collaborate with your circles yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => (
                                    <motion.div
                                        key={request.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="bg-white border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all"
                                    >
                                        {/* Request Info */}
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Avatar Placeholder - Firestore store user info needs fetch or redundant store? Assumed redundant. */}
                                            <div className="w-12 h-12 border-2 border-slate-900 bg-purple-100 flex items-center justify-center text-purple-700 font-black text-lg overflow-hidden flex-shrink-0">
                                                {'U'}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-900 mb-1 uppercase text-lg">
                                                    Request from {request.fromCircleName}
                                                </h4>
                                                <p className="text-sm text-slate-600 mb-3 font-medium">
                                                    Wants to collaborate <span className="font-black text-purple-700 bg-purple-100 px-1 border border-purple-200">{request.fromCircleName}</span> with your circle <span className="font-black text-purple-700 bg-purple-100 px-1 border border-purple-200">{request.toCircleName}</span>
                                                </p>
                                                {request.message && (
                                                    <div className="bg-slate-100 border-l-4 border-slate-900 p-3 text-sm text-slate-700 font-medium italic">
                                                        "{request.message}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleAccept(request.id!)}
                                                disabled={processingId === request.id!}
                                                className="flex-1 px-4 py-3 bg-green-500 text-white border-2 border-slate-900 font-black uppercase tracking-wider hover:bg-green-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {processingId === request.id! ? (
                                                    <BrutalistSpinner size={16} className="text-white border-white" />
                                                ) : (
                                                    <Check className="w-5 h-5" strokeWidth={3} />
                                                )}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id!)}
                                                disabled={processingId === request.id!}
                                                className="flex-1 px-4 py-3 bg-red-500 text-white border-2 border-slate-900 font-black uppercase tracking-wider hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {processingId === request.id! ? (
                                                    <BrutalistSpinner size={16} className="text-white border-white" />
                                                ) : (
                                                    <XCircle className="w-5 h-5" strokeWidth={3} />
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
