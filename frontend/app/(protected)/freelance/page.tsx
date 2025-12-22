"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Bookmark,
    Share2,
    ChevronRight,
    ChevronLeft,
    Users,
    Users as UsersIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CreateProjectModal from '@/components/CreateProjectModal';
import { Gig } from '@/lib/firestore';
import { useProjects, useBookmarks } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';

const FreelancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { projects, loading } = useProjects();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // We might need a ProjectApplicationModal similar to Startups later

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.company.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleApply = (project: Gig) => {
        if (!currentUser) return router.push('/auth');
        // Ideally open explicit application modal
        alert(`Application flow for ${project.title}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header / Nav Area (Placeholder for global nav) */}
            <div className="h-12"></div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Hero / Title Section */}
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-green-600 tracking-tighter">
                        EB Colancing
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Find collaborative freelance opportunities. Work with others, share the load, and build amazing things together using our Team-based freelancing model.
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

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Web Dev, Range: $5500"
                            value={searchTerm}
                            onChange={(e: any) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-6 pr-14 border-2 border-slate-900 rounded-xl text-lg focus:outline-none transition shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px] placeholder:text-slate-400 font-bold"
                        />
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-900 w-6 h-6" />
                    </div>
                </div>

                {/* List Layout */}
                <div className="max-w-5xl mx-auto space-y-8">
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
                                    className="bg-white border-2 border-slate-900 rounded-none p-6 mb-6 hover:border-green-600 transition-all duration-300 relative group"
                                >
                                    {/* Wireframe Header Structure */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors">
                                                {project.title}
                                            </h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e: any) => {
                                                    e.stopPropagation();
                                                    if (project.id) toggleBookmark(project.id);
                                                }}
                                                className={`p-1 hover:text-green-600 transition ${project.id && isBookmarked(project.id) ? 'text-green-600' : 'text-slate-400'}`}
                                            >
                                                <Bookmark className={`w-5 h-5 ${project.id && isBookmarked(project.id) ? 'fill-current' : ''}`} />
                                            </button>
                                            <button
                                                onClick={(e: any) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(`${window.location.origin}/freelance/${project.id}`);
                                                    alert('Link copied to clipboard!');
                                                }}
                                                className="p-1 hover:text-green-600 transition text-slate-400"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subheader / Meta */}
                                    <div className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-wide flex items-center gap-2">
                                        <span>{project.roles?.length || 8} Roles</span>
                                        <span className="text-slate-300">|</span>
                                        <span>Equity and Salary Based</span>
                                        <span className="text-slate-300">|</span>
                                        <span className="text-slate-900">Urgent Requirement</span>
                                    </div>

                                    {/* Role Slots (Wireframe Rectangles) */}
                                    <div className="space-y-3 mb-6">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="h-10 border-2 border-slate-200 w-full" />
                                        ))}
                                    </div>

                                    {/* Footer: Posted By (Left) + View Button (Right) */}
                                    <div className="flex items-center justify-between pt-4 border-t-0 border-slate-100">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-100 overflow-hidden mb-1">
                                                {/* Pattern or Image */}
                                                {(project as any).image ? (
                                                    <img src={(project as any).image} alt="Project" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:4px_4px] opacity-20"></div>
                                                )}
                                            </div>
                                            <div className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                                Posted by
                                            </div>
                                        </div>

                                        <motion.button
                                            onClick={() => handleApply(project)}
                                            className="px-6 py-1.5 border-2 border-green-600 text-green-700 font-bold bg-green-50 hover:bg-green-600 hover:text-white transition-all text-sm"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            View All Roles
                                        </motion.button>
                                    </div>
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
                            Turn your side project into a funded startup.
                            Use our tools to find co-founders, get mentorship, and launch.
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

                <footer className="text-center text-slate-400 text-sm font-bold mt-12">
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
