/**
 * API Configuration
 * Base URL for all backend API calls
 */

// Backend API Base URL
export const API_BASE_URL = 'http://localhost:8001';

// WebSocket URL (replace http with ws)
export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
    ME: `${API_BASE_URL}/api/v1/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/v1/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/v1/auth/reset-password`,
  },
  
  // Users
  USERS: {
    BASE: `${API_BASE_URL}/api/v1/users/`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/users/${id}`,
    INVITE: `${API_BASE_URL}/api/v1/users/invite`,
    SEARCH: `${API_BASE_URL}/api/v1/users/search`,
    ROLE: (id: string) => `${API_BASE_URL}/api/v1/users/${id}/role`,
    STATUS: (id: string) => `${API_BASE_URL}/api/v1/users/${id}/status`,
  },
  
  // Projects
  PROJECTS: {
    BASE: `${API_BASE_URL}/api/v1/projects/`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/projects/${id}`,
    TASKS: (id: string) => `${API_BASE_URL}/api/v1/projects/${id}/tasks`,
    OWNERS: `${API_BASE_URL}/api/v1/projects/owners`,
    STATUS: (id: string) => `${API_BASE_URL}/api/v1/projects/${id}/status`,
  },
  
  // Tasks
  TASKS: {
    BASE: `${API_BASE_URL}/api/v1/tasks/`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}`,
    MY: `${API_BASE_URL}/api/v1/tasks/my`,
    CREATED_BY_ME: `${API_BASE_URL}/api/v1/tasks/created-by-me`,
    STATS: `${API_BASE_URL}/api/v1/tasks/stats`,
    STATUS: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}/status`,
    ASSIGNEE: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}/assignee`,
  },
  
  // Comments
  COMMENTS: {
    BY_TASK: (taskId: string) => `${API_BASE_URL}/api/v1/tasks/${taskId}/comments`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/v1/comments/${id}`,
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: `${API_BASE_URL}/api/v1/dashboard/stats`,
    RECENT_PROJECTS: `${API_BASE_URL}/api/v1/dashboard/recent-projects`,
    MY_TASKS: `${API_BASE_URL}/api/v1/dashboard/my-tasks`,
  },
  
  // Settings
  SETTINGS: {
    BASE: `${API_BASE_URL}/api/v1/settings/`,
    PASSWORD: `${API_BASE_URL}/api/v1/settings/password`,
  },
  
  // Invitations
  INVITATIONS: {
    SENT: `${API_BASE_URL}/api/v1/invitations/sent`,
    RECEIVED: `${API_BASE_URL}/api/v1/invitations/received`,
    RESPOND: (id: string) => `${API_BASE_URL}/api/v1/invitations/${id}/respond`,
    DELETE: (id: string) => `${API_BASE_URL}/api/v1/invitations/${id}`,
  },
  
  // WebSocket
  WEBSOCKET: {
    CONNECT: (token: string) => `${WS_BASE_URL}/api/v1/ws?token=${token}`,
    STATUS: `${API_BASE_URL}/api/v1/ws/status`,
  },
};

/**
 * Helper function to get authorization headers
 */
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
