"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Search,
    Bookmark,
    Rocket,
    Share2,
    ChevronRight,
    ChevronLeft,
    Users,
    CheckCircle,
    UserCircle,
    MoreVertical,
    Edit2,
    Trash2,
    XCircle as CloseIcon,
    Link as LinkIcon,
    ArrowRight
} from 'lucide-react';
import { useStartups, useMyApplications, useBookmarks } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeAgo } from '@/lib/utils';
import CreateStartupModal from '@/components/CreateStartupModal';
import StartupApplicationModal from '@/components/StartupApplicationModal';
import ApplicantsModal from '@/components/ApplicantsModal';
import CollaborationRequestModal from '@/components/CollaborationRequestModal';
import BrutalistLoader from '@/components/ui/BrutalistLoader';

const StartupsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize tab from URL or default to 'discover'
    const initialTab = (searchParams.get('tab') as 'discover' | 'posted' | 'applied') || 'discover';

    // Add delete/update hooks
    const { startups, loading: startupsLoading, deleteStartup, updateStartupStatus } = useStartups();
    const { applications, loading: appsLoading } = useMyApplications();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTabState] = useState<'discover' | 'posted' | 'applied'>(initialTab);

    // Sync state if URL changes
    React.useEffect(() => {
        const tab = searchParams.get('tab') as 'discover' | 'posted' | 'applied';
        if (tab) setActiveTabState(tab);
    }, [searchParams]);

    // Update URL when tab changes
    const setActiveTab = (tab: 'discover' | 'posted' | 'applied') => {
        setActiveTabState(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        params.delete('id'); // Clear specific ID when switching tabs manually
        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [selectedStartup, setSelectedStartup] = useState<any>(null);
    const [selectedTargetStartup, setSelectedTargetStartup] = useState<any>(null);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    // Derived Data
    const myPostedStartups = startups.filter(s => (typeof s.postedBy === 'object' && s.postedBy !== null && s.postedBy.firebaseUid === currentUser?.uid) || (s as any).founderId === currentUser?.uid);
    const myApplicationIds = new Set(applications.map(app => (app.opportunityId && typeof app.opportunityId === 'object' ? (app.opportunityId as any)._id : app.opportunityId)));

    // Filter Logic
    const getDisplayStartups = () => {
        const idParam = searchParams.get('id');
        let sourceData: any[] = [];

        if (activeTab === 'discover') sourceData = startups;
        else if (activeTab === 'posted') sourceData = myPostedStartups;

        let filtered = sourceData.filter(startup => {
            const matchesSearch = (startup.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (startup.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        if (idParam) {
            filtered = filtered.filter(s => (s.id || s._id) === idParam);
        }

        return filtered;
    };

    const displayItems = getDisplayStartups();
    const isLoading = startupsLoading || appsLoading;

    const handleApply = (startup: any) => {
        setSelectedStartup(startup);
        setShowApplicationModal(true);
    };

    const handleManage = (startup: any) => {
        setSelectedStartup(startup);
        setShowApplicantsModal(true);
    };

    const getAppStatus = (startupId: string) => {
        const app = applications.find(a => {
            const oppId = a.opportunityId && typeof a.opportunityId === 'object' ? (a.opportunityId as any)._id : a.opportunityId;
            return oppId === startupId;
        });
        return app?.status;
    };

    const handleCopyLink = (id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/startups/${id}`);
        alert('Link copied to clipboard!');
        setActionMenuOpen(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this opportunity? This cannot be undone.')) {
            await deleteStartup(id);
            setActionMenuOpen(null);
        }
    };

    const handleCloseOpportunity = async (id: string) => {
        if (confirm('Stop accepting new applications?')) {
            await updateStartupStatus(id, 'closed');
            setActionMenuOpen(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Spacing */}
            <div className="h-12"></div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Hero Section */}
                <div className="text-center space-y-6 mb-12">
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase transform -rotate-1">
                        Startups
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-bold text-xl uppercase tracking-wide">
                        Join the next unicorn. Or build it.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-6">
                        <button
                            id="tour-startup-create"
                            onClick={() => setShowCreateModal(true)}
                            className="px-8 py-4 bg-green-600 text-white font-black uppercase tracking-widest border-4 border-slate-900 hover:bg-green-500 hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all transform hover:-translate-y-1"
                        >
                            Post Opportunity
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SEARCH OPPORTUNITIES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-16 pl-6 pr-14 border-4 border-slate-900 rounded-none text-xl focus:outline-none transition shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[4px] focus:translate-y-[4px] placeholder:text-slate-400 font-black uppercase tracking-wide"
                        />
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-900 w-8 h-8" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-2 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] inline-flex gap-2">
                        {(['discover', 'posted', 'applied'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-black text-sm transition-all uppercase tracking-widest
                                    ${activeTab === tab
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                {tab === 'discover' ? 'Discover' : tab === 'posted' ? 'My Startups' : 'Applied'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full">
                    {/* Active Tab Content */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <BrutalistLoader />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {(activeTab === 'applied' ? applications : displayItems).map((item, index) => {
                                // Unified item handling based on tab
                                const isAppTab = activeTab === 'applied';
                                const startup = isAppTab ? (item as any).opportunity : item;
                                const status = isAppTab ? (item as any).status : getAppStatus(startup.id || startup._id);
                                const isOwner = startup.postedBy?.firebaseUid === currentUser?.uid || startup.founderId === currentUser?.uid;

                                if (!startup) return null; // Safety check

                                return (
                                    <motion.div
                                        key={item._id || item.id || index}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border-4 border-slate-900 p-0 hover:shadow-[12px_12px_0px_0px_rgba(22,163,74,1)] transition-all duration-300 group flex flex-col relative"
                                    >
                                        {/* Image / Header */}
                                        <div className="aspect-[4/3] bg-slate-100 relative border-b-4 border-slate-900 overflow-hidden">
                                            {startup.logo || startup.image ? (
                                                <img
                                                    src={startup.logo || startup.image}
                                                    alt={startup.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:24px_24px]"></div>
                                            )}

                                            {/* Status Badge for Applications */}
                                            {status && (
                                                <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-black uppercase shadow-sm border-2 border-slate-900
                                                    ${status === 'accepted' ? 'bg-green-400 text-slate-900' :
                                                        status === 'rejected' ? 'bg-red-500 text-white' :
                                                            'bg-yellow-300 text-slate-900'}`}>
                                                    {status}
                                                </div>
                                            )}

                                            <div className="absolute left-0 bottom-0 bg-slate-900 text-white text-xs font-black px-4 py-2 uppercase tracking-wide border-t-4 border-r-4 border-slate-900">
                                                {startup.industry || 'Tech'}
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1 pr-2">
                                                    <h3 className="text-xl font-black text-slate-900 leading-none group-hover:text-green-600 transition-colors uppercase truncate">
                                                        {startup.name || startup.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 border border-slate-200 uppercase">
                                                            {startup.location || 'Remote'}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-400 uppercase">
                                                            {formatTimeAgo(isAppTab ? (item as any).createdAt : startup.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions (Bookmark/Share) */}
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            if (startup.id || startup._id) toggleBookmark(startup.id || startup._id);
                                                        }}
                                                        className="p-1.5 border-2 border-transparent hover:border-slate-900 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900"
                                                    >
                                                        <Bookmark className={`w-5 h-5 ${isBookmarked(startup.id || startup._id) ? 'fill-current text-green-600' : ''}`} />
                                                    </button>

                                                    {isOwner && (
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActionMenuOpen(actionMenuOpen === (startup.id || startup._id) ? null : (startup.id || startup._id));
                                                                }}
                                                                className="p-1.5 border-2 border-transparent hover:border-slate-900 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900"
                                                            >
                                                                <MoreVertical className="w-5 h-5" />
                                                            </button>
                                                            <AnimatePresence>
                                                                {actionMenuOpen === (startup.id || startup._id) && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                                                        className="absolute right-0 top-full mt-1 w-48 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
                                                                    >
                                                                        <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); handleDelete(startup.id || startup._id); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase hover:bg-red-50 text-red-600 flex gap-2"><Trash2 className="w-3 h-3" /> Delete</button>
                                                                        <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null); handleCopyLink(startup.id || startup._id); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase hover:bg-slate-50 text-slate-900 flex gap-2"><Share2 className="w-3 h-3" /> Share</button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-tight">
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {startup.roles?.length || 1} Roles</span>
                                                <span>•</span>
                                                <span>{startup.equity || 'Equity'}</span>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="mt-auto pt-4 border-t-4 border-slate-100 flex flex-col gap-2">
                                                {isOwner ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleManage(startup)}
                                                            className="flex-1 py-3 bg-slate-900 text-white text-xs font-black uppercase hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            Manage ({startup.totalApplicants || 0})
                                                        </button>
                                                        <button onClick={() => router.push(`/startups/${startup.id || startup._id}`)} className="px-3 border-2 border-slate-900 hover:bg-slate-100"><ArrowRight className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => router.push(`/startups/${startup.id || startup._id}`)}
                                                        className="w-full py-3 bg-white border-4 border-slate-900 text-slate-900 text-xs font-black uppercase hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
                                                    >
                                                        View Opportunity <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && activeTab !== 'discover' && displayItems.length === 0 && applications.length === 0 && (
                        <div className="text-center py-20 border-4 border-dashed border-slate-300">
                            <h3 className="text-2xl font-black text-slate-300 uppercase">No {activeTab} opportunities.</h3>
                            <button onClick={() => setActiveTab('discover')} className="mt-4 text-green-600 font-bold hover:underline uppercase tracking-wide">
                                Browse all opportunities
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="text-center text-slate-400 text-xs font-black uppercase tracking-widest mt-20">
                    Earnbuddy Pvt. Ltd. © 2024
                </footer>

            </div>

            {/* Modals */}
            <CreateStartupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    // Force refresh or switch tab logic here if needed
                    setActiveTab('posted');
                }}
            />

            <StartupApplicationModal
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                startup={selectedStartup}
                selectedRole={null}
                onSuccess={() => {
                    setShowApplicationModal(false);
                    setSelectedStartup(null);
                    setActiveTab('applied');
                }}
            />

            <ApplicantsModal
                isOpen={showApplicantsModal}
                onClose={() => setShowApplicantsModal(false)}
                startupId={selectedStartup?._id || selectedStartup?.id}
                startupName={selectedStartup?.name || selectedStartup?.title}
            />

            <CollaborationRequestModal
                isOpen={showCollabModal}
                onClose={() => {
                    setShowCollabModal(false);
                    setSelectedTargetStartup(null);
                }}
                targetCircle={selectedTargetStartup ? {
                    id: selectedTargetStartup.room?._id || selectedTargetStartup.room,
                    name: selectedTargetStartup.name || selectedTargetStartup.title,
                    description: selectedTargetStartup.description
                } : null}
                onSuccess={() => {
                    setShowCollabModal(false);
                    setSelectedTargetStartup(null);
                }}
            />

        </div >
    );
};

export default StartupsPage;
