"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Users,
    ChevronRight,
    ChevronLeft,
    Bookmark,
    Share2,
    ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';

const CirclesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { rooms, loading, joinRoom, requestJoin } = useRooms();
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
            // Directly go to dynamic room page which SHOULD have chat
            router.push(`/circles/${room.id}`);
        } else if (isPending) {
            // Already requested
        } else {
            if (room.isPrivate) {
                requestJoin(room.id);
            } else {
                joinRoom(room.id);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header placeholder - assumed handled by Layout */}

            <div className="container mx-auto px-4 py-12 max-w-7xl">

                {/* Hero */}
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-green-600 tracking-tighter">
                        EB Circles
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Explore communities, connect with peers, and find your tribe.
                        Verified ventures and exclusive circles awaiting you.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-6">
                        <button className="px-8 py-3 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition transform hover:-translate-y-1">
                            Browse Circles
                        </button>
                        <button
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 transform hover:-translate-y-1"
                        >
                            Create a Circle
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-20 relative z-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-green-200 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-slate-100">
                            <Search className="ml-4 text-slate-400 w-6 h-6" />
                            <input
                                type="text"
                                placeholder="Search for circles, interests, or communities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-4 pr-4 text-lg outline-none text-slate-700 placeholder:text-slate-400 font-medium bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Active Circles Grid */}
                <div className="mb-24">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Active Communities</h2>
                        <button className="text-green-600 font-bold text-sm flex items-center hover:underline">View All <ChevronRight className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)
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
                                        className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all group relative"
                                    >
                                        {/* Status Dot */}
                                        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${room.isPrivate ? 'bg-purple-500' : 'bg-green-500'} ring-4 ring-white`}></div>

                                        {/* Avatar */}
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 mb-6 relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                            {room.avatar ? (
                                                <img src={room.avatar} alt={room.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Users className="w-8 h-8 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                                            {room.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2 h-10 leading-relaxed">
                                            {room.description || "A community for verified builders and creators."}
                                        </p>

                                        <div className="mt-auto w-full">
                                            <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold text-slate-400 bg-slate-50 py-1.5 px-3 rounded-full w-fit mx-auto">
                                                <Users className="w-3 h-3" />
                                                {(room.memberCount || room.members?.length || 0)} Members
                                            </div>

                                            <button
                                                onClick={() => handleRoomAction(room)}
                                                disabled={!!isPending}
                                                className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 border-2
                                                    ${isMember
                                                        ? 'bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md shadow-green-200'
                                                        : isPending
                                                            ? 'bg-white border-slate-900 text-slate-900 cursor-not-allowed'
                                                            : 'bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md shadow-green-200'
                                                    }
                                                `}
                                            >
                                                {isMember ? (
                                                    <>Enter The Room <ArrowRight className="w-4 h-4" /></>
                                                ) : isPending ? (
                                                    "Requested !"
                                                ) : room.isPrivate ? (
                                                    <>Request To Join <ArrowRight className="w-4 h-4" /></>
                                                ) : (
                                                    <>Join Circle <ArrowRight className="w-4 h-4" /></>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>


                {/* Featured Events (Wireframe "Upcoming Events" style) */}
                {/* Wireframe shows simple green bars with title and details */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Upcoming Events</h2>

                    {[1, 2].map((item) => (
                        <div key={item} className="bg-green-500 rounded-xl overflow-hidden text-white flex flex-col md:flex-row shadow-lg relative group">
                            {/* Graphic/Date Box */}
                            <div className="w-full md:w-48 bg-green-600 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-green-400/30">
                                <span className="text-4xl font-black tracking-tighter">24</span>
                                <span className="text-lg font-bold uppercase opacity-80">Oct</span>
                                <span className="text-xs font-bold mt-2 bg-white/20 px-2 py-1 rounded">Online</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 flex flex-col justify-center relative">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="p-2 hover:bg-white/10 rounded-full transition"><Bookmark className="w-5 h-5" /></button>
                                    <button className="p-2 hover:bg-white/10 rounded-full transition"><Share2 className="w-5 h-5" /></button>
                                </div>

                                <h3 className="text-2xl font-black mb-2">Event Name</h3>
                                <p className="text-white/80 text-sm font-medium mb-4 line-clamp-1">
                                    This type of an event can never occur, because AI rules the design blisters...
                                </p>

                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {['Category', 'Category', 'Category'].map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 border border-white/40 rounded text-[10px] font-bold text-white/80 uppercase">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <button className="px-6 py-2 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-green-600 transition text-sm">
                                        View More
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="text-center text-slate-400 text-sm font-bold mt-24 mb-8">
                    Earnbuddy Pvt. Ltd. all rights reserved
                </footer>

            </div>
        </div>
    );
};

export default CirclesPage;
