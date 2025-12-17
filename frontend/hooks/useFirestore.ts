import { useState, useEffect } from 'react';
import { Pod, PodPost, ChatRoom as Room, Startup, Gig, Notification, ChatMessage, UserAnalytics } from '../lib/firestore'; // Keep types for now
import { useAuth } from '../contexts/AuthContext';
import { roomAPI, opportunityAPI, messageAPI, applicationAPI, userAPI, eventAPI } from '../lib/axios';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getAll();
        const data = response.data.map((room: any) => ({
          ...room,
          id: room._id || room.id // Ensure id exists
        }));
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [currentUser]);

  const createRoom = async (roomData: any) => {
    try {
      await roomAPI.create(roomData);
      // Refresh
      const response = await roomAPI.getAll();
      const data = response.data.map((room: any) => ({
        ...room,
        id: room._id || room.id
      }));
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await roomAPI.join(roomId);
      // Refresh
      const response = await roomAPI.getAll();
      const data = response.data.map((room: any) => ({
        ...room,
        id: room._id || room.id
      }));
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  };

  const requestJoin = joinRoom; // Map to same for now

  return { rooms, loading, error, createRoom, joinRoom, requestJoin };
};

export const useRoomMessages = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Need to ensure user is logged in for socket

  useEffect(() => {
    if (!roomId) return;

    // 1. Fetch historical messages via HTTP
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await messageAPI.getAll(roomId);
        setMessages(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 2. Setup Real-time Socket Connection
    let socketInstance: any = null;

    const setupSocket = async () => {
      try {
        // Dynamic import to avoid SSR issues if any, though "use client" handles it.
        // Using the lib helper we created
        const { getSocket } = await import('../lib/socket');
        const socket = await getSocket();

        if (socket) {
          socketInstance = socket;

          // Join Room
          socket.emit('join_room', roomId);

          // Listen for messages
          socket.on('new_message', (newMessage: ChatMessage) => {
            setMessages((prev) => {
              // Prevent duplicates if backend emits for sender too, but sender usually optimistic updates.
              // Assuming backend sends a proper ID.
              if (prev.find(m => m.id === newMessage.id || (m as any)._id === (newMessage as any)._id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          });

          // Listen for errors (e.g. not a member)
          socket.on('error', (err: any) => {
            console.error('Socket Error:', err);
            if (err === 'Not a member of this room') {
              setError('You are not authorized to view this chat.');
            }
          });
        }
      } catch (err) {
        console.error('Failed to setup socket:', err);
      }
    };

    if (currentUser) {
      setupSocket();
    }

    // Cleanup
    return () => {
      if (socketInstance) {
        socketInstance.emit('leave_room', roomId);
        socketInstance.off('new_message');
        socketInstance.off('error');
      }
    };

  }, [roomId, currentUser]);

  const sendMessage = async (content: string, senderId: string, type: 'text' | 'image' = 'text') => {
    try {
      // Send via HTTP (Reliable storage)
      const response = await messageAPI.send(roomId, content, type);
      const savedMessage = response.data;

      // Optimistic update is tricky with ID mismatch, but since we refetch history or get socket event, 
      // we can rely on socket event for the "official" append, 
      // OR append optimistically and let the socket event dedupe.
      // Backend controller emits 'new_message', so our listener above will catch it.
      // We rely on the socket listener to display it to self as well for consistency, 
      // OR we can deduplicate.

      // For now, let's rely on the socket event coming back from the server (latency is low). 
      // But for better UX, we might want to append immediately.
      // If we append immediately, we need a temp ID.

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err; // Re-throw so UI can handle error state (e.g. clear input or not)
    }
  };

  return { messages, loading, error, sendMessage };
};

export const useRoomChatMessages = useRoomMessages;

export const useStartups = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const response = await opportunityAPI.getAll('startup');
        const data = response.data.map((item: any) => ({ ...item, id: item._id }));
        setStartups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch startups');
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const createStartup = async (startupData: any) => {
    try {
      await opportunityAPI.create({ ...startupData, type: 'startup' });
      const response = await opportunityAPI.getAll('startup');
      const data = response.data.map((item: any) => ({ ...item, id: item._id }));
      setStartups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create startup');
    }
  };

  const applyToStartup = async (startupId: string, roleId: string, userId: string, applicationData: any) => {
    try {
      await applicationAPI.apply(startupId, { message: JSON.stringify(applicationData), roleId });
      // Refresh?
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply to startup');
    }
  };

  const bookmarkStartup = async (startupId: string, userId: string) => { }; // TODO
  const unbookmarkStartup = async (startupId: string, userId: string) => { }; // TODO

  return { startups, loading, error, createStartup, applyToStartup, bookmarkStartup, unbookmarkStartup };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Assuming 'freelance' or 'project' type. Let's use 'project' as per model comment for Colancing
        const response = await opportunityAPI.getAll('freelance');
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
    try {
      await opportunityAPI.create({ ...projectData, type: 'project' });
      const response = await opportunityAPI.getAll('project');
      const data = response.data.map((item: any) => ({ ...item, id: item._id }));
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const applyToRole = async (projectId: string, roleId: string, userId: string, applicationData: any) => {
    try {
      await applicationAPI.apply(projectId, { message: JSON.stringify(applicationData), roleId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply to role');
    }
  };

  const bookmarkProject = async (projectId: string, userId: string) => { };
  const unbookmarkProject = async (projectId: string, userId: string) => { };

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
  return { notifications: [], loading: false, error: null, markAsRead: async () => { }, unreadCount: 0 };
};

export const useEvents = (limit?: number) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getAll(limit);
        const data = response.data.map((item: any) => ({ ...item, id: item._id }));
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
      const currentBookmarks = userProfile.bookmarks || [];
      const isBookmarked = currentBookmarks.includes(opportunityId);

      let newBookmarks: string[];
      if (isBookmarked) {
        newBookmarks = currentBookmarks.filter(id => id !== opportunityId);
      } else {
        newBookmarks = [...currentBookmarks, opportunityId];
      }

      await updateProfile({ bookmarks: newBookmarks });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (opportunityId: string) => {
    return userProfile?.bookmarks?.includes(opportunityId) || false;
  };

  return { toggleBookmark, isBookmarked, loading };
};

export const useOnboarding = () => {
  const saveOnboardingResponse = async (data: any) => {
    try {
      await userAPI.updateMe({ ...data, onboardingCompleted: true });
    } catch (error) {
      console.error("Failed to save onboarding", error);
      throw error;
    }
  };
  return { saveOnboardingResponse };
};
