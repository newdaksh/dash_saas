
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

// User types for the dual-portal system
export type UserType = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  company_name: string;  // Comma-separated display string
  company_names?: string[];  // Array of all company names
  company_ids?: string[];  // Array of all company IDs
  current_company_id?: string;  // Currently active company
  current_company_name?: string;
  avatar_url?: string;  // Avatar URL from API
  avatarUrl?: string;   // Alias for backwards compatibility
  status: 'Active' | 'Invited';
  role: 'Admin' | 'Member' | 'Viewer';
  user_type: UserType; // 'admin' for company admins, 'user' for individual users
  email_notifications?: boolean;
  push_notifications?: boolean;
  product_updates?: boolean;
  two_factor_enabled?: boolean;
  public_profile?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Invitation from company admin to user
export interface Invitation {
  id: string;
  company_id: string;
  company_name: string;
  inviter_id: string;
  inviter_name: string;
  invitee_email: string;
  invitee_id?: string;
  role: 'Member' | 'Viewer';
  status: 'Pending' | 'Accepted' | 'Declined';
  message?: string;
  created_at: string;
  updated_at?: string;
}

// Notification for users
export interface Notification {
  id: string;
  user_id?: string;
  type: 'invitation' | 'invitation_response' | 'user_joined' | 'task_assigned' | 'task_updated' | 'mention' | 'system';
  title?: string;
  message: string;
  data?: any; // Additional data like invitation_id, task_id, etc.
  read: boolean;
  created_at?: string;
  createdAt?: string; // Alternative field name
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Collaborator {
  user_id: string;
  user_name: string;
  user_avatar?: string;
}

// Task History types
export type HistoryActionType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'priority_changed'
  | 'assignee_changed'
  | 'due_date_changed'
  | 'project_changed'
  | 'title_changed'
  | 'description_changed'
  | 'collaborators_changed';

export interface TaskHistory {
  id: string;
  task_id: string;
  action: HistoryActionType;
  field_name?: string;
  old_value?: any;
  new_value?: any;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  company_id?: string;
  created_at: string;
  created_at_ist: string;  // IST formatted timestamp
}

export interface TaskHistoryResponse {
  history: TaskHistory[];
  total: number;
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
  collaborators?: Collaborator[]; // Multiple collaborators from the same company
  creator_id: string; // The person who assigned the task
  project_id?: string | null;
  project_name?: string | null;
  company_id?: string;  // Company the task belongs to
  company_name?: string;  // Company name for display
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
  company_id?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type ViewFilter = 'all_tasks' | 'assigned_to_me' | 'assigned_by_me' | 'collaborating_on';

// Helper function to convert dates
export const parseDate = (dateStr: string | null): Date | null => {
  return dateStr ? new Date(dateStr) : null;
};
