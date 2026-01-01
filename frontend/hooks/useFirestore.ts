"use client";

import { useState, useEffect, useCallback } from 'react';
import { Pod, PodPost, ChatRoom as Room, Startup, Gig, Notification, ChatMessage, UserAnalytics, Application, FirestoreService } from '../lib/firestore'; // Keep types for now
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { socket } from '../lib/socket';
import { getDefaultImage } from '../lib/utils';


// Custom hooks for Firestore operations
export const usePods = () => {
    const [pods, setPods] = useState<Pod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // For now, treat pods as rooms or empty
        setLoading(false);
    }, []);

    const joinPod = async () => { };
    const leavePod = async () => { };
    const createPod = async () => { return ''; };

    return { pods, loading, error, joinPod, leavePod, createPod };
};

// Stub usePodPosts
export const usePodPosts = (podId: string) => {
    return { posts: [], loading: false, error: null, createPost: async () => { }, likePost: async () => { }, unlikePost: async () => { }, bookmarkPost: async () => { } };
};

export const useRooms = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [myRooms, setMyRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);

                let pRooms: Room[] = [];
                let uRooms: Room[] = [];

                try {
                    const pubRes = await api.get('/rooms');
                    pRooms = pubRes.data.map((r: { _id: string;[key: string]: unknown }) => ({ ...r, id: r._id }));
                } catch (e) { console.error("Error fetching public rooms", e); }

                if (currentUser) {
                    try {
                        const myRes = await api.get('/rooms/me');
                        uRooms = myRes.data.map((r: any) => ({ ...r, id: r._id }));
                    } catch (e) { console.error("Error fetching my rooms", e); }
                }

                setRooms(pRooms);
                setMyRooms(uRooms);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to fetch rooms';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [currentUser, refreshTrigger]);

    useEffect(() => {
        if (!socket) return;

        // Specific Handlers to avoid full refetch
        const handleRoomCreated = (newRoom: Room) => {
            // Add to public rooms (assuming new rooms are public or check isPrivate)
            // Ideally payload tells us. For now, we append to top.
            setRooms(prev => {
                if (prev.some(r => r.id === newRoom.id)) return prev;
                return [newRoom, ...prev];
            });
        };

        const handleRoomUpdated = (updatedRoom: Room) => {
            setRooms(prev => prev.map(r => r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r));
            setMyRooms(prev => prev.map(r => r.id === updatedRoom.id ? { ...r, ...updatedRoom } : r));
        };

        const handleMemberJoined = (data: { roomId: string }) => {
            const { roomId } = data;
            // Update count locally
            const updateCount = (list: Room[]) => list.map(r => {
                if (r.id === roomId) {
                    return { ...r, memberCount: (r.memberCount || 0) + 1 };
                }
                return r;
            });
            setRooms(prev => updateCount(prev));
            setMyRooms(prev => updateCount(prev));
        };

        const handleMemberLeft = (data: { roomId: string }) => {
            const { roomId } = data;
            const updateCount = (list: Room[]) => list.map(r => {
                if (r.id === roomId) {
                    return { ...r, memberCount: Math.max((r.memberCount || 1) - 1, 0) };
                }
                return r;
            });
            setRooms(prev => updateCount(prev));
            setMyRooms(prev => updateCount(prev));
        };

        const handleRoomDeleted = ({ roomId }: { roomId: string }) => {
            setRooms(prev => prev.filter(r => r.id !== roomId));
            setMyRooms(prev => prev.filter(r => r.id !== roomId));
        };

        socket.on('room:created', handleRoomCreated);
        socket.on('room:updated', handleRoomUpdated);
        socket.on('room:deleted', handleRoomDeleted);
        socket.on('room:member_joined', handleMemberJoined);
        socket.on('room:member_left', handleMemberLeft);

        return () => {
            socket.off('room:created', handleRoomCreated);
            socket.off('room:updated', handleRoomUpdated);
            socket.off('room:deleted', handleRoomDeleted);
            socket.off('room:member_joined', handleMemberJoined);
            socket.off('room:member_left', handleMemberLeft);
        };
    }, []);

    const createRoom = async (roomData: any) => {
        if (!currentUser) return;
        try {
            const payload = { ...roomData };
            if (!payload.avatar) {
                payload.avatar = getDefaultImage(payload.name);
            }
            await api.post('/rooms', payload);
            // Trigger refresh via state to use the shared logic
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to create room');
            throw err;
        }
    };

    const joinRoom = async (roomId: string) => {
        if (!currentUser) return;
        try {
            await api.post(`/rooms/${roomId}/join`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to join room');
        }
    };

    const requestJoin = async (roomId: string) => {
        if (!currentUser) return;
        try {
            // Use Backend API for requests (which now handles Pending vs Accepted based on privacy too)
            // But usually requestJoin implies explicit "Ask to join" -> Pending.
            // joinRoom (Public) uses the same endpoint.
            // Our backend `joinRoom` handles both.
            await api.post(`/rooms/${roomId}/join`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to request join');
        }
    };

    const getPendingRequests = async (roomId: string) => {
        try {
            const res = await api.get(`/rooms/${roomId}/pending`);
            // Backend returns array of RoomMembership populated with user
            // Mapped to expected format if needed. 
            // Frontend components expect { id, user: { displayName, photoURL... } }
            // Backend returns { ...membership, user: { ...userDoc } }
            return res.data;
        } catch (err) {
            console.error('Failed to get pending requests:', err);
            return [];
        }
    };

    const approveMembership = async (roomId: string, userId: string, status: 'accepted' | 'rejected') => {
        try {
            await api.post(`/rooms/${roomId}/approve/${userId}`, { status });
            // Trigger refresh via socket usually, but manual refresh safe
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error('Failed to update membership:', err);
            throw err;
        }
        // Refetch logic if needed, but components usually handle it
    };

    return { rooms, myRooms, loading, error, createRoom, joinRoom, requestJoin, getPendingRequests, approveMembership };
};

export const useRoomMessages = (roomId: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser, userProfile } = useAuth();
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [typingUsers, setTypingUsers] = useState<any[]>([]);

    // Realtime Subscription
    // Realtime Subscription & Initial Fetch
    useEffect(() => {
        if (!roomId || !currentUser) return;

        let mounted = true;

        // 1. Fetch Online Users
        FirestoreService.getOnlineMembers(roomId).then(data => {
            if (mounted) setOnlineUsers(data);
        }).catch(console.error);

        // 2. Fetch Initial Messages via API
        setLoading(true);
        api.get(`/rooms/${roomId}/messages?limit=50`)
            .then(res => {
                if (mounted) {
                    // API returns Oldest -> Newest (ASC).
                    // We render Top -> Bottom.
                    // So [Oldest, ..., Newest] is correct for Standard Chat.
                    // NO REVERSE NEEDED.
                    setMessages(res.data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('Failed to load messages:', err);
                if (mounted) setLoading(false);
            });

        // 3. Socket Subscription
        if (socket) {
            socket.emit('join_room', roomId);

            const handleNewMessage = (msg: ChatMessage) => {
                setMessages(prev => {
                    // Dedup
                    if (prev.some(m => m._id === msg._id || m.id === msg._id)) return prev;
                    return [...prev, msg];
                });
            };

            const handleTyping = ({ userId, userName }: any) => {
                if (userId !== currentUser.uid) {
                    setTypingUsers(prev => {
                        if (prev.some(u => u.userId === userId)) return prev;
                        return [...prev, { userId, userName }];
                    });
                }
            };

            const handleStopTyping = ({ userId }: any) => {
                setTypingUsers(prev => prev.filter(u => u.userId !== userId));
            };

            const handleOnline = (user: any) => {
                setOnlineUsers(prev => {
                    // Dedup
                    const exists = prev.some(u => u.userId === user.userId);
                    if (exists) return prev;
                    return [...prev, user];
                });
            };

            const handleOffline = ({ userId }: any) => {
                setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
            };

            const handleRoomUsers = (users: any[]) => {
                setOnlineUsers(users);
            };

            socket.on('new_message', handleNewMessage);
            socket.on('typing', handleTyping);
            socket.on('stop_typing', handleStopTyping);
            socket.on('member:online', handleOnline);
            socket.on('member:offline', handleOffline);
            socket.on('room_users', handleRoomUsers);


            return () => {
                mounted = false;
                socket.off('new_message', handleNewMessage);
                socket.off('typing', handleTyping);
                socket.off('stop_typing', handleStopTyping);
                socket.off('member:online', handleOnline);
                socket.off('member:offline', handleOffline);
                socket.off('room_users', handleRoomUsers);
                socket.emit('leave_room', roomId);
            };
        }

        return () => { mounted = false; };
    }, [roomId, currentUser]);

    const loadMore = async () => {
        if (!hasMore || isLoadingMore || messages.length === 0) return;

        setIsLoadingMore(true);
        // Oldest message is at index 0 because we strictly store [Oldest ... Newest]
        const oldestMessageId = messages[0]._id || messages[0].id; // Handle both due to loose types

        try {
            const res = await api.get(`/rooms/${roomId}/messages?limit=30&before=${oldestMessageId}`);
            const olderMessages = res.data;

            if (olderMessages.length < 30) {
                setHasMore(false);
            }

            if (olderMessages.length > 0) {
                setMessages(prev => {
                    // Prepend logic
                    // Dedup against existing (just in case)
                    const existingIds = new Set(prev.map(m => m._id));
                    const uniqueOlder = olderMessages.filter((m: any) => !existingIds.has(m._id));
                    return [...uniqueOlder, ...prev];
                });
            }
        } catch (err) {
            console.error('Failed to load older messages:', err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
        if (!roomId || !currentUser) return;
        try {
            await FirestoreService.sendChatMessage({
                roomId,
                content,
                type,
                sender: {
                    _id: currentUser.uid,
                    displayName: userProfile?.displayName || 'Unknown',
                    photoURL: currentUser.photoURL || '',
                    firebaseUid: currentUser.uid
                },
                // senderId/Name legacy support
                senderId: currentUser.uid,
                senderName: userProfile?.displayName,
                senderPhotoURL: currentUser.photoURL || ''
            });
        } catch (err: any) {
            setError(err.message || 'Failed to send message');
            throw err;
        }
    };

    const notifyTyping = () => {
        // No-op without socket.io
    };

    const deleteMessage = async (messageId: string) => {
        await FirestoreService.deleteMessage(roomId, messageId);
    };

    const updateMessage = async (messageId: string, content: string) => {
        await FirestoreService.updateMessage(roomId, messageId, content);
    };

    return { messages, loading, error, sendMessage, onlineUsers, typingUsers, notifyTyping, loadMore, hasMore, isLoadingMore, deleteMessage, updateMessage };
};

export const useRoomChatMessages = useRoomMessages;

export const useStartups = () => {
    const [startups, setStartups] = useState<Startup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Initial fetch
    const fetchStartups = useCallback(async () => {
        try {
            setLoading(true);
            // const data = await FirestoreService.getStartups();
            const response = await api.get('/opportunities?type=startup');
            const data = response.data.map((item: any) => ({ ...item, id: item._id }));
            setStartups(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch startups');
        } finally {
            setLoading(false);
        }
    }, []);

    // Use Effect to handle initial fetch and refresh trigger (manual or socket)
    useEffect(() => {
        fetchStartups();
    }, [fetchStartups, refreshTrigger]);

    // Socket Listeners
    useEffect(() => {
        const handleRefresh = () => {
            setRefreshTrigger(prev => prev + 1);
        };

        if (socket) {
            socket.on('opportunity:created', handleRefresh);
            socket.on('opportunity:updated', handleRefresh);
            socket.on('application:updated', handleRefresh); // Status changes
        }

        return () => {
            if (socket) {
                socket.off('opportunity:created', handleRefresh);
                socket.off('opportunity:updated', handleRefresh);
                socket.off('application:updated', handleRefresh);
            }
        };
    }, []);

    const createStartup = async (startupData: any) => {
        if (!currentUser) return;
        try {
            // Ensure type is set to startup
            const payload = { ...startupData, type: 'startup' };
            if (!payload.logo) {
                payload.logo = getDefaultImage(payload.name);
            }
            await api.post('/opportunities', payload);
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create startup');
            throw err;
        }
    };

    const updateStartup = async (id: string, startupData: any) => {
        if (!currentUser) return;
        try {
            await api.put(`/opportunities/${id}`, startupData);
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update startup');
            throw err;
        }
    };

    const applyToStartup = async (startupId: string, roleId: string, userId: string, applicationData: any) => {
        try {
            await api.post('/applications', {
                opportunityId: startupId,
                roleId,
                message: applicationData
            });
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to apply to startup');
            throw err;
        }
    };

    const getApplicants = async (startupId: string): Promise<any[]> => {
        try {
            const response = await api.get(`/applications/opportunity/${startupId}`);
            // Backend returns array of application objects, populated with 'applicant'
            return response.data;
        } catch (err) {
            console.error("Error fetching applicants:", err);
            throw err;
        }
    };


    const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected' | 'interviewing') => {
        try {
            await api.patch(`/applications/${applicationId}/status`, { status });
        } catch (err) {
            console.error("Error updating application status:", err);
            throw err;
        }
    };

    const bookmarkStartup = async (startupId: string, userId: string) => {
        await FirestoreService.bookmarkStartup(startupId, userId);
    };
    const unbookmarkStartup = async (startupId: string, userId: string) => {
        await FirestoreService.unbookmarkStartup(startupId, userId);
    }; // TODO

    const deleteStartup = async (startupId: string) => {
        // TODO: implement delete in FirestoreService
        // await FirestoreService.deleteStartup(startupId);
        setRefreshTrigger(p => p + 1);
    };

    const updateStartupStatus = async (startupId: string, status: string) => {
        try {
            await api.patch(`/opportunities/${startupId}/status`, { status });
            setRefreshTrigger(p => p + 1);
        } catch (e) {
            console.error('Failed to update startup status:', e);
            setError(e instanceof Error ? e.message : 'Failed to update status');
            throw e;
        }
    };

    return {
        startups,
        loading,
        error,
        createStartup,
        updateStartup,
        applyToStartup,
        bookmarkStartup,
        unbookmarkStartup,
        getApplicants,
        updateApplicationStatus,
        deleteStartup,
        updateStartupStatus,
        fetchStartups
    };
};

export const useMyApplications = () => {
    const { currentUser } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = useCallback(async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            // const apps = await FirestoreService.getUserApplications(currentUser.uid);
            const response = await api.get('/applications/me');
            const apps = response.data.map((app: any) => ({
                ...app,
                id: app._id,
            }));
            setApplications(apps);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchApplications();
    }, [currentUser]);

    return { applications, loading, error, fetchApplications };
};

export const useProjects = () => {
    const [projects, setProjects] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            // const data = await FirestoreService.getProjects();
            const response = await api.get('/opportunities?type=freelance');
            const data = response.data.map((item: any) => ({ ...item, id: item._id }));
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects, refreshTrigger]);

    // Socket Listeners
    useEffect(() => {
        const handleRefresh = () => {
            setRefreshTrigger(p => p + 1);
        };

        if (socket) {
            socket.on('opportunity:created', handleRefresh);
            socket.on('opportunity:updated', handleRefresh);
        }

        return () => {
            if (socket) {
                socket.off('opportunity:created', handleRefresh);
                socket.off('opportunity:updated', handleRefresh);
            }
        };
    }, []);

    const createProject = async (projectData: any) => {
        if (!currentUser) return;
        try {
            const payload = { ...projectData, type: 'project' };
            if (!payload.companyLogo) {
                payload.companyLogo = getDefaultImage(payload.company || payload.title);
            }
            await FirestoreService.createProject(payload, currentUser.uid);
            setRefreshTrigger(p => p + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
            throw err;
        }
    };

    const applyToRole = async (projectId: string, roleId: string, userId: string, applicationData: any) => {
        try {
            await FirestoreService.applyToRole(projectId, roleId, userId, applicationData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to apply to role');
        }
    };

    const bookmarkProject = async (projectId: string, userId: string) => { await FirestoreService.bookmarkProject(projectId, userId); };
    const unbookmarkProject = async (projectId: string, userId: string) => { await FirestoreService.unbookmarkProject(projectId, userId); };

    return { projects, loading, error, createProject, applyToRole, bookmarkProject, unbookmarkProject, fetchProjects };
};

// Analytics Hook
export const useAnalytics = () => {
    const analytics: any = {
        userId: 'stub',
        profileViews: 0,
        postsCreated: 0,
        messagesPosted: 0,
        podsJoined: 0,
        gigsApplied: 0,
        startupsApplied: 0,
        completedProjects: 0,
        earnings: 0,
        lastActive: {},
        createdAt: {},
        updatedAt: {}
    };
    return { analytics, loading: false, error: null };
};

// Recommendations Hook
export const useRecommendations = () => {
    // Return empty array or mock object instead of null to be safer, or explicit type
    return { recommendations: [], loading: false, error: null };
};

// Community Posts Hook
export const useCommunityPosts = () => {
    const [posts] = useState<any[]>([]);
    const loading = false;
    const error = null;
    const createPost = async () => { };
    const refreshPosts = async () => { };
    return { posts, loading, error, createPost, refreshPosts };
};

// Enhanced Pod Posts
export const useEnhancedPodPosts = (podId: string) => {
    return { posts: [], loading: false, error: null, createPost: async () => { } };
};

// ... (existing exports)

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // Polling based since we are using REST API now
        const fetchNotifications = async () => {
            // ... existing polling logic
            try {
                const response = await api.get('/notifications');
                const data = response.data.map((item: any) => ({ ...item, id: item._id }));
                setNotifications(data);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError('Failed to fetch notifications');
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

        // Realtime Listener
        const handleNewNotification = (notif: any) => {
            // notif might be raw from socket, ensure shape matches
            const newNotif = { ...notif, id: notif._id || notif.id, isRead: false };
            setNotifications(prev => {
                // Deduplicate
                if (prev.some(n => n.id === newNotif.id)) return prev;
                return [newNotif, ...prev];
            });
        };

        if (socket) {
            socket.on('notification:new', handleNewNotification);
        }

        return () => {
            clearInterval(interval);
            if (socket) socket.off('notification:new', handleNewNotification);
        };
    }, [currentUser]);

    const markAsRead = async (id: string) => {
        try {
            // await FirestoreService.markNotificationRead(id);
            await api.put(`/notifications/${id}/read`);
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return { notifications, loading, error, markAsRead, unreadCount };
};

export const useEvents = (limit?: number) => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const data = await FirestoreService.getEvents(limit);
                setEvents(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch events');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [limit]);

    return { events, loading, error };
};

export const useBookmarks = () => {
    const { userProfile, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const toggleBookmark = async (opportunityId: string) => {
        if (!userProfile) return;
        setLoading(true);
        try {
            await FirestoreService.toggleBookmark(opportunityId, userProfile.uid);
            // Ideally trigger a profile refresh here since toggleBookmark updates separate arrays (bookmarkedGigs, bookmarkedStartups)
            // updateProfile call might be tricky without knowing which one changed, so we rely on backend/realtime or manual fetch.
            // For now, simple return or maybe we can fetch profile again.
            // Optionally: await updateProfile(await FirestoreService.getUserProfile(userProfile.uid));
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        } finally {
            setLoading(false);
        }
    };

    const isBookmarked = (opportunityId: string) => {
        // Check both arrays
        return userProfile?.bookmarkedGigs?.includes(opportunityId) || userProfile?.bookmarkedStartups?.includes(opportunityId) || false;
    };

    return { toggleBookmark, isBookmarked, loading };
};

export const useOnboarding = () => {
    const saveOnboardingResponse = async (data: any) => {
        try {
            await FirestoreService.saveOnboardingResponse(data);
        } catch (error) {
            console.error("Failed to save onboarding", error);
            throw error;
        }
    };
    return { saveOnboardingResponse };
};
