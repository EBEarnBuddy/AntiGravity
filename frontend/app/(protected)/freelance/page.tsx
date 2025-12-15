"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CreateProjectModal from '@/components/CreateProjectModal';
import { Gig } from '@/lib/firestore';
import { useProjects } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';

const FreelancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { projects, loading } = useProjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Gig | null>(null);

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.company.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleApply = (project: Gig) => {
        if (!currentUser) return router.push('/auth');
        // Ideally open explicit application modal, for now verifying flow
        // The modal logic would go here
        alert(`Application flow for ${project.title}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header / Nav Area (Placeholder for global nav) */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-6">
                        {/* Nav items handled by layout */}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-7xl">

                {/* Hero / Title Section */}
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-green-600 tracking-tight">
                        EB Colancing
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg">
                        Explore from 500+ Opportunities posted by 100+ plus verified Ventures
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
                            placeholder="Web Dev, Range: $500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-6 pr-14 border-2 border-slate-300 rounded-lg text-lg focus:border-green-500 focus:outline-none transition shadow-sm placeholder:text-slate-400 font-medium"
                        />
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                    </div>
                </div>

                {/* List Layout */}
                <div className="max-w-5xl mx-auto space-y-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md group relative grid grid-cols-1 md:grid-cols-[140px_1fr] lg:grid-cols-[180px_1fr] gap-8"
                                >
                                    {/* Bookmark/Share Actions (Absolute Top Right) */}
                                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                                        <button className="p-1.5 hover:bg-slate-100 rounded-full text-green-600 transition">
                                            <Bookmark className="w-5 h-5 fill-current" />
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 rounded-full text-green-600 transition">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Left Column: Avatar & "Posted by" */}
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {/* Placeholder Grid Pattern */}
                                            <div className="w-full h-full opacity-10 bg-[radial-gradient(#000000_2px,transparent_2px)] [background-size:8px_8px]"></div>
                                        </div>
                                        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            Posted by
                                        </div>
                                    </div>

                                    {/* Right Column: Content */}
                                    <div className="flex flex-col justify-center text-center md:text-left">
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors mb-2">
                                            {project.title}
                                        </h3>

                                        <div className="text-sm font-medium text-slate-500 mb-6 flex flex-wrap justify-center md:justify-start gap-1">
                                            <span>{project.roles?.length || 0} Roles</span>
                                            <span className="text-slate-300">|</span>
                                            <span>Equity and Salary Based</span>
                                            <span className="text-slate-300">|</span>
                                            <span>Urgent Requirement</span>
                                        </div>

                                        <div className="mt-auto">
                                            <motion.button
                                                onClick={() => handleApply(project)}
                                                className="px-6 py-2 border-2 border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-600 hover:text-white transition-all w-full md:w-auto"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                View All Roles
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Simple List placeholders (the 3 lines in wireframe) */}
                                    {/* Usually we don't implement empty boxes unless specified. 
                                        The wireframe shows simple horizontal lines below the first card.
                                        I will interpret them as separate cards in the main list. 
                                    */}

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-4 mt-12 mb-12">
                        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="font-bold text-slate-900">1 / 69</span>
                        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-900"><ChevronRight className="w-5 h-5" /></button>
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

            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
};

export default FreelancePage;
