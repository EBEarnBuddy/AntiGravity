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
    UserCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStartups, useMyApplications } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';
import CreateStartupModal from '@/components/CreateStartupModal';
import StartupApplicationModal from '@/components/StartupApplicationModal';
import ApplicantsModal from '@/components/ApplicantsModal';

const StartupsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize tab from URL or default to 'discover'
    const initialTab = (searchParams.get('tab') as 'discover' | 'posted' | 'applied') || 'discover';

    const { startups, loading: startupsLoading, bookmarkStartup } = useStartups();
    const { applications, loading: appsLoading } = useMyApplications();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTabState] = useState<'discover' | 'posted' | 'applied'>(initialTab);

    // Sync state if URL changes (optional, but good for back button)
    React.useEffect(() => {
        const tab = searchParams.get('tab') as 'discover' | 'posted' | 'applied';
        if (tab) setActiveTabState(tab);
    }, [searchParams]);

    // Update URL when tab changes
    const setActiveTab = (tab: 'discover' | 'posted' | 'applied') => {
        setActiveTabState(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [selectedStartup, setSelectedStartup] = useState<any>(null);

    // Derived Data
    const myPostedStartups = startups.filter(s => (typeof s.postedBy === 'object' && s.postedBy !== null && s.postedBy.firebaseUid === currentUser?.uid) || (s as any).founderId === currentUser?.uid);
    const myApplicationIds = new Set(applications.map(app => (app.opportunityId && typeof app.opportunityId === 'object' ? (app.opportunityId as any)._id : app.opportunityId)));

    // Filter Logic
    const getDisplayStartups = () => {
        let sourceData: any[] = [];
        if (activeTab === 'discover') sourceData = startups;
        else if (activeTab === 'posted') sourceData = myPostedStartups;

        return sourceData.filter(startup => {
            const matchesSearch = (startup.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (startup.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Spacing */}
            <div className="h-12"></div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Hero Section */}
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-5xl md:text-6xl font-black text-green-600 tracking-tighter">
                        EB LaunchPad
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg">
                        Explore opportunities, build your dream team, or find your next big role.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 transform hover:-translate-y-0.5"
                        >
                            Post an Opportunity
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-10">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search startups, roles, or industries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-6 pr-14 border-2 border-slate-900 rounded-xl text-lg focus:outline-none transition shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px] placeholder:text-slate-400 font-bold"
                        />
                        <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-900 w-6 h-6" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-1 rounded-xl border-2 border-slate-200 inline-flex shadow-sm">
                        {(['discover', 'posted', 'applied'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all capitalize
                                    ${activeTab === tab
                                        ? 'bg-green-100 text-green-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {tab === 'discover' ? 'Discover All' : tab === 'posted' ? 'My Startups' : 'My Applications'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full">
                    {/* Active Tab Content */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                        className="bg-white border-2 border-slate-900 rounded-none p-4 hover:border-green-600 transition-colors duration-300 group flex flex-col relative"
                                    >
                                        {/* Image / Header */}
                                        <div className="aspect-[4/3] bg-slate-50 relative border-2 border-slate-200 mb-4 overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>

                                            {/* Status Badge for Applications */}
                                            {status && (
                                                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border border-black/10
                                                    ${status === 'accepted' ? 'bg-green-500 text-white' :
                                                        status === 'rejected' ? 'bg-red-500 text-white' :
                                                            'bg-yellow-400 text-slate-900'}`}>
                                                    {status}
                                                </div>
                                            )}

                                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-4 py-1 rounded-b-lg uppercase">
                                                {startup.industry || 'Category'}
                                            </div>
                                        </div>

                                        {/* Card Info */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-green-600 transition-colors line-clamp-1">
                                                    {startup.name || startup.title}
                                                </h3>
                                                <p className="text-[10px] text-slate-500 font-bold">
                                                    {startup.location || 'Remote'}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Share2 className="w-4 h-4 text-green-600" />
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-slate-500 font-medium mb-4 text-center">
                                            {startup.roles?.length || 1} Roles | {startup.equity || 'Equity'} | {startup.salary || 'Salary'}
                                        </p>

                                        {/* Actions */}
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                                            {isOwner ? (
                                                <button
                                                    onClick={() => handleManage(startup)}
                                                    className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold uppercase hover:bg-slate-800 transition-all rounded-md flex items-center justify-center gap-2"
                                                >
                                                    <Users className="w-3 h-3" /> Manage ({startup.totalApplicants || 0})
                                                </button>
                                            ) : status ? (
                                                <div className="flex-1 py-2 bg-slate-100 text-slate-500 text-xs font-bold uppercase rounded-md flex items-center justify-center gap-2 cursor-default">
                                                    {status === 'accepted' ? <CheckCircle className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />} Applied
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleApply(startup)}
                                                    className="flex-1 py-2 bg-white border-2 border-slate-900 text-slate-900 text-xs font-bold uppercase hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-0.5 rounded-md"
                                                >
                                                    Apply Now
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && activeTab !== 'discover' && displayItems.length === 0 && applications.length === 0 && (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-bold text-slate-900">No {activeTab} opportunities found.</h3>
                            <button onClick={() => setActiveTab('discover')} className="mt-4 text-green-600 font-bold hover:underline">
                                Browse all opportunities
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="text-center text-slate-400 text-sm font-bold mt-20">
                    Earnbuddy Pvt. Ltd. all rights reserved
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

        </div >
    );
};

export default StartupsPage;
