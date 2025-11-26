# Dash SaaS Frontend - API Integration Guide

## API Configuration

The frontend is configured to connect to the backend API running at:
```
http://localhost:8000
```

All API endpoints are defined in `api.config.ts` for easy access and maintenance.

## Backend Connection

### Prerequisites
1. **Backend must be running** on port 8000
2. **Frontend runs** on port 3000 (configured in `vite.config.ts`)
3. **CORS is configured** in the backend to accept requests from `http://localhost:3000`

### Starting the Application

1. **Start the Backend** (from `dash_api` directory):
   ```bash
   cd dash_api
   python main.py
   ```
   Backend will be available at: http://localhost:8000

2. **Start the Frontend** (from `dash_saas` directory):
   ```bash
   cd dash_saas
   npm install
   npm run dev
   ```
   Frontend will be available at: http://localhost:3000

## API Endpoints Reference

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user info
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

### Users (`/api/v1/users`)
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `POST /users/invite` - Invite new user
- `DELETE /users/:id` - Delete user (admin only)

### Projects (`/api/v1/projects`)
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/tasks` - Get project tasks

### Tasks (`/api/v1/tasks`)
- `GET /tasks` - List all tasks (with filters)
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `PATCH /tasks/:id/status` - Update task status
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/my` - Get my assigned tasks
- `GET /tasks/stats` - Get task statistics

### Dashboard (`/api/v1/dashboard`)
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/recent-projects` - Get recent projects
- `GET /dashboard/my-tasks` - Get my pending tasks

## Using the API in Components

### Example: Login

```typescript
import { API_ENDPOINTS, getAuthHeaders } from './api.config';

const login = async (email: string, password: string) => {
  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  // data contains: { access_token, refresh_token, token_type, expires_in, user }
  
  // Store token for future requests
  localStorage.setItem('access_token', data.access_token);
  
  return data;
};
```

### Example: Fetch Tasks (Authenticated)

```typescript
import { API_ENDPOINTS, getAuthHeaders } from './api.config';

const fetchTasks = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(API_ENDPOINTS.TASKS.BASE, {
    method: 'GET',
    headers: getAuthHeaders(token)
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  
  return await response.json();
};
```

### Example: Create Task

```typescript
import { API_ENDPOINTS, getAuthHeaders } from './api.config';

const createTask = async (taskData: any) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(API_ENDPOINTS.TASKS.BASE, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(taskData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  
  return await response.json();
};
```

## Authentication Flow

1. **User logs in** → Receive `access_token` and `refresh_token`
2. **Store tokens** in localStorage or secure storage
3. **Include token** in all authenticated requests:
   ```
   Authorization: Bearer <access_token>
   ```
4. **Token expires** in 30 minutes → Use refresh token to get new access token
5. **Refresh token expires** in 7 days → User must login again

## Error Handling

The backend returns standardized error responses:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "status_code": 400
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Next Steps

To integrate the backend API into the frontend:

1. **Update `context.tsx`** to fetch data from API instead of using mock data
2. **Add authentication** to the Auth page
3. **Implement API calls** in components (CreateTaskModal, CreateProjectModal, etc.)
4. **Add loading states** and error handling
5. **Store JWT token** securely
6. **Add token refresh logic**

## Testing the Connection

You can test if the backend is running by visiting:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- API Info: http://localhost:8000/

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure:
1. Backend is running on port 8000
2. Frontend is running on port 3000
3. Backend `.env` file has: `CORS_ORIGINS=http://localhost:3000`

### Connection Refused
If the frontend can't connect to the backend:
1. Check backend is running: `http://localhost:8000/health`
2. Check firewall settings
3. Verify the API_BASE_URL in `api.config.ts` is correct

### 401 Unauthorized
If you get unauthorized errors:
1. Check the JWT token is being sent in headers
2. Verify the token hasn't expired
3. Check you're logged in

---

For more details, see:
- Backend API Documentation: http://localhost:8000/docs
- Backend README: `../dash_api/README.md`
