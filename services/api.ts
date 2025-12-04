/**
 * API Service Layer
 * Handles all HTTP requests to the backend API with authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../api.config';

// Token management - Using sessionStorage for per-window sessions
// This allows different users to be logged in on different browser windows/tabs
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
};

// User data persistence for session recovery
export const setUserData = (userData: any): void => {
  sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

export const getUserData = (): any | null => {
  const data = sessionStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserData = (): void => {
  sessionStorage.removeItem(USER_DATA_KEY);
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Allow cookies/credentials in CORS requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Don't intercept login/register requests - let them fail naturally
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                           originalRequest?.url?.includes('/auth/register');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          setTokens(access_token, refresh_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to appropriate login
          clearTokens();
          // Check if user was on user portal, redirect accordingly
          const isUserPortal = window.location.hash.includes('/user');
          window.location.href = isUserPortal ? '/#/user/login' : '/#/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to appropriate login
        clearTokens();
        const isUserPortal = window.location.hash.includes('/user');
        window.location.href = isUserPortal ? '/#/user/login' : '/#/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== Authentication APIs ====================

export const authAPI = {
  register: async (data: { name: string; email: string; password: string; company_name: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  logout: () => {
    clearTokens();
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  },
};

// ==================== User APIs ====================

export const userAPI = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.BASE);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
    return response.data;
  },

  invite: async (email: string, role?: string) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.INVITE, { email, role: role || 'Member' });
    return response.data;
  },

  search: async (query: string) => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.SEARCH, {
      params: { q: query },
    });
    return response.data;
  },

  updateRole: async (id: string, role: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.ROLE(id), { role });
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.USERS.STATUS(id), { status });
    return response.data;
  },
};

// ==================== Profile APIs (Self-service) ====================

export const profileAPI = {
  getMyProfile: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/profile/me`);
    return response.data;
  },

  updateMyProfile: async (data: { name?: string; email?: string; avatar_url?: string }) => {
    const response = await apiClient.put(`${API_BASE_URL}/api/v1/profile/me`, data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`${API_BASE_URL}/api/v1/profile/me/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAvatar: async () => {
    const response = await apiClient.delete(`${API_BASE_URL}/api/v1/profile/me/avatar`);
    return response.data;
  },
};

// ==================== Project APIs ====================

export const projectAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.BASE, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.BY_ID(id));
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.PROJECTS.BASE, data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.PROJECTS.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.PROJECTS.BY_ID(id));
    return response.data;
  },

  getTasks: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.TASKS(id));
    return response.data;
  },

  getOwners: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.OWNERS);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.PROJECTS.STATUS(id), { status });
    return response.data;
  },
};

// ==================== Task APIs ====================

export const taskAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.BASE, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.BY_ID(id));
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.BASE, data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.TASKS.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.TASKS.BY_ID(id));
    return response.data;
  },

  getMyTasks: async (allCompanies: boolean = true) => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.MY, {
      params: { all_companies: allCompanies }
    });
    return response.data;
  },

  getCreatedByMe: async (allCompanies: boolean = true) => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.CREATED_BY_ME, {
      params: { all_companies: allCompanies }
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.STATS);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.TASKS.STATUS(id), { status });
    return response.data;
  },

  updateAssignee: async (id: string, assignee_id: string) => {
    const response = await apiClient.patch(API_ENDPOINTS.TASKS.ASSIGNEE(id), { assignee_id });
    return response.data;
  },

  getHistory: async (taskId: string, skip: number = 0, limit: number = 50) => {
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/tasks/${taskId}/history`, {
      params: { skip, limit }
    });
    return response.data;
  },
};

// ==================== Comment APIs ====================

export const commentAPI = {
  getByTask: async (taskId: string) => {
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/tasks/${taskId}/comments`);
    return response.data;
  },

  create: async (taskId: string, content: string) => {
    const response = await apiClient.post(`${API_BASE_URL}/api/v1/tasks/${taskId}/comments`, {
      content,
    });
    return response.data;
  },

  update: async (id: string, content: string) => {
    const response = await apiClient.put(`${API_BASE_URL}/api/v1/comments/${id}`, { content });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${API_BASE_URL}/api/v1/comments/${id}`);
    return response.data;
  },
};

// ==================== Dashboard APIs ====================

export const dashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/dashboard/stats`);
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/dashboard/recent-activity`);
    return response.data;
  },
};

// ==================== Invitation APIs ====================

export const invitationAPI = {
  getSent: async () => {
    const response = await apiClient.get(API_ENDPOINTS.INVITATIONS.SENT);
    return response.data;
  },

  getReceived: async () => {
    const response = await apiClient.get(API_ENDPOINTS.INVITATIONS.RECEIVED);
    return response.data;
  },

  respond: async (id: string, action: 'accept' | 'decline') => {
    const response = await apiClient.post(API_ENDPOINTS.INVITATIONS.RESPOND(id), { action });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.INVITATIONS.DELETE(id));
    return response.data;
  },
};

// ==================== Chatbot APIs ====================

// Chatbot API Base URL (separate service on port 8081)
const CHATBOT_BASE_URL = 'https://nexus-chatbot-backend.onrender.com';

// In-memory cache + in-flight promise to dedupe history requests in the SPA runtime
let _chatbotHistoryCache: any = null;
let _chatbotHistoryPromise: Promise<any> | null = null;

export const chatbotAPI = {
  /**
   * Send a message to the AI Task Assistant
   */
  sendMessage: async (message: string) => {
    const response = await apiClient.post(`${CHATBOT_BASE_URL}/chat`, { message });
    return response.data;
  },

  /**
   * Reset the chat history
   */
  resetChat: async () => {
    const response = await apiClient.post(`${CHATBOT_BASE_URL}/reset_chat`);
    // Clear local cache so subsequent calls fetch fresh state
    _chatbotHistoryCache = null;
    _chatbotHistoryPromise = null;
    return response.data;
  },

  /**
   * Get chat history for the current user
   */
  /**
   * Get chat history with simple in-memory caching + in-flight dedupe.
   * Call without args to return cached result when available. Pass { force: true }
   * to bypass the cache.
   */
  getHistory: async (opts?: { force?: boolean } ) => {
    const force = opts?.force === true;
    if (!force && _chatbotHistoryCache) {
      return _chatbotHistoryCache;
    }

    if (!force && _chatbotHistoryPromise) {
      return _chatbotHistoryPromise;
    }

    _chatbotHistoryPromise = apiClient.get(`${CHATBOT_BASE_URL}/chat/history`)
      .then((res) => {
        _chatbotHistoryCache = res.data;
        _chatbotHistoryPromise = null;
        return _chatbotHistoryCache;
      })
      .catch((err) => {
        _chatbotHistoryPromise = null;
        throw err;
      });

    return _chatbotHistoryPromise;
  },

  /**
   * Notify chatbot about data changes in the dashboard
   */
  notifyChanges: async (changes: string[]) => {
    const response = await apiClient.post(`${CHATBOT_BASE_URL}/chat/notify_changes`, { changes });
    return response.data;
  },

  /**
   * Health check for chatbot service
   */
  healthCheck: async () => {
    const response = await apiClient.get(`${CHATBOT_BASE_URL}/health`);
    return response.data;
  },

  /**
   * Get current user info from chatbot service
   */
  getMe: async () => {
    const response = await apiClient.get(`${CHATBOT_BASE_URL}/me`);
    return response.data;
  },
};

export default apiClient;
