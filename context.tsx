
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Task, Project, Invitation, Notification, UserType } from './types';
import { authAPI, userAPI, taskAPI, projectAPI, invitationAPI, setTokens, getAccessToken, setUserData, getUserData, clearTokens } from './services/api';

interface AppContextType {
  user: User | null;
  users: User[];
  tasks: Task[];
  projects: Project[];
  invitations: Invitation[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  // Admin auth
  login: (email: string, password: string) => Promise<void>;
  loginAsUser: (email: string, password: string) => Promise<void>;
  register: (companyName: string, name: string, email: string, password: string) => Promise<void>;
  // User auth (individual users, not company admins)
  userLogin: (email: string, password: string) => Promise<void>;
  userRegister: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  // Tasks
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  // Projects
  addProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  // Users/Team
  updateUser: (data: Partial<User>) => Promise<void>;
  inviteUser: (email: string, role?: string) => Promise<void>;
  updateTeamMember: (user: User) => Promise<void>;
  deleteTeamMember: (userId: string) => Promise<void>;
  // Invitations (for individual users)
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  // Notifications
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load current user on mount if token exists
  useEffect(() => {
    const initializeApp = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          setLoading(true);
          // First try to get user from session storage for quick recovery
          const cachedUser = getUserData();
          if (cachedUser) {
            setUser(cachedUser);
          }
          
          // Then verify with API and update
          const userData = await authAPI.getCurrentUser();
          console.log('Current user data:', userData);
          
          // Preserve the user_type from cached data if it exists
          // This ensures users stay in user portal after refresh
          const userWithType = {
            ...userData,
            user_type: cachedUser?.user_type || userData.user_type
          };
          
          setUser(userWithType);
          setUserData(userWithType); // Cache for session recovery
          
          // Call the appropriate refresh function based on user type
          if (userWithType.user_type === 'user') {
            await refreshUserData();
          } else {
            await refreshData();
          }
        } catch (err: any) {
          console.error('Failed to initialize app:', err);
          setError(err.message);
          authAPI.logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const refreshData = async () => {
    console.log('Starting refreshData...');
    try {
      const usersPromise = userAPI.getAll().catch(err => { 
        console.error('Users API error:', err); 
        return []; 
      });
      const tasksPromise = taskAPI.getAll().catch(err => { 
        console.error('Tasks API error:', err); 
        return []; 
      });
      const projectsPromise = projectAPI.getAll().catch(err => { 
        console.error('Projects API error:', err); 
        return []; 
      });
      const sentInvitationsPromise = invitationAPI.getSent().catch(err => { 
        console.error('Sent Invitations API error:', err); 
        return []; 
      });

      const [usersData, tasksData, projectsData, sentInvitations] = await Promise.all([
        usersPromise,
        tasksPromise,
        projectsPromise,
        sentInvitationsPromise,
      ]);
      
      console.log('RefreshData received:', {
        usersCount: usersData?.length,
        tasksCount: tasksData?.length,
        projectsCount: projectsData?.length,
        invitationsCount: sentInvitations?.length,
        tasksDataType: typeof tasksData,
        tasksDataIsArray: Array.isArray(tasksData),
        firstTask: tasksData?.[0]
      });
      
      if (Array.isArray(usersData)) {
        console.log('Setting users:', usersData.length);
        setUsers(usersData);
      }
      if (Array.isArray(tasksData)) {
        console.log('Setting tasks:', tasksData.length);
        setTasks(tasksData);
      }
      if (Array.isArray(projectsData)) {
        console.log('Setting projects:', projectsData.length);
        setProjects(projectsData);
      }
      if (Array.isArray(sentInvitations)) {
        console.log('Setting invitations:', sentInvitations.length);
        setInvitations(sentInvitations);
      }
    } catch (err: any) {
      console.error('Failed to refresh data:', err, err.stack);
      setError(err.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      setTokens(response.access_token, response.refresh_token);
      
      const userData = await authAPI.getCurrentUser();
      
      // Check if user is an admin - only admins can login through admin portal
      if (userData.role !== 'Admin') {
        // Clear tokens and reject login
        clearTokens();
        throw new Error('Only company admins can login here. Please use the User Portal.');
      }
      
      setUser(userData);
      setUserData(userData); // Cache user data for session persistence
      
      await refreshData();
    } catch (err: any) {
      console.error('Login failed:', err);
      // Clear any partial auth state
      clearTokens();
      setUser(null);
      const errorMessage = err.message || err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login as a specific user (for switching between users in different windows)
  const loginAsUser = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear existing session first
      clearTokens();
      setUser(null);
      setUsers([]);
      setTasks([]);
      setProjects([]);
      
      const response = await authAPI.login({ email, password });
      setTokens(response.access_token, response.refresh_token);
      
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setUserData(userData); // Cache user data for session persistence
      
      await refreshData();
    } catch (err: any) {
      console.error('Login as user failed:', err);
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (companyName: string, name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register({
        name,
        email,
        password,
        company_name: companyName,
      });
      
      setTokens(response.access_token, response.refresh_token);
      
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setUserData(userData); // Cache user data for session persistence
      
      await refreshData();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setUsers([]);
    setTasks([]);
    setProjects([]);
    setInvitations([]);
    setNotifications([]);
  };

  // ==================== User Portal Auth ====================
  
  const userLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      setTokens(response.access_token, response.refresh_token);
      
      const userData = await authAPI.getCurrentUser();
      
      // Check if user is an admin - admins should not login through user portal
      if (userData.role === 'Admin') {
        // Clear tokens and reject login
        clearTokens();
        throw new Error('Admin users should login through the Company Admin portal');
      }
      
      // Mark as user type
      const userWithType = { ...userData, user_type: 'user' as UserType };
      setUser(userWithType);
      setUserData(userWithType);
      
      await refreshUserData();
    } catch (err: any) {
      console.error('User login failed:', err);
      // Clear any partial auth state
      clearTokens();
      setUser(null);
      const errorMessage = err.message || err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const userRegister = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // For individual users, we use "Individual" as the company name
      // since the backend requires a non-empty company_name
      const response = await authAPI.register({
        name,
        email,
        password,
        company_name: 'Individual',
      });
      
      setTokens(response.access_token, response.refresh_token);
      
      const userData = await authAPI.getCurrentUser();
      const userWithType = { ...userData, user_type: 'user' as UserType };
      setUser(userWithType);
      setUserData(userWithType);
      
      await refreshUserData();
    } catch (err: any) {
      console.error('User registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh data for user portal (invitations, notifications, assigned tasks)
  const refreshUserData = async () => {
    console.log('Refreshing user portal data...');
    try {
      // Fetch tasks from all companies user belongs to
      const tasksPromise = taskAPI.getAll({ all_companies: true }).catch(err => {
        console.error('Tasks API error:', err);
        return [];
      });

      const receivedInvitationsPromise = invitationAPI.getReceived().catch(err => {
        console.error('Received Invitations API error:', err);
        return [];
      });

      const [tasksData, receivedInvitations] = await Promise.all([tasksPromise, receivedInvitationsPromise]);

      if (Array.isArray(tasksData)) {
        console.log('Setting tasks from all companies:', tasksData.length);
        setTasks(tasksData);
      }

      if (Array.isArray(receivedInvitations)) {
        console.log('Setting received invitations:', receivedInvitations.length);
        setInvitations(receivedInvitations);
      }

      // Notifications are fetched from a real API in production
      // For now, keep notifications empty - they will be populated when admins send invitations
      // The invitations list itself serves as the source of pending invitations to display
    } catch (err: any) {
      console.error('Failed to refresh user data:', err);
    }
  };

  // ==================== Invitation Management ====================

  const acceptInvitation = async (invitationId: string) => {
    try {
      setError(null);
      await invitationAPI.respond(invitationId, 'accept');
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'Accepted' as const }
            : inv
        )
      );
      // Add a notification
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          user_id: user?.id || '',
          type: 'system',
          title: 'Invitation Accepted',
          message: `You have joined ${invitations.find(i => i.id === invitationId)?.company_name}`,
          read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Failed to accept invitation:', err);
      setError(err.response?.data?.detail || 'Failed to accept invitation');
      throw err;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      setError(null);
      await invitationAPI.respond(invitationId, 'decline');
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'Declined' as const }
            : inv
        )
      );
    } catch (err: any) {
      console.error('Failed to decline invitation:', err);
      setError(err.response?.data?.detail || 'Failed to decline invitation');
      throw err;
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      setError(null);
      await invitationAPI.delete(invitationId);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err: any) {
      console.error('Failed to revoke invitation:', err);
      setError(err.response?.data?.detail || 'Failed to revoke invitation');
      throw err;
    }
  };

  // ==================== Notification Management ====================

  const markNotificationRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      setError(null);
      const updatedUser = await userAPI.update(user.id, data);
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.detail || 'Failed to update user');
      throw err;
    }
  };

  const inviteUser = async (email: string, role?: string) => {
    try {
      setError(null);
      const invitation = await userAPI.invite(email, role);
      // Add the invitation to the invitations list instead of users
      setInvitations(prev => [...prev, invitation]);
    } catch (err: any) {
      console.error('Failed to invite user:', err);
      setError(err.response?.data?.detail || 'Failed to invite user');
      throw err;
    }
  };

  const updateTeamMember = async (updatedUser: User) => {
    try {
      setError(null);
      const updated = await userAPI.update(updatedUser.id, updatedUser);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      if (user && user.id === updated.id) {
        setUser(updated);
      }
    } catch (err: any) {
      console.error('Failed to update team member:', err);
      setError(err.response?.data?.detail || 'Failed to update team member');
      throw err;
    }
  };

  const deleteTeamMember = async (userId: string) => {
    try {
      setError(null);
      await userAPI.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      console.error('Failed to delete team member:', err);
      setError(err.response?.data?.detail || 'Failed to delete team member');
      throw err;
    }
  };

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    
    try {
      setError(null);
      const newTask = await taskAPI.create({
        title: task.title || 'New Task',
        description: task.description || '',
        status: task.status || 'To Do',
        priority: task.priority || 'Medium',
        due_date: task.due_date || null,
        assignee_id: task.assignee_id || user.id,
        project_id: task.project_id || null,
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (err: any) {
      console.error('Failed to add task:', err);
      setError(err.response?.data?.detail || 'Failed to add task');
      throw err;
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      setError(null);
      const updated = await taskAPI.update(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        due_date: updatedTask.due_date,
        assignee_id: updatedTask.assignee_id,
        project_id: updatedTask.project_id,
      });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.response?.data?.detail || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError(null);
      await taskAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.detail || 'Failed to delete task');
      throw err;
    }
  };

  const addProject = async (project: Partial<Project>) => {
    if (!user) return;
    
    try {
      setError(null);
      const newProject = await projectAPI.create({
        name: project.name || 'New Project',
        description: project.description || '',
        status: project.status || 'Active',
        due_date: project.due_date || null,
        owner_id: project.owner_id || user.id,
        client_name: project.client_name || '',
      });
      setProjects(prev => [newProject, ...prev]);
    } catch (err: any) {
      console.error('Failed to add project:', err);
      setError(err.response?.data?.detail || 'Failed to add project');
      throw err;
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      setError(null);
      const updated = await projectAPI.update(updatedProject.id, {
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        due_date: updatedProject.due_date,
        owner_id: updatedProject.owner_id,
        client_name: updatedProject.client_name,
      });
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err: any) {
      console.error('Failed to update project:', err);
      setError(err.response?.data?.detail || 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setError(null);
      await projectAPI.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      // Update tasks that belonged to this project to have no project (they stay in DB)
      setTasks(prev => prev.map(t => 
        t.project_id === projectId 
          ? { ...t, project_id: undefined, project_name: undefined } 
          : t
      ));
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setError(err.response?.data?.detail || 'Failed to delete project');
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      users,
      tasks, 
      projects,
      invitations,
      notifications,
      loading,
      error,
      login,
      loginAsUser,
      register,
      userLogin,
      userRegister,
      logout, 
      addTask, 
      updateTask,
      deleteTask,
      addProject,
      updateProject,
      deleteProject,
      updateUser,
      inviteUser,
      updateTeamMember,
      deleteTeamMember,
      acceptInvitation,
      declineInvitation,
      revokeInvitation,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
