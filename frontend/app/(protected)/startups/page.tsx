"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Search,
    Bookmark,
    Rocket,
    Share,
    ChevronRight,
    ChevronLeft,
    Users,
    CheckCircle,
    CircleUser,
    MoreVertical,
    Edit,
    Trash,
    XCircle as CloseIcon,
    Link,
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
import ShareModal from '@/components/ShareModal';
import useOnClickOutside from '@/hooks/useOnClickOutside';

const StartupsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize tab from URL or default to 'discover'
    const initialTab = (searchParams.get('tab') as 'discover' | 'posted' | 'applied') || 'discover';

    // Add delete/update hooks
    const { startups, loading: startupsLoading, deleteStartup, updateStartupStatus, fetchStartups } = useStartups();
    const { applications, loading: appsLoading, fetchApplications } = useMyApplications();
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
    const [showEditModal, setShowEditModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [selectedStartup, setSelectedStartup] = useState<any>(null);
    const [selectedTargetStartup, setSelectedTargetStartup] = useState<any>(null);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    const activeMenuRef = React.useRef<HTMLDivElement>(null);
    useOnClickOutside(activeMenuRef, () => setActionMenuOpen(null));

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

    const handleEdit = (startup: any) => {
        setSelectedStartup(startup);
        setShowEditModal(true);
        setActionMenuOpen(null);
    };

    const handleShare = (startup: any) => {
        setSelectedStartup(startup);
        setShowShareModal(true);
        setActionMenuOpen(null);
    };

    const getAppStatus = (startupId: string) => {
        const app = applications.find(a => {
            const oppId = a.opportunityId && typeof a.opportunityId === 'object' ? (a.opportunityId as any)._id : a.opportunityId;
            return oppId === startupId;
        });
        return app?.status;
    };

    const handleCopyLink = (startup: any) => {
        const id = startup.slug || startup.id || startup._id;
        navigator.clipboard.writeText(`${window.location.origin}/startups/${id}`);
        alert('Link copied to clipboard!');
        setActionMenuOpen(null);
    };

    const handleCloseOpportunity = async (id: string) => {
        if (confirm('Are you sure you want to close this opportunity? It will be hidden from the Discover feed.')) {
            await updateStartupStatus(id, 'closed');
            setActionMenuOpen(null);
        }
    };

    // Kept for admin or specific cases if needed, but UI uses Close mostly now
    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this opportunity? This cannot be undone.')) {
            await deleteStartup(id);
            setActionMenuOpen(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* ... (Hero, Search - No Changes) ... */}
            <div className="h-12"></div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-6xl">

                {/* Hero Section */}
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase transform -rotate-1">
                        Startups
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-bold text-base uppercase tracking-wide">
                        Join the next unicorn. Or build it.
                    </p>
                </div>

                {/* Search Bar & Post Button */}
                <div className="max-w-4xl mx-auto mb-10 flex gap-3">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="SEARCH OPPORTUNITIES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-4 pr-10 border-4 border-slate-900 rounded-none text-base focus:outline-none transition shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] focus:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[3px] focus:translate-y-[3px] placeholder:text-slate-400 font-black uppercase tracking-wide"
                        />
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-900 w-5 h-5" />
                    </div>

                    <button
                        id="tour-startup-create"
                        onClick={() => setShowCreateModal(true)}
                        className="h-12 px-5 bg-green-600 text-white font-black text-sm uppercase tracking-widest border-4 border-slate-900 rounded-none shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:bg-green-500 hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all whitespace-nowrap"
                    >
                        Post Opportunity
                    </button>
                </div>

                {/* Tabs */}
                <div className="sticky top-[64px] z-10 bg-slate-50 pt-2 pb-4 mb-6">
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide md:justify-center">
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`px-6 py-2.5 font-black uppercase tracking-widest border-4 border-slate-900 transition-all text-xs whitespace-nowrap ${activeTab === 'discover'
                                ? 'bg-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]'
                                : 'bg-white text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            Explore Startups
                        </button>
                        <button
                            onClick={() => setActiveTab('posted')}
                            className={`px-6 py-2.5 font-black uppercase tracking-widest border-4 border-slate-900 transition-all text-xs whitespace-nowrap ${activeTab === 'posted'
                                ? 'bg-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]'
                                : 'bg-white text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            My Startups
                        </button>
                        <button
                            onClick={() => setActiveTab('applied')}
                            className={`px-6 py-2.5 font-black uppercase tracking-widest border-4 border-slate-900 transition-all text-xs whitespace-nowrap ${activeTab === 'applied'
                                ? 'bg-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]'
                                : 'bg-white text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            My Applications
                        </button>
                    </div>
                </div>

                {/* Tabs */}
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
                                    className={`bg-white border-4 border-slate-900 p-0 hover:shadow-[12px_12px_0px_0px_rgba(22,163,74,1)] transition-all duration-300 group flex flex-col relative ${startup.status === 'closed' ? 'opacity-75 grayscale' : ''}`}
                                >
                                    {/* Image / Header */}
                                    <div className="aspect-[4/3] bg-slate-100 relative border-b-4 border-slate-900 overflow-hidden">
                                        {startup.logo || startup.image ? (
                                            <img
                                                src={startup.logo || startup.image}
                                                alt={startup.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 bg-white"
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

                                        {startup.status === 'closed' && (
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-slate-300 text-slate-900 text-xs font-black uppercase border-2 border-slate-900">
                                                Closed
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShare(startup);
                                                    }}
                                                    className="p-1.5 border-2 border-transparent hover:border-slate-900 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900"
                                                >
                                                    <Share className="w-5 h-5" />
                                                </button>
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
                                                                    ref={activeMenuRef}
                                                                >
                                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(startup); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase hover:bg-slate-50 text-slate-900 flex gap-2"><Edit className="w-3 h-3" /> Edit Opportunity</button>
                                                                    {startup.status !== 'closed' && (
                                                                        <button onClick={(e) => { e.stopPropagation(); handleCloseOpportunity(startup.id || startup._id); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase hover:bg-red-50 text-red-600 flex gap-2"><CloseIcon className="w-3 h-3" /> Close Opportunity</button>
                                                                    )}
                                                                    <button onClick={(e) => { e.stopPropagation(); setShowCollabModal(true); setSelectedTargetStartup(startup); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase hover:bg-purple-50 text-purple-700 flex gap-2"><Users className="w-3 h-3" /> Request Collaboration</button>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleShare(startup); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase hover:bg-slate-50 text-slate-900 flex gap-2"><Share className="w-3 h-3" /> Share Opportunity</button>
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
                                                    <button onClick={() => router.push(`/startups/${startup.slug || startup.id || startup._id}`)} className="px-3 border-2 border-slate-900 hover:bg-slate-100"><ArrowRight className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => router.push(`/startups/${startup.slug || startup.id || startup._id}`)}
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
                )
                }

                {/* Empty State */}
                {
                    !isLoading && activeTab !== 'discover' && displayItems.length === 0 && applications.length === 0 && (
                        <div className="text-center py-20 border-4 border-dashed border-slate-300">
                            <h3 className="text-2xl font-black text-slate-300 uppercase">No {activeTab} opportunities.</h3>
                            <button onClick={() => setActiveTab('discover')} className="mt-4 text-green-600 font-bold hover:underline uppercase tracking-wide">
                                Browse all opportunities
                            </button>
                        </div>
                    )
                }
            </div >

            {/* Footer */}
            {/* Footer */}
            <footer className="text-center text-slate-400 text-xs font-black uppercase tracking-widest mt-20">
                Earnbuddy Pvt. Ltd. © 2024
            </footer>

            <CreateStartupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchStartups();
                    setActiveTab('posted');
                }}
            />

            {/* Edit Modal */}
            <CreateStartupModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    setShowEditModal(false);
                    setSelectedStartup(null);
                    fetchStartups(); // Refresh list to show edits
                }}
                isEditing={true}
                initialData={selectedStartup}
            />

            {/* Share Modal */}
            {
                selectedStartup && (
                    <ShareModal
                        isOpen={showShareModal}
                        onClose={() => {
                            setShowShareModal(false);
                            setSelectedStartup(null);
                        }}
                        title={selectedStartup.name || selectedStartup.title}
                        url={typeof window !== 'undefined' ? `${window.location.origin}/startups/${selectedStartup.slug || selectedStartup.id || selectedStartup._id}` : ''}
                        description={selectedStartup.description}
                    />
                )
            }

            <StartupApplicationModal
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                startup={selectedStartup}
                selectedRole={null}
                onSuccess={() => {
                    setShowApplicationModal(false);
                    setSelectedStartup(null);
                    fetchApplications(); // Refresh my applications list
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
