
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import { Sidebar } from './components/Sidebar';
import { UserSidebar } from './components/UserSidebar';
import { Dashboard } from './pages/Dashboard';
import { TaskList } from './pages/TaskList';
import { ProjectList } from './pages/ProjectList';
import { UserList } from './pages/UserList';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { UserAuth } from './pages/UserAuth';
import { UserDashboard } from './pages/UserDashboard';
import { UserTasks } from './pages/UserTasks';
import { UserNotifications } from './pages/UserNotifications';
import { UserCompanies } from './pages/UserCompanies';
import { AdminNotifications } from './pages/AdminNotifications';

// Admin Layout (Company Admin Dashboard)
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 custom-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
           {children}
        </div>
      </main>
    </div>
  );
};

// User Layout (Individual User Dashboard)
const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 overflow-hidden">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 custom-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
           {children}
        </div>
      </main>
    </div>
  );
};

// Protected route for Admin portal
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  // If user is a regular user, redirect to user portal
  if (user.user_type === 'user') return <Navigate to="/user" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

// Protected route for User portal
const UserProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/user/login" replace />;
  return <UserLayout>{children}</UserLayout>;
};

const AppRoutes = () => {
  const { user } = useApp();

  return (
    <Routes>
      {/* ==================== Admin Portal Routes ==================== */}
      <Route path="/login" element={user ? (user.user_type === 'user' ? <Navigate to="/user" /> : <Navigate to="/" />) : <Auth />} />
      <Route 
        path="/" 
        element={
          <AdminProtectedRoute>
            <Dashboard />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <AdminProtectedRoute>
            <TaskList />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <AdminProtectedRoute>
            <ProjectList />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <AdminProtectedRoute>
            <UserList />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <AdminProtectedRoute>
            <Profile />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <AdminProtectedRoute>
            <Settings />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <AdminProtectedRoute>
            <AdminNotifications />
          </AdminProtectedRoute>
        } 
      />

      {/* ==================== User Portal Routes ==================== */}
      <Route path="/user/login" element={user ? (user.user_type === 'user' ? <Navigate to="/user" /> : <Navigate to="/" />) : <UserAuth />} />
      <Route 
        path="/user" 
        element={
          <UserProtectedRoute>
            <UserDashboard />
          </UserProtectedRoute>
        } 
      />
      <Route 
        path="/user/tasks" 
        element={
          <UserProtectedRoute>
            <UserTasks />
          </UserProtectedRoute>
        } 
      />
      <Route 
        path="/user/notifications" 
        element={
          <UserProtectedRoute>
            <UserNotifications />
          </UserProtectedRoute>
        } 
      />
      <Route 
        path="/user/companies" 
        element={
          <UserProtectedRoute>
            <UserCompanies />
          </UserProtectedRoute>
        } 
      />
      <Route 
        path="/user/profile" 
        element={
          <UserProtectedRoute>
            <Profile />
          </UserProtectedRoute>
        } 
      />
      <Route 
        path="/user/settings" 
        element={
          <UserProtectedRoute>
            <Settings />
          </UserProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;