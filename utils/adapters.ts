/**
 * Adapters for converting between old camelCase field names and new snake_case field names
 * This helps maintain compatibility during the transition to backend API integration
 */

import { User, Task, Project } from '../types';

// Type for old User interface (for reference)
type OldUser = {
  id: string;
  name: string;
  email: string;
  companyName: string;
  avatarUrl?: string;
  status: 'Active' | 'Invited';
  role: 'Admin' | 'Member' | 'Viewer';
};

// Type for old Task interface
type OldTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  creatorId: string;
  projectId?: string;
  projectName?: string;
  comments?: any[];
};

// Type for old Project interface
type OldProject = {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Archived' | 'On Hold';
  dueDate: Date;
  ownerId: string;
  ownerName: string;
  clientName: string;
};

// Field mapping helpers for use in components
export const getTaskFields = (task: Task | any) => ({
  assigneeId: task.assignee_id || task.assigneeId,
  assigneeName: task.assignee_name || task.assigneeName,
  assigneeAvatar: task.assignee_avatar || task.assigneeAvatar,
  creatorId: task.creator_id || task.creatorId,
  projectId: task.project_id || task.projectId,
  projectName: task.project_name || task.projectName,
  dueDate: task.due_date || task.dueDate,
  isOverdue: task.is_overdue || task.isOverdue,
  createdAt: task.created_at || task.createdAt,
  updatedAt: task.updated_at || task.updatedAt,
});

export const getUserFields = (user: User | any) => ({
  companyName: user.company_name || user.companyName,
  avatarUrl: user.avatar_url || user.avatarUrl,
  emailNotifications: user.email_notifications || user.emailNotifications,
  pushNotifications: user.push_notifications || user.pushNotifications,
  productUpdates: user.product_updates || user.productUpdates,
  twoFactorEnabled: user.two_factor_enabled || user.twoFactorEnabled,
  publicProfile: user.public_profile || user.publicProfile,
  createdAt: user.created_at || user.createdAt,
  updatedAt: user.updated_at || user.updatedAt,
});

export const getProjectFields = (project: Project | any) => ({
  dueDate: project.due_date || project.dueDate,
  ownerId: project.owner_id || project.ownerId,
  ownerName: project.owner_name || project.ownerName,
  clientName: project.client_name || project.clientName,
  createdAt: project.created_at || project.createdAt,
  updatedAt: project.updated_at || project.updatedAt,
});

// Helper to safely access nested fields
export const safeAccess = <T,>(obj: any, newKey: string, oldKey: string): T | undefined => {
  return obj?.[newKey] ?? obj?.[oldKey];
};
