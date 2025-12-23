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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center justify-center p-8 text-center">
            {/* Nav spacer */}
            <div className="h-16"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
            >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <UsersIcon className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
                    CoLancing <span className="text-green-600">Coming Soon</span>
                </h1>

                <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10">
                    We are building a revolutionary way to freelance.
                    Collaborate with others, form temporary agencies, and tackle bigger projects together.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">
                        Notify Me
                    </button>
                    <button
                        onClick={() => router.push('/discover')}
                        className="px-8 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:border-slate-900 hover:text-slate-900 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default FreelancePage;
