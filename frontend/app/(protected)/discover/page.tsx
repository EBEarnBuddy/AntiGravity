"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Users,
    Briefcase,
    Rocket,
    MessageCircle,
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
import { applicationAPI } from '@/lib/axios';

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

    // Fetch My Applications
    useEffect(() => {
        const fetchApplications = async () => {
            if (!currentUser) return;
            try {
                // Assuming this endpoint returns applications with populated opportunity details
                const res = await applicationAPI.getMyApplications();
                setMyApplications(res.data || []);
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
        { title: 'Find Work', icon: Briefcase, path: '/freelance', color: 'bg-emerald-500' },
        { title: 'Join a Circle', icon: Users, path: '/circles', color: 'bg-blue-500' },
        { title: 'Browse Startups', icon: Rocket, path: '/startups', color: 'bg-purple-500' },
        { title: 'Events', icon: Calendar, path: '#events', color: 'bg-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Builder'}! 👋
                            </h1>
                            <p className="text-slate-500 font-medium">Here's what's happening in your network.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search opportunities, circles..."
                                placeholder="Search opportunities, circles..."
                                className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-slate-900 text-slate-900 font-bold placeholder:text-slate-500 focus:outline-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                            />
                            <button
                                onClick={() => setShowAdvancedSearch(true)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content - Left Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Quick Actions */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -2, x: -2 }}
                                    className="bg-white p-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer group"
                                    onClick={() => action.path.startsWith('#') ? {} : router.push(action.path)}
                                >
                                    <div className={`${action.color} w-10 h-10 border-2 border-slate-900 flex items-center justify-center mb-3 text-white shadow-sm group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">{action.title}</h3>
                                </motion.div>
                            ))}
                        </section>

                        {/* My Workbench */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-green-600" />
                                <h2 className="text-xl font-black text-slate-900">My Workbench</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* My Applications Card */}
                                <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-blue-500" />
                                            Active Applications
                                        </h3>
                                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold">
                                            {myApplications.length}
                                        </span>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar md:h-[calc(100%-3rem)]">
                                        {loadingApplications ? (
                                            [1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                                        ) : myApplications.length > 0 ? (
                                            myApplications.map((app: any) => (
                                                <div key={app._id} className="group flex items-start gap-4 p-3 hover:bg-slate-50 transition-colors border-2 border-transparent hover:border-slate-900">
                                                    <div className="w-10 h-10 bg-white border-2 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                                        <Briefcase className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">{app.opportunityId?.title || app.opportunityId?.name || 'Unknown Opportunity'}</h4>
                                                        <p className="text-xs text-slate-500 truncate">{app.status}</p>
                                                    </div>
                                                    {app.status === 'accepted' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <Clock className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400 text-sm">
                                                No active applications yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bookmarks Card */}
                                <div className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Bookmark className="w-4 h-4 text-purple-500" />
                                            Saved Opportunities
                                        </h3>
                                        <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full text-xs font-bold">
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
                                                            <h4 className="font-bold text-slate-900 text-sm truncate">{item.name || item.title}</h4>
                                                            <p className="text-xs text-slate-500 truncate capitalize">{item.type}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400 text-sm">
                                                No bookmarks yet.
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
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <h2 className="text-xl font-black text-slate-900">Recommended for You</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {(projectsLoading || startupsLoading) ? (
                                    [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                                ) : (
                                    feedItems.map((item: any) => (
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
                                                            <img src={item.logo || item.companyLogo} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">⚡</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                                                            {item.name || item.title}
                                                        </h3>
                                                        <p className="text-slate-600 text-sm line-clamp-1 mb-2">{item.description}</p>
                                                        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                                                            <span className="px-2 py-1 bg-white border border-slate-900 text-slate-900">
                                                                {item.industry || item.category || 'Tech'}
                                                            </span>
                                                            {item.location && (
                                                                <span className="px-2 py-1 bg-white border border-slate-900 text-slate-900">
                                                                    {item.location}
                                                                </span>
                                                            )}
                                                            <span className="px-2 py-1 bg-green-600 text-white border border-slate-900">
                                                                {item.salary || item.funding || 'Funded'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                                    {item.createdAt ? formatDate(item.createdAt) : 'Recently'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Upcoming Events */}
                        <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sticky top-24">
                            <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-600" />
                                Upcoming Events
                            </h3>

                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200"></div>

                                {eventsLoading ? (
                                    [1, 2].map(i => <div key={i} className="pl-8"><Skeleton className="h-16 w-full" /></div>)
                                ) : events.length > 0 ? (
                                    events.map((event, i) => (
                                        <div key={i} className="relative pl-8 group cursor-pointer">
                                            {/* Dot */}
                                            <div className="absolute left-0 top-1.5 w-5 h-5 border-2 border-slate-900 bg-green-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] z-10 group-hover:scale-110 transition-transform"></div>

                                            <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                                                {event.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 mb-1">{formatDate(event.date)} • {event.location || 'Online'}</p>
                                            <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>

                                            {/* Host Circle */}
                                            {event.hostCircles && event.hostCircles[0] && (
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Host:</span>
                                                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {event.hostCircles[0].name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="pl-8 text-sm text-slate-400">No upcoming events.</div>
                                )}
                            </div>

                            <button className="w-full mt-6 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-900 bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                View Calendar
                            </button>
                        </div>

                        {/* Trending Circles (Simple List) */}
                        <div className="bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-20 blur-3xl rounded-full transform translate-x-10 -translate-y-10"></div>

                            <h3 className="font-bold text-lg mb-4 relative z-10">Trendsetters</h3>
                            <p className="text-slate-300 text-sm mb-6 relative z-10">Top circles making waves this week.</p>

                            <div className="space-y-4 relative z-10">
                                {pods.slice(0, 3).map((pod, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" onClick={() => router.push(`/circles`)}>
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                                            {pod.icon || '🔥'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{pod.name}</h4>
                                            <p className="text-xs text-slate-400">{pod.memberCount || 0} members</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <AdvancedSearch
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={() => { }}
            />
        </div>
    );
}
