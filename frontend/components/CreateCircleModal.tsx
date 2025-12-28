import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Lock, Globe, Hash, Zap, Heart, Code, Briefcase, Paintbrush } from 'lucide-react';
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
        icon: 'users',
        avatar: ''
    });

    const icons = [
        { id: 'users', icon: Users, label: 'General' },
        { id: 'code', icon: Code, label: 'Tech' },
        { id: 'briefcase', icon: Briefcase, label: 'Business' },
        { id: 'palette', icon: Paintbrush, label: 'Design' },
        { id: 'heart', icon: Heart, label: 'Health' },
        { id: 'zap', icon: Zap, label: 'Innovation' }
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
                icon: formData.icon,
                avatar: formData.avatar
            } as any); // Use as any to bypass type check for now if avatar is missing in type
            onSuccess();
            onClose();
            setFormData({ name: '', description: '', isPrivate: false, icon: 'users', avatar: '' });
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
                        className="flex flex-col bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] w-full max-w-lg overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-slate-900 bg-green-400">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Create a Circle</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white border-2 border-transparent hover:border-slate-900 transition-all text-slate-900"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-black text-slate-900 uppercase mb-2">Circle Avatar</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 border-2 border-slate-900 flex items-center justify-center overflow-hidden relative">
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                    <label className="cursor-pointer px-4 py-2 bg-white border-2 border-slate-900 text-xs font-black uppercase tracking-wide hover:bg-slate-50 transition shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
                                        Upload Image
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-black text-slate-900 uppercase mb-2">Circle Name</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                                        placeholder="e.g., Marketing Pros"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-black text-slate-900 uppercase mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-slate-900 bg-white text-slate-900 focus:outline-none focus:bg-slate-50 transition-all font-bold placeholder:text-slate-400 resize-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px]"
                                    rows={3}
                                    placeholder="What is this circle about?"
                                />
                            </div>

                            {/* Icon Selection */}
                            <div>
                                <label className="block text-sm font-black text-slate-900 uppercase mb-2">Theme Icon</label>
                                <div className="flex gap-2 flex-wrap">
                                    {icons.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setFormData(prev => ({ ...prev, icon: item.id }))}
                                                className={`p-3 border-2 transition-all flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] ${formData.icon === item.id
                                                    ? 'border-slate-900 bg-green-400 text-slate-900'
                                                    : 'border-slate-900 bg-white hover:bg-slate-100 text-slate-900'
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
                                    className={`flex-1 p-4 border-2 text-left transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] ${!formData.isPrivate
                                        ? 'border-slate-900 bg-green-200'
                                        : 'border-slate-900 bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Globe className={`w-5 h-5 text-slate-900`} />
                                        <span className={`font-black uppercase text-slate-900`}>Public</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-bold">Anyone can see and join</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                                    className={`flex-1 p-4 border-2 text-left transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] ${formData.isPrivate
                                        ? 'border-slate-900 bg-purple-200'
                                        : 'border-slate-900 bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lock className={`w-5 h-5 text-slate-900`} />
                                        <span className={`font-black uppercase text-slate-900`}>Private</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-bold">Invite only access</p>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t-4 border-slate-900 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 font-black uppercase tracking-wide border-2 border-transparent hover:border-slate-900 hover:bg-white text-slate-500 hover:text-slate-900 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name || !formData.description}
                                className={`px-6 py-3 font-black uppercase tracking-wide border-2 border-slate-900 text-white transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${isSubmitting || !formData.name || !formData.description
                                    ? 'bg-slate-400 cursor-not-allowed border-slate-400 shadow-none'
                                    : 'bg-green-600 hover:bg-green-700'
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
