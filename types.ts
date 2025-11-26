
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
  company_name: string;
  avatar_url?: string;
  status: 'Active' | 'Invited';
  role: 'Admin' | 'Member' | 'Viewer';
  email_notifications?: boolean;
  push_notifications?: boolean;
  product_updates?: boolean;
  two_factor_enabled?: boolean;
  public_profile?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  due_date: string | null;
  assignee_id: string; // The person doing the task
  assignee_name: string;
  assignee_avatar?: string;
  creator_id: string; // The person who assigned the task
  project_id?: string;
  project_name?: string;
  created_at?: string;
  updated_at?: string;
  is_overdue?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Archived' | 'On Hold';
  due_date: string | null;
  owner_id: string;
  owner_name: string;
  client_name: string;
  created_at?: string;
  updated_at?: string;
}

export type ViewFilter = 'assigned_to_me' | 'assigned_by_me';

// Helper function to convert dates
export const parseDate = (dateStr: string | null): Date | null => {
  return dateStr ? new Date(dateStr) : null;
};
