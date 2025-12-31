"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import {
    User,
    MapPin,
    Briefcase,
    CheckCircle,
    Link,
    Calendar,
    Share,
    BadgeCheck
} from 'lucide-react';
import BrutalistLoader from '@/components/ui/BrutalistLoader';

const ProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const { currentUser } = useAuth();
    const username = params?.username as string;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'circles'>('overview');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let user = await FirestoreService.getUserByUsername(username);
                if (!user) {
                    // Fallback to checking by ID
                    user = await FirestoreService.getUserProfile(username);
                }

                if (!user) {
                    throw new Error("User not found");
                }
                setProfile(user);
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                setError(err.message || "User not found");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><BrutalistLoader /></div>;

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <div className="w-20 h-20 bg-red-100 border-4 border-slate-900 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <User className="w-10 h-10 text-slate-900" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">User Not Found</h1>
                <p className="text-slate-600 font-bold mb-8">{error || "The user you are looking for does not exist."}</p>
                <button onClick={() => router.push('/discover')} className="px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-wide border-2 border-slate-900 hover:bg-white hover:text-slate-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    Go Home
                </button>
            </div>
        );
    }

    const isOwnProfile = currentUser?.uid === profile.firebaseUid;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b-4 border-slate-900 relative">
                <div className="h-48 bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#22c55e_25%,transparent_25%,transparent_75%,#22c55e_75%,#22c55e)] [background-size:24px_24px]"></div>
                </div>

                <div className="container mx-auto px-4 max-w-6xl relative z-10 -mt-16 mb-8">
                    <div className="flex flex-col md:flex-row items-end md:items-end gap-6">
                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex-shrink-0">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-green-100 flex items-center justify-center">
                                    <User className="w-16 h-16 text-green-600" />
                                </div>
                            )}
                        </div>

                        {/* Identity */}
                        <div className="flex-1 pb-2">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-1 flex items-center gap-2">
                                {profile.displayName}
                                {profile.badges?.some((b: any) => b.name === 'verified') && (
                                    <BadgeCheck className="w-8 h-8 text-blue-500" />
                                )}
                            </h1>
                            <p className="text-slate-600 font-bold text-lg mb-4 flex flex-wrap items-center gap-4">
                                <span>@{profile.username || 'user'}</span>
                                {profile.role && (
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 border-2 border-slate-200 text-xs font-black uppercase tracking-wide">
                                        <Briefcase className="w-3 h-3" /> {profile.role}
                                    </span>
                                )}
                                {profile.location && (
                                    <span className="flex items-center gap-1 text-sm font-medium">
                                        <MapPin className="w-4 h-4 text-slate-400" /> {profile.location}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mb-2 w-full md:w-auto">
                            {!isOwnProfile ? (
                                <button className="flex-1 md:flex-none px-6 py-3 bg-green-500 text-slate-900 font-black uppercase tracking-wide border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
                                    Follow
                                </button>
                                </>
                        ) : (
                        <button onClick={() => router.push('/profile')} className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-wide border-2 border-slate-900 hover:bg-white hover:text-slate-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            Edit Profile
                        </button>
                            )}
                        <button className="px-4 py-3 bg-white text-slate-900 font-black border-2 border-slate-900 hover:bg-slate-50 transition-all" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Profile link copied!");
                        }}>
                            <Share className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <div className="mt-8 max-w-3xl">
                        <p className="text-lg text-slate-700 font-medium leading-relaxed border-l-4 border-green-500 pl-4 py-1 italic">
                            "{profile.bio}"
                        </p>
                    </div>
                )}

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Followers', value: profile.followers?.length || 0 },
                        { label: 'Following', value: profile.following?.length || 0 },
                        { label: 'Reputation', value: profile.stats?.reputationScore || 0 },
                        { label: 'Executed', value: profile.stats?.circlesCompleted || 0 },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white border-2 border-slate-900 p-3 shadow-sm hover:shadow-md transition-all">
                            <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

            {/* Layout Content */ }
    <div className="container mx-auto px-4 max-w-6xl mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Col: Sidebar Info */}
        <div className="space-y-8">
            {/* Skills */}
            <div className="bg-white border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                    {profile.skills?.length > 0 ? profile.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-slate-100 border-2 border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide">
                            {skill}
                        </span>
                    )) : (
                        <p className="text-sm text-slate-400 font-medium italic">No skills listed yet.</p>
                    )}
                </div>
            </div>

            {/* Socials */}
            <div className="bg-slate-900 text-white p-6 border-4 border-slate-900">
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Connect</h3>
                <div className="space-y-3">
                    {profile.socialLinks?.linkedin && (
                        <a href={profile.socialLinks.linkedin} target="_blank" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                            <Link className="w-5 h-5" /> LinkedIn
                        </a>
                    )}
                    {profile.socialLinks?.github && (
                        <a href={profile.socialLinks.github} target="_blank" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                            <Link className="w-5 h-5" /> GitHub
                        </a>
                    )}
                    {profile.socialLinks?.portfolio && (
                        <a href={profile.socialLinks.portfolio} target="_blank" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                            <Link className="w-5 h-5" /> Portfolio
                        </a>
                    )}
                    {(!profile.socialLinks || Object.keys(profile.socialLinks).length === 0) && (
                        <p className="text-sm text-slate-500 italic">No social links added.</p>
                    )}
                </div>
            </div>

            {/* Availability */}
            <div className={`p-6 border-4 border-slate-900 ${profile.availability === 'busy' ? 'bg-red-100' : 'bg-green-100'}`}>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Availability</h3>
                <p className="font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${profile.availability === 'busy' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    {profile.availability === 'busy' ? 'Currently Busy' : 'Open to Work'}
                </p>
            </div>
        </div>

        {/* Right Col: Main Tabs Content */}
        <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b-4 border-slate-900 mb-8 bg-white">
                {['overview', 'opportunities', 'circles'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === tab
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Badges Removed as per request */}


                        {/* Activity Timeline (Mock) */}
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-4 uppercase flex items-center gap-2">
                                <Calendar className="w-5 h-5" /> Recent Activity
                            </h3>
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                                <div className="relative">
                                    <div className="absolute -left-[39px] w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                                    <h4 className="font-bold text-slate-900">Joined EarnBuddy</h4>
                                    <p className="text-sm text-slate-500">Just now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'opportunities' && (
                    <div className="text-center py-12 bg-white border-2 border-slate-200 border-dashed">
                        <p className="text-slate-500 font-bold">No opportunities posted yet.</p>
                    </div>
                )}

                {activeTab === 'circles' && (
                    <div className="text-center py-12 bg-white border-2 border-slate-200 border-dashed">
                        <p className="text-slate-500 font-bold">No circles joined yet.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
        </div >
    );
};

export default ProfilePage;
