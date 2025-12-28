import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Linkedin, Facebook } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    url: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title = "Share this with friends", url }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareSocial = (platform: string) => {
        let shareUrl = '';
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);

        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
        }

        if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] w-full max-w-md overflow-hidden"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-slate-900 bg-yellow-300">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Share</h2>
                            <button onClick={onClose} className="hover:scale-110 transition-transform text-slate-900">
                                <X className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <h3 className="text-2xl font-black text-slate-900 uppercase leading-none">{title}</h3>

                            {/* Social Icons */}
                            <div className="flex gap-4">
                                <button onClick={() => shareSocial('twitter')} className="w-12 h-12 bg-sky-400 border-2 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-white">
                                    <Twitter className="w-5 h-5 fill-current" />
                                </button>
                                <button onClick={() => shareSocial('linkedin')} className="w-12 h-12 bg-blue-600 border-2 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-white">
                                    <Linkedin className="w-5 h-5 fill-current" />
                                </button>
                                <button onClick={() => shareSocial('facebook')} className="w-12 h-12 bg-blue-500 border-2 border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-white">
                                    <Facebook className="w-5 h-5 fill-current" />
                                </button>
                            </div>

                            {/* Copy Link */}
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Or copy link</label>
                                <div className="flex gap-0">
                                    <div className="flex-1 px-4 py-3 bg-slate-100 border-2 border-slate-900 border-r-0 font-mono text-sm truncate text-slate-600">
                                        {url}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 bg-slate-900 text-white border-2 border-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
