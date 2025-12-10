"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Plus,
    Users,
    ChevronRight,
    ChevronLeft,
    Bookmark,
    Share2,
    Calendar,
    ArrowRight,
    Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';

const CirclesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { rooms, loading, joinRoom, requestJoin } = useRooms(); // Assuming useRooms now fetches relevant rooms
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoomAction = (room: any) => {
        if (!currentUser) return router.push('/auth');

        const isMember = room.members.includes(currentUser.uid);
        const isPending = room.pendingMembers?.includes(currentUser.uid);

        if (isMember) {
            router.push(`/circles/${room.id}`);
        } else if (isPending) {
            // Already requested
        } else {
            // Check if private, if so request, else join
            if (room.isPrivate) {
                requestJoin(room.id);
            } else {
                joinRoom(room.id); // Or redirect to room and join there? 
                // For now, let's assume direct join for public rooms or request for all based on UX
                // Wireframe says "Request To Join" or "Enter The Room".
                // We'll enforce request for all restricted, or auto-join for public.
                // Assuming Join Room handles logic.
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between text-sm font-medium text-slate-600">
                    {/* Nav placeholder */}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-7xl">

                {/* Hero */}
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-green-600 tracking-tight">
                        EB Circles
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg">
                        Explore communities, connect with peers, and find your tribe.
                        Verified ventures and exclusive circles awaiting you.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button className="px-6 py-2 border-2 border-slate-900 text-slate-900 font-bold rounded-lg hover:bg-slate-50 transition">
                            Join a Circle
                        </button>
                        <button
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md"
                        >
                            Create an Event
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-16 relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Web Dev, Range: $500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-6 pr-14 border-2 border-slate-300 rounded-lg text-lg focus:border-green-500 focus:outline-none transition shadow-sm placeholder:text-slate-400 font-medium"
                        />
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)
                    ) : (
                        filteredRooms.map((room, index) => {
                            const isMember = currentUser && room.members.includes(currentUser.uid);
                            const isPending = currentUser && room.pendingMembers?.includes(currentUser.uid);

                            return (
                                <motion.div
                                    key={room.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col items-center text-center hover:border-green-500 transition-all group relative"
                                >
                                    {/* Status Dot */}
                                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${room.isPrivate ? 'bg-purple-500' : 'bg-green-500'}`}></div>

                                    {/* Avatar */}
                                    <div className="w-32 h-32 rounded-full border-2 border-slate-200 bg-slate-50 mb-4 overflow-hidden relative">
                                        <div className="w-full h-full opacity-10 bg-[radial-gradient(#2f9e44_2px,transparent_2px)] [background-size:8px_8px]"></div>
                                        {room.avatar && <img src={room.avatar} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />}
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors">
                                        {room.name}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                        #{room.id?.substring(0, 6).toUpperCase()}
                                    </p>

                                    <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2 min-h-[40px]">
                                        {room.description || "A community for verified builders and creators."}
                                    </p>

                                    <div className="mt-auto w-full space-y-3">
                                        <p className="text-xs text-green-600 font-bold">
                                            Members: {(room.memberCount || room.members?.length || 0) > 1000 ? `${((room.memberCount || 0) / 1000).toFixed(1)}k` : (room.memberCount || 0)}
                                        </p>

                                        <button
                                            onClick={() => handleRoomAction(room)}
                                            disabled={!!isPending}
                                            className={`w-full py-2 border-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                                                ${isMember
                                                    ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                                                    : isPending
                                                        ? 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
                                                        : 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                                                }
                                            `}
                                        >
                                            {isMember ? (
                                                <>Enter The Room <ArrowRight className="w-4 h-4" /></>
                                            ) : isPending ? (
                                                "Requested !"
                                            ) : (
                                                <>Request To Join <ArrowRight className="w-4 h-4" /></>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mb-20">
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-bold text-slate-900">1 / 69</span>
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-900"><ChevronRight className="w-5 h-5" /></button>
                </div>

                {/* Upcoming Events */}
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-slate-800">Upcoming Events</h2>

                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-green-500 rounded-xl overflow-hidden text-white flex flex-col md:flex-row min-h-[200px] relative">
                            {/* Mesh Pattern Left */}
                            <div className="w-full md:w-1/4 bg-green-600/50 p-6 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_2px,transparent_2px)] [background-size:12px_12px]"></div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 flex flex-col justify-center">
                                <h3 className="text-3xl font-black mb-2">Event Name</h3>
                                <p className="text-white/80 text-sm font-bold mb-4">Date: 22nd Feb, 2026 | Venue: Online</p>
                                <p className="text-white/90 text-sm font-medium max-w-2xl mb-6">
                                    This type of an event can never occur, because 26 mein to duniya khatam hai...
                                </p>

                                <button className="px-6 py-2 border-2 border-white rounded-lg font-bold hover:bg-white hover:text-green-600 transition w-fit">
                                    View More
                                </button>
                            </div>

                            {/* Actions Top Right */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-full transition"><Bookmark className="w-5 h-5 fill-white" /></button>
                                <button className="p-2 hover:bg-white/10 rounded-full transition"><Share2 className="w-5 h-5" /></button>
                            </div>

                            {/* Tags Bottom right */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <span className="text-xs font-bold opacity-80">Tags:</span>
                                {['Category', 'Category', 'Category'].map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 border border-white/40 rounded text-[10px] font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="text-center text-slate-500 text-sm font-bold mt-20 mb-8 p-4 border-t border-slate-200 bg-green-500 text-white rounded-t-lg">
                    Earnbuddy Pvt. Ltd. all rights reserved
                </footer>

            </div>
        </div>
    );
};

export default CirclesPage;
