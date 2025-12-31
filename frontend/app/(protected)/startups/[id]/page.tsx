"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Share,
    Bookmark,
    Users,
    Briefcase,
    MapPin,
    DollarSign,
    PieChart,
    Calendar,
    CheckCircle,
    Globe,
    Link,
    Mail,
    Rocket
} from 'lucide-react';
import { useStartups, useMyApplications, useBookmarks } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { formatTimeAgo } from '@/lib/utils';
import api from '@/lib/api';
import StartupApplicationModal from '@/components/StartupApplicationModal';
import ShareModal from '@/components/ShareModal';
import CreateStartupModal from '@/components/CreateStartupModal';
import RequestCollaborationModal from '@/components/RequestCollaborationModal';
import BrutalistLoader from '@/components/ui/BrutalistLoader';

const StartupDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const startupId = params?.id as string;
    const { currentUser } = useAuth();
    const { updateStartupStatus } = useStartups();

    const [startup, setStartup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { applications } = useMyApplications();
    const { toggleBookmark, isBookmarked } = useBookmarks();

    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchStartup = async () => {
            try {
                setLoading(true);
                // const data = await FirestoreService.getOpportunityById(startupId);
                const response = await api.get(`/opportunities/${startupId}`);
                const data = { ...response.data, id: response.data._id };

                if (!data) throw new Error("Opportunity not found");
                setStartup(data);
            } catch (err: any) {
                console.error('Failed to fetch startup details:', err);
                setError(err.message || 'Failed to load opportunity');
            } finally {
                setLoading(false);
            }
        };

        if (startupId) {
            fetchStartup();
        }
    }, [startupId]);

    const getAppStatus = () => {
        if (!applications || !startup) return null;
        const app = applications.find(a => {
            const oppId = a.opportunityId && typeof a.opportunityId === 'object' ? (a.opportunityId as any)._id : a.opportunityId;
            return oppId === startup.id;
        });
        return app?.status;
    };

    const status = getAppStatus();
    const isOwner = startup?.postedBy?.firebaseUid === currentUser?.uid || startup?.founderId === currentUser?.uid;

    const handleApply = (roleId?: string) => {
        if (roleId) setSelectedRole(roleId);
        else setSelectedRole(null);
        setShowApplicationModal(true);
    };

    const handleCloseOpportunity = async () => {
        if (confirm('Are you sure you want to close this opportunity? It will no longer be visible in the main feed.')) {
            try {
                await updateStartupStatus(startup.id, 'closed');
                setStartup((prev: any) => ({ ...prev, status: 'closed' })); // Optimistic update
                alert('Opportunity closed successfully.');
            } catch (error) {
                alert('Failed to close opportunity.');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <BrutalistLoader />
            </div>
        );
    }

    if (error || !startup) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
                <div className="w-16 h-16 bg-red-100 border-2 border-slate-900 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase">Opportunity Not Found</h1>
                <p className="text-slate-600 mb-6 font-bold">{error || "This opportunity doesn't exist or has been removed."}</p>
                <button
                    onClick={() => router.push('/startups')}
                    className="px-6 py-2 bg-slate-900 text-white font-black uppercase tracking-wide border-2 border-slate-900 hover:bg-white hover:text-slate-900 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all"
                >
                    Back to Launchpad
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Nav Back */}
            <div className="sticky top-[64px] z-10 bg-slate-50/90 backdrop-blur-md border-b-2 border-slate-900">
                <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between">
                    <button
                        onClick={() => router.push('/startups')}
                        className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-wide text-sm hover:underline decoration-2 underline-offset-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Launchpad
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="p-2 border-2 border-slate-200 hover:border-slate-900 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all text-slate-500 hover:text-slate-900 bg-white"
                        >
                            <Share className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toggleBookmark(startup.id)}
                            className={`p-2 border-2 transition-all ${isBookmarked(startup.id)
                                ? 'bg-green-100 border-green-600 text-green-700 shadow-[2px_2px_0px_0px_rgba(22,163,74,1)]'
                                : 'bg-white border-slate-200 hover:border-slate-900 text-slate-500 hover:text-slate-900 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'}`}
                        >
                            <Bookmark className={`w-5 h-5 ${isBookmarked(startup.id) ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Card */}
                <div className="bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] mb-12">
                    {/* Cover Image */}
                    <div className="h-64 md:h-80 bg-slate-100 relative overflow-hidden border-b-4 border-slate-900">
                        {startup.image || startup.logo ? (
                            <img
                                src={startup.image || startup.logo}
                                alt={startup.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:24px_24px]"></div>
                        )}
                        <div className="absolute top-6 left-6 bg-white px-4 py-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-xs font-black uppercase tracking-widest text-slate-900">
                            {startup.type === 'project' ? 'Project' : 'Startup'}
                        </div>
                        {status && (
                            <div className={`absolute bottom-6 right-6 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                ${status === 'accepted' ? 'bg-green-400 text-slate-900' :
                                    status === 'rejected' ? 'bg-red-400 text-white' :
                                        'bg-yellow-300 text-slate-900'}`}>
                                {status}
                            </div>
                        )}
                        {startup.status === 'closed' && !status && (
                            <div className="absolute bottom-6 right-6 px-4 py-2 text-xs font-black uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-slate-300 text-slate-600">
                                Closed
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-10">
                        <div className="flex flex-col lg:flex-row gap-10 lg:items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none mb-4 uppercase tracking-tighter">
                                    {startup.name || startup.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-slate-500 mb-8 border-b-2 border-slate-100 pb-8">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border-2 border-slate-200 text-slate-700 uppercase tracking-wide text-xs">
                                        <Briefcase className="w-4 h-4" /> {startup.industry || 'Tech'}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border-2 border-slate-200 text-slate-700 uppercase tracking-wide text-xs">
                                        <MapPin className="w-4 h-4" /> {startup.location || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border-2 border-slate-200 text-slate-700 uppercase tracking-wide text-xs">
                                        <Calendar className="w-4 h-4" /> Posted {formatTimeAgo(startup.createdAt)}
                                    </div>
                                </div>
                                <div className="prose prose-slate max-w-none">
                                    <p className="text-xl text-slate-800 leading-relaxed font-medium">
                                        {startup.description}
                                    </p>
                                </div>
                            </div>

                            {/* Sidebar-ish Info */}
                            <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                                <div className="p-6 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(203,213,225,1)]">
                                    <h3 className="text-sm font-black uppercase text-slate-900 mb-6 tracking-widest border-b-2 border-slate-900 pb-2">At a Glance</h3>
                                    <div className="space-y-4">
                                        {startup.equity && (
                                            <div className="flex items-center justify-between group">
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                                                    <PieChart className="w-4 h-4" /> Equity
                                                </span>
                                                <span className="text-sm font-black text-slate-900 bg-green-100 px-2 py-0.5 border border-green-300">{startup.equity}</span>
                                            </div>
                                        )}
                                        {startup.salary && (
                                            <div className="flex items-center justify-between group">
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                                                    <DollarSign className="w-4 h-4" /> Salary
                                                </span>
                                                <span className="text-sm font-black text-slate-900 bg-yellow-100 px-2 py-0.5 border border-yellow-300">{startup.salary}</span>
                                            </div>
                                        )}
                                        {startup.stage && (
                                            <div className="flex items-center justify-between group">
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                                                    <Rocket className="w-4 h-4" /> Stage
                                                </span>
                                                <span className="text-sm font-black text-slate-900">{startup.stage}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between group">
                                            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                                                <Users className="w-4 h-4" /> Team
                                            </span>
                                            <span className="text-sm font-black text-slate-900">{startup.teamSize || '1-10'}</span>
                                        </div>
                                    </div>

                                    {!isOwner && !status && startup.status !== 'closed' && (
                                        <>
                                            <button
                                                onClick={() => handleApply()}
                                                className="w-full mt-8 py-4 bg-green-500 text-slate-900 font-black uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all"
                                            >
                                                Apply Now
                                            </button>
                                            <button
                                                onClick={() => setShowCollabModal(true)}
                                                className="w-full mt-3 py-3 bg-purple-50 text-purple-700 font-black uppercase tracking-widest border-2 border-purple-200 hover:border-slate-900 hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Users className="w-5 h-5" /> Request Collaboration
                                            </button>
                                        </>
                                    )}
                                    {isOwner && (
                                        <div className="mt-8 grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => setShowEditModal(true)}
                                                className="w-full py-3 bg-slate-100 text-slate-900 font-black uppercase tracking-widest border-2 border-slate-900 hover:bg-white hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all"
                                            >
                                                Edit Opportunity
                                            </button>
                                            {startup.status !== 'closed' ? (
                                                <button
                                                    onClick={handleCloseOpportunity}
                                                    className="w-full py-3 bg-red-100 text-red-900 font-black uppercase tracking-widest border-2 border-slate-900 hover:bg-red-200 hover:shadow-[2px_2px_0px_0px_rgba(185,28,28,1)] transition-all"
                                                >
                                                    Close Opportunity
                                                </button>
                                            ) : (
                                                <div className="w-full py-3 bg-slate-200 text-slate-500 font-black uppercase tracking-widest border-2 border-slate-300 text-center">
                                                    Closed
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Founder Info */}
                                <div className="p-6 bg-slate-900 text-white border-4 border-slate-900">
                                    <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Posted By</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                                            {startup.founderAvatar ? (
                                                <img src={startup.founderAvatar} alt="Founder" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-6 h-6 text-slate-900" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white">{startup.founderName || 'Unknown Founder'}</p>
                                            <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Project Lead</p>
                                        </div>
                                    </div>
                                    {startup.contact && (
                                        <div className="flex gap-3 mt-6">
                                            {startup.contact.linkedin && (
                                                <a href={startup.contact.linkedin} target="_blank" className="p-2 border-2 border-slate-700 hover:border-white hover:bg-white hover:text-slate-900 text-slate-400 transition-all">
                                                    <Link className="w-4 h-4" />
                                                </a>
                                            )}
                                            {startup.contact.website && (
                                                <a href={startup.contact.website} target="_blank" className="p-2 border-2 border-slate-700 hover:border-white hover:bg-white hover:text-slate-900 text-slate-400 transition-all">
                                                    <Globe className="w-4 h-4" />
                                                </a>
                                            )}
                                            {startup.contact.email && (
                                                <a href={`mailto:${startup.contact.email}`} className="p-2 border-2 border-slate-700 hover:border-white hover:bg-white hover:text-slate-900 text-slate-400 transition-all">
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roles Section */}
                {startup.roles && startup.roles.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-4 w-4 bg-green-500 border-2 border-slate-900"></div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Open Roles</h2>
                        </div>

                        <div className="grid gap-6">
                            {startup.roles.map((role: any) => (
                                <div key={role.id || role._id} className="bg-white border-4 border-slate-900 p-8 hover:shadow-[12px_12px_0px_0px_rgba(22,163,74,1)] transition-all group relative">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-2xl font-black text-slate-900 uppercase">{role.title}</h3>
                                                <span className="bg-slate-900 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide border-2 border-slate-900">{role.type}</span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-4">
                                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {role.location}</span>
                                                {role.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {role.salary}</span>}
                                            </div>

                                            <p className="text-slate-700 text-lg font-medium leading-relaxed max-w-3xl">{role.description}</p>
                                        </div>

                                        {!isOwner && startup.status !== 'closed' && (
                                            <button
                                                onClick={() => handleApply(role.id)}
                                                className="px-8 py-3 bg-white border-4 border-slate-900 text-slate-900 font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                                            >
                                                Apply Role
                                            </button>
                                        )}
                                    </div>

                                    {role.requirements && role.requirements.length > 0 && (
                                        <div className="mt-6 pt-6 border-t-2 border-slate-100">
                                            <div className="flex flex-wrap gap-2 transition-all">
                                                {role.requirements.map((req: string, idx: number) => (
                                                    <span key={idx} className="px-3 py-1 bg-slate-100 border-2 border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide group-hover:border-green-500 group-hover:bg-green-50 group-hover:text-green-700">
                                                        {req}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Requirements / Additional Info */}
                {(startup.requirements?.length > 0 || startup.additionalInfo) && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {startup.requirements?.length > 0 && (
                            <div className="bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                                    <CheckCircle className="w-6 h-6 text-green-600" /> General Requirements
                                </h3>
                                <ul className="space-y-4">
                                    {startup.requirements.map((req: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-slate-800 font-bold">
                                            <div className="w-2 h-2 bg-slate-900 mt-2 flex-shrink-0"></div>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {startup.additionalInfo && (
                            <div className="bg-slate-50 border-4 border-slate-200 p-8">
                                <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Additional Info</h3>
                                <div className="text-slate-600 font-medium leading-relaxed">
                                    {startup.additionalInfo}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Application Modal */}
            <StartupApplicationModal
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                startup={startup}
                selectedRole={startup.roles?.find((r: any) => r.id === selectedRole) || null}
                onSuccess={() => {
                    setShowApplicationModal(false);
                    router.refresh(); // Or optimistically update status
                }}
            />

            {/* Edit Modal */}
            <CreateStartupModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    // Refetch startup data to show changes
                    const fetchStartup = async () => {
                        try {
                            const response = await api.get(`/opportunities/${startupId}`);
                            const data = { ...response.data, id: response.data._id };
                            if (data) setStartup(data);
                        } catch (e) { console.error(e); }
                    };
                    fetchStartup();
                }}
                isEditing={true}
                initialData={startup}
            />

            {/* Collab Modal */}
            <RequestCollaborationModal
                isOpen={showCollabModal}
                onClose={() => setShowCollabModal(false)}
                targetCircleId={startup?.circleId || startup?.circle?.id || startup?._id}
                targetName={startup?.name}
            />

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title={startup.name || startup.title}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                description={startup.description}
            />
        </div >
    );
};

export default StartupDetailPage;
