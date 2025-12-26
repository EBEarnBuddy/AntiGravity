import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
console.log(`ℹ️  [API Config] Base URL: ${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add authentication interceptor
api.interceptors.request.use(
  async (config) => {
    const user = auth?.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting Firebase token:', error);
      }
    }
    console.log(`➡️ [API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code outside 2xx range
      const status = error.response.status;
      const url = error.config.url;
      const method = error.config.method?.toUpperCase();
      const data = error.response.data;

      console.error(`❌ [API FAILURE] ${status} ${method} ${url}`, data);

      if (status === 401) {
        console.warn('⚠️ [Auth] Unauthorized: Token invalid/expired. Check Firebase Auth.');
      } else if (status === 403) {
        console.warn('⚠️ [Auth] Forbidden: Insufficient permissions.');
      } else if (status === 404) {
        console.warn('⚠️ [API] Not Found: Endpoint does not exist. Check URL.');
      } else if (status >= 500) {
        console.error('🔥 [API] Server Error: Internal Backend Issue.');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('🌐 [NETWORK FAILURE] No response received. Possible causes: Backend down, CORS issue, or wrong URL.');
      console.error('Request Details:', error.config);
    } else {
      // Something happened in setting up the request
      console.error('❌ [REQUEST ERROR] Client-side error:', error.message);
    }
    return Promise.reject(error);
  }
);

// --- API Methods ---

export const userAPI = {
  sync: () => api.post('/users/sync'),
  getMe: () => api.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.put('/users/me', data),
  toggleBookmark: (opportunityId: string) => api.post('/users/bookmarks/toggle', { opportunityId }),
  getByUsername: (username: string) => api.get(`/users/${username}`),
};

export const opportunityAPI = {
  getAll: (type?: string) => api.get('/opportunities', { params: { type } }),
  getById: (id: string) => api.get(`/opportunities/${id}`),
  create: (data: Record<string, unknown>) => api.post('/opportunities', data),
  delete: (id: string) => api.delete(`/opportunities/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/opportunities/${id}/status`, { status }),
};

export const applicationAPI = {
  apply: (opportunityId: string, data: { message: string; roleId?: string }) => api.post('/applications', { opportunityId, ...data }),
  getMyApplications: () => api.get('/applications/me'),
  getForOpportunity: (opportunityId: string) => api.get(`/applications/opportunity/${opportunityId}`),
  updateStatus: (id: string, status: string) => api.patch(`/applications/${id}/status`, { status }),
};

export const roomAPI = {
  getRooms: (type?: string) => api.get(`/rooms${type ? `?type=${type}` : ''}`),
  getMyRooms: () => api.get('/rooms/me'),
  createRoom: (data: any) => api.post('/rooms', data),
  joinRoom: (roomId: string) => api.post(`/rooms/${roomId}/join`),
  getPendingRequests: (roomId: string) => api.get(`/rooms/${roomId}/pending`),
  approveMembership: (roomId: string, userId: string, status: 'accepted' | 'rejected') =>
    api.post(`/rooms/${roomId}/approve/${userId}`, { status }),
  updateRoom: (roomId: string, data: any) => api.put(`/rooms/${roomId}`, data),
  deleteRoom: (roomId: string) => api.delete(`/rooms/${roomId}`),
  leaveRoom: (roomId: string) => api.post(`/rooms/${roomId}/leave`),
  getOnlineMembers: (roomId: string) => api.get(`/rooms/${roomId}/online`),
};

export const collaborationAPI = {
  sendRequest: (fromCircleId: string, toCircleId: string, message?: string) =>
    api.post('/collaborations/request', { fromCircleId, toCircleId, message }),
  getPendingRequests: () => api.get('/collaborations/pending'),
  acceptRequest: (requestId: string) => api.post(`/collaborations/${requestId}/accept`),
  rejectRequest: (requestId: string) => api.post(`/collaborations/${requestId}/reject`),
};

export const eventAPI = {
  getAll: (limit?: number) => api.get('/events', { params: { limit } }),
  create: (data: Record<string, unknown>) => api.post('/events', data),
};

export const messageAPI = {
  send: (roomId: string, content: string, type: 'text' | 'image' | 'file' = 'text') =>
    api.post(`/rooms/${roomId}/messages`, { content, type }),
  getAll: (roomId: string) => api.get(`/rooms/${roomId}/messages`),
  markAsRead: (roomId: string) => api.post(`/rooms/${roomId}/messages/read`),
  sendTyping: (roomId: string, isTyping: boolean) =>
    api.post(`/rooms/${roomId}/typing/${isTyping ? 'start' : 'stop'}`),
};

export const communityPostsAPI = {
  create: (data: Record<string, unknown>) => api.post('/community-posts', data),
  createPost: (data: Record<string, unknown>) => api.post('/community-posts', data),
  getAll: () => api.get('/community-posts'),
  // Add other methods as needed based on usage
};


export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};

export const uploadAPI = {
  getSignature: (folder: string) => api.post('/upload/signature', { folder }),
};

export default api;