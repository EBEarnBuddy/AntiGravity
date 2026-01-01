"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Users,
    Briefcase,
    Rocket,
    MessageSquare,
    Search,
    TrendingUp,
    Filter,
    Calendar,
    Bookmark,
    Clock,
    CheckCircle,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePods, useProjects, useStartups, useEvents, useBookmarks, useRooms } from '@/hooks/useFirestore';
import { FloatingCard } from '@/components/ui/floating-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedSearch } from '@/components/ui/advanced-search';
import { FirestoreService } from '@/lib/firestore';
import { TourReengagementBox } from '@/components/tour/TourReengagementBox';
import CreateStartupModal from '@/components/CreateStartupModal';
import CreateCircleModal from '@/components/CreateCircleModal';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const formatDate = (dateString: any) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function DiscoverPage() {
    const { currentUser, userProfile } = useAuth();
    const router = useRouter();

    // Hooks
    const { pods, loading: podsLoading } = usePods();
    const { projects, loading: projectsLoading } = useProjects();
    const { startups, loading: startupsLoading } = useStartups();
    const { events, loading: eventsLoading } = useEvents(5);
    const { isBookmarked } = useBookmarks();

    // Local State
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(true);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCircleModal, setShowCircleModal] = useState(false);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);

    // Fetch My Applications
    useEffect(() => {
        const fetchApplications = async () => {
            if (!currentUser) return;
            try {
                const apps = await FirestoreService.getUserApplications(currentUser.uid);
                setMyApplications(apps);
            } catch (err) {
                console.error("Failed to fetch applications", err);
            } finally {
                setLoadingApplications(false);
            }
        };
        fetchApplications();
    }, [currentUser]);

    // Derived Data
    // Ensure ids are present or filter items without id
    const validStartups = startups || [];
    const validProjects = projects || [];

    const bookmarkedOpportunities = [...validStartups, ...validProjects]
        .filter(item => item.id && isBookmarked(item.id));

    // Feed: Combined Startups and Projects, sorted by creation (assuming default sort for now or random mix)
    // We'll take top 10 items for the feed
    const feedItems = [...validStartups, ...validProjects]
        // .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Assuming createdAt exists and is string/date
        .slice(0, 10);

    const quickActions = [
        { title: 'Find Projects', icon: Briefcase, path: '/freelance', color: 'bg-emerald-500', badge: 'Coming Soon' },
        { title: 'Trending Circles', icon: Users, path: '/circles', color: 'bg-blue-500', badge: 'Hot' },
        { title: 'Browse Startups', icon: Rocket, path: '/startups', color: 'bg-purple-500', badge: 'Trending' },
        { title: 'Events', icon: Calendar, path: '/events', color: 'bg-orange-500', badge: 'Coming Soon' },
    ];


    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-100 z-30">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div id="tour-dashboard-welcome" className="flex-1 min-w-0 w-full md:w-auto">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Builder'}
                            </h1>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wide">Here's what's happening in your network.</p>
                        </div>

                        {/* Mobile Header Optimization: Search + Create */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Search Bar - Restored for Mobile/Desktop balance as per request */}
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 pl-10 pr-4 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
                                />
                            </div>

                            {/* Create Button & Dropdown */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                                    className="h-10 w-10 md:h-12 md:w-12 bg-green-500 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center text-white shrink-0"
                                >
                                    <Plus className="w-6 h-6 md:w-7 md:h-7 stroke-[3]" />
                                </motion.button>
                                {/* ... Dropdown content (kept same logic, just spacing adjusted above) ... */}
                                <AnimatePresence>
                                    {showCreateDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-72 bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] z-50 p-2"
                                        >
                                            <button
                                                onClick={() => {
                                                    setShowCreateModal(true);
                                                    setShowCreateDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-3 bg-white hover:bg-green-50 text-slate-900 hover:text-green-700 font-black uppercase text-xs tracking-wide border-2 border-transparent hover:border-slate-900 transition-all flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 bg-green-100 border-2 border-slate-900 flex items-center justify-center text-green-700">
                                                    <Rocket className="w-4 h-4" />
                                                </div>
                                                Post Startup Role
                                            </button>

                                            <div className="relative opacity-60 cursor-not-allowed">
                                                <button
                                                    disabled
                                                    className="w-full text-left px-4 py-3 bg-white text-slate-400 font-black uppercase text-xs tracking-wide border-2 border-transparent flex items-center gap-3 mt-1 cursor-not-allowed pr-28"
                                                >
                                                    <div className="w-8 h-8 bg-blue-50 border-2 border-slate-200 flex items-center justify-center text-blue-300">
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                    Post Project
                                                </button>
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5">Coming Soon</span>
                                            </div>

                                            <button
                                                onClick={() => { setShowCircleModal(true); setShowCreateDropdown(false); }}
                                                className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 text-slate-900 hover:text-purple-700 font-black uppercase text-xs tracking-wide border-2 border-transparent hover:border-slate-900 transition-all flex items-center gap-3 mt-1"
                                            >
                                                <div className="w-8 h-8 bg-purple-100 border-2 border-slate-900 flex items-center justify-center text-purple-700">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                Create Circle
                                            </button>

                                            <div className="relative opacity-60 cursor-not-allowed">
                                                <button
                                                    disabled
                                                    className="w-full text-left px-4 py-3 bg-white text-slate-400 font-black uppercase text-xs tracking-wide border-2 border-transparent flex items-center gap-3 mt-1 cursor-not-allowed pr-28"
                                                >
                                                    <div className="w-8 h-8 bg-orange-50 border-2 border-slate-200 flex items-center justify-center text-orange-300">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    Host Event
                                                </button>
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5">Coming Soon</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* ... existing content ... */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content - Full Width */}
                    <div className="lg:col-span-12 space-y-10">

                        {/* Quick Actions */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {/* ... quick actions map ... */}
                            {quickActions.map((action, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -2, x: -2 }}
                                    className="bg-white p-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer group relative overflow-hidden min-h-[120px] flex flex-col justify-between"
                                    onClick={() => action.path.startsWith('#') ? {} : router.push(action.path)}
                                >
                                    {action.badge && (
                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900 text-white text-[10px] uppercase font-black tracking-wider">
                                            {action.badge}
                                        </div>
                                    )}
                                    <div className={`${action.color} w-10 h-10 border-2 border-slate-900 flex items-center justify-center mb-3 text-white shadow-sm group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm pr-6 leading-tight">{action.title}</h3>
                                </motion.div>
                            ))}
                        </section>

                        {/* My Workbench */}
                        <section id="tour-dashboard-workbench">
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">My Workbench</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* ... workbench cards ... */}
                                <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-sm">
                                            Active Applications
                                        </h3>
                                        {/* ... */}
                                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-black border border-blue-100">
                                            {myApplications.length}
                                        </span>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar md:h-[calc(100%-3rem)]">
                                        {loadingApplications ? (
                                            [1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-none" />)
                                        ) : myApplications.length > 0 ? (
                                            myApplications.map((app: any) => (
                                                <div key={app._id} className="group flex items-start gap-4 p-3 hover:bg-slate-50 transition-colors border-2 border-transparent hover:border-slate-900">
                                                    <div className="w-10 h-10 bg-white border-2 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                                        <Briefcase className="w-5 h-5 text-slate-900" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate uppercase">{app.opportunityId?.title || app.opportunityId?.name || 'Unknown Opportunity'}</h4>
                                                        <p className="text-xs text-slate-500 truncate uppercase bold">{app.status}</p>
                                                    </div>
                                                    {app.status === 'accepted' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <Clock className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase">
                                                No active applications yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bookmarks Card */}
                                <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-sm">
                                            Saved Opportunities
                                        </h3>
                                        <span className="bg-purple-50 text-purple-600 px-2.5 py-1 text-xs font-black border border-purple-100">
                                            {bookmarkedOpportunities.length}
                                        </span>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar md:h-[calc(100%-3rem)]">
                                        {bookmarkedOpportunities.length > 0 ? (
                                            bookmarkedOpportunities.map((item: any) => (
                                                <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-slate-50 transition-colors border-2 border-transparent hover:border-slate-900 cursor-pointer"
                                                    onClick={() => router.push(item.type === 'startup' ? `/startups` : `/freelance`)}>
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 bg-slate-100 flex-shrink-0 border-2 border-slate-900"
                                                            style={{ backgroundImage: `url(${item.logo || item.companyLogo})`, backgroundSize: 'cover' }} />
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-slate-900 text-sm truncate uppercase">{item.name || item.title}</h4>
                                                            <p className="text-xs text-slate-500 truncate capitalize font-bold">{item.type}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase">
                                                No bookmarks.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Recent Activity Feed */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recommended for You</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {(projectsLoading || startupsLoading) ? (
                                    [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-none" />)
                                ) : (
                                    <>
                                        {feedItems.slice(0, 5).map((item: any) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all cursor-pointer group"
                                                onClick={() => router.push(item.type === 'startup' ? `/startups` : `/freelance`)}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex-shrink-0">
                                                            {item.logo || item.companyLogo ? (
                                                                <img src={item.logo || item.companyLogo} alt="" className="w-full h-full object-cover bg-white" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl">⚡</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-black uppercase text-slate-900 group-hover:text-green-600 transition-colors">
                                                                {item.name || item.title}
                                                            </h3>
                                                            <p className="text-slate-600 text-sm line-clamp-1 mb-2 font-medium">{item.description}</p>
                                                            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                                                                <span className="px-2 py-1 bg-white border-2 border-slate-900 text-slate-900">
                                                                    {item.industry || item.category || 'Tech'}
                                                                </span>
                                                                {item.location && (
                                                                    <span className="px-2 py-1 bg-white border-2 border-slate-900 text-slate-900">
                                                                        {item.location}
                                                                    </span>
                                                                )}
                                                                <span className="px-2 py-1 bg-green-600 text-white border-2 border-slate-900">
                                                                    {item.salary || item.funding || 'Funded'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-black uppercase text-slate-400 whitespace-nowrap">
                                                        {item.createdAt ? formatDate(item.createdAt) : 'Recently'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        <div className="flex justify-center mt-8">
                                            <button
                                                onClick={() => router.push('/startups')}
                                                className="bg-white text-slate-900 px-8 py-3 border-2 border-slate-900 font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                            >
                                                View More Opportunities
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <AdvancedSearch
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={() => { }}
            />

            <TourReengagementBox />

            <CreateStartupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    // Ideally refresh feed, but for now just close
                    setShowCreateModal(false);
                    router.push('/startups?tab=posted'); // Redirect to see it
                }}
            />

            <CreateCircleModal
                isOpen={showCircleModal}
                onClose={() => setShowCircleModal(false)}
                onSuccess={() => {
                    setShowCircleModal(false);
                    router.push('/circles?tab=my_circles');
                }}
            />
        </div>
    );
}
