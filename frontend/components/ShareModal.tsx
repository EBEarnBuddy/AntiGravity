import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Mail, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
    description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, url, description = '' }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description || title);

    const shareLinks = [
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: 'bg-[#0077b5] text-white'
        },
        {
            name: 'Twitter / X',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: 'bg-black text-white'
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            color: 'bg-[#25D366] text-white'
        },
        {
            name: 'Email',
            icon: Mail,
            url: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
            color: 'bg-slate-500 text-white'
        }
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
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
                        className="bg-white border-4 border-slate-900 w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b-4 border-slate-900 bg-slate-50">
                            <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">Share Opportunity</h3>
                            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Copy Link */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Opportunity Link</label>
                                <div className="flex bg-white border-2 border-slate-900 p-1">
                                    <input
                                        readOnly
                                        value={url}
                                        className="flex-1 bg-transparent px-2 text-sm font-bold text-slate-900 outline-none truncate"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="bg-slate-900 text-white px-3 py-1 text-xs font-bold uppercase hover:bg-slate-700 transition"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* Social Buttons */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Share On</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {shareLinks.map((link) => (
                                        <a
                                            key={link.name}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center justify-center gap-2 py-3 px-4 ${link.color} font-bold text-xs uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
                                        >
                                            <link.icon className="w-4 h-4" />
                                            {link.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Decorative Footer Stripe */}
                        <div className="h-2 bg-green-500 border-t-4 border-slate-900"></div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
