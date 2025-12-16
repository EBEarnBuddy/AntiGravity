"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoomMessages, useRooms } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import {
    Send,
    Image as ImageIcon,
    Paperclip,
    MoreVertical,
    ChevronLeft,
    Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const RoomChatPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const roomId = params?.roomId as string;
    const { currentUser } = useAuth();

    // In a real app, we'd fetch individual room details efficiently.
    // Reusing useRooms for now, or assume we pass it/fetch it.
    const { rooms } = useRooms();
    const room = rooms.find(r => r.id === roomId);

    const { messages, loading, sendMessage } = useRoomMessages(roomId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !currentUser) return;

        await sendMessage(newMessage, currentUser.uid, 'text');
        setNewMessage('');
        // Optimistic scroll
        setTimeout(scrollToBottom, 50);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!room && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            {/* Room Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/circles')}
                        className="p-2 hover:bg-slate-100 rounded-full transition duration-200 group"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-900" />
                    </button>

                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-100 to-green-50 border border-green-200 flex items-center justify-center overflow-hidden shadow-sm">
                        {room?.avatar ? (
                            <img src={room.avatar} alt="Room" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-black text-green-700">
                                {room?.name?.substring(0, 2).toUpperCase() || '#'}
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-lg font-black text-slate-900 leading-tight">
                            {room?.name || "Loading Room..."}
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-1.5 uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {room?.memberCount || 1} Members Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-slate-50 scroll-smooth">
                {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-bold">No messages yet. Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    // Check if previous message was same sender to group visually if needed (future polish)

                    return (
                        <motion.div
                            key={msg.id || index} // Fallback index if id missing initially
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`px-5 py-3 text-[15px] leading-relaxed shadow-sm
                                    ${isMe
                                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl rounded-tr-sm'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                                <span className={`text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider ${isMe ? 'text-green-600/50' : 'text-slate-400'}`}>
                                    {msg.senderName || 'User'} • {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="bg-slate-50 p-4 pb-6 shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                    <button className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition duration-200">
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <div className="flex-1 py-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none focus:ring-0 px-2 py-2 text-slate-900 placeholder:text-slate-400 resize-none max-h-32 text-[15px] font-medium"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shadow-lg shadow-green-200"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomChatPage;
