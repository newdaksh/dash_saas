import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Layers, Settings, LogOut, Hexagon, ChevronRight } from 'lucide-react';
import { useApp } from '../context';

export const Sidebar: React.FC = () => {
  const { user, logout } = useApp();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
      isActive 
        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
    }`;

  return (
    <aside className="hidden md:flex flex-col w-72 bg-[#0F172A] border-r border-slate-800 h-screen sticky top-0 transition-all z-20">
      {/* Brand Header */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-3 text-white mb-8 group cursor-pointer">
          <div className="relative">
             <div className="absolute inset-0 bg-brand-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
             <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl relative z-10 shadow-inner border border-white/10">
               <Hexagon className="text-white fill-white" size={24} />
             </div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight block leading-none">NexusTask</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Workspace</span>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
           <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500"></div>
             <div className="relative px-4 py-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl flex items-center gap-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800">
                  {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
               </div>
               <div className="overflow-hidden flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.companyName}</p>
               </div>
               <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
             </div>
           </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 flex-1">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu</p>
        <nav className="space-y-2">
          <NavLink to="/" className={navClass}>
            <Home size={20} className="stroke-[1.5]" />
            <span className="text-sm font-medium tracking-wide">Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={navClass}>
            <Layers size={20} className="stroke-[1.5]" />
            <span className="text-sm font-medium tracking-wide">Projects</span>
          </NavLink>
          <NavLink to="/tasks" className={navClass}>
            <CheckSquare size={20} className="stroke-[1.5]" />
            <span className="text-sm font-medium tracking-wide">My Tasks</span>
          </NavLink>
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur">
         <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group">
            <Settings size={20} className="stroke-[1.5] group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut size={20} className="stroke-[1.5] group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};