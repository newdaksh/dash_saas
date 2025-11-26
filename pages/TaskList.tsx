import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Task, ViewFilter, Status, Priority } from '../types';
import { Search, Filter, Plus, Calendar, ChevronDown, CheckCircle2, Circle, ListFilter, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TaskPanel } from '../components/TaskPanel';
import { CreateTaskModal } from '../components/CreateTaskModal';

interface TaskListProps {
  mode: 'all_tasks' | 'projects_view';
}

export const TaskList: React.FC<TaskListProps> = ({ mode }) => {
  const { user, tasks } = useApp();
  const [filter, setFilter] = useState<ViewFilter>('assigned_to_me');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derive the selected task from the latest tasks array
  const selectedTask = useMemo(() => 
    tasks.find(t => t.id === selectedTaskId) || null
  , [tasks, selectedTaskId]);

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    
    let result = tasks;

    if (filter === 'assigned_to_me') {
      result = result.filter(t => t.assigneeId === user.id);
    } else {
      result = result.filter(t => t.creatorId === user.id);
    }

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) ||
        t.assigneeName.toLowerCase().includes(lowerSearch) ||
        t.projectName?.toLowerCase().includes(lowerSearch)
      );
    }

    if (mode === 'projects_view') {
       result = result.filter(t => !!t.projectId);
    }

    return result;
  }, [tasks, user, filter, statusFilter, search, mode]);

  const handleRowClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-slide-up">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="px-2.5 py-0.5 rounded-md bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
               {mode === 'projects_view' ? 'Projects' : 'Workspace'}
             </span>
           </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'projects_view' ? 'Project Overview' : 'My Tasks'}
          </h1>
        </div>
        
        <Button 
          variant="primary" 
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 rounded-xl px-5 py-2.5 transition-all hover:scale-105 active:scale-95"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} className="mr-2 stroke-[2.5]" />
          Add New Task
        </Button>
      </div>

      {/* Floating Controls Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row gap-4 justify-between items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto p-1">
          {/* View Filter */}
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500">
               <Filter size={16} />
             </div>
             <select 
               value={filter}
               onChange={(e) => setFilter(e.target.value as ViewFilter)}
               className="appearance-none bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 block w-full sm:w-56 pl-10 pr-10 py-2.5 font-medium transition-all cursor-pointer outline-none"
             >
               <option value="assigned_to_me">Assigned to me</option>
               <option value="assigned_by_me">Assigned by me</option>
             </select>
             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Status Filter */}
          <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500">
               <ListFilter size={16} />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
               className="appearance-none bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 block w-full sm:w-48 pl-10 pr-10 py-2.5 font-medium transition-all cursor-pointer outline-none"
             >
               <option value="All">All Statuses</option>
               {Object.values(Status).map(s => (
                 <option key={s} value={s}>{s}</option>
               ))}
             </select>
             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>

        {/* Search */}
        <div className="w-full lg:w-80 p-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors text-slate-400 group-focus-within:text-brand-500">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              className="bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-500 block w-full pl-10 p-2.5 transition-all outline-none placeholder-slate-400" 
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Modern List View */}
      <div className="flex-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-6 px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5">Task</div>
          <div className="hidden md:block col-span-2">Project</div>
          <div className="hidden md:block col-span-2">Due Date</div>
          <div className="col-span-3 md:col-span-2">Assignee</div>
          <div className="col-span-3 md:col-span-1 text-right">Priority</div>
        </div>

        {/* List Content */}
        <div className="space-y-2 pb-10">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, idx) => (
              <div 
                key={task.id} 
                onClick={() => handleRowClick(task)}
                className="group grid grid-cols-12 gap-6 p-4 bg-white rounded-xl border border-transparent hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer items-center relative overflow-hidden"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                {/* Selection Highlight Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-brand-500 transition-opacity ${selectedTaskId === task.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                  <div className={`transition-transform duration-300 group-hover:scale-110 ${task.status === Status.DONE ? 'text-green-500' : 'text-slate-300 group-hover:text-brand-500'}`}>
                    {task.status === Status.DONE ? <CheckCircle2 size={22} className="fill-green-100" /> : <Circle size={22} strokeWidth={2} />}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-sm font-semibold block truncate ${task.status === Status.DONE ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-slate-400 md:hidden block mt-0.5">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>

                <div className="hidden md:block col-span-2">
                  {task.projectName ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-white group-hover:border-brand-100 transition-colors">
                      {task.projectName}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </div>

                <div className="hidden md:block col-span-2 text-sm">
                  <div className="flex items-center gap-2">
                    {task.dueDate ? (
                      <>
                        <Calendar size={14} className={task.dueDate < new Date() ? 'text-red-500' : 'text-slate-400'} />
                        <span className={`font-medium ${task.dueDate < new Date() ? 'text-red-600' : 'text-slate-600'}`}>
                          {task.dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </>
                    ) : <span className="text-slate-300">-</span>}
                  </div>
                </div>

                <div className="col-span-3 md:col-span-2 flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 p-[2px] shadow-sm">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {task.assigneeAvatar ? 
                          <img src={task.assigneeAvatar} alt="" className="w-full h-full object-cover" /> : 
                          <span className="text-[10px] font-bold text-slate-600">{task.assigneeName.charAt(0)}</span>
                        }
                      </div>
                   </div>
                   <span className="text-xs font-medium text-slate-600 truncate hidden lg:block group-hover:text-slate-900 transition-colors">{task.assigneeName}</span>
                </div>

                <div className="col-span-3 md:col-span-1 text-right flex justify-end items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm ${
                    task.priority === Priority.HIGH ? 'bg-red-50 text-red-600 border-red-100' :
                    task.priority === Priority.MEDIUM ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {task.priority}
                  </span>
                  <ArrowRight size={14} className="ml-3 text-brand-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="bg-slate-50 p-6 rounded-full mb-4 animate-pulse-slow">
                 <ListFilter size={48} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No tasks found</h3>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {setSearch(''); setStatusFilter('All');}}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Slide-over */}
      <TaskPanel 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTaskId(null)} 
      />

      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};