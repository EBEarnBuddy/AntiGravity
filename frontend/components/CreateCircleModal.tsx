import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserGroupIcon, LockClosedIcon, GlobeAltIcon, HashtagIcon, BoltIcon, HeartIcon, CodeBracketIcon, BriefcaseIcon, PaintBrushIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useRooms } from '../hooks/useFirestore';

interface CreateCircleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateCircleModal: React.FC<CreateCircleModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const { createRoom } = useRooms();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false,
        icon: 'users'
    });

    const icons = [
        { id: 'users', icon: UserGroupIcon, label: 'General' },
        { id: 'code', icon: CodeBracketIcon, label: 'Tech' },
        { id: 'briefcase', icon: BriefcaseIcon, label: 'Business' },
        { id: 'palette', icon: PaintBrushIcon, label: 'Design' },
        { id: 'heart', icon: HeartIcon, label: 'Health' },
        { id: 'zap', icon: BoltIcon, label: 'Innovation' }
    ];

    const handleSubmit = async () => {
        if (!formData.name || !formData.description) return;
        if (!currentUser) return;

        try {
            setIsSubmitting(true);
            await createRoom({
                name: formData.name,
                description: formData.description,
                isPrivate: formData.isPrivate,
                icon: formData.icon
            });
            onSuccess();
            onClose();
            setFormData({ name: '', description: '', isPrivate: false, icon: 'users' });
        } catch (error) {
            console.error('Failed to create circle:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="flex flex-col bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900">Create a Circle</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Circle Name</label>
                                <div className="relative">
                                    <HashtagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium placeholder:text-slate-400"
                                        placeholder="e.g., Marketing Pros"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all outline-none font-medium placeholder:text-slate-400 resize-none"
                                    rows={3}
                                    placeholder="What is this circle about?"
                                />
                            </div>

                            {/* Icon Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Theme Icon</label>
                                <div className="flex gap-2 flex-wrap">
                                    {icons.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setFormData(prev => ({ ...prev, icon: item.id }))}
                                                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${formData.icon === item.id
                                                    ? 'border-green-600 bg-green-50 text-green-600'
                                                    : 'border-slate-200 hover:border-green-200 text-slate-400'
                                                    }`}
                                                title={item.label}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Privacy */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                                    className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${!formData.isPrivate
                                        ? 'border-green-600 bg-green-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <GlobeAltIcon className={`w-5 h-5 ${!formData.isPrivate ? 'text-green-600' : 'text-slate-400'}`} />
                                        <span className={`font-bold ${!formData.isPrivate ? 'text-slate-900' : 'text-slate-600'}`}>Public</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">Anyone can see and join</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                                    className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${formData.isPrivate
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <LockClosedIcon className={`w-5 h-5 ${formData.isPrivate ? 'text-purple-600' : 'text-slate-400'}`} />
                                        <span className={`font-bold ${formData.isPrivate ? 'text-slate-900' : 'text-slate-600'}`}>Private</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">Invite only access</p>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name || !formData.description}
                                className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${isSubmitting || !formData.name || !formData.description
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                    }`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Circle'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreateCircleModal;
