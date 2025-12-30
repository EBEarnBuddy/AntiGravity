"use client";

import { useState, useEffect, useRef } from 'react';
import { Pod, PodPost, ChatRoom as Room, Startup, Gig, Notification, ChatMessage, UserAnalytics, Application, FirestoreService } from '../lib/firestore'; // Keep types for now
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';


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
  }, [currentUser]);

  const createRoom = async (roomData: any) => {
    if (!currentUser) return;
    try {
      await api.post('/rooms', roomData);
      // Refresh
      const myRes = await api.get('/rooms/me');
      setMyRooms(myRes.data.map((r: any) => ({ ...r, id: r._id })));
      const pubRes = await api.get('/rooms');
      setRooms(pubRes.data.map((r: any) => ({ ...r, id: r._id })));
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
      throw err;
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!currentUser) return;
    try {
      await api.post(`/rooms/${roomId}/join`);
      const myRes = await api.get('/rooms/me');
      setMyRooms(myRes.data.map((r: any) => ({ ...r, id: r._id })));
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    }
  };

  const requestJoin = async (roomId: string) => {
    if (!currentUser) return;
    try {
      await FirestoreService.requestJoinRoom(roomId, currentUser.uid);
    } catch (err: any) {
      setError(err.message || 'Failed to request join');
    }
  };

  const getPendingRequests = async (roomId: string) => {
    return await FirestoreService.getPendingMemberProfiles(roomId);
  };

  const approveMembership = async (roomId: string, userId: string, status: 'accepted' | 'rejected') => {
    await FirestoreService.approveMembership(roomId, userId, status);
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
  useEffect(() => {
    if (!roomId || !currentUser) return;

    // 1. Fetch Online Users (Stubbed)
    FirestoreService.getOnlineMembers(roomId).then(setOnlineUsers).catch(console.error);

    // 2. Subscribe to messages
    setLoading(true);
    const unsubscribe = FirestoreService.subscribeToRoomMessages(roomId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
      // Check hasMore usually requires knowing total count or getting older messages. 
      // Snapshot gives latest 100. Pagination with snapshot is tricky. 
      // For now we assume if we have 100 messages, there might be more.
      setHasMore(msgs.length >= 100);
    });

    return () => unsubscribe();
  }, [roomId, currentUser]);

  const loadMore = async () => {
    // Pagination with Firestore and snapshot needs complexity (startAfter).
    // For now, we stub loadMore or just don't load older than 100.
    // Or we can fetch using getRoomMessages with offset/cursor if needed.
    console.warn('Load more not fully implemented in Firestore refactor yet');
    setIsLoadingMore(false);
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

  // Initial fetch
  const fetchStartups = async () => {
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
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const createStartup = async (startupData: any) => {
    if (!currentUser) return;
    try {
      // Ensure type is set to startup
      const payload = { ...startupData, type: 'startup' };
      await api.post('/opportunities', payload);
      await fetchStartups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create startup');
      throw err;
    }
  };

  const updateStartup = async (id: string, startupData: any) => {
    if (!currentUser) return;
    try {
      await api.put(`/opportunities/${id}`, startupData);
      await fetchStartups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update startup');
      throw err;
    }
  };

  const applyToStartup = async (startupId: string, roleId: string, userId: string, applicationData: any) => {
    try {
      await FirestoreService.applyToStartup(startupId, roleId, userId, applicationData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to apply to startup');
    }
  };

  const getApplicants = async (startupId: string): Promise<any[]> => {
    // This requires fetching from roles.applicants in the startup doc
    // Currently FirestoreService doesn't have a direct "getApplicants" that returns array
    // It's embedded in the Startup object. 
    // Implementation logic: fetch startup, aggregate applicants.
    const startup = await FirestoreService.getOpportunityById(startupId);
    if (startup && (startup as Startup).roles) {
      return (startup as Startup).roles.flatMap(r => r.applicants.map(app => ({
        ...app,
        _id: app.userId,
        id: app.userId,
        applicantId: app.userId,
        applicant: {
          displayName: app.userName,
          photoURL: app.userAvatar,
          _id: app.userId
        },
        opportunityId: startupId,
        message: app.coverLetter || '',
        createdAt: app.appliedAt ? (app.appliedAt as any).toDate?.()?.toISOString() || new Date().toISOString() : new Date().toISOString()
      })));
    }
    return [];
  };

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    // This requires finding which role/startup the application belongs to.
    // Might need more arguments (startupId, roleId).
    // Or refactor usage to pass them.
    console.error("updateApplicationStatus requires startupId and roleId in Firestore implementation");
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
    await fetchStartups();
  };

  const updateStartupStatus = async (startupId: string, status: string) => {
    try {
      await FirestoreService.updateStartupStatus(startupId, status);
      await fetchStartups();
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
    updateStartupStatus
  };
};

export const useMyApplications = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        // const apps = await FirestoreService.getUserApplications(currentUser.uid);
        const response = await api.get('/applications/me');
        const apps = response.data.map((app: any) => ({
          ...app,
          id: app._id,
          // Map backend status to frontend expectations if needed, usually matches
          // Backend populated opportunity is just an ID or object?
          // Route says: .populate('opportunity')
        }));
        setApplications(apps);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [currentUser]);

  return { applications, loading, error };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
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
    };

    fetchProjects();
  }, []);

  const createProject = async (projectData: any) => {
    if (!currentUser) return;
    try {
      await FirestoreService.createProject({ ...projectData, type: 'project' }, currentUser.uid);
      const data = await FirestoreService.getProjects();
      setProjects(data);
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

  return { projects, loading, error, createProject, applyToRole, bookmarkProject, unbookmarkProject };
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
    return () => clearInterval(interval);
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
