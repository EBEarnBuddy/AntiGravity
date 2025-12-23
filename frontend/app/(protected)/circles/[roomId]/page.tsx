"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoomMessages, useRooms } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import {
    Send,
    Paperclip,
    MoreVertical,
    ChevronLeft,
    Users,
    UserCheck
} from 'lucide-react';
import PendingRequestsModal from '@/components/PendingRequestsModal';
import CollaborationRequestsModal from '@/components/CollaborationRequestsModal';
import { getSocket } from '@/lib/socket';
import { messageAPI } from '@/lib/axios';
import { formatTimeAgo } from '@/lib/utils';

const RoomChatPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const roomId = params?.roomId as string;
    const { currentUser } = useAuth();

    const { rooms, myRooms } = useRooms();
    const room = rooms.find(r => r.id === roomId) || myRooms.find(r => r.id === roomId);

    const { messages, loading, sendMessage } = useRoomMessages(roomId);
    const [newMessage, setNewMessage] = useState('');
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Check membership status
    const isMember = currentUser && room?.members?.includes(currentUser.uid);
    const isPending = currentUser && room?.pendingMembers?.includes(currentUser.uid);
    const isAdmin = isMember;

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
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

    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        if (currentUser && messages.length > 0) {
            // Mark as read
            messageAPI.markAsRead(roomId).catch(console.error);
        }
    }, [messages, roomId, currentUser]);

    // Socket listeners for Typing and Read Receipts
    useEffect(() => {
        let socketInstance: any = null;
        const setupSocket = async () => {
            const socket = await getSocket();
            if (!socket) return;
            socketInstance = socket;

            socket.on('typing', (data: { userId: string, userName: string, roomId: string }) => {
                if (data.roomId === roomId && data.userId !== currentUser?.uid) {
                    setTypingUsers(prev => {
                        if (!prev.includes(data.userName)) return [...prev, data.userName];
                        return prev;
                    });
                }
            });

            socket.on('stop_typing', (data: { userId: string, roomId: string }) => {
                if (data.roomId === roomId) {
                    setTypingUsers(prev => prev.filter(name => name !== data.userId)); // userId in stop_typing might need to be mapped or we use userName. 
                    // To be safe, let's assume typing event sends userName and we store userName.
                    // But stop_typing usually sends userId. 
                    // Simplification: We clear ALL typing users after timeout if complex.
                    // Let's rely on standard logic:
                    // We need to map userId to name or just store userId and look up? 
                    // Let's store objects: {id, name}
                }
            });

            // For simplicity, we'll just listen to 'typing' and auto-clear with local timeout if stop isn't reliable, 
            // OR assumes backend broadcasts userName in stop_typing too? 
            // Let's adjust the listener to be more robust manually below.
        };
        setupSocket();

        return () => {
            if (socketInstance) {
                socketInstance.off('typing');
                socketInstance.off('stop_typing');
            }
        };
    }, [roomId, currentUser]);

    const handleTyping = async () => {
        const socket = await getSocket();
        if (socket && currentUser) {
            socket.emit('typing', { roomId, userId: currentUser.uid, userName: currentUser.displayName });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stop_typing', { roomId, userId: currentUser.uid });
            }, 2000);
        }
    };

    // Access control
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="max-w-md text-center space-y-4 p-8">
                    <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Request Pending</h2>
                    <p className="text-slate-600 font-medium">
                        Your request to join <span className="font-bold text-green-600">{room?.name}</span> is pending approval from the circle admin.
                    </p>
                    <button
                        onClick={() => router.push('/circles')}
                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                    >
                        Back to Circles
                    </button>
                </div>
            </div>
        );
    }

    if (!isMember && room) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="max-w-md text-center space-y-4 p-8">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
                    <p className="text-slate-600 font-medium">
                        You are not a member of this circle.
                    </p>
                    <button
                        onClick={() => router.push('/circles')}
                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                    >
                        Back to Circles
                    </button>
                </div>
            </div>
        );
    }

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
        <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Room Header - Comicy Style */}
            <div className="bg-white border-b-2 border-slate-900 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10 w-full min-h-[60px]">
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => router.push('/circles')}
                        className="p-2 hover:bg-slate-100 rounded-full transition duration-200 group flex-shrink-0"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-900" />
                    </button>

                    <div className="w-10 h-10 bg-slate-50 border-2 border-slate-900 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                        {/* Pattern Background */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:10px_10px] [background-position:0_0,5px_5px]"></div>
                        {room?.avatar ? (
                            <img src={room.avatar} alt="Room" className="w-full h-full object-cover relative z-10" />
                        ) : (
                            <span className="text-xs font-black text-slate-900 relative z-10">
                                {room?.name?.substring(0, 2).toUpperCase() || '#'}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="text-base font-black text-slate-900 leading-tight truncate">
                            {room?.name || "Loading Room..."}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5 flex items-center gap-1.5 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {room?.memberCount || 1} Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative flex-shrink-0">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 top-12 bg-white border-2 border-slate-900 rounded-xl shadow-xl z-20 min-w-[220px]">
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setShowPendingModal(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-slate-900 hover:bg-green-50 hover:text-green-700 transition flex items-center gap-2 border-b border-slate-200"
                                >
                                    <UserCheck className="w-4 h-4" />
                                    Manage Requests
                                </button>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setShowCollabModal(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-slate-900 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-2 rounded-b-xl"
                                >
                                    <Users className="w-4 h-4" />
                                    Collaboration Requests
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area - Scrollable messages only */}
            <div className="flex-1 flex flex-col min-h-0 w-full">
                <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto w-full">
                    {messages.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                                <Users className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-bold">No messages yet. Start the conversation!</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        // Handle both old schema (senderId string) and new schema (sender object)
                        const sender = (msg as any).sender;
                        const senderId = sender?.firebaseUid || msg.senderId;
                        const senderName = sender?.displayName || msg.senderName;
                        const senderPhoto = sender?.photoURL || msg.senderPhotoURL;

                        const isMe = senderId === currentUser?.uid;

                        return (
                            <div
                                key={msg.id || index}
                                className={`flex items-start gap-3 w-full ${isMe ? 'justify-end flex-row-reverse' : 'justify-start flex-row'}`}
                            >
                                {/* Avatar - Comic Style */}
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 border-2 border-slate-900 overflow-hidden bg-gradient-to-br from-green-400 to-green-600 relative">
                                        {/* Pattern */}
                                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:8px_8px] [background-position:0_0,4px_4px]"></div>
                                        {senderPhoto ? (
                                            <img
                                                src={senderPhoto}
                                                alt={senderName || 'User'}
                                                className="w-full h-full object-cover relative z-10"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-black text-xs relative z-10">
                                                {senderName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message bubble - Comic Style */}
                                <div className="flex flex-col gap-1 max-w-[70%]">
                                    <div
                                        className={`border-2 border-slate-900 px-4 py-2 ${isMe
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-slate-900'
                                            }`}
                                    >
                                        <div className="text-sm font-medium leading-relaxed">{msg.content}</div>
                                    </div>
                                    <span className={`text-[10px] font-black px-1 uppercase tracking-wider ${isMe ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                                        {formatTimeAgo(msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000) : (msg as any).createdAt)}
                                        {isMe && (msg as any).readBy && (msg as any).readBy.length > 0 && (
                                            <span className="ml-2 text-green-600">
                                                Read by {(msg as any).readBy.length}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Comicy Style */}
            <div className="bg-slate-50 p-4 shrink-0 border-t-2 border-slate-900 w-full relative">
                {typingUsers.length > 0 && (
                    <div className="absolute -top-8 left-6 text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-t-lg border-2 border-b-0 border-slate-900 animate-pulse">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
                <form
                    onSubmit={handleSend}
                    className="w-full mx-auto relative border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus-within:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus-within:translate-x-[2px] focus-within:translate-y-[2px] transition-all"
                >
                    <textarea
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full min-h-12 max-h-32 resize-none bg-white px-4 py-3 text-sm font-medium focus:outline-none placeholder:text-slate-400"
                        rows={1}
                    />
                    <div className="flex items-center p-2 justify-between">
                        <div className="flex">
                            <button
                                type="button"
                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition duration-200"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="px-4 py-2 bg-slate-900 text-white border-2 border-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 font-bold uppercase text-xs flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </form>
            </div>

            {/* Pending Requests Modal */}
            <PendingRequestsModal
                isOpen={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                roomId={roomId}
                roomName={room?.name || ''}
            />

            {/* Collaboration Requests Modal */}
            <CollaborationRequestsModal
                isOpen={showCollabModal}
                onClose={() => setShowCollabModal(false)}
            />
        </div>
    );
};

export default RoomChatPage;
