"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomMessages, useRooms } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import {
    Send,
    Paperclip,
    MoreVertical,
    ChevronLeft,
    ChevronDown,
    Users,
    UserPlus,
    Settings,
    LogOut,
    Info,
    Copy,
    Trash,
    Edit,
    Eye,
    X
} from 'lucide-react';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { FirestoreService } from '@/lib/firestore';
import PendingRequestsModal from '@/components/PendingRequestsModal';
import CollaborationRequestsModal from '@/components/CollaborationRequestsModal';
import ChatSettingsModal from '@/components/ChatSettingsModal';
import { formatTimeAgo } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Linkify } from '@/components/ui/linkify';
import { uploadImage } from '@/lib/cloudinary';

const RoomChatPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const paramRoomId = params?.roomId as string;
    const { currentUser, userProfile } = useAuth();

    const { rooms, myRooms } = useRooms();

    // Resolve Room: Check both ID and Slug
    const room = rooms.find(r => r.id === paramRoomId || r.slug === paramRoomId)
        || myRooms.find(r => r.id === paramRoomId || r.slug === paramRoomId);

    // Use resolved ID if available, otherwise fallback to param (which might be an ID even if room not found yet)
    // If param is a slug but room not found, this might fail API call until room loads, which is acceptable
    const activeRoomId = room?.id || paramRoomId;

    const { messages, loading, sendMessage, onlineUsers, typingUsers, notifyTyping, loadMore, hasMore, isLoadingMore, deleteMessage, updateMessage } = useRoomMessages(activeRoomId);
    const [newMessage, setNewMessage] = useState('');
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Editing State
    const [editingMessage, setEditingMessage] = useState<{ id: string, content: string } | null>(null);

    // ... (Scroll refs/effects - keep existing)

    // Scroll Management for Pagination
    const previousScrollHeightRef = useRef<number>(0);

    useEffect(() => {
        if (isLoadingMore && scrollContainerRef.current) {
            previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
        }
    }, [isLoadingMore]);

    useEffect(() => {
        if (!isLoadingMore && previousScrollHeightRef.current > 0 && scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            const diff = newScrollHeight - previousScrollHeightRef.current;
            if (diff > 0) {
                scrollContainerRef.current.scrollTop = diff; // Restore relative position
            }
            previousScrollHeightRef.current = 0;
        }
    }, [messages, isLoadingMore]);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, message: any } | null>(null);
    // Removed readInfoMessage state

    // ... (Refs - keep existing)
    const contextMenuRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(contextMenuRef, () => setContextMenu(null));

    const menuRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(menuRef, () => setShowMenu(false));
    useOnClickOutside(infoRef, () => setShowInfo(false));

    // ... (Mention logic - keep existing)
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionIndex, setMentionIndex] = useState<number>(-1);
    const [mentionCandidates, setMentionCandidates] = useState<any[]>([]);

    useEffect(() => {
        if (mentionQuery !== null) {
            const candidates = new Map();
            onlineUsers.forEach((u: any) => {
                if (u.userId !== currentUser?.uid) {
                    candidates.set(u.userId, { uid: u.userId, username: u.userName, avatar: u.userAvatar });
                }
            });
            messages.forEach((msg: any) => {
                const s = msg.sender;
                const uid = s?.firebaseUid || msg.senderId;
                if (uid && uid !== currentUser?.uid) {
                    const username = s?.username || s?.displayName || msg.senderName;
                    if (username) {
                        candidates.set(uid, { uid, username, avatar: s?.photoURL || msg.senderPhotoURL });
                    }
                }
            });
            const filtered = Array.from(candidates.values()).filter((c: any) =>
                c.username?.toLowerCase().includes(mentionQuery.toLowerCase())
            );
            setMentionCandidates(filtered.slice(0, 5));
        } else {
            setMentionCandidates([]);
        }
    }, [mentionQuery, onlineUsers, messages, currentUser]);

    const handleInputParams = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNewMessage(val);
        notifyTyping();

        const cursorInfo = e.target.selectionStart;
        const textBeforeBox = val.substring(0, cursorInfo);
        const lastAt = textBeforeBox.lastIndexOf('@');

        if (lastAt !== -1) {
            const query = textBeforeBox.substring(lastAt + 1);
            if (!query.includes(' ')) {
                setMentionQuery(query);
                setMentionIndex(lastAt);
                return;
            }
        }
        setMentionQuery(null);
        setMentionIndex(-1);
    };

    const insertMention = (username: string) => {
        if (mentionIndex === -1) return;
        const before = newMessage.substring(0, mentionIndex);
        // Clean username: remove spaces
        const cleanUsername = username.replace(/\s+/g, '');
        const after = newMessage.substring(mentionIndex + (mentionQuery?.length || 0) + 1);
        setNewMessage(`${before}@${cleanUsername} ${after}`);
        setMentionQuery(null);
        setMentionIndex(-1);
        // Focus back on textarea if needed, though react state update usually handle it. 
        // We might need a ref to textarea to strictly focus it.
    };

    // File Upload Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        try {
            // Optimistic / Loading state could be added here
            const url = await uploadImage(file, `earnbuddy/circles/${activeRoomId}`);
            await sendMessage(url, 'image'); // Send as image type
        } catch (error) {
            console.error("Failed to upload file", error);
            alert("Failed to upload image.");
        }
    };



    // Check membership status
    const isMember = currentUser && room?.members?.includes(currentUser.uid);
    const isPending = currentUser && room?.pendingMembers?.includes(currentUser.uid);

    // Admin Check: Owner OR (todo: fetch explicit admin role) - For now restricting to Owner/Creator as "Admin" for settings
    const isOwner = React.useMemo(() => {
        if (!currentUser || !room) return false;

        const createdBy = (room as any).createdBy;
        // creatorId could be MongoID string, or object with _id
        const creatorMongoId = typeof createdBy === 'object' ? (createdBy?._id || createdBy?.id) : createdBy;

        // 1. Check if creator matches MongoID of current user (Best for MongoDB relations)
        if (userProfile?.id && creatorMongoId === userProfile.id) return true;

        // 2. Check if creator matches Firebase UID (Legacy/Simple)
        if (creatorMongoId === currentUser.uid) return true;

        // 3. Check explicit Firebase UID field on room
        const creatorFirebaseUid = (room as any).createdByUid || (room as any).ownerId;
        if (creatorFirebaseUid === currentUser.uid) return true;

        // 4. Check if populated createdBy object has a firebaseUid field that matches
        if (typeof createdBy === 'object' && createdBy?.firebaseUid === currentUser.uid) return true;

        // 5. Check postedBy (for Opportunity/Startup Circles)
        const postedBy = (room as any).postedBy;
        const postedByUid = typeof postedBy === 'object' ? (postedBy?.firebaseUid || postedBy?._id) : postedBy;
        if (postedByUid === currentUser.uid) return true;

        // 6. Check founderId (for Startups)
        if ((room as any).founderId === currentUser.uid) return true;

        return false;
    }, [currentUser, userProfile, room]);

    const isAdmin = isOwner; // Temporarily equates admin to owner until role fetch is added

    const handleSaveEdit = async () => {
        if (editingMessage && editingMessage.content.trim()) {
            await updateMessage(editingMessage.id, editingMessage.content);
            setEditingMessage(null);
        }
    };

    const handleEditKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            setEditingMessage(null);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const msgToSend = newMessage; // Capture value
        if (!msgToSend.trim() || !currentUser) return;

        setNewMessage(''); // Clear immediately for UX
        // Hook handles clearing typing state on sendMessage trigger


        try {
            await sendMessage(msgToSend, 'text');
        } catch (err) {
            // Optional: Restore message on failure if critical, but for chat UI usually we show a 'failed' state on the message bubble instead. 
            // For now, simpler is better as per instructions.
            console.error(err);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line
            handleSend();
        }
        // Shift+Enter will naturally insert new line (default behavior of textarea)
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

            if (scrollTop === 0 && hasMore && !isLoadingMore) {
                loadMore();
            }
        }
    };

    const groupedMessages = React.useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        messages.forEach(msg => {
            const date = msg.timestamp?.seconds
                ? new Date(msg.timestamp.seconds * 1000)
                : new Date((msg as any).createdAt || Date.now());

            let dateKey = date.toLocaleDateString();
            const today = new Date().toLocaleDateString();
            const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

            if (dateKey === today) dateKey = 'Today';
            else if (dateKey === yesterday) dateKey = 'Yesterday';
            else {
                dateKey = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            }

            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(msg);
        });
        return groups;
    }, [messages]);

    useEffect(() => {
        // Only auto-scroll if user was already near bottom or it's the first load
        if (isNearBottom) {
            scrollToBottom();
        }
        if (currentUser && messages.length > 0) {
            // Mark as read handled by hook/socket now, but generic API call backup is fine
            FirestoreService.markMessagesAsRead(activeRoomId, currentUser.uid).catch(console.error);
        }
    }, [messages, activeRoomId, currentUser]);



    // Access control
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="max-w-md text-center space-y-4 p-8">
                    <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-10 h-10 text-yellow-600" />
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
        <div className="fixed inset-0 flex flex-col bg-slate-50 font-sans overflow-hidden" style={{ top: '64px', height: 'calc(100dvh - 64px)' }}>
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
                            {onlineUsers.length > 0 ? onlineUsers.length : 1} Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative flex-shrink-0">
                    <div className="relative" ref={infoRef}>
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition"
                        >
                            <Info className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                            {showInfo && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                    className="absolute right-0 top-12 bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] z-20 w-64 p-4"
                                >
                                    <h3 className="font-black text-lg text-slate-900 mb-2 uppercase border-b-2 border-slate-100 pb-2">Circle Info</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Name</p>
                                            <p className="font-bold text-slate-900">{room?.name}</p>
                                        </div>
                                        {room?.description && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Description</p>
                                                <p className="text-sm font-medium text-slate-700">{room.description}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Members</p>
                                            <p className="text-sm font-black text-green-600">{room?.members?.length || 0} Members</p>
                                        </div>
                                        <div className="pt-2 flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    alert('Circle link copied to clipboard!');
                                                    setShowInfo(false);
                                                }}
                                                className="w-full py-2 bg-green-100 text-green-700 text-xs font-black uppercase rounded-lg hover:bg-green-200 transition flex items-center justify-center gap-2"
                                            >
                                                <Copy className="w-3 h-3" />
                                                Copy Invite Link
                                            </button>
                                            <button
                                                onClick={() => setShowInfo(false)}
                                                className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-black uppercase rounded-lg cursor-not-allowed"
                                            >
                                                Members (View Only)
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative" ref={menuRef}>
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
                                        <UserPlus className="w-4 h-4" />
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
                                            if (!currentUser) return;
                                            if (confirm('Are you sure you want to leave this circle?')) {
                                                try {
                                                    await FirestoreService.leaveRoom(activeRoomId, currentUser.uid);
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

                    {isLoadingMore && (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                        </div>
                    )}

                    {Object.entries(groupedMessages).map(([dateLabel, groupMsgs]) => (
                        <div key={dateLabel}>
                            {/* Date Divider */}
                            <div className="flex justify-center mb-6 sticky top-0 z-10">
                                <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border border-slate-300">
                                    {dateLabel}
                                </span>
                            </div>

                            {groupMsgs.map((msg, index) => {
                                // Handle both old schema (senderId string) and new schema (sender object)
                                const sender = (msg as any).sender;
                                const senderId = sender?.firebaseUid || msg.senderId;
                                const senderName = sender?.displayName || msg.senderName;
                                const senderPhoto = sender?.photoURL || msg.senderPhotoURL;

                                const isMe = senderId === currentUser?.uid;

                                if ((msg as any).type === 'system') {
                                    const content = msg.content;
                                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                                    const parts = content.split(urlRegex);

                                    return (
                                        <motion.div
                                            key={msg.id || `${dateLabel}-${index}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-center w-full mb-4 px-8 relative z-0"
                                        >
                                            <div className="bg-purple-600 border-2 border-slate-900 text-white text-xs font-bold px-4 py-2 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                {parts.map((part: string, i: number) =>
                                                    urlRegex.test(part) ? (
                                                        <a
                                                            key={i}
                                                            href={part}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-yellow-300 hover:text-white underline mx-1"
                                                        >
                                                            {part}
                                                        </a>
                                                    ) : (
                                                        <span key={i}>{part}</span>
                                                    )
                                                )}
                                                <div className="text-[9px] text-purple-200 mt-1 font-normal opacity-80">
                                                    {formatTimeAgo(msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000) : (msg as any).createdAt)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={msg.id || `${dateLabel}-${index}`}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                        className={`flex items-end gap-2 w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isMe && (
                                            <div className="flex-shrink-0 order-1">
                                                <UserAvatar
                                                    src={senderPhoto}
                                                    alt={senderName}
                                                    uid={senderId}
                                                    username={sender.username} // Assuming sender object has username, otherwise fallback to UID linking
                                                    size={32}
                                                    className="bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                                                />
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
                                            {editingMessage && editingMessage.id === msg.id ? (
                                                <div className="flex flex-col items-end gap-2 w-full max-w-[400px]">
                                                    <textarea
                                                        value={editingMessage.content}
                                                        onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                                                        onKeyDown={handleEditKeyPress}
                                                        autoFocus
                                                        className="w-full px-4 py-3 bg-white border-2 border-slate-900 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all resize-none text-sm font-medium"
                                                        rows={3}
                                                    />
                                                    <div className="flex gap-2 text-[10px] font-black uppercase">
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="px-3 py-1 bg-green-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600 active:translate-y-[2px] active:shadow-none transition-all"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingMessage(null)}
                                                            className="px-3 py-1 bg-slate-200 text-slate-600 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-300 active:translate-y-[2px] active:shadow-none transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">Esc to cancel • Enter to save</span>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`px-4 py-2 font-bold leading-relaxed shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] border-2 border-slate-900 relative group whitespace-pre-wrap break-all break-words ${isMe
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-white text-slate-900'
                                                        }`}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        setContextMenu({ x: e.clientX, y: e.clientY, message: { ...msg, isMe } });
                                                    }}
                                                >
                                                    {msg.content.split(/(@\w+)/g).map((part: string, i: number) => {
                                                        if (part.match(/^@\w+$/)) {
                                                            const username = part.substring(1);
                                                            // Handle @all separately
                                                            if (username.toLowerCase() === 'all') {
                                                                return <span key={i} className="text-purple-600 font-black">{part}</span>;
                                                            }
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => router.push(`/u/${username}`)} // Adjust route as needed
                                                                    className={`${isMe ? 'text-white underline' : 'text-purple-600'} font-black hover:opacity-80 transition`}
                                                                >
                                                                    {part}
                                                                </button>
                                                            );
                                                        }
                                                        return <Linkify key={i} className={isMe ? "text-yellow-300 hover:text-white underline" : "text-purple-600 hover:text-purple-800 underline"}>{part}</Linkify>;
                                                    })}
                                                </div>
                                            )}

                                            {/* Timestamp & Read Status (Bottom) */}
                                            <span className={`text-[10px] font-medium text-slate-400 mt-1 px-1 flex items-center flex-wrap gap-1 ${isMe ? 'justify-end' : ''}`}>
                                                <span>{formatTimeAgo(msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000) : (msg as any).createdAt)}</span>
                                                {(msg as any).updatedAt && (msg as any).updatedAt !== (msg as any).createdAt && (
                                                    <span className="text-xs italic">(edited)</span>
                                                )}
                                                {isMe && msg.readBy && msg.readBy.length > 0 && (
                                                    <span className="text-green-600 font-bold ml-1 flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        Read by {msg.readBy.length}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })
                            }
                        </div>
                    ))}
                    {/* Invisible div to scroll to bottom */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Scroll to Bottom Button */}
                <AnimatePresence>
                    {!isNearBottom && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            onClick={() => scrollToBottom()}
                            className="absolute bottom-6 right-8 z-20 p-3 bg-white text-slate-900 border-2 border-slate-900 rounded-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center group"
                        >
                            <ChevronDown className="w-6 h-6 group-hover:text-green-600 transition-colors" />
                            {/* Optional: Unread count badge if needed later */}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area - Comicy Style */}
            <div className="bg-slate-50 p-4 shrink-0 border-t-2 border-slate-900 w-full relative">
                <AnimatePresence>
                    {mentionCandidates.length > 0 && mentionQuery !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-4 mb-2 bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] z-30 min-w-[200px] overflow-hidden"
                        >
                            <div className="bg-slate-100 px-3 py-2 text-[10px] uppercase font-black text-slate-500 border-b-2 border-slate-900">
                                Mention Someone
                            </div>
                            {mentionCandidates.map((c, idx) => (
                                <button
                                    key={c.uid || idx}
                                    onClick={() => insertMention(c.username)}
                                    className="w-full text-left px-4 py-3 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-3 border-b border-slate-100 last:border-0"
                                >
                                    <UserAvatar
                                        src={c.avatar}
                                        alt={c.username}
                                        uid={c.uid}
                                        size={24}
                                        className="bg-purple-100"
                                    />
                                    <span className="font-bold text-sm w-full truncate">{c.username}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {typingUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute -top-12 left-6 flex items-end gap-2 z-20 pointer-events-none"
                        >
                            {/* Horizontal Stack of Typing Users */}
                            <div className="flex -space-x-2 mr-2">
                                {typingUsers.map((u: any, idx: number) => (
                                    <div key={idx} className="relative z-10 border-2 border-white rounded-full">
                                        <UserAvatar
                                            src={u.userAvatar}
                                            alt={u.userName}
                                            uid={u.userId}
                                            username={u.userName?.replace(' ', '').toLowerCase()}
                                            size={24}
                                            className="bg-white"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Typing Bubble with Dots */}
                            <div className="bg-white border-2 border-slate-900 rounded-2xl rounded-bl-none px-3 py-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center gap-1 min-h-[36px]">
                                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce [animation-duration:0.6s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]"></span>
                            </div>


                        </motion.div>
                    )}

                    {/* Mention Suggestions */}
                    {mentionCandidates.length > 0 && (
                        <div className="absolute bottom-full left-4 mb-2 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] z-30 min-w-[200px] overflow-hidden">
                            <div className="bg-slate-100 px-3 py-1 border-b-2 border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                Mention Member
                            </div>
                            {mentionCandidates.map((user: any) => (
                                <button
                                    key={user.uid}
                                    onClick={() => insertMention(user.username)}
                                    className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2 transition-colors border-b border-slate-100 last:border-0"
                                >
                                    <UserAvatar
                                        src={user.avatar}
                                        alt={user.username}
                                        username={user.username}
                                        size={24}
                                        className="bg-white border border-slate-200"
                                    />
                                    <span className="font-bold text-sm text-slate-900">{user.username}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
                <form
                    onSubmit={handleSend}
                    className="w-full mx-auto relative border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus-within:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus-within:translate-x-[2px] focus-within:translate-y-[2px] transition-all"
                >
                    <textarea
                        value={newMessage}
                        onChange={handleInputParams}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full min-h-12 max-h-32 resize-none bg-white px-4 py-3 text-sm font-medium focus:outline-none placeholder:text-slate-400"
                        rows={1}
                    />
                    <div className="flex items-center p-2 justify-between">
                        <div className="flex">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*" // Restrict to images for now
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
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

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-50 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 180) }}
                >
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(contextMenu.message.content);
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-black uppercase hover:bg-slate-100 flex items-center gap-2"
                    >
                        <Copy className="w-3 h-3" /> Copy Text
                    </button>

                    {contextMenu.message.isMe && (
                        <>
                            <button
                                onClick={() => {
                                    setEditingMessage({ id: contextMenu.message.id || contextMenu.message._id, content: contextMenu.message.content });
                                    setContextMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-black uppercase hover:bg-purple-50 text-slate-900 flex items-center gap-2"
                            >
                                <Edit className="w-3 h-3" /> Edit
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this message?')) {
                                        deleteMessage(contextMenu.message.id || contextMenu.message._id);
                                    }
                                    setContextMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-black uppercase hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                                <Trash className="w-3 h-3" /> Delete
                            </button>
                        </>
                    )}
                </div>
            )}



            {/* Pending Requests Modal */}
            <PendingRequestsModal
                isOpen={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                roomId={activeRoomId}
                roomName={room?.name || ''}
            />

            {/* Collaboration Requests Modal */}
            <CollaborationRequestsModal
                isOpen={showCollabModal}
                onClose={() => setShowCollabModal(false)}
                roomId={activeRoomId}
            />

            {/* Chat Settings Modal */}
            <ChatSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                room={room}
                onUpdate={(updatedRoom) => {
                    // Check if slug changed and we are currently viewing it
                    if (updatedRoom.slug && updatedRoom.slug !== paramRoomId) {
                        // Redirect to new slug
                        router.replace(`/circles/${updatedRoom.slug}`);
                    }
                }}
                onDelete={() => router.push('/circles')}
            />
        </div >
    );
};

export default RoomChatPage;
