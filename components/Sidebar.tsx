import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Layers, Settings, LogOut, Hexagon } from 'lucide-react';
import { useApp } from '../context';

export const Sidebar: React.FC = () => {
  const { user, logout } = useApp();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
      isActive 
        ? 'bg-brand-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 text-white mb-8">
          <div className="bg-brand-500 p-1.5 rounded-lg">
            <Hexagon className="text-white fill-white" size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">NexusTask</span>
        </div>

        {user && (
           <div className="mb-6 px-3 py-3 bg-slate-800 rounded-xl flex items-center gap-3 border border-slate-700">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full" /> : user.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.companyName}</p>
             </div>
           </div>
        )}

        <nav className="space-y-1">
          <NavLink to="/" className={navClass}>
            <Home size={18} />
            <span className="text-sm font-medium">Home</span>
          </NavLink>
          <NavLink to="/projects" className={navClass}>
            <Layers size={18} />
            <span className="text-sm font-medium">Projects</span>
          </NavLink>
          <NavLink to="/tasks" className={navClass}>
            <CheckSquare size={18} />
            <span className="text-sm font-medium">My Tasks</span>
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
         <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};