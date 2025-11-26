export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: Date | null;
  assigneeId: string; // The person doing the task
  assigneeName: string;
  assigneeAvatar?: string;
  creatorId: string; // The person who assigned the task
  projectId?: string;
  projectName?: string;
  comments: Comment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Archived' | 'On Hold';
  dueDate: Date;
  ownerId: string;
}

export type ViewFilter = 'assigned_to_me' | 'assigned_by_me';