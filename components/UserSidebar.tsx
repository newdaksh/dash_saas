import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Bell, Settings, LogOut, User, ChevronRight, ChevronLeft, Building2 } from 'lucide-react';
import { useApp } from '../context';

export const UserSidebar: React.FC = () => {
  const { user, logout, notifications } = useApp();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
      isActive 
        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
    } ${isCollapsed ? 'justify-center px-3' : ''}`;

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  return (
    <aside className={`hidden md:flex flex-col bg-[#0F172A] border-r border-slate-800 h-screen sticky top-0 transition-all duration-300 z-20 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Brand Header */}
      <div className="p-6 pb-8">
        <div className={`flex items-center gap-3 text-white mb-8 group cursor-pointer ${isCollapsed ? 'justify-center' : ''}`} onClick={() => navigate('/user')}>
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-2 rounded-xl relative z-10 shadow-inner border border-white/10">
              <User className="text-white" size={24} />
            </div>
          </div>
          {!isCollapsed && (
            <div>
              <span className="font-bold text-xl tracking-tight block leading-none">NexusTask</span>
              <span className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold">User Portal</span>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        {user && !isCollapsed && (
          <div 
            onClick={() => navigate('/user/profile')}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
            <div className="relative px-4 py-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl flex items-center gap-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800 overflow-hidden">
                {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors group-hover:translate-x-0.5" />
            </div>
          </div>
        )}
        
        {/* Collapsed user avatar */}
        {user && isCollapsed && (
          <div 
            onClick={() => navigate('/user/profile')}
            className="flex justify-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800 overflow-hidden hover:ring-purple-500 transition-all">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 flex-1">
        {!isCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>}
        <nav className="space-y-2">
          <NavLink to="/user" end className={navClass} title="Dashboard">
            <Home size={20} className="stroke-[1.5] shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">Dashboard</span>}
          </NavLink>
          
          <NavLink to="/user/tasks" className={navClass} title="My Tasks">
            <CheckSquare size={20} className="stroke-[1.5] shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">My Tasks</span>}
          </NavLink>
          
          <NavLink to="/user/notifications" className={navClass} title="Notifications">
            <div className="relative shrink-0">
              <Bell size={20} className="stroke-[1.5]" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </div>
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">Notifications</span>}
          </NavLink>
          
          <NavLink to="/user/companies" className={navClass} title="My Companies">
            <Building2 size={20} className="stroke-[1.5] shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium tracking-wide">My Companies</span>}
          </NavLink>
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur">
        <nav className="space-y-2">
          <NavLink 
            to="/user/settings"
            title="Settings"
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${isCollapsed ? 'justify-center px-3' : ''}`}
          >
            <Settings size={20} className="stroke-[1.5] group-hover:rotate-90 transition-transform duration-500 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </NavLink>
          <button 
            onClick={handleLogout}
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
    </aside>
  );
};
