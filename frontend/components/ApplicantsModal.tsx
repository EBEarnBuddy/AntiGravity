import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, User, MessageSquare } from 'lucide-react';
import { useStartups } from '@/hooks/useFirestore';
import { Application } from '@/lib/firestore';

interface ApplicantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    startupId: string;
    startupName: string;
}

const ApplicantsModal: React.FC<ApplicantsModalProps> = ({ isOpen, onClose, startupId, startupName }) => {
    const { getApplicants, updateApplicationStatus } = useStartups();
    const [applicants, setApplicants] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && startupId) {
            loadApplicants();
        }
    }, [isOpen, startupId]);

    const loadApplicants = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getApplicants(startupId);
            setApplicants(data);
        } catch (err) {
            setError("Failed to load applicants.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (appId: string, status: 'accepted' | 'rejected') => {
        try {
            // Optimistic update
            setApplicants(prev => prev.map(app =>
                (app._id === appId || (app as any).id === appId) ? { ...app, status } : app
            ));

            await updateApplicationStatus(appId, status);
        } catch (err) {
            console.error(err);
            // Revert on failure (could be improved with deeper rollback logic)
            loadApplicants();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Applicants</h2>
                            <p className="text-slate-500 font-medium text-sm">Managing: <span className="text-green-600">{startupName}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-6 flex-1">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 text-red-500 font-medium">{error}</div>
                        ) : applicants.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <User className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No applicants yet</h3>
                                <p className="text-slate-500">Wait for talent to discover your startup.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applicants.map((app: any) => (
                                    <div key={app._id || app.id} className="border border-slate-200 rounded-xl p-5 hover:border-green-200 transition-colors bg-white shadow-sm flex flex-col sm:flex-row gap-4">
                                        {/* Applicant Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <img
                                                    src={(app.applicant as any)?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                                                    alt="Applicant"
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-slate-900 leading-tight">{(app.applicant as any)?.displayName || 'Anonymous User'}</h3>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {app.message && (
                                                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-3 border border-slate-100 italic">
                                                    "<span className="not-italic">{app.message}</span>"
                                                </div>
                                            )}

                                            {app.details && (
                                                <div className="bg-white p-3 rounded-lg text-sm border border-slate-100 mb-3 shadow-sm">
                                                    <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Application Responses</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(app.details).map(([key, value]) => (
                                                            <div key={key}>
                                                                <span className="font-semibold text-slate-700 block text-xs bg-slate-50 px-1 py-0.5 rounded w-fit mb-0.5">{key}:</span>
                                                                <span className="text-slate-600 block pl-1">{String(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                                                    ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex sm:flex-col gap-2 justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 min-w-[120px]">
                                            {app.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(app._id || app.id, 'accepted')}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition"
                                                    >
                                                        <Check className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(app._id || app.id, 'rejected')}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 hover:text-red-500 hover:border-red-200 transition"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full py-2 text-center text-xs font-bold text-slate-400 uppercase">
                                                    Processing Complete
                                                </div>
                                            )}

                                            <button
                                                onClick={() => alert('User reported to admins.')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition mt-auto"
                                            >
                                                Report User
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ApplicantsModal;
