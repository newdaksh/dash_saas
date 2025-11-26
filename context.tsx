
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Task, Project } from './types';
import { authAPI, userAPI, taskAPI, projectAPI, setTokens, getAccessToken } from './services/api';

interface AppContextType {
  user: User | null;
  users: User[];
  tasks: Task[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (companyName: string, name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  inviteUser: (email: string, role?: string) => Promise<void>;
  updateTeamMember: (user: User) => Promise<void>;
  deleteTeamMember: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load current user on mount if token exists
  useEffect(() => {
    const initializeApp = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          setLoading(true);
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          await refreshData();
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
    try {
      const [usersData, tasksData, projectsData] = await Promise.all([
        userAPI.getAll(),
        taskAPI.getAll(),
        projectAPI.getAll(),
      ]);
      
      setUsers(usersData);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Failed to refresh data:', err);
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
      setUser(userData);
      
      await refreshData();
    } catch (err: any) {
      console.error('Login failed:', err);
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
      const newUser = await userAPI.invite(email, role);
      setUsers(prev => [...prev, newUser]);
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
      // Optionally delete associated tasks
      setTasks(prev => prev.filter(t => t.project_id !== projectId));
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
      loading,
      error,
      login, 
      register, 
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
