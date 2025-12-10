"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Plus,
    MapPin,
    Users,
    TrendingUp,
    Star,
    Bookmark,
    ExternalLink,
    Rocket,
    DollarSign,
    Building,
    Zap,
    Filter,
    Share2,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStartups } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';
import CreateStartupModal from '@/components/CreateStartupModal';
import StartupApplicationModal from '@/components/StartupApplicationModal';
import { FloatingCard } from '@/components/ui/floating-card';

const StartupsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { startups, loading, applyToStartup, bookmarkStartup } = useStartups();
    const router = useRouter();
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
            {/* Header / Nav Area (Placeholder for global nav) */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-6">
                        {/* Nav items handled by layout, assuming specific sub-nav here if needed */}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-7xl">

                {/* Hero / Title Section */}
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-green-600 tracking-tight">
                        EB LaunchPad
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg">
                        Explore from 500+ Opportunities posted by 100+ verified Ventures
                        from all across the globe, to find the one venture that changes your life!
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button className="px-6 py-2 border-2 border-slate-900 text-slate-900 font-bold rounded-lg hover:bg-slate-50 transition">
                            Search Filters
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md"
                        >
                            Post an Opportunity
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-16 relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="CEO, World Bank"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-6 pr-14 border-2 border-slate-300 rounded-lg text-lg focus:border-green-500 focus:outline-none transition shadow-sm placeholder:text-slate-400 font-medium"
                        />
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Startup Cards (3 Columns) */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filteredStartups.map((startup, index) => {
                                        const hasApplied = currentUser ? (startup.roles?.some(role => role.applicants?.some((app: any) => app.userId === currentUser.uid))) : false;

                                        return (
                                            <motion.div
                                                key={startup.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:border-green-500 transition-colors duration-300 group flex flex-col"
                                            >
                                                {/* Cover Image */}
                                                <div className="h-32 bg-slate-100 relative overflow-hidden">
                                                    {/* Mesh / Pattern Placeholder */}
                                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                                                    {/* Category Tag */}
                                                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                                                        {startup.industry || 'Tech'}
                                                    </div>

                                                    {/* Action Icons */}
                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); if (startup.id) handleBookmarkStartup(startup.id); }}
                                                            className="p-1.5 bg-white/90 rounded-full hover:text-green-600 transition"
                                                        >
                                                            <Bookmark className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1.5 bg-white/90 rounded-full hover:text-green-600 transition">
                                                            <Share2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 pt-0 flex-1 flex flex-col">
                                                    {/* Logo Overlap */}
                                                    <div className="relative -mt-8 mb-3">
                                                        <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-100 p-1 flex items-center justify-center shadow-sm">
                                                            {startup.logo ? (
                                                                <img src={startup.logo} alt={startup.name} className="w-full h-full rounded-full object-cover" />
                                                            ) : (
                                                                <Rocket className="w-8 h-8 text-green-600" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Header */}
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-green-700 transition-colors">
                                                                {startup.name}
                                                            </h3>
                                                            {startup.verified && <div className="text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div></div>}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            Founded: {startup.foundedDate || '2024'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Tags: B2B, AI-Native, SaaS
                                                        </p>
                                                    </div>

                                                    {/* Spacer */}
                                                    <div className="flex-1"></div>

                                                    {/* Footer Info */}
                                                    <div className="border-t border-slate-100 pt-3 mt-2 space-y-3">
                                                        <p className="text-xs text-slate-500 font-medium text-center">
                                                            {startup.roles?.length || 0} Roles | Equity and Salary Based | Urgent Requirement
                                                        </p>

                                                        <motion.button
                                                            onClick={() => handleApplyToStartup(startup)}
                                                            className="w-full py-2 border-2 border-slate-900 text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            View All Roles
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
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

                    {/* Sidebar (Right Column) */}
                    <div className="hidden lg:block space-y-6">
                        {/* Sidebar Item 1 */}
                        <div className="border-2 border-slate-200 rounded-xl h-48 bg-white flex items-center justify-center text-slate-400 font-medium text-sm">
                            Ad Space / Featured
                        </div>
                        {/* Sidebar Item 2 */}
                        <div className="border-2 border-slate-200 rounded-xl h-48 bg-white flex items-center justify-center text-slate-400 font-medium text-sm">
                            Upcoming Events
                        </div>
                        {/* Sidebar Item 3 */}
                        <div className="border-2 border-slate-200 rounded-xl h-48 bg-white flex items-center justify-center text-slate-400 font-medium text-sm">
                            Community Highlights
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
                            This is some random text about the application, that we have to include
                            to make the app seem more trustworthy, and the lander more impressive.
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
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                </div>

                <footer className="text-center text-slate-500 text-sm font-bold mt-12">
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
        </div>
    );
};

export default StartupsPage;
