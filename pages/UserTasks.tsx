import React from 'react';
import { useApp } from '../context';
import { CheckSquare, Clock, Filter, Plus } from 'lucide-react';
import { Button } from '../components/Button';

export const UserTasks: React.FC = () => {
  const { user, tasks, updateTask } = useApp();
  
  // Filter tasks assigned to this user
  const myTasks = tasks.filter(t => t.assignee_id === user?.id);
  
  // Group by status
  const todoTasks = myTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = myTasks.filter(t => t.status === 'In Progress');
  const reviewTasks = myTasks.filter(t => t.status === 'Review');
  const doneTasks = myTasks.filter(t => t.status === 'Done');

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = myTasks.find(t => t.id === taskId);
    if (task) {
      await updateTask({ ...task, status: newStatus as any });
    }
  };

  const TaskColumn = ({ title, tasks, color, icon }: { title: string, tasks: any[], color: string, icon: React.ReactNode }) => (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm overflow-hidden">
      <div className={`p-4 border-b ${color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold text-slate-800">{title}</h3>
          </div>
          <span className="text-sm font-medium text-slate-500">{tasks.length}</span>
        </div>
      </div>
      
      <div className="p-4 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto custom-scrollbar">
        {tasks.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">No tasks</p>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id}
              className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <h4 className="font-medium text-slate-800 group-hover:text-purple-600 transition-colors">
                {task.title}
              </h4>
              
              {task.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
              )}
              
              <div className="flex items-center flex-wrap gap-2 mt-3">
                {task.project_name && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {task.project_name}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === 'High' ? 'bg-red-100 text-red-700' :
                  task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </span>
              </div>
              
              {task.due_date && (
                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                  <Clock size={12} />
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
              
              {/* Quick status change */}
              <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100">
                {['To Do', 'In Progress', 'Review', 'Done'].map(status => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task.id, status);
                    }}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                      task.status === status 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col space-y-6 relative z-10 p-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-purple-100/80 text-purple-700">
                Personal
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              My Tasks
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Manage tasks assigned to you across all companies.
            </p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          <TaskColumn 
            title="To Do" 
            tasks={todoTasks} 
            color="bg-slate-50 border-slate-200"
            icon={<div className="w-3 h-3 rounded-full bg-slate-400"></div>}
          />
          <TaskColumn 
            title="In Progress" 
            tasks={inProgressTasks} 
            color="bg-blue-50 border-blue-200"
            icon={<div className="w-3 h-3 rounded-full bg-blue-500"></div>}
          />
          <TaskColumn 
            title="Review" 
            tasks={reviewTasks} 
            color="bg-amber-50 border-amber-200"
            icon={<div className="w-3 h-3 rounded-full bg-amber-500"></div>}
          />
          <TaskColumn 
            title="Done" 
            tasks={doneTasks} 
            color="bg-green-50 border-green-200"
            icon={<div className="w-3 h-3 rounded-full bg-green-500"></div>}
          />
        </div>
      </div>
    </div>
  );
};
