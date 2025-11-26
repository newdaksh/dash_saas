import React, { useMemo } from 'react';
import { useApp } from '../context';
import { Status, Priority } from '../types';
import { CheckCircle2, Clock, AlertCircle, BarChart3, Layers, ArrowUpRight, Calendar } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, colorClass, bgGradient, delay }: any) => (
  <div 
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group animate-slide-up"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bgGradient} text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className="stroke-[2.5]" />
      </div>
    </div>
    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
      <span className="text-green-500 flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-full">
        <ArrowUpRight size={12} /> +12%
      </span>
      <span>vs last week</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { user, tasks, projects } = useApp();

  const stats = useMemo(() => {
    const myTasks = tasks.filter(t => t.assigneeId === user?.id);
    return {
      total: myTasks.length,
      completed: myTasks.filter(t => t.status === Status.DONE).length,
      overdue: myTasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== Status.DONE).length,
      highPriority: myTasks.filter(t => t.priority === Priority.HIGH && t.status !== Status.DONE).length
    };
  }, [tasks, user]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 mb-2 tracking-tight">
            {greeting}, {user.name}
          </h1>
          <p className="text-slate-500 text-lg">Here's your daily briefing and project overview.</p>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Current Date</p>
           <p className="text-xl font-semibold text-slate-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Tasks Completed" 
          value={stats.completed} 
          icon={CheckCircle2} 
          bgGradient="bg-gradient-to-br from-green-400 to-green-600"
          delay="0.1s"
        />
        <StatCard 
          label="Pending Tasks" 
          value={stats.total - stats.completed} 
          icon={Clock} 
          bgGradient="bg-gradient-to-br from-blue-400 to-blue-600"
          delay="0.2s"
        />
        <StatCard 
          label="High Priority" 
          value={stats.highPriority} 
          icon={AlertCircle} 
          bgGradient="bg-gradient-to-br from-orange-400 to-orange-600"
          delay="0.3s"
        />
        <StatCard 
          label="Active Projects" 
          value={projects.length} 
          icon={BarChart3} 
          bgGradient="bg-gradient-to-br from-purple-400 to-purple-600"
          delay="0.4s"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up-delayed">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="text-brand-500" size={24} />
              Recent Projects
            </h2>
            <button className="text-brand-600 text-sm font-semibold hover:text-brand-700 hover:underline transition-colors">View All Projects</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {projects.map((project, idx) => (
               <div key={project.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10 ${
                    idx % 2 === 0 ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                       idx % 2 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}>
                       <Layers size={20} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">{project.name}</h4>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1">{project.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(project.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex -space-x-2">
                        {/* Mock avatars */}
                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white text-[9px] flex items-center justify-center text-white font-bold">+2</div>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Quick Tasks */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={24} />
              My Tasks
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
            <div className="space-y-1">
              {tasks.filter(t => t.assigneeId === user.id && t.status !== Status.DONE).slice(0, 5).map(task => (
                <div key={task.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${
                    task.priority === Priority.HIGH ? 'bg-red-500 shadow-red-200' : 
                    task.priority === Priority.MEDIUM ? 'bg-orange-400 shadow-orange-200' : 'bg-blue-500 shadow-blue-200'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 mb-1 truncate group-hover:text-brand-600 transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />
                      <span className={task.dueDate && task.dueDate < new Date() ? 'text-red-500 font-medium' : ''}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowUpRight size={16} className="text-slate-400" />
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.assigneeId === user.id).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p>No pending tasks.</p>
                </div>
              )}
            </div>
            <button className="w-full py-3 text-center text-sm font-semibold text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-all mt-2">
              See All Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};