import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, Cog6ToothIcon, TrashIcon, CheckIcon, CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { uploadImage } from '../lib/cloudinary';
import { roomAPI } from '../lib/axios';

interface ChatSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: any;
    onUpdate: (updatedRoom: any) => void;
    onDelete: () => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ isOpen, onClose, room, onUpdate, onDelete }) => {
    const [name, setName] = useState(room?.name || '');
    const [description, setDescription] = useState(room?.description || '');
    const [avatar, setAvatar] = useState(room?.avatar || '');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Sync state when room changes
    React.useEffect(() => {
        if (room) {
            setName(room.name || '');
            setDescription(room.description || '');
            setAvatar(room.avatar || '');
        }
    }, [room]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setAvatar(URL.createObjectURL(selectedFile));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let finalAvatar = avatar;
            if (file) {
                // Determine folder based on context if possible, but default to circles
                finalAvatar = await uploadImage(file, 'earnbuddy/circles');
            }

            await roomAPI.updateRoom(room.id || room._id, {
                name,
                description,
                avatar: finalAvatar
            });

            onUpdate({ ...room, name, description, avatar: finalAvatar });
            onClose();
        } catch (error) {
            console.error('Failed to update room:', error);
            alert('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this circle? This action cannot be undone.')) {
            setLoading(true);
            try {
                await roomAPI.deleteRoom(room.id || room._id);
                onDelete();
            } catch (error) {
                console.error('Failed to delete room:', error);
                alert('Failed to delete circle');
            } finally {
                setLoading(false);
            }
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
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Cog6ToothIcon className="w-5 h-5" /> Chat Settings
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
                            <XMarkIcon className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-slate-100 rounded-full border-2 border-slate-900 overflow-hidden relative group">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Img</div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <CloudArrowUpIcon className="w-6 h-6 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase">Change Image</span>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-xs font-bold text-slate-900 uppercase mb-1 block">Chat Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-bold focus:border-slate-900 focus:outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-slate-900 uppercase mb-1 block">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg font-medium text-sm focus:border-slate-900 focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 uppercase text-sm disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : <><CheckIcon className="w-4 h-4" /> Save Changes</>}
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full py-3 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition flex items-center justify-center gap-2 uppercase text-sm"
                        >
                            <TrashIcon className="w-4 h-4" /> Delete Chat
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChatSettingsModal;
