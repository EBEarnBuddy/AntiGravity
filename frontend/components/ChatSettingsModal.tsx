import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Trash, Check, CloudUpload } from 'lucide-react';
import { uploadImage } from '../lib/cloudinary';
import { roomAPI } from '../lib/axios';
import { BrutalistSpinner } from '@/components/ui/BrutalistSpinner';

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
                    className="relative w-full max-w-md bg-white border-4 border-slate-900 rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b-4 border-slate-900 flex justify-between items-center bg-white">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                            <Settings className="w-6 h-6" /> Chat Settings
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 border-2 border-transparent hover:border-slate-900 transition-all">
                            <X className="w-6 h-6 text-slate-900 stroke-[3]" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 bg-slate-100 border-4 border-slate-900 overflow-hidden relative group shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">IMG</div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <CloudUpload className="w-8 h-8 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 border border-slate-900">Change Image</span>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-sm font-black text-slate-900 uppercase mb-2 block tracking-wide">Chat Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-900 outline-none font-bold text-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all placeholder:text-slate-300"
                                placeholder="ENTER CHAT NAME"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-black text-slate-900 uppercase mb-2 block tracking-wide">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-slate-900 outline-none font-medium text-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all resize-none placeholder:text-slate-300"
                                placeholder="What is this chat about?"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t-4 border-slate-900 bg-slate-50 flex flex-col gap-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white font-black border-2 border-slate-900 hover:bg-slate-800 transition flex items-center justify-center gap-2 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loading ? <BrutalistSpinner size={20} className="text-white border-white" /> : <><Check className="w-5 h-5 stroke-[3]" /> Save Changes</>}
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full py-4 bg-red-500 text-white font-black border-2 border-slate-900 hover:bg-red-600 transition flex items-center justify-center gap-2 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-wait"
                        >
                            <Trash className="w-5 h-5 stroke-[3]" /> Delete Chat
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChatSettingsModal;
