# Frontend Dynamic Integration - Migration Guide

## Overview
The dash_saas frontend has been migrated from static mock data to fully dynamic API integration with the backend on port 8000. This document outlines all changes made and instructions for running the application.

## Major Changes

### 1. API Service Layer (`services/api.ts`)
- **Created**: Complete API service layer with axios
- **Features**:
  - JWT token management (access & refresh tokens)
  - Automatic token refresh on 401 errors
  - Request/response interceptors
  - Organized API methods for all resources:
    - Authentication (register, login, getCurrentUser, logout)
    - Users (CRUD operations, invite, search, role/status updates)
    - Projects (CRUD operations, get tasks, owners, status updates)
    - Tasks (CRUD operations, my tasks, stats, assignee updates)
    - Comments (CRUD operations)
    - Dashboard (stats, recent activity)

### 2. Type Definitions (`types.ts`)
- **Updated**: All interfaces to match backend snake_case field naming
- **Changes**:
  - `companyName` → `company_name`
  - `avatarUrl` → `avatar_url`
  - `assigneeId` → `assignee_id`
  - `assigneeName` → `assignee_name`
  - `assigneeAvatar` → `assignee_avatar`
  - `creatorId` → `creator_id`
  - `projectId` → `project_id`
  - `projectName` → `project_name`
  - `dueDate` → `due_date`
  - `ownerId` → `owner_id`
  - `ownerName` → `owner_name`
  - `clientName` → `client_name`
  - All date fields now use string (ISO format)
- **Added**: Helper function `parseDate()` for date conversions
- **Added**: Optional fields for timestamps and backend-specific data

### 3. Context Provider (`context.tsx`)
- **Replaced**: All mock data with real API calls
- **Updated**: All CRUD operations to use API endpoints
- **Added**:
  - `loading` state for API operations
  - `error` state for error handling
  - `refreshData()` method to reload all data
  - Automatic user session restoration on app load
  - Proper async/await error handling
  - Token management integration

### 4. Authentication (`pages/Auth.tsx`)
- **Updated**: Login/register to use real API calls
- **Changes**:
  - Now accepts password field
  - Proper async form submission
  - Error handling from API
  - Token storage after successful auth

### 5. Dashboard (`pages/Dashboard.tsx`)
- **Updated**: All field references to use new snake_case names
- **Changes**:
  - `assigneeId` → `assignee_id`
  - `dueDate` → `due_date` with `parseDate()` helper
  - Date comparisons updated for string dates
  - Loading states support

### 6. Component Updates Required
The following components need field name updates (similar to Dashboard):
- **TaskList.tsx**: Update all task field references
- **ProjectList.tsx**: Update all project field references
- **UserList.tsx**: Update all user field references
- **TaskPanel.tsx**: Update task field references in panel
- **ProjectPanel.tsx**: Update project field references in panel
- **UserPanel.tsx**: Update user field references in panel
- **CreateTaskModal.tsx**: Update form field names
- **CreateProjectModal.tsx**: Update form field names
- **InviteUserModal.tsx**: Update form field names

### 7. Package Dependencies
- **Added**: `axios` ^1.6.0 to package.json

## Installation & Setup

### 1. Install Dependencies
```bash
cd dash_saas
npm install
```

### 2. Verify Backend is Running
Ensure the backend API is running on http://localhost:8000:
```bash
cd ../dash_api
# Activate virtual environment
# Run: uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend
```bash
cd ../dash_saas
npm run dev
```

## API Configuration

The API base URL is configured in `api.config.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8000';
```

To change the backend URL (e.g., for production), update this file.

## Authentication Flow

1. **Login/Register**: User enters credentials
2. **Token Storage**: Access & refresh tokens stored in localStorage
3. **Automatic Injection**: Tokens added to all API requests via interceptor
4. **Auto Refresh**: On 401 error, automatically tries to refresh token
5. **Session Restoration**: On app load, checks for valid token and loads user data

## Error Handling

All API errors are caught and:
1. Logged to console
2. Set in context `error` state
3. Can be displayed to users via toast/alert (to be implemented)

## Field Naming Convention

The frontend now follows the backend's snake_case convention:
- **Old (camelCase)**: `assigneeId`, `companyName`, `dueDate`
- **New (snake_case)**: `assignee_id`, `company_name`, `due_date`

## Date Handling

- **Backend**: Returns dates as ISO strings (`"2024-06-15"` or `"2024-06-15T10:30:00Z"`)
- **Frontend**: 
  - Stores as strings in state
  - Converts to Date objects for display using `parseDate()` helper
  - Sends as strings in API requests

## Remaining Tasks

### High Priority
1. Update field names in all component files:
   - TaskList.tsx
   - ProjectList.tsx  
   - UserList.tsx
   - All modal components
   - All panel components

2. Add loading indicators in UI
3. Add error toast/notification system
4. Handle empty states when no data from API

### Medium Priority
1. Add form validation matching backend requirements
2. Implement comment functionality
3. Add dashboard stats API integration
4. Handle API pagination for large datasets

### Low Priority
1. Add optimistic UI updates
2. Implement WebSocket for real-time updates
3. Add offline support with service workers
4. Cache API responses

## Testing

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login with existing user
- [ ] Auto-refresh token works
- [ ] Create new task
- [ ] Update task status
- [ ] Delete task
- [ ] Create new project
- [ ] Update project
- [ ] Delete project
- [ ] Invite user
- [ ] Update user profile
- [ ] Logout and login again

## Troubleshooting

### Issue: "Network Error" or CORS issues
**Solution**: Ensure backend has CORS configured for `http://localhost:5173` (Vite default port)

### Issue: "401 Unauthorized" on all requests
**Solution**: Check if token is stored in localStorage. Try logging out and logging in again.

### Issue: "Cannot read property of undefined"
**Solution**: Check if field names have been updated from camelCase to snake_case

### Issue: Dates showing as "Invalid Date"
**Solution**: Use `parseDate()` helper function from types.ts

## Support

For issues or questions, check:
1. Browser console for errors
2. Network tab for failed API calls
3. Backend logs for server errors

## API Documentation

Full API documentation available at: `http://localhost:8000/docs` (when backend is running)
