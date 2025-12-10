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
    ArrowRight,
    Hash,
    Eye,
    Filter,
    Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePods, useProjects, useStartups, useAnalytics, useRecommendations, useOnboarding, useRooms } from '@/hooks/useFirestore';
import { TrendingPods } from '@/components/ui/trending-pods';
import { BuilderFeed } from '@/components/ui/builder-feed';
import { FloatingCard } from '@/components/ui/floating-card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancedSearch } from '@/components/ui/advanced-search';
// import { NotificationCenter } from '@/components/ui/notification-center'; // Temporarily commented out until verified
import { OnboardingFlow } from '@/components/ui/onboarding-flow';

export default function DiscoverPage() {
    const { currentUser, userProfile, logout } = useAuth();
    const { pods, loading: podsLoading } = usePods();
    const { projects, loading: projectsLoading } = useProjects();
    const { startups, loading: startupsLoading } = useStartups();
    const { rooms, loading: roomsLoading } = useRooms();
    const { analytics, loading: analyticsLoading } = useAnalytics();
    const { recommendations, loading: recommendationsLoading } = useRecommendations();
    const { saveOnboardingResponse } = useOnboarding();
    const router = useRouter();

    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (userProfile && !userProfile.onboardingCompleted) {
            setShowOnboarding(true);
        }
    }, [userProfile]);


    const handleSearch = (filters: any) => {
        console.log('Search filters:', filters);
        // Implement search logic
    };

    const handleOnboardingComplete = (data: any) => {
        console.log('Onboarding data:', data);

        // Save onboarding data to database
        saveOnboardingResponse(data).then(() => {
            setShowOnboarding(false);
            // Refresh the page
            window.location.reload();
        }).catch(error => {
            console.error('Error saving onboarding data:', error);
        });
    };

    // Personalized quick actions based on user's onboarding
    const getPersonalizedQuickActions = () => {
        const baseActions = [
            {
                title: 'Community Pods',
                description: 'Join builder communities',
                icon: Hash,
                path: '/community',
                color: 'from-blue-500 to-purple-600',
                count: pods?.length || 0
            },
            {
                title: 'Team Projects',
                description: 'Join project teams',
                icon: Briefcase,
                path: '/freelance',
                color: 'from-green-500 to-emerald-600',
                count: projects?.length || 0
            },
            {
                title: 'Startups',
                description: 'Discover startup opportunities',
                icon: Rocket,
                path: '/startups',
                color: 'from-purple-500 to-pink-600',
                count: startups?.length || 0
            },
            {
                title: 'Chat Rooms',
                description: 'Connect in real-time',
                icon: MessageCircle,
                path: '/rooms',
                color: 'from-orange-500 to-red-600',
                count: rooms?.length || 0
            }
        ];

        return baseActions;
    };

    const quickActions = getPersonalizedQuickActions();

    // Personalized stats (Using mock data logic from original file)
    const getPersonalizedStats = () => {
        const joinedPods = currentUser ? pods.filter(p => p.members?.includes(currentUser.uid)) : [];
        const profileViews = analytics?.profileViews ?? 0;
        const postsCreated = analytics?.postsCreated ?? 0;
        const projectsCompleted = (userProfile?.completedProjects as number) ?? analytics?.completedProjects ?? 0;
        const podsJoined = joinedPods.length;

        return [
            { label: 'Profile Views', value: profileViews.toString(), icon: Eye, change: "+0%" },
            { label: 'Posts Created', value: postsCreated.toString(), icon: MessageCircle, change: "+0%" },
            { label: 'Pods Joined', value: podsJoined.toString(), icon: Users, change: "+0%" },
            { label: 'Projects Completed', value: projectsCompleted.toString(), icon: Award, change: "+0%" }
        ];
    };

    const stats = getPersonalizedStats();

    const recentActivity = [
        { type: 'Welcome', title: 'Complete your profile to get personalized recommendations', time: 'Now', urgent: true }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto">
                {/* Welcome Section */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Builder'}!
                        👋
                    </h2>
                    <p className="text-slate-600">
                        Here's what's happening in your builder network today.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <FloatingCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {stat.change}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <stat.icon className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </FloatingCard>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">Quick Actions</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <motion.div
                                key={index}
                                className="group cursor-pointer"
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                onClick={() => router.push(action.path)}
                            >
                                <div className={`bg-gradient-to-r ${action.color} rounded-2xl p-6 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <action.icon className="w-8 h-8" />
                                        <span className="text-2xl font-bold">{action.count}</span>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                                        <p className="text-sm opacity-90">{action.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Search Section */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                            <input
                                type="text"
                                placeholder="Search opportunities, pods, startups, and more..."
                                className="w-full pl-14 pr-14 py-5 text-xl border border-slate-200 rounded-2xl bg-white text-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-lg"
                            />
                            <motion.button
                                onClick={() => setShowAdvancedSearch(true)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 hover:bg-slate-100 rounded-lg transition-colors"
                                whileHover={{ scale: 1.1 }}
                            >
                                <Filter className="w-6 h-6 text-slate-500" />
                            </motion.button>
                        </div>
                    </div>
                </motion.section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Builder Feed */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <BuilderFeed />
                        </motion.section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Trending Pods */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            {podsLoading ? (
                                <FloatingCard className="p-6">
                                    <Skeleton className="h-6 w-32 mb-4" />
                                    <div className="space-y-4">
                                        Loading pods...
                                    </div>
                                </FloatingCard>
                            ) : (
                                <TrendingPods pods={pods} />
                            )}
                        </motion.section>

                        {/* Quick Stats */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <FloatingCard className="p-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-6">Your Progress</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-600">Profile Completion</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {userProfile?.onboardingCompleted ? '100%' : '85%'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <motion.div
                                                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: userProfile?.onboardingCompleted ? "100%" : "85%" }}
                                                transition={{ duration: 1, delay: 0.8 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/profile')}
                                >
                                    {userProfile?.onboardingCompleted ? 'View Profile' : 'Complete Profile'}
                                </motion.button>
                            </FloatingCard>
                        </motion.section>

                    </div>
                </div>
            </div>

            {/* Advanced Search Modal */}
            <AdvancedSearch
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={handleSearch}
            />

            {/* Onboarding Flow */}
            <OnboardingFlow
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
                onSkip={() => setShowOnboarding(false)}
            />
        </div>
    );
};
