"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useFirestore';
import { collaborationAPI } from '@/lib/axios';
import { BrutalistSpinner } from '@/components/ui/BrutalistSpinner';

interface CollaborationRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetCircle: {
        id: string;
        name: string;
        description?: string;
    } | null;
    onSuccess?: () => void;
}

const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
    isOpen,
    onClose,
    targetCircle,
    onSuccess
}) => {
    const { currentUser } = useAuth();
    const { myRooms, loading: roomsLoading } = useRooms();
    const [selectedCircleId, setSelectedCircleId] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Filter to only show circles owned by current user
    const ownedCircles = myRooms.filter(room => {
        // Use createdByUid if available, fallback to createdBy
        const creatorUid = (room as any).createdByUid || room.createdBy;
        return creatorUid === currentUser?.uid && room.id !== targetCircle?.id;
    });

    useEffect(() => {
        if (isOpen && ownedCircles.length > 0 && !selectedCircleId) {
            setSelectedCircleId(ownedCircles[0].id || '');
        }
    }, [isOpen, ownedCircles]);

    const handleSend = async () => {
        if (!selectedCircleId) {
            setError('Please select a circle');
            return;
        }

        if (!targetCircle?.id) {
            setError('Target circle not found');
            return;
        }

        setSending(true);
        setError('');

        try {
            await collaborationAPI.sendRequest(selectedCircleId, targetCircle.id, message);
            onSuccess?.();
            onClose();
            // Reset form
            setMessage('');
            setSelectedCircleId('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send collaboration request');
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md bg-white border-4 border-slate-900 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b-4 border-slate-900 bg-green-400">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Request Collab</h2>
                                <p className="text-slate-900 font-bold text-xs uppercase opacity-80">
                                    With: {targetCircle?.name || 'Unknown'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white border-2 border-slate-900 hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                            >
                                <X className="w-5 h-5 stroke-[3]" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-white space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-100 border-2 border-slate-900 text-red-900 font-bold text-sm flex items-center gap-2">
                                    <X className="w-4 h-4" /> {error}
                                </div>
                            )}

                            {/* Select Your Circle */}
                            <div>
                                <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">
                                    Select Your Circle
                                </label>
                                {roomsLoading ? (
                                    <div className="text-sm text-slate-400 font-bold animate-pulse">Loading your circles...</div>
                                ) : ownedCircles.length === 0 ? (
                                    <div className="text-sm font-bold text-slate-500 p-4 bg-slate-100 border-2 border-slate-900">
                                        You don't own any circles yet. Create a circle first.
                                    </div>
                                ) : (
                                    <select
                                        value={selectedCircleId}
                                        onChange={(e) => setSelectedCircleId(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-slate-900 rounded-none bg-white font-bold focus:shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] focus:outline-none transition-all"
                                    >
                                        {ownedCircles.map((circle) => (
                                            <option key={circle.id} value={circle.id}>
                                                {circle.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Optional Message */}
                            <div>
                                <label className="block text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="WHY DO YOU WANT TO COLLABORATE?"
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-slate-900 rounded-none bg-white font-bold focus:shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] focus:outline-none transition-all resize-none placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t-4 border-slate-900 bg-slate-50 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border-2 border-slate-900 text-slate-900 font-black uppercase tracking-wider hover:bg-slate-200 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending || ownedCircles.length === 0}
                                className="flex-1 px-4 py-3 bg-green-500 text-white font-black uppercase tracking-wider border-2 border-slate-900 hover:bg-green-600 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <BrutalistSpinner size={20} className="text-white border-white" />
                                ) : (
                                    <>
                                        Send <Send className="w-4 h-4 stroke-[3]" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CollaborationRequestModal;
