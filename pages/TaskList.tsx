
import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Task, ViewFilter, Status, Priority } from '../types';
import { Search, Filter, Plus, Calendar, ChevronDown, CheckCircle2, Circle, ListFilter, ArrowRight, Layers, LayoutGrid } from 'lucide-react';
import { Button } from '../components/Button';
import { TaskPanel } from '../components/TaskPanel';
import { CreateTaskModal } from '../components/CreateTaskModal';

export const TaskList: React.FC = () => {
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

    return result;
  }, [tasks, user, filter, statusFilter, search]);

  const handleRowClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      
      <div className="flex-1 flex flex-col space-y-6 relative z-10 p-1">
        
        {/* Header Section with Glass Effect */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-brand-100/80 text-brand-700">
                 Workspace
               </span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              My Tasks
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} available
            </p>
          </div>
          
          <Button 
            variant="primary" 
            className="bg-brand-600/90 hover:bg-brand-600 backdrop-blur text-white shadow-xl shadow-brand-500/20 rounded-xl px-6 py-3 transition-all hover:scale-105 active:scale-95 border border-brand-400/30"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} className="mr-2 stroke-[2.5]" />
            Add New Task
          </Button>
        </div>

        {/* Floating Controls Bar (Glass Capsule) */}
        <div className="sticky top-0 z-20 mx-1">
          <div className="bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-[0_8px_32px_rgb(0,0,0,0.05)] flex flex-col lg:flex-row gap-4 justify-between items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto p-1">
              {/* View Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-600">
                  <Filter size={16} />
                </div>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as ViewFilter)}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full sm:w-56 pl-10 pr-10 py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="assigned_to_me">Assigned to me</option>
                  <option value="assigned_by_me">Assigned by me</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-600">
                  <ListFilter size={16} />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full sm:w-48 pl-10 pr-10 py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
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
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors text-slate-500 group-focus-within:text-brand-600">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  className="bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full pl-10 p-2.5 transition-all outline-none placeholder-slate-500 shadow-sm" 
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Glass List View */}
        <div className="flex-1 animate-slide-up pb-12" style={{ animationDelay: '0.2s' }}>
          
          {/* List Content */}
          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, idx) => (
                <div 
                  key={task.id} 
                  onClick={() => handleRowClick(task)}
                  className="group relative grid grid-cols-12 gap-6 p-4 md:p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer items-center overflow-hidden"
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  {/* Hover Gradient Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-brand-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Selection Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500 transition-all duration-300 ${selectedTaskId === task.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                  {/* Task Status & Title */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-4 relative z-10">
                    <div className={`transition-all duration-300 group-hover:scale-110 p-1 rounded-full ${
                      task.status === Status.DONE 
                        ? 'text-green-500 bg-green-50/50' 
                        : 'text-slate-400 group-hover:text-brand-500 group-hover:bg-brand-50/50'
                    }`}>
                      {task.status === Status.DONE ? <CheckCircle2 size={20} className="fill-green-100" /> : <Circle size={20} strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-sm font-bold block truncate transition-colors ${task.status === Status.DONE ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-brand-700'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            task.priority === Priority.HIGH ? 'bg-red-50 text-red-600 border-red-100' :
                            task.priority === Priority.MEDIUM ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {task.priority}
                        </span>
                        {task.projectName && <span className="text-[10px] text-slate-500">• {task.projectName}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Project Tag */}
                  <div className="hidden md:flex col-span-2 items-center relative z-10">
                    {task.projectName ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/50 text-slate-600 border border-slate-200/50 group-hover:border-brand-200 group-hover:text-brand-600 transition-colors">
                        <Layers size={12} />
                        <span className="truncate">{task.projectName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 px-2">-</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex col-span-2 text-sm relative z-10">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg group-hover:bg-white/50 transition-colors">
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

                  {/* Assignee */}
                  <div className="col-span-3 md:col-span-2 flex items-center gap-2 relative z-10">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 p-[2px] shadow-sm ring-2 ring-white group-hover:ring-brand-100 transition-all">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          {task.assigneeAvatar ? 
                            <img src={task.assigneeAvatar} alt="" className="w-full h-full object-cover" /> : 
                            <span className="text-[10px] font-bold text-slate-600">{task.assigneeName.charAt(0)}</span>
                          }
                        </div>
                     </div>
                     <span className="text-xs font-medium text-slate-600 truncate hidden lg:block group-hover:text-slate-900 transition-colors">{task.assigneeName}</span>
                  </div>

                  {/* Priority & Action */}
                  <div className="hidden md:flex col-span-1 text-right justify-end items-center relative z-10">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-transform group-hover:scale-105 ${
                      task.priority === Priority.HIGH ? 'bg-red-50/80 text-red-600 border-red-100' :
                      task.priority === Priority.MEDIUM ? 'bg-orange-50/80 text-orange-600 border-orange-100' :
                      'bg-emerald-50/80 text-emerald-600 border-emerald-100'
                    }`}>
                      {task.priority}
                    </span>
                    <ArrowRight size={16} className="absolute right-4 text-brand-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300/50">
                <div className="bg-white p-6 rounded-full mb-4 shadow-lg animate-float">
                   <LayoutGrid size={40} className="text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No tasks found</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">Your workspace is looking clean!</p>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-slate-50"
                  onClick={() => {setSearch(''); setStatusFilter('All');}}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
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
