
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Layers, Settings, LogOut, Hexagon, ChevronRight, Users, ChevronLeft, Bell, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context';

export const Sidebar: React.FC = () => {
  const { user, logout, notifications } = useApp();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
      isActive 
        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
    } ${isCollapsed ? 'justify-center px-3' : ''}`;

  return (
    <aside className={`hidden md:flex flex-col bg-[#0F172A] border-r border-slate-800 h-screen sticky top-0 transition-all duration-300 z-20 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Brand Header */}
      <div className="p-6 pb-8">
        <div className={`flex items-center gap-3 text-white mb-8 group cursor-pointer ${isCollapsed ? 'justify-center' : ''}`} onClick={() => navigate('/')}>
          <div className="relative">
             <div className="absolute inset-0 bg-brand-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
             <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl relative z-10 shadow-inner border border-white/10">
               <Hexagon className="text-white fill-white" size={24} />
             </div>
          </div>
          {!isCollapsed && (
            <div>
              <span className="font-bold text-xl tracking-tight block leading-none">NexusTask</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Workspace</span>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        {user && !isCollapsed && (
           <div 
             onClick={() => navigate('/profile')}
             className="relative group cursor-pointer"
           >
             <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
             <div className="relative px-4 py-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl flex items-center gap-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800 overflow-hidden">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
               </div>
               <div className="overflow-hidden flex-1">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition-colors">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.companyName}</p>
               </div>
               <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors group-hover:translate-x-0.5" />
             </div>
           </div>
        )}
        
        {/* Collapsed user avatar */}
        {user && isCollapsed && (
          <div 
            onClick={() => navigate('/profile')}
            className="flex justify-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800 overflow-hidden hover:ring-brand-500 transition-all">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 flex-1">
        {!isCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>}
        <nav className="space-y-2">
          <NavLink to="/" className={navClass} title="Dashboard">
            <Home size={20} className="stroke-[1.5] shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">Dashboard</span>}
          </NavLink>
          <NavLink to="/projects" className={navClass} title="Projects">
            <Layers size={20} className="stroke-[1.5] shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">Projects</span>}
          </NavLink>
          <NavLink to="/tasks" className={navClass} title="My Tasks">
            <CheckSquare size={20} className="stroke-[1.5] shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">My Tasks</span>}
          </NavLink>
          <NavLink to="/users" className={navClass} title="Users">
            <Users size={20} className="stroke-[1.5] shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">Users</span>}
          </NavLink>
          
          {/* Notifications Link */}
          <NavLink to="/notifications" className={navClass} title="Notifications">
            <div className="relative shrink-0">
              <Bell size={20} className="stroke-[1.5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">Notifications</span>}
          </NavLink>
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur">
         <nav className="space-y-2">
          <NavLink 
            to="/settings"
            title="Settings"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${isCollapsed ? 'justify-center px-3' : ''}`}
          >
            <Settings size={20} className="stroke-[1.5] group-hover:rotate-90 transition-transform duration-500 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </NavLink>
          <button 
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group ${isCollapsed ? 'justify-center px-3' : ''}`}
          >
            <LogOut size={20} className="stroke-[1.5] group-hover:-translate-x-1 transition-transform shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group ${isCollapsed ? 'justify-center px-3' : ''}`}
          >
            {isCollapsed ? (
              <ChevronRight size={20} className="stroke-[1.5] shrink-0" />
            ) : (
              <>
                <ChevronLeft size={20} className="stroke-[1.5] shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-up">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Confirm Logout</h3>
                  <p className="text-sm text-slate-500">Are you sure you want to log out?</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                You will be redirected to the login page and will need to sign in again to access your dashboard.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};