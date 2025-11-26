/**
 * API Service Layer
 * Handles all HTTP requests to the backend API with authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../api.config';

// Token management
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          window.location.href = '/#/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        clearTokens();
        window.location.href = '/#/login';
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
    const response = await apiClient.post(API_ENDPOINTS.USERS.INVITE, { email, role });
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

  getMyTasks: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.MY);
    return response.data;
  },

  getCreatedByMe: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.CREATED_BY_ME);
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
};

// ==================== Comment APIs ====================

export const commentAPI = {
  getByTask: async (taskId: string) => {
    const response = await apiClient.get(`${API_BASE_URL}/api/v1/tasks/${taskId}/comments`);
    return response.data;
  },

  create: async (taskId: string, content: string) => {
    const response = await apiClient.post(`${API_BASE_URL}/api/v1/comments`, {
      task_id: taskId,
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

export default apiClient;
