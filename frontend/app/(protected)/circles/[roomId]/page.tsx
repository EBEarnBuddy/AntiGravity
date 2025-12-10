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
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!room && !loading) {
        // Ideally show loading state until rooms are fetched
        // or fetch specific room.
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Room Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/circles')}
                        className="p-2 hover:bg-slate-100 rounded-full transition"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center overflow-hidden">
                        {room?.avatar ? (
                            <img src={room.avatar} alt="Room" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-green-700">#</span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-lg font-black text-slate-900 leading-none">
                            {room?.name || "Loading Room..."}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {room?.memberCount || 0} Members
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl text-sm font-medium shadow-sm 
                                    ${isMe
                                        ? 'bg-green-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 px-1">
                                    {msg.senderName} • {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4 shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-2">
                    <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-full transition">
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-green-500 focus-within:bg-white transition-all duration-200">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-slate-900 placeholder:text-slate-400 resize-none max-h-32"
                            rows={1}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomChatPage;
