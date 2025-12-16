"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Bookmark,
    Rocket,
    Share2,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStartups } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';
import CreateStartupModal from '@/components/CreateStartupModal';
import StartupApplicationModal from '@/components/StartupApplicationModal';

const StartupsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { startups, loading, applyToStartup, bookmarkStartup } = useStartups();
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [selectedStartup, setSelectedStartup] = useState<any>(null);

    // Filter Startups
    const filteredStartups = startups.filter(startup => {
        const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            startup.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleApplyToStartup = (startup: any) => {
        setSelectedStartup(startup);
        setShowApplicationModal(true);
    };

    const handleBookmarkStartup = async (startupId: string) => {
        if (!currentUser) return;
        try {
            await bookmarkStartup(startupId, currentUser.uid);
        } catch (error) {
            console.error('Error bookmarking startup:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header (Layout handles this, but spacing needed) */}
            <div className="h-12"></div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Hero / Title Section */}
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-green-600 tracking-tighter">
                        EB LaunchPad
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg">
                        Explore opportunities posted by verified ventures from across the globe.
                        Find the one venture that changes your life!
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-6">
                        <button className="px-6 py-2.5 border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition transform hover:-translate-y-0.5">
                            Search Filters
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 transform hover:-translate-y-0.5"
                        >
                            Post an Opportunity
                        </button>
                    </div>
                </div>

                {/* Search Bar - Wireframe Style */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="CEO, World Bank"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-6 pr-14 border-2 border-slate-900 rounded-xl text-lg focus:outline-none transition shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px] placeholder:text-slate-400 font-bold"
                        />
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-900 w-6 h-6" />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full">

                    {/* Startup Cards */}
                    <div>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filteredStartups.map((startup, index) => (
                                        <motion.div
                                            key={startup.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white border-2 border-slate-900 rounded-none p-4 hover:border-green-600 transition-colors duration-300 group flex flex-col relative"
                                        >
                                            {/* Wireframe Image Placeholder (Checked Box Pattern) */}
                                            <div className="aspect-[4/3] bg-slate-50 relative border-2 border-slate-200 mb-4 overflow-hidden">
                                                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>

                                                {/* Category Badge Top Center */}
                                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-4 py-1 rounded-b-lg uppercase">
                                                    {startup.industry || 'Category'}
                                                </div>
                                            </div>

                                            {/* Header Info */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-green-600 transition-colors">
                                                        {startup.name}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-500 font-bold">
                                                        Founded: {startup.foundedDate || 'Sept. 1991'} | {startup.location || 'London'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Share2 className="w-4 h-4 text-green-600" />
                                                </div>
                                            </div>

                                            {/* Meta Tags */}
                                            <p className="text-[10px] text-slate-500 font-medium mb-4 text-center">
                                                {startup.roles?.length || 8} Roles | Equity and Salary Based | Urgent Requirement
                                            </p>

                                            {/* Button */}
                                            <div className="mt-auto">
                                                <button
                                                    onClick={() => handleApplyToStartup(startup)}
                                                    className="w-full py-2 bg-white border-2 border-slate-900 text-slate-900 text-xs font-bold uppercase hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-0.5"
                                                >
                                                    View All Roles
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-4 mt-12 mb-12">
                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                            <span className="font-bold text-slate-900">1 / 69</span>
                            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-900"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA Section */}
                <div className="bg-green-500 rounded-3xl p-12 text-center text-white mt-12 relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                        <h2 className="text-4xl md:text-5xl font-black">
                            Starting out something of your own?
                        </h2>
                        <p className="text-white/90 text-lg font-medium leading-relaxed">
                            Join thousands of founders building their dreams on EarnBuddy.
                            Find your co-founder, build your team, and launch your vision.
                        </p>

                        <div className="flex items-center justify-center gap-4 pt-4">
                            <button className="px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-green-600 transition">
                                Learn How It works
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 border-2 border-white bg-white/10 text-white font-bold rounded-lg hover:bg-white hover:text-green-600 transition"
                            >
                                Post your Opportunity
                            </button>
                        </div>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,transparent_1px)] [background-size:24px_24px]"></div>
                </div>

                <footer className="text-center text-slate-400 text-sm font-bold mt-12">
                    Earnbuddy Pvt. Ltd. all rights reserved
                </footer>

            </div>

            {/* Modals */}
            <CreateStartupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => setShowCreateModal(false)}
            />
            <StartupApplicationModal
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                startup={selectedStartup}
                selectedRole={null}
                onSuccess={() => {
                    setShowApplicationModal(false);
                    setSelectedStartup(null);
                }}
            />
        </div >
    );
};

export default StartupsPage;
