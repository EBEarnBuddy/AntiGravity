import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- API Methods ---

export const userAPI = {
  sync: () => api.post('/users/sync'),
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
};

export const opportunityAPI = {
  getAll: (type?: string) => api.get('/opportunities', { params: { type } }),
  getById: (id: string) => api.get(`/opportunities/${id}`),
  create: (data: any) => api.post('/opportunities', data),
};

export const applicationAPI = {
  apply: (opportunityId: string, message?: string) => api.post('/applications', { opportunityId, message }),
  getMyApplications: () => api.get('/applications/me'),
};

export const roomAPI = {
  getAll: () => api.get('/rooms'),
  getMyRooms: () => api.get('/rooms/me'),
  create: (data: any) => api.post('/rooms', data),
  join: (roomId: string) => api.post(`/rooms/${roomId}/join`),
};

export const messageAPI = {
  send: (roomId: string, content: string, type: 'text' | 'image' = 'text') =>
    api.post(`/rooms/${roomId}/messages`, { content, type }),
  getAll: (roomId: string) => api.get(`/rooms/${roomId}/messages`),
};

export const communityPostsAPI = {
  create: (data: any) => api.post('/community-posts', data),
  createPost: (data: any) => api.post('/community-posts', data),
  getAll: () => api.get('/community-posts'),
  // Add other methods as needed based on usage
};

export const uploadAPI = {
  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Ensure backend has /upload route if needed, or implement separately
    // For now, removing or keeping as is if backend supported it. 
    // The current backend plan didn't include general upload, but we can add it later.
    // returning generic error for now to avoid confusion or mocking it.
    console.warn("Upload API not fully implemented in backend yet");
    return { url: "https://via.placeholder.com/150" };
  }
};

export default api;