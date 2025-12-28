"use client";

import { useState, useEffect, useRef } from 'react';
import { Pod, PodPost, ChatRoom as Room, Startup, Gig, Notification, ChatMessage, UserAnalytics, Application, FirestoreService, OnboardingData } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';


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
        const [publicRooms, userRooms] = await Promise.all([
          FirestoreService.getPublicRooms(),
          currentUser ? FirestoreService.getRooms(currentUser.uid) : Promise.resolve([])
        ]);
        setRooms(publicRooms);
        setMyRooms(userRooms);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
    // Realtime listeners removed for now, or could use onSnapshot if implemented in FirestoreService for rooms list
  }, [currentUser]);

  const createRoom = async (roomData: any) => {
    try {
      await FirestoreService.createRoom(roomData);
      // Optimistic or refetch
      if (currentUser) {
        const userRooms = await FirestoreService.getRooms(currentUser.uid);
        setMyRooms(userRooms);
        const publicRooms = await FirestoreService.getPublicRooms();
        setRooms(publicRooms);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!currentUser) return;
    try {
      await FirestoreService.joinRoom(roomId, currentUser.uid);
      // Refetch
      const userRooms = await FirestoreService.getRooms(currentUser.uid);
      setMyRooms(userRooms);
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

  // Initial fetch
  const fetchStartups = async () => {
    try {
      setLoading(true);
      const data = await FirestoreService.getStartups();
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
    try {
      await FirestoreService.createStartup({ ...startupData, type: 'startup' });
      await fetchStartups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create startup');
      throw err;
    }
  };

  const updateStartup = async (id: string, startupData: any) => {
    // TODO: Add updateStartup to FirestoreService if not exists, or implement logic
    // Assume it exists or stub for now as we don't have explicit updateStartup in snippet yet
    // Using generic update logic if possible or omit if not critical
    console.warn("updateStartup not fully implemented in FirestoreService yet");
    // Reload
    await fetchStartups();
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
        const apps = await FirestoreService.getUserApplications(currentUser.uid);
        setApplications(apps);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return { applications, loading, error };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await FirestoreService.getProjects();
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
    try {
      await FirestoreService.createProject({ ...projectData, type: 'project' });
      const data = await FirestoreService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
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
export const useEnhancedPodPosts = (_podId: string) => {
  return { posts: [], loading: false, error: null, createPost: async () => { } };
};

// ... (existing exports)

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = FirestoreService.subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    try {
      await FirestoreService.markNotificationRead(id);
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
  const { userProfile } = useAuth();
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
  const saveOnboardingResponse = async (data: OnboardingData) => {
    try {
      await FirestoreService.saveOnboardingResponse(data);
    } catch (error) {
      console.error("Failed to save onboarding", error);
      throw error;
    }
  };
  return { saveOnboardingResponse };
};
