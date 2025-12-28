import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageSquare, Check, AlertTriangle } from 'lucide-react';
import { useRooms } from '@/hooks/useFirestore';
import { collaborationAPI } from '@/lib/axios';

interface RequestCollaborationModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetCircleId?: string; // The circle we are requesting TO
    targetName?: string;
    onSuccess?: () => void;
}

const RequestCollaborationModal: React.FC<RequestCollaborationModalProps> = ({ isOpen, onClose, targetCircleId, targetName, onSuccess }) => {
    const { myRooms, loading: loadingRooms } = useRooms();
    const [selectedCircleId, setSelectedCircleId] = useState<string>('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter for circles user owns or is admin of (simplified to all myRooms for now, or maybe only 'private' or 'community' ones where they are leader)
    // Assuming collaboration can be sent from any circle the user is part of (or maybe just ones they own).
    // Let's assume 'myRooms' contains rooms user is a member of. Ideally we want rooms user manages.
    // For now, list all.
    const eligibleCircles = myRooms || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetCircleId) {
            setError("This opportunity doesn't have a linked circle to collaborate with.");
            return;
        }
        if (!selectedCircleId) {
            setError("Please select one of your circles to collaborate from.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await collaborationAPI.sendRequest(selectedCircleId, targetCircleId, message);
            if (onSuccess) onSuccess();
            onClose();
            alert("Collaboration request sent successfully!");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Failed to send request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
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
                    className="relative w-full max-w-lg bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden"
                >
                    <div className="bg-slate-50 px-6 py-4 border-b-2 border-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 border-2 border-slate-900 flex items-center justify-center text-purple-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Collaborate</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Connect your circle with {targetName || 'Partner'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors border-2 border-transparent hover:border-slate-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-2 border-red-500 flex items-start gap-3 text-red-700">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}

                        {!targetCircleId ? (
                            <div className="p-4 bg-yellow-50 border-2 border-yellow-500 flex items-start gap-3 text-yellow-800">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-bold">This opportunity is not linked to a community circle yet, so collaboration cannot be requested.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <label className="block text-sm font-black text-slate-900 uppercase tracking-wide">
                                        Select Your Circle
                                    </label>
                                    <p className="text-xs text-slate-500 font-bold mb-2">Choose which of your circles represents this partnership.</p>

                                    {loadingRooms ? (
                                        <div className="h-12 bg-slate-100 animate-pulse border-2 border-slate-200" />
                                    ) : (
                                        <select
                                            value={selectedCircleId}
                                            onChange={(e) => setSelectedCircleId(e.target.value)}
                                            required
                                            className="w-full p-3 bg-white border-2 border-slate-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all font-bold text-slate-900"
                                        >
                                            <option value="">-- Select a Circle --</option>
                                            {eligibleCircles.map(room => (
                                                <option key={room.id} value={room.id}>
                                                    {room.name} ({room.memberCount || 1} members)
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {eligibleCircles.length === 0 && !loadingRooms && (
                                        <p className="text-xs text-red-500 font-bold">You don't have any circles to collaborate from.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-black text-slate-900 uppercase tracking-wide">
                                        Proposal Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Hi, we'd love to partner with you on this..."
                                        className="w-full h-32 p-3 bg-white border-2 border-slate-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all resize-none font-medium custom-scrollbar"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 pt-4 border-t-2 border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-black uppercase tracking-wider hover:bg-slate-200 transition-colors border-2 border-transparent hover:border-slate-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedCircleId || !targetCircleId}
                                className="flex-1 py-3 px-4 bg-purple-600 text-white font-black uppercase tracking-wider hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-slate-900 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Users className="w-5 h-5" /> Send Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RequestCollaborationModal;
