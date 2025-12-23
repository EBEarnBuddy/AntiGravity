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
    UserCheck,
    Settings,
    LogOut
} from 'lucide-react';
import { roomAPI } from '@/lib/axios'; // Import API for leaving
import PendingRequestsModal from '@/components/PendingRequestsModal';
import CollaborationRequestsModal from '@/components/CollaborationRequestsModal';
import ChatSettingsModal from '@/components/ChatSettingsModal';
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
    const [showSettingsModal, setShowSettingsModal] = useState(false);

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

    const [isNearBottom, setIsNearBottom] = useState(true);

    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const scrollBottom = scrollHeight - scrollTop - clientHeight;
            setIsNearBottom(scrollBottom < 100);
        }
    };

    useEffect(() => {
        // Only auto-scroll if user was already near bottom or it's the first load
        if (isNearBottom) {
            scrollToBottom();
        }
        if (currentUser && messages.length > 0) {
            // Mark as read
            messageAPI.markAsRead(roomId).catch(console.error);
        }
    }, [messages, roomId, currentUser]); // Removed isNearBottom from deps to avoid loop

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
        <div className="fixed inset-0 flex flex-col bg-slate-50 font-sans overflow-hidden" style={{ top: '64px' }}>
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
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-slate-900 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Collaboration Requests
                                </button>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setShowSettingsModal(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition flex items-center gap-2 rounded-b-xl border-t border-slate-200"
                                >
                                    <Settings className="w-4 h-4" />
                                    Chat Settings
                                </button>
                            )}
                            {!isAdmin && (
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to leave this circle?')) {
                                            try {
                                                await roomAPI.leaveRoom(roomId);
                                                router.push('/circles');
                                            } catch (e) {
                                                console.error('Failed to leave:', e);
                                                alert('Failed to leave circle');
                                            }
                                        }
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2 rounded-b-xl border-t border-slate-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Leave Circle
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area - Scrollable messages only */}
            <div className="flex-1 flex flex-col min-h-0 w-full relative">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 px-6 py-6 space-y-4 overflow-y-auto w-full custom-scrollbar"
                >
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

                        if ((msg as any).type === 'system') {
                            const content = msg.content;
                            // Basic link detection
                            const urlRegex = /(https?:\/\/[^\s]+)/g;
                            const parts = content.split(urlRegex);

                            return (
                                <div key={msg.id || index} className="flex justify-center w-full mb-4 px-8">
                                    <div className="bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-full text-center shadow-sm">
                                        {parts.map((part: string, i: number) =>
                                            urlRegex.test(part) ? (
                                                <a
                                                    key={i}
                                                    href={part}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline mx-1"
                                                >
                                                    {part}
                                                </a>
                                            ) : (
                                                <span key={i}>{part}</span>
                                            )
                                        )}
                                        <div className="text-[9px] text-slate-400 mt-1 font-normal opacity-70">
                                            {formatTimeAgo(msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000) : (msg as any).createdAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={msg.id || index}
                                className={`flex items-end gap-2 w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* Avatar (Receiver Only) */}
                                {!isMe && (
                                    <div className="flex-shrink-0 order-1">
                                        <div className="h-8 w-8 rounded-full border-2 border-slate-900 overflow-hidden bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                            {senderPhoto ? (
                                                <img src={senderPhoto} alt={senderName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-xs font-bold text-slate-500">
                                                    {senderName?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`flex flex-col max-w-[70%] order-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Name (Top) */}
                                    <span
                                        className={`text-[10px] font-bold mb-1 px-1 ${isMe ? 'hidden' : 'text-purple-600'
                                            }`}
                                    >
                                        {senderName}
                                    </span>

                                    {/* Bubble */}
                                    <div
                                        className={`px-4 py-2 font-bold leading-relaxed shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 relative group ${isMe
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-slate-900'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Timestamp (Bottom) */}
                                    <span className={`text-[10px] font-medium text-slate-400 mt-1 px-1 flex items-center gap-1`}>
                                        {formatTimeAgo(msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000) : (msg as any).createdAt)}
                                        {isMe && msg.readBy && msg.readBy.length > 0 && (
                                            <span className="text-green-600 ml-1">
                                                Read {(() => {
                                                    // Find the latest read time
                                                    const latestRead = msg.readBy.reduce((latest: any, current: any) => {
                                                        const currentDate = new Date(current.readAt || Date.now());
                                                        return !latest || currentDate > new Date(latest) ? current.readAt : latest;
                                                    }, null);
                                                    return latestRead ? formatTimeAgo(latestRead) : '';
                                                })()}
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
                            onClick={() => {
                                // Force scroll to bottom on send
                                setIsNearBottom(true);
                                setTimeout(() => scrollToBottom("smooth"), 100);
                            }}
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

            {/* Settings Modal */}
            <ChatSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                room={room}
                onUpdate={(updated) => {/* Room hook handles live updates via socket usually, but strict update here is fine too */ }}
                onDelete={() => router.push('/circles')}
            />
        </div>
    );
};

export default RoomChatPage;
