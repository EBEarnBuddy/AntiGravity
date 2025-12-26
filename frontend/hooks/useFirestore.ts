"use client";

import { useState, useEffect } from 'react';
import { Pod, PodPost, ChatRoom as Room, Startup, Gig, Notification, ChatMessage, UserAnalytics, Application } from '../lib/firestore'; // Keep types for now
import { useAuth } from '../contexts/AuthContext';
import { roomAPI, opportunityAPI, messageAPI, applicationAPI, userAPI, eventAPI, notificationAPI } from '../lib/axios';

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
        const [allResponse, myResponse] = await Promise.all([
          roomAPI.getRooms(), // Get community circles by default
          currentUser ? roomAPI.getMyRooms() : Promise.resolve({ data: [] })
        ]);

        const allData = allResponse.data.map((room: any) => ({
          ...room,
          id: room._id || room.id
        }));

        const myData = myResponse.data.map((room: any) => ({
          ...room,
          id: room._id || room.id
        }));

        setRooms(allData);
        setMyRooms(myData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Realtime Listener for Auto-Reload
    let socketInstance: any = null;
    const setupSocket = async () => {
      try {
        const { getSocket } = await import('../lib/socket');
        const socket = await getSocket();
        if (socket) {
          socketInstance = socket;

          const handleReload = () => {
            fetchRooms();
          };

          socket.on('room_created', handleReload);
          socket.on('membership_updated', handleReload);
          socket.on('membership_created', handleReload); // Pending requests or new joins
        }
      } catch (e) {
        console.error('Socket setup failed in useRooms', e);
      }
    };
    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('room_created');
        socketInstance.off('membership_updated');
        socketInstance.off('membership_created');
      }
    };
  }, [currentUser]);

  const createRoom = async (roomData: any) => {
    try {
      await roomAPI.createRoom(roomData);
      // Refresh both
      const [allResponse, myResponse] = await Promise.all([
        roomAPI.getRooms(),
        roomAPI.getMyRooms()
      ]);
      setRooms(allResponse.data.map((r: any) => ({ ...r, id: r._id || r.id })));
      setMyRooms(myResponse.data.map((r: any) => ({ ...r, id: r._id || r.id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await roomAPI.joinRoom(roomId);
      // Refresh both
      const [allResponse, myResponse] = await Promise.all([
        roomAPI.getRooms(),
        roomAPI.getMyRooms()
      ]);
      setRooms(allResponse.data.map((r: any) => ({ ...r, id: r._id || r.id })));
      setMyRooms(myResponse.data.map((r: any) => ({ ...r, id: r._id || r.id })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  };

  const requestJoin = joinRoom; // Map to same for now

  const getPendingRequests = async (roomId: string) => {
    try {
      const response = await roomAPI.getPendingRequests(roomId);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
      return [];
    }
  };

  const approveMembership = async (roomId: string, userId: string, status: 'accepted' | 'rejected') => {
    try {
      await roomAPI.approveMembership(roomId, userId, status);
      // Refresh rooms to update counts and membership status
      const [allResponse, myResponse] = await Promise.all([
        roomAPI.getRooms(), // Get community circles by default
        roomAPI.getMyRooms()
      ]);
      setRooms(allResponse.data);
      setMyRooms(myResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve membership');
      throw err;
    }
  };

  return { rooms, myRooms, loading, error, createRoom, joinRoom, requestJoin, getPendingRequests, approveMembership };
};

export const useRoomMessages = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, userProfile, updateProfile } = useAuth(); // Need user for socket logic

  // Realtime State
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!roomId) return;

    // 1. Fetch historical messages & Online Users (REST Hybrid)
    const fetchData = async () => {
      try {
        setLoading(true);
        const [msgsRes, onlineRes] = await Promise.all([
          messageAPI.getAll(roomId),
          // Safely fail on online fetch if backend not ready, but ideally it works
          roomAPI.getOnlineMembers(roomId).catch(() => ({ data: [] }))
        ]);

        setMessages(msgsRes.data);
        setOnlineUsers(onlineRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 2. Setup Real-time
    let socketInstance: any = null;

    const setupSocket = async () => {
      if (!currentUser) return;

      try {
        const { getSocket } = await import('../lib/socket');
        const socket = await getSocket();

        if (socket) {
          socketInstance = socket;

          // -- Listeners first --

          // New Message
          socket.on('new_message', (newMessage: ChatMessage) => {
            // ... handler logic
            console.log('Received new message:', newMessage);
            if ((newMessage as any).room !== roomId) return; // Basic safety check

            if (document.visibilityState === 'visible') {
              socket.emit('message:read', { roomId, userId: currentUser.uid });
            }

            setMessages((prev) => {
              // ... dedupe logic
              if (prev.find(m => m.id === newMessage.id || (m as any)._id === (newMessage as any)._id)) {
                return prev;
              }

              // If we have a pending message that matches, replace it
              /* 
                 Simplified Match: 
                 If we have a pending message from 'Me' created recently, AND this incoming message is from 'Me'
                 We assume it's the confirmation.
                 Ideally, we'd use a UUID generated on client, but for now we rely on the backend response to 'sendMessage' 
                 to update the specific pending message ID. 
                 However for incoming socket events that might arrive BEFORE the REST response?
              */

              return [...prev, newMessage];
            });
          });

          // Join Room (Once listeners are ready)
          console.log(`Joining Room: ${roomId}`);
          socket.emit('join_room', roomId);
          socket.emit('message:read', { roomId, userId: currentUser.uid });

  // Online Presence
  socket.on('room_users', (users: any[]) => {
    // Merge with REST fetched data if needed, or trust socket as live source
    setOnlineUsers(users);
  });

  socket.on('member:online', (user: any) => {
    setOnlineUsers(prev => {
      if (prev.find(u => u.userId === user.userId)) return prev;
      return [...prev, user];
    });
  });

  socket.on('member:offline', (data: { userId: string }) => {
    setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
  });

  // Typing
  socket.on('typing', (data: any) => {
    setTypingUsers(prev => {
      if (prev.find(u => u.userId === data.userId)) return prev;
      return [...prev, data];
    });
  });

  socket.on('stop_typing', (data: any) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
  });

  // Read Receipts
  socket.on('messages_read', (data: { roomId: string, userId: string, readAt: string }) => {
    setMessages(prev => prev.map(msg => {
      const alreadyRead = msg.readBy?.some((r: any) => (r.user?._id || r.user) === data.userId);
      if (!alreadyRead) {
        return {
          ...msg,
          readBy: [...(msg.readBy || []), { user: data.userId, readAt: data.readAt }]
        };
      }
      return msg;
    }));
  });

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

setupSocket();

return () => {
  if (socketInstance) {
    socketInstance.emit('leave_room', roomId);
    socketInstance.off('new_message');
    socketInstance.off('room_users');
    socketInstance.off('member:online');
    socketInstance.off('member:offline');
    socketInstance.off('typing');
    socketInstance.off('stop_typing');
    socketInstance.off('messages_read');
    socketInstance.off('error');
  }
};
  }, [roomId, currentUser]);

const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
  if (!roomId || !currentUser) return;

  // OPTIMISTIC UPDATE
  const tempId = `temp-${Date.now()}`;
  const optimisticMessage: any = {
    id: tempId,
    _id: tempId,
    content,
    type,
    sender: {
      _id: 'me', // placeholder
      firebaseUid: currentUser.uid,
      displayName: userProfile?.displayName || 'Me',
      photoURL: currentUser.photoURL,
    },
    room: roomId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readBy: [],
    pending: true // Flag for UI
  };

  setMessages(prev => [...prev, optimisticMessage]);

  try {
    const { getSocket } = await import('../lib/socket');
    const socket = await getSocket();

    // Stop typing immediately (Hybrid: Socket + REST? Requirement says Switch typing to REST)
    // We will call the REST endpoint for certainty, but for sendMessage, we just want to clear it.
    // Calling stopTyping() helper is safer.
    sendTyping(false);

    // Send via REST (Authoritative)
    const response = await messageAPI.send(roomId, content, type);
    const confirmedMessage = response.data;

    // RECONCILIATION
    setMessages(prev => prev.map(m => m.id === tempId ? confirmedMessage : m));

    return confirmedMessage;
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to send message');
    // Rollback optimistic update on failure
    setMessages(prev => prev.filter(m => m.id !== tempId));
    throw err;
  }
};

const sendTyping = async (isTyping: boolean) => {
  if (!roomId || !currentUser) return;
  try {
    await messageAPI.sendTyping(roomId, isTyping);
  } catch (e) { console.error('Failed to update typing status', e); }
};

return { messages, loading, error, sendMessage, onlineUsers, typingUsers, sendTyping };
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

    // Realtime Listener
    let socketInstance: any = null;
    const setupSocket = async () => {
      try {
        const { getSocket } = await import('../lib/socket');
        const socket = await getSocket();
        if (socket) {
          socketInstance = socket;

          // Re-fetch on any opportunity creation or status change
          const handleReload = (data?: any) => {
            // Optional: Filter by type if available in data to avoid unnecessary refetches
            if (data && data.type && data.type !== 'startup') return;
            fetchStartups();
          };

          socket.on('opportunity_created', handleReload);
          // Assuming we might add 'opportunity_updated' later
        }
      } catch (e) {
        console.error('Socket setup failed in useStartups', e);
      }
    };
    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('opportunity_created');
      }
    };
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

  const getApplicants = async (startupId: string) => {
    try {
      const response = await applicationAPI.getForOpportunity(startupId);
      return response.data;
    } catch (err) {
      console.error('Failed to get applicants:', err);
      throw err;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await applicationAPI.updateStatus(applicationId, status);
    } catch (err) {
      console.error('Failed to update status:', err);
      throw err;
    }
  };

  const bookmarkStartup = async (startupId: string, userId: string) => { }; // TODO
  const unbookmarkStartup = async (startupId: string, userId: string) => { }; // TODO

  const deleteStartup = async (startupId: string) => {
    try {
      await opportunityAPI.delete(startupId);
      // Refresh
      const response = await opportunityAPI.getAll('startup');
      const data = response.data.map((item: any) => ({ ...item, id: item._id }));
      setStartups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete startup');
    }
  };

  const updateStartupStatus = async (startupId: string, status: string) => {
    // Assuming backend endpoint exists for this or generic update
    // We didn't explicitly check generic update, but we have opportunityAPI.update?
    // Let's assume we need to add it or use a generic update if available.
    // Checking opportunityAPI in axios.ts might be needed, but I'll write the logic assuming it exists or I'll add it.
    // For now, let's look at axios.ts later to confirm.
    try {
      // Using a generic update if available, or just error out if not found? 
      // I'll assume opportunityAPI.update exists.
      // actually, let's verify axios.ts first or just stub it.
      // I recall deleteRoom/updateRoom, but opportunity?
      // Let's stub it for now and I will verify axios next.
    } catch (e) { }
  };

  return { startups, loading, error, createStartup, applyToStartup, bookmarkStartup, unbookmarkStartup, getApplicants, updateApplicationStatus, deleteStartup, updateStartupStatus };
};

export const useMyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await applicationAPI.getMyApplications();
        setApplications(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();

    // Realtime Listener
    let socketInstance: any = null;
    const setupSocket = async () => {
      try {
        const { getSocket } = await import('../lib/socket');
        const socket = await getSocket();
        if (socket) {
          socketInstance = socket;

          const handleReload = () => {
            fetchApplications();
          };

          // Re-fetch when application status changes or (less likely) a new one is created by user elsewhere
          socket.on('application_status_updated', handleReload);
          socket.on('application_created', handleReload);
        }
      } catch (e) {
        console.error('Socket setup failed in useMyApplications', e);
      }
    };
    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('application_status_updated');
        socketInstance.off('application_created');
      }
    };
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

    // Realtime Listener
    let socketInstance: any = null;
    const setupSocket = async () => {
      try {
        const { getSocket } = await import('../lib/socket');
        const socket = await getSocket();
        if (socket) {
          socketInstance = socket;

          const handleReload = (data?: any) => {
            if (data && data.type && data.type !== 'project' && data.type !== 'freelance') return;
            fetchProjects();
          };

          socket.on('opportunity_created', handleReload);
        }
      } catch (e) {
        console.error('Socket setup failed in useProjects', e);
      }
    };
    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('opportunity_created');
      }
    };
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const { notificationAPI } = await import('../lib/axios'); // Lazy import to avoid circ dep if any
      const response = await notificationAPI.getMyNotifications();
      setNotifications(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    let socketInstance: any = null;
    const setupSocket = async () => {
      try {
        const { getSocket } = await import('../lib/socket');
        const socket = await getSocket();
        if (socket) {
          socketInstance = socket;
          // Support both events for transition
          const handleNotification = (notif: Notification) => {
            fetchNotifications(); // Reload list to get latest state
          };
          socket.on('notification', handleNotification);
          socket.on('notification:new', handleNotification);
        }
      } catch (e) {
        console.error(e);
      }
    };
    setupSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('notification');
        socketInstance.off('notification:new');
      }
    };
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    try {
      const { notificationAPI } = await import('../lib/axios');
      await notificationAPI.markAsRead(id);
      // Refetch
      fetchNotifications();
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
      await userAPI.toggleBookmark(opportunityId);
      // Optimistically update or refetch
      const currentBookmarks = userProfile.bookmarks || [];
      const isBookmarked = currentBookmarks.includes(opportunityId);
      let newBookmarks;
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
