"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useFirestore';
import {
    Search,
    Plus,
    ArrowRight,
    Users,
    Briefcase,
    Target,
    Globe,
    MoreVertical
} from 'lucide-react';
import CreateRoomModal from '@/components/CreateCircleModal';
import CollaborationRequestModal from '@/components/CollaborationRequestModal';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';

const CirclesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { rooms, myRooms, loading, joinRoom, requestJoin } = useRooms();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'explore' | 'my-circles'>('explore');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeCircleType, setActiveCircleType] = useState<'community' | 'collab' | 'opportunity'>('community');
    const [showMenuForCircle, setShowMenuForCircle] = useState<string | null>(null);
    const [collabModalOpen, setCollabModalOpen] = useState(false);
    const [selectedTargetCircle, setSelectedTargetCircle] = useState<any>(null);
    const [userOwnedCircles, setUserOwnedCircles] = useState<string[]>([]);

    // Sidebar links
    const sidebarLinks = [
        {
            label: "Community Circles",
            href: "#",
            icon: <Globe className="h-5 w-5 flex-shrink-0" />,
            type: 'community' as const
        },
        {
            label: "Collab Circles",
            href: "#",
            icon: <Users className="h-5 w-5 flex-shrink-0" />,
            type: 'collab' as const
        },
        {
            label: "Opportunity Circles",
            href: "#",
            icon: <Target className="h-5 w-5 flex-shrink-0" />,
            type: 'opportunity' as const
        },
    ];

    // Determine which circles the user owns
    useEffect(() => {
        if (currentUser && myRooms.length > 0) {
            const ownedIds = myRooms
                .filter(room => room.createdBy === currentUser.uid)
                .map(room => room.id || '');
            setUserOwnedCircles(ownedIds);
        }
    }, [currentUser, myRooms]);

    // Check if user owns at least one circle
    const userOwnsCircles = userOwnedCircles.length > 0;

    const handleCollaborationRequest = (circle: any) => {
        setSelectedTargetCircle(circle);
        setCollabModalOpen(true);
        setShowMenuForCircle(null);
    };

    const handleCollabSuccess = () => {
        // Modal will close automatically
        // Rooms will refresh via real-time listeners
    };

    const handleRoomAction = (room: any) => {
        if (!currentUser) return router.push('/auth');

        // For collab and opportunity circles, users are already members - navigate directly
        if (activeCircleType === 'collab' || activeCircleType === 'opportunity') {
            router.push(`/circles/${room.id}`);
            return;
        }

        // If in My Circles tab, user is already a member - navigate directly
        if (activeTab === 'my-circles') {
            router.push(`/circles/${room.id}`);
            return;
        }

        // In Explore tab - check membership status
        const isMember = room.members?.includes(currentUser.uid);
        const isPending = room.pendingMembers?.includes(currentUser.uid);

        if (isMember) {
            router.push(`/circles/${room.id}`);
        } else if (!isPending) {
            joinRoom(room.id);
        }
    };

    const renderContent = () => {
        // Determine source rooms based on circle type
        let sourceRooms;

        if (activeCircleType === 'collab' || activeCircleType === 'opportunity') {
            // Always use myRooms for collab and opportunity circles (user's circles only)
            sourceRooms = myRooms;
        } else {
            // For community circles, use explore or my-circles based on activeTab
            sourceRooms = activeTab === 'explore'
                ? rooms.filter(room => !room.members?.includes(currentUser?.uid || ''))
                : myRooms;
        }

        // Filter by circle type
        const typeFilteredRooms = sourceRooms.filter(room => {
            const roomType = (room as any).type || 'community';
            return roomType === activeCircleType;
        });

        // Filter by search term
        const filteredRooms = typeFilteredRooms.filter(room =>
            room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Render content for all types, using the filteredRooms logic


        // Community Circles content (existing circles page)
        return (
            <>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">
                            {activeCircleType === 'community' ? 'Community Circles' : activeCircleType === 'opportunity' ? 'Opportunity Circles' : 'Collab Circles'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {activeCircleType === 'community'
                                ? 'Connect with verified builders and creators'
                                : activeCircleType === 'opportunity'
                                    ? 'Your startup opportunity circles'
                                    : 'Your collaboration circles'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Circle
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search circles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-6 pr-14 border-2 border-slate-900 rounded-xl text-lg focus:outline-none transition shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:translate-x-[2px] focus:translate-y-[2px] placeholder:text-slate-400 font-bold"
                    />
                    <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-900 w-6 h-6" />
                </div>

                {/* Tabs - Only show for Community Circles */}
                {activeCircleType === 'community' && (
                    <div className="flex gap-2 mb-6 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`px-6 py-3 font-bold transition-all relative ${activeTab === 'explore'
                                ? 'text-green-600'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Explore
                            {activeTab === 'explore' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('my-circles')}
                            className={`px-6 py-3 font-bold transition-all relative ${activeTab === 'my-circles'
                                ? 'text-green-600'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            My Circles
                            {activeTab === 'my-circles' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                                />
                            )}
                        </button>
                    </div>
                )}

                {/* Circles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-slate-400 font-bold">
                                {activeTab === 'explore' ? "No communities found." : "You haven't joined any circles yet."}
                            </div>
                        ) : (
                            filteredRooms.map((room: any, index: number) => {
                                const isMember = currentUser && room.members?.includes(currentUser.uid);
                                const isPending = currentUser && room.pendingMembers?.includes(currentUser.uid);
                                const isOwnCircle = userOwnedCircles.includes(room.id);
                                const isOwner = (room as any).createdByUid === currentUser?.uid;

                                return (
                                    <motion.div
                                        key={room.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="bg-white border-2 border-slate-900 rounded-none p-6 hover:border-green-600 transition-colors duration-300 group flex flex-col relative"
                                    >
                                        {/* Status Indicator (top right) */}
                                        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${room.isPrivate ? 'bg-purple-500' : 'bg-green-500'} ring-4 ring-white`}></div>

                                        {/* Owner Badge (top left) - Only show in My Circles tab for owned circles */}
                                        {activeTab === 'my-circles' && isOwner && activeCircleType === 'community' && (
                                            <div className="absolute top-4 left-4 px-2 py-1 bg-green-600 text-white text-xs font-black rounded-lg shadow-lg">
                                                OWNER
                                            </div>
                                        )}

                                        {/* 3-Dot Menu - Show in Explore for non-owned circles, and in My Circles for circles user is member of but doesn't own */}
                                        {((activeTab === 'explore' && !isOwnCircle) || (activeTab === 'my-circles' && !isOwner)) && (
                                            <div className="absolute top-4 left-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenuForCircle(showMenuForCircle === room.id ? null : room.id);
                                                    }}
                                                    className="p-2 hover:bg-slate-100 rounded-full transition"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-slate-600" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {showMenuForCircle === room.id && (
                                                    <div className="absolute left-0 top-10 bg-white border-2 border-slate-900 rounded-xl shadow-xl z-10 min-w-[180px]">
                                                        <button
                                                            onClick={() => handleCollaborationRequest(room)}
                                                            className="w-full px-4 py-3 text-left text-sm font-bold text-slate-900 hover:bg-green-50 hover:text-green-700 transition rounded-xl"
                                                        >
                                                            Request Collaboration
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Avatar/Icon Area with Pattern Background */}
                                        <div className="aspect-square w-24 bg-slate-50 relative border-2 border-slate-200 mb-4 overflow-hidden mx-auto">
                                            {/* Pattern Background */}
                                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>

                                            {room.avatar ? (
                                                <img src={room.avatar} alt={room.name} className="w-full h-full object-cover relative z-10" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center relative z-10">
                                                    <Users className="w-10 h-10 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Circle Info - Centered */}
                                        <div className="text-center mb-4">
                                            <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-green-600 transition-colors mb-1">
                                                {room.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                                                {room.description || 'No description'}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-center gap-4 mb-4 text-xs text-slate-500 font-bold">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {(room.memberCount || room.members?.length || 0)} Members
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${room.isPrivate ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                {room.isPrivate ? 'Private' : 'Public'}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-auto w-full pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => handleRoomAction(room)}
                                                disabled={!!isPending}
                                                className={`w-full py-2 text-xs font-bold uppercase transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${isMember
                                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                    : isPending
                                                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                        : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                                                    }`}
                                            >
                                                {(activeCircleType as string) === 'collab' || (activeCircleType as string) === 'opportunity' ? (
                                                    'Enter Circle'
                                                ) : activeTab === 'my-circles' ? (
                                                    <>Enter Circle <ArrowRight className="w-4 h-4 inline" /></>
                                                ) : isPending ? (
                                                    'Requested'
                                                ) : isMember ? (
                                                    <>Open Circle <ArrowRight className="w-4 h-4 inline" /></>
                                                ) : (
                                                    'Join Circle'
                                                )}
                                            </button>
                                        </div>
                                    </motion.div >
                                );
                            })
                        )}
                    </AnimatePresence >
                </div >
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-50 flex overflow-hidden" style={{ top: '64px' }}>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                <SidebarBody className="justify-center gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="mb-8 overflow-hidden">
                            <motion.div animate={{ opacity: sidebarOpen ? 1 : 0, height: sidebarOpen ? 'auto' : 0 }}>
                                <h2 className="text-lg font-black text-slate-900 whitespace-nowrap">Circle Types</h2>
                            </motion.div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {sidebarLinks.map((link, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveCircleType(link.type)}
                                    className="cursor-pointer"
                                >
                                    <SidebarLink
                                        link={link}
                                        isActive={activeCircleType === link.type}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {renderContent()}
                </div>
            </div>

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    // Rooms will auto-refresh via useRooms hook
                }}
            />

            {/* Collaboration Request Modal */}
            {selectedTargetCircle && (
                <CollaborationRequestModal
                    isOpen={collabModalOpen}
                    onClose={() => {
                        setCollabModalOpen(false);
                        setSelectedTargetCircle(null);
                    }}
                    targetCircle={selectedTargetCircle}
                    onSuccess={handleCollabSuccess}
                />
            )}
        </div>
    );
};

export default CirclesPage;
