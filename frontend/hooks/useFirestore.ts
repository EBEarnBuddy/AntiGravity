import { useState, useEffect } from 'react';
import { Pod, PodPost, ChatRoom as Room, Startup, Gig, Notification, ChatMessage, UserAnalytics } from '../lib/firestore'; // Keep types for now
import { useAuth } from '../contexts/AuthContext';
import { roomAPI, opportunityAPI, messageAPI, applicationAPI, userAPI } from '../lib/axios';

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
        setRooms(response.data);
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
      setRooms(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await roomAPI.join(roomId);
      // Refresh
      const response = await roomAPI.getAll();
      setRooms(response.data);
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

  useEffect(() => {
    if (!roomId) return;

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
    // Polling setup could go here if no sockets
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);

  }, [roomId]);

  const sendMessage = async (content: string, senderId: string, type: 'text' | 'image' = 'text') => {
    try {
      await messageAPI.send(roomId, content, type);
      // Refresh
      const response = await messageAPI.getAll(roomId);
      setMessages(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
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
        setStartups(response.data);
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
      setStartups(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create startup');
    }
  };

  const applyToStartup = async (startupId: string, roleId: string, userId: string, applicationData: any) => {
    try {
      await applicationAPI.apply(startupId, JSON.stringify(applicationData));
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
        const response = await opportunityAPI.getAll('project');
        setProjects(response.data);
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
      setProjects(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const applyToRole = async (projectId: string, roleId: string, userId: string, applicationData: any) => {
    try {
      await applicationAPI.apply(projectId, JSON.stringify(applicationData));
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
