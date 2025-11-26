
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Task, Project, Status, Priority } from './types';

// Mock Data Generation
const MOCK_USER: User = {
  id: 'u1',
  name: 'Rahul Sain',
  email: 'rahul@example.com',
  companyName: 'Acme Corp',
  avatarUrl: 'https://picsum.photos/200'
};

const MOCK_PROJECTS: Project[] = [
  { 
    id: 'p1', 
    name: 'Website Redesign', 
    description: 'Overhaul the corporate site', 
    status: 'Active', 
    dueDate: new Date('2024-12-31'), 
    ownerId: 'u1',
    ownerName: 'Rahul Sain',
    clientName: 'TechFlow Solutions'
  },
  { 
    id: 'p2', 
    name: 'Mobile App Launch', 
    description: 'iOS and Android release', 
    status: 'Active', 
    dueDate: new Date('2024-10-15'), 
    ownerId: 'u1',
    ownerName: 'Rahul Sain',
    clientName: 'Nexus Retail'
  },
  { 
    id: 'p3', 
    name: 'Q4 Marketing', 
    description: 'Holiday campaigns', 
    status: 'On Hold', 
    dueDate: new Date('2024-11-20'), 
    ownerId: 'u2',
    ownerName: 'Mike Ross',
    clientName: 'Internal'
  },
];

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Draft Project Brief',
    description: 'Create a comprehensive brief for the design team.',
    status: Status.TODO,
    priority: Priority.HIGH,
    dueDate: new Date('2024-06-20'),
    assigneeId: 'u1',
    assigneeName: 'Rahul Sain',
    assigneeAvatar: 'https://picsum.photos/200',
    creatorId: 'u2',
    projectId: 'p1',
    projectName: 'Website Redesign',
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Jane Doe', content: 'Please include the new brand guidelines.', createdAt: new Date('2024-06-01') }
    ]
  },
  {
    id: 't2',
    title: 'Schedule Kickoff Meeting',
    description: 'Find a time that works for all stakeholders.',
    status: Status.DONE,
    priority: Priority.MEDIUM,
    dueDate: new Date('2024-06-18'),
    assigneeId: 'u1',
    assigneeName: 'Rahul Sain',
    assigneeAvatar: 'https://picsum.photos/200',
    creatorId: 'u1',
    projectId: 'p1',
    projectName: 'Website Redesign',
    comments: []
  },
  {
    id: 't3',
    title: 'Review Wireframes',
    description: 'Check the initial wireframes for user flow accuracy.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    dueDate: new Date('2024-07-01'),
    assigneeId: 'u2',
    assigneeName: 'Mike Ross',
    assigneeAvatar: 'https://picsum.photos/201',
    creatorId: 'u1',
    projectId: 'p2',
    projectName: 'Mobile App Launch',
    comments: []
  },
  {
    id: 't4',
    title: 'Send Email to HR',
    description: 'Confirm the new hire onboarding process.',
    status: Status.TODO,
    priority: Priority.LOW,
    dueDate: null,
    assigneeId: 'u1',
    assigneeName: 'Rahul Sain',
    assigneeAvatar: 'https://picsum.photos/200',
    creatorId: 'u1',
    projectId: undefined,
    comments: []
  }
];

interface AppContextType {
  user: User | null;
  tasks: Task[];
  projects: Project[];
  login: (name: string, email: string) => void;
  register: (company: string, name: string, email: string) => void;
  logout: () => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  updateUser: (data: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const login = (name: string, email: string) => {
    // Simulating login
    setUser({ ...MOCK_USER, name, email });
  };

  const register = (company: string, name: string, email: string) => {
    // Simulating register
    setUser({ ...MOCK_USER, name, email, companyName: company });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      tasks, 
      projects, 
      login, 
      register, 
      logout, 
      addTask, 
      updateTask,
      addProject,
      updateProject,
      updateUser
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
