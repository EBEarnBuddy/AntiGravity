"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useFirestore';
import { collaborationAPI } from '@/lib/axios';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-black text-slate-900 mb-2">Request Collaboration</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Send a collaboration request to <span className="font-bold text-slate-900">{targetCircle?.name || 'Unknown'}</span>
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Select Your Circle */}
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Select Your Circle
                    </label>
                    {roomsLoading ? (
                        <div className="text-sm text-slate-400">Loading your circles...</div>
                    ) : ownedCircles.length === 0 ? (
                        <div className="text-sm text-slate-400 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            You don't own any circles yet. Create a circle first to send collaboration requests.
                        </div>
                    ) : (
                        <select
                            value={selectedCircleId}
                            onChange={(e) => setSelectedCircleId(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
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
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Message (Optional)
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message to your collaboration request..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 font-medium resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || ownedCircles.length === 0}
                        className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-green-200"
                    >
                        {sending ? 'Sending...' : 'Send Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollaborationRequestModal;
