"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Share2,
    Bookmark,
    Users,
    Briefcase,
    MapPin,
    DollarSign,
    PieChart,
    Calendar,
    CheckCircle,
    Globe,
    Linkedin,
    Mail
} from 'lucide-react';
import { useStartups, useMyApplications, useBookmarks } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { opportunityAPI } from '@/lib/axios';
import { formatTimeAgo } from '@/lib/utils';
import StartupApplicationModal from '@/components/StartupApplicationModal';

const StartupDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const startupId = params?.id as string;
    const { currentUser } = useAuth();

    const [startup, setStartup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { applications } = useMyApplications();
    const { toggleBookmark, isBookmarked } = useBookmarks();

    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchStartup = async () => {
            try {
                setLoading(true);
                const response = await opportunityAPI.getById(startupId);
                setStartup({ ...response.data, id: response.data._id });
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
        setShowApplicationModal(true);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !startup) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Opportunity Not Found</h1>
                <p className="text-slate-600 mb-6">{error || "This opportunity doesn't exist or has been removed."}</p>
                <button
                    onClick={() => router.push('/startups')}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                    Back to Launchpad
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Nav Back */}
            <div className="sticky top-[64px] z-10 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
                <div className="container mx-auto px-4 py-3 max-w-5xl flex items-center justify-between">
                    <button
                        onClick={() => router.push('/startups')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Launchpad
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyLink}
                            className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition text-slate-500 hover:text-green-600"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toggleBookmark(startup.id)}
                            className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition text-slate-500"
                        >
                            <Bookmark className={`w-5 h-5 ${isBookmarked(startup.id) ? 'fill-current text-green-600' : 'hover:text-green-600'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header Card */}
                <div className="bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-10">
                    {/* Cover Image */}
                    <div className="h-64 md:h-80 bg-slate-100 relative overflow-hidden">
                        {startup.image || startup.logo ? (
                            <img
                                src={startup.image || startup.logo}
                                alt={startup.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200 text-xs font-black uppercase tracking-wide text-green-700">
                            {startup.type === 'project' ? 'Project' : 'Startup'}
                        </div>
                        {status && (
                            <div className={`absolute bottom-4 right-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-sm border border-black/10
                                ${status === 'accepted' ? 'bg-green-500 text-white' :
                                    status === 'rejected' ? 'bg-red-500 text-white' :
                                        'bg-yellow-400 text-slate-900'}`}>
                                {status}
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-10">
                        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-2">
                                    {startup.name || startup.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-500 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> {startup.industry || 'Tech'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {startup.location || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Posted {formatTimeAgo(startup.createdAt)}
                                    </div>
                                </div>
                                <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                                    {startup.description}
                                </p>
                            </div>

                            {/* Sidebar-ish Info */}
                            <div className="w-full md:w-72 flex-shrink-0 space-y-4">
                                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                    <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-wider">Details</h3>
                                    <div className="space-y-3">
                                        {startup.equity && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                    <PieChart className="w-4 h-4" /> Equity
                                                </span>
                                                <span className="text-sm font-black text-slate-900">{startup.equity}</span>
                                            </div>
                                        )}
                                        {startup.salary && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" /> Salary
                                                </span>
                                                <span className="text-sm font-black text-slate-900">{startup.salary}</span>
                                            </div>
                                        )}
                                        {startup.stage && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                    <Rocket className="w-4 h-4" /> Stage
                                                </span>
                                                <span className="text-sm font-black text-slate-900">{startup.stage}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Team
                                            </span>
                                            <span className="text-sm font-black text-slate-900">{startup.teamSize || '1-10'}</span>
                                        </div>
                                    </div>

                                    {!isOwner && !status && (
                                        <button
                                            onClick={() => handleApply()}
                                            className="w-full mt-6 py-3 bg-green-600 text-white font-black uppercase rounded-lg hover:bg-green-700 transition shadow-[4px_4px_0px_0px_rgba(22,101,52,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]"
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                    {isOwner && (
                                        <button
                                            onClick={() => alert('Manage flow coming soon')}
                                            className="w-full mt-6 py-3 bg-slate-900 text-white font-black uppercase rounded-lg hover:bg-slate-800 transition"
                                        >
                                            Manage Opportunity
                                        </button>
                                    )}
                                </div>

                                {/* Founder Info */}
                                <div className="p-5 bg-white rounded-xl border border-slate-200">
                                    <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-wider">Posted By</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden">
                                            {startup.founderAvatar ? (
                                                <img src={startup.founderAvatar} alt="Founder" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{startup.founderName || 'Unknown Founder'}</p>
                                            <p className="text-xs font-bold text-slate-500">Founder</p>
                                        </div>
                                    </div>
                                    {startup.contact && (
                                        <div className="flex gap-2 mt-4">
                                            {startup.contact.linkedin && (
                                                <a href={startup.contact.linkedin} target="_blank" className="p-2 bg-slate-50 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                            {startup.contact.website && (
                                                <a href={startup.contact.website} target="_blank" className="p-2 bg-slate-50 rounded-full hover:bg-green-50 text-slate-400 hover:text-green-600 transition">
                                                    <Globe className="w-4 h-4" />
                                                </a>
                                            )}
                                            {startup.contact.email && (
                                                <a href={`mailto:${startup.contact.email}`} className="p-2 bg-slate-50 rounded-full hover:bg-yellow-50 text-slate-400 hover:text-yellow-600 transition">
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
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                                <Users className="w-5 h-5" />
                            </span>
                            Open Roles
                        </h2>
                        <div className="grid gap-4">
                            {startup.roles.map((role: any) => (
                                <div key={role.id || role._id} className="bg-white border text-left border-slate-200 p-6 rounded-xl hover:border-green-400 transition group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{role.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase">{role.type}</span>
                                                <span>{role.location}</span>
                                                {role.salary && <span>• {role.salary}</span>}
                                            </div>
                                            <p className="mt-3 text-slate-600 max-w-2xl">{role.description}</p>
                                        </div>
                                        {!isOwner && (
                                            <button
                                                onClick={() => handleApply(role.id)}
                                                className="px-6 py-2 bg-white border-2 border-slate-900 text-slate-900 font-bold uppercase rounded-lg hover:bg-slate-900 hover:text-white transition whitespace-nowrap"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Requirements / Additional Info */}
                {(startup.requirements?.length > 0 || startup.additionalInfo) && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {startup.requirements?.length > 0 && (
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" /> Requirements
                                </h3>
                                <ul className="space-y-3">
                                    {startup.requirements.map((req: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {startup.additionalInfo && (
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-4">Additional Info</h3>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600">
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
                    // Optimistic update logic if needed
                    router.refresh();
                }}
            />
        </div>
    );
};

// Simple Icon component helper if needed, but imported lucid-react icons work fine.
import { Rocket } from 'lucide-react';

export default StartupDetailPage;
