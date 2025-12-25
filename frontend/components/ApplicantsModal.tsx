import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, User, MessageSquare } from 'lucide-react';
import { useStartups } from '@/hooks/useFirestore';
import { Application } from '@/lib/firestore';
import { BrutalistSpinner } from '@/components/ui/BrutalistSpinner';

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
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-3xl bg-white border-4 border-slate-900 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header - Comic Style */}
                    <div className="flex items-center justify-between p-6 border-b-4 border-slate-900 bg-green-500 relative overflow-hidden">
                        {/* Pattern Background */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white tracking-tight">APPLICANTS</h2>
                            <p className="text-white/90 font-bold text-sm">Managing: <span className="text-yellow-300 font-black">{startupName}</span></p>
                        </div>
                        <button onClick={onClose} className="relative z-10 p-2 bg-white hover:bg-red-500 hover:text-white border-2 border-slate-900 transition-all text-slate-900 hover:scale-110 duration-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                                <BrutalistSpinner size={64} className="text-slate-900" />
                                <p className="mt-6 font-black text-xl uppercase tracking-widest text-slate-900">Loading Applicants...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 px-6 bg-red-100 border-4 border-red-500 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-red-500 border-2 border-slate-900 flex items-center justify-center mx-auto mb-3">
                                        <XCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-red-900 font-black text-lg uppercase">{error}</p>
                                </div>
                            </div>
                        ) : applicants.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
                                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-green-500 border-4 border-slate-900 flex items-center justify-center mb-6 mx-auto">
                                        <User className="w-12 h-12 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase">No Applicants Yet!</h3>
                                    <p className="text-slate-600 font-bold max-w-xs">Your startup is live! Talented builders will discover it soon. 🚀</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {applicants.map((app: any) => (
                                    <div key={app._id || app.id} className="border-4 border-slate-900 rounded-none p-6 hover:border-green-600 transition-all duration-300 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(34,197,94,0.5)] hover:translate-x-[-2px] hover:translate-y-[-2px] flex flex-col sm:flex-row gap-6 relative">
                                        {/* Applicant Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-slate-900 overflow-hidden bg-slate-100">
                                                        <img
                                                            src={(app.applicant as any)?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                                                            alt="Applicant"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white"></div>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl text-slate-900 leading-tight uppercase tracking-tight">{(app.applicant as any)?.displayName || 'Anonymous UserIcon'}</h3>
                                                    <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {app.message && (
                                                <div className="bg-yellow-100 border-2 border-slate-900 p-4 mb-4 relative overflow-hidden">
                                                    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>
                                                    <div className="relative z-10">
                                                        <MessageSquare className="w-4 h-4 text-slate-900 mb-2" />
                                                        <p className="text-sm text-slate-900 font-bold italic">"{app.message}"</p>
                                                    </div>
                                                </div>
                                            )}

                                            {app.details && (
                                                <div className="bg-white border-2 border-slate-900 p-4 mb-4 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                                    <h4 className="font-black text-green-600 text-xs uppercase mb-3 tracking-widest border-b-2 border-green-600 pb-2">📋 Application Responses</h4>
                                                    <div className="space-y-3">
                                                        {Object.entries(app.details).map(([key, value]) => (
                                                            <div key={key} className="bg-slate-50 border-2 border-slate-200 p-3">
                                                                <span className="font-black text-slate-900 block text-xs mb-1 uppercase">{key}:</span>
                                                                <span className="text-slate-700 block text-sm font-bold">{String(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1.5 border-2 border-slate-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]
                                                    ${app.status === 'accepted' ? 'bg-green-500 text-white' :
                                                        app.status === 'rejected' ? 'bg-red-500 text-white' :
                                                            'bg-yellow-400 text-slate-900'}`}>
                                                    {app.status === 'accepted' && <Check className="w-3 h-3" />}
                                                    {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex sm:flex-col gap-3 justify-center border-t-2 sm:border-t-0 sm:border-l-2 border-slate-900 pt-4 sm:pt-0 sm:pl-6 mt-2 sm:mt-0 min-w-[140px]">
                                            {app.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(app._id || app.id, 'accepted')}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 border-2 border-slate-900 text-white text-xs font-black uppercase hover:bg-green-700 transition-all hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                                                    >
                                                        <Check className="w-4 h-4" /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(app._id || app.id, 'rejected')}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-900 text-slate-900 text-xs font-black uppercase hover:bg-red-500 hover:text-white transition-all hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full py-3 px-3 text-center text-xs font-black text-slate-500 uppercase bg-slate-100 border-2 border-slate-300">
                                                    ✓ Complete
                                                </div>
                                            )}

                                            <button
                                                onClick={() => alert('UserIcon reported to admins.')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-black text-slate-400 hover:text-red-600 transition mt-auto uppercase hover:bg-red-50 border-2 border-transparent hover:border-red-200"
                                            >
                                                Report
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
