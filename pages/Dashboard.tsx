import React, { useMemo } from 'react';
import { useApp } from '../context';
import { Status, Priority } from '../types';
import { CheckCircle2, Clock, AlertCircle, BarChart3, Layers } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, colorClass, bgClass }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${bgClass}`}>
        <Icon size={20} className={colorClass} />
      </div>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
    </div>
    <h3 className="text-sm font-medium text-slate-500">{label}</h3>
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
    <div className="max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {greeting}, {user.name}
        </h1>
        <p className="text-slate-500">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          label="Tasks Completed" 
          value={stats.completed} 
          icon={CheckCircle2} 
          colorClass="text-green-600"
          bgClass="bg-green-50"
        />
        <StatCard 
          label="Tasks Due Soon" 
          value={stats.total - stats.completed} 
          icon={Clock} 
          colorClass="text-brand-600"
          bgClass="bg-brand-50"
        />
        <StatCard 
          label="High Priority" 
          value={stats.highPriority} 
          icon={AlertCircle} 
          colorClass="text-orange-600"
          bgClass="bg-orange-50"
        />
        <StatCard 
          label="Active Projects" 
          value={projects.length} 
          icon={BarChart3} 
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Recent Projects</h2>
                <button className="text-brand-600 text-sm font-medium hover:underline">View All</button>
             </div>
             <div className="divide-y divide-slate-100">
               {projects.map(project => (
                 <div key={project.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                        <Layers size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{project.name}</h4>
                        <p className="text-xs text-slate-500">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">Due {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Quick Tasks */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">My Tasks</h2>
            </div>
            <div className="p-4">
              {tasks.filter(t => t.assigneeId === user.id && t.status !== Status.DONE).slice(0, 5).map(task => (
                <div key={task.id} className="flex items-start gap-3 mb-4 last:mb-0 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === Priority.HIGH ? 'bg-red-500' : 'bg-brand-500'
                  }`} />
                  <div>
                    <h4 className="text-sm font-medium text-slate-800 leading-none mb-1">{task.title}</h4>
                    <span className="text-xs text-slate-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.assigneeId === user.id).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No tasks assigned. Enjoy your day!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};