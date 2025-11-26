
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Task, Project, Status, Priority } from './types';

// Mock Data Generation
const MOCK_USER: User = {
  id: 'u1',
  name: 'Rahul Sain',
  email: 'rahul@example.com',
  companyName: 'Acme Corp',
  avatarUrl: 'https://picsum.photos/id/64/200',
  status: 'Active',
  role: 'Admin'
};

// Additional Mock Users for the Team
const MOCK_TEAM: User[] = [
  MOCK_USER,
  {
    id: 'u2',
    name: 'Mike Ross',
    email: 'mike@example.com',
    companyName: 'Acme Corp',
    avatarUrl: 'https://picsum.photos/id/91/200',
    status: 'Active',
    role: 'Member'
  },
  {
    id: 'u3',
    name: 'Sarah Jen',
    email: 'sarah@example.com',
    companyName: 'Acme Corp',
    avatarUrl: 'https://picsum.photos/id/177/200',
    status: 'Active',
    role: 'Member'
  },
  {
    id: 'u4',
    name: 'David Kim',
    email: 'david@example.com',
    companyName: 'Acme Corp',
    avatarUrl: 'https://picsum.photos/id/338/200',
    status: 'Active',
    role: 'Viewer'
  },
  {
    id: 'u5',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    companyName: 'Acme Corp',
    avatarUrl: undefined,
    status: 'Invited',
    role: 'Member'
  }
];

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
    assigneeAvatar: 'https://picsum.photos/id/64/200',
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
    assigneeAvatar: 'https://picsum.photos/id/64/200',
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
    assigneeAvatar: 'https://picsum.photos/id/91/200',
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
    assigneeAvatar: 'https://picsum.photos/id/64/200',
    creatorId: 'u1',
    projectId: undefined,
    comments: []
  }
];

interface AppContextType {
  user: User | null;
  users: User[];
  tasks: Task[];
  projects: Project[];
  login: (name: string, email: string) => void;
  register: (company: string, name: string, email: string) => void;
  logout: () => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  updateUser: (data: Partial<User>) => void;
  addTeamMember: (name: string) => void;
  inviteUser: (email: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_TEAM);
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

  const addTeamMember = (name: string) => {
    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@acme.com`,
        companyName: 'Acme Corp',
        avatarUrl: undefined,
        status: 'Active',
        role: 'Member'
    };
    setUsers(prev => [...prev, newUser]);
  }

  const inviteUser = (email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0], // Temporary name derived from email
      email: email,
      companyName: 'Acme Corp',
      avatarUrl: undefined,
      status: 'Invited',
      role: 'Member'
    };
    setUsers(prev => [...prev, newUser]);
  }

  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Optional: Delete associated tasks
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
  }

  return (
    <AppContext.Provider value={{ 
      user, 
      users,
      tasks, 
      projects, 
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
      addTeamMember,
      inviteUser
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