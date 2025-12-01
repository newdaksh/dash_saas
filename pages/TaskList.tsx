
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context';
import { Task, ViewFilter, Status, Priority } from '../types';
import { Search, Filter, Plus, Calendar, ChevronDown, CheckCircle2, Circle, ListFilter, ArrowRight, Layers, LayoutGrid, ArrowUpDown, Clock, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { TaskPanel } from '../components/TaskPanel';

type SortOption = 'default' | 'dueDate' | 'priority';
type DateFilter = 'all' | 'today' | 'week' | 'overdue';

// Separate component for editable task row to isolate re-renders
const TaskTitleInput: React.FC<{
  task: Task;
  onUpdate: (task: Task) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}> = React.memo(({ task, onUpdate, onKeyDown }) => {
  const [localTitle, setLocalTitle] = useState(task.title);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isEditingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Only sync with external changes when NOT actively editing
  useEffect(() => {
    if (!isEditingRef.current) {
      setLocalTitle(task.title);
    }
  }, [task.title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    isEditingRef.current = true;
    setLocalTitle(newTitle);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Only save if title is not empty (backend requires min_length=1)
    if (newTitle.trim().length > 0) {
      debounceRef.current = setTimeout(() => {
        onUpdate({ ...task, title: newTitle });
      }, 600);
    }
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    // Only save if title is not empty and different
    if (localTitle.trim().length > 0 && localTitle !== task.title) {
      onUpdate({ ...task, title: localTitle });
    } else if (localTitle.trim().length === 0) {
      // Revert to original title if empty
      setLocalTitle(task.title);
    }
    
    // Mark editing as done after a short delay to allow the update to complete
    setTimeout(() => {
      isEditingRef.current = false;
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <input 
      ref={inputRef}
      id={`task-input-${task.id}`}
      type="text"
      value={localTitle}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder="Write a task name..."
      autoComplete="off"
      className={`w-full bg-transparent border border-transparent rounded px-2 -ml-2 py-1.5 -my-1 text-sm md:text-base font-semibold block transition-all placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none ${
        task.status === Status.DONE 
          ? 'text-slate-400 line-through' 
          : 'text-slate-900'
      }`}
    />
  );
});

export const TaskList: React.FC = () => {
  const location = useLocation();
  const { user, tasks, projects, updateTask, addTask } = useApp();
  const [filter, setFilter] = useState<ViewFilter>('assigned_to_me');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [search, setSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // State to track which task should be auto-focused (for new tasks)
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  // Handle navigation state from Dashboard
  useEffect(() => {
    const state = location.state as { 
      selectedTaskId?: string; 
      statusFilter?: Status | 'pending';
      priorityFilter?: Priority;
    } | null;
    
    if (state) {
      if (state.selectedTaskId) {
        setSelectedTaskId(state.selectedTaskId);
        // Clear status filter to ensure the task is visible
        setStatusFilter('All');
      }
      if (state.statusFilter) {
        if (state.statusFilter === 'pending') {
          // Show all non-done tasks
          setStatusFilter('All');
        } else {
          setStatusFilter(state.statusFilter);
        }
      }
      // Note: priorityFilter is not currently supported in the UI filters,
      // but we can add it later if needed
      
      // Clear the location state after processing
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Derive the selected task from the latest tasks array
  const selectedTask = useMemo(() => 
    tasks.find(t => t.id === selectedTaskId) || null
  , [tasks, selectedTaskId]);

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    
    let result = tasks;

    console.log('Filtering tasks:', {
      totalTasks: tasks.length,
      userId: user.id,
      userIdType: typeof user.id,
      filter,
      sampleTask: tasks[0] ? {
        assignee_id: tasks[0].assignee_id,
        assignee_id_type: typeof tasks[0].assignee_id,
        creator_id: tasks[0].creator_id
      } : null
    });

    // 1. Initial Source Filter
    if (filter === 'assigned_to_me') {
      result = result.filter(t => t.assignee_id === user.id);
    } else {
      result = result.filter(t => t.creator_id === user.id);
    }

    // 2. Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    // 3. Project Filter
    if (projectFilter !== 'all') {
      result = result.filter(t => t.project_id === projectFilter);
    }

    // 4. Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      result = result.filter(t => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (dateFilter === 'overdue') {
           // Overdue if date is before today and not done
           return taskDate < today && t.status !== Status.DONE;
        }
        if (dateFilter === 'today') {
           return taskDate.getTime() === today.getTime();
        }
        if (dateFilter === 'week') {
           const nextWeek = new Date(today);
           nextWeek.setDate(today.getDate() + 7);
           return taskDate >= today && taskDate <= nextWeek;
        }
        return true;
      });
    }

    // 5. Search Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) ||
        t.assignee_name.toLowerCase().includes(lowerSearch) ||
        t.project_name?.toLowerCase().includes(lowerSearch)
      );
    }

    // 6. Sorting
    if (sortBy === 'dueDate') {
      result = [...result].sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else if (sortBy === 'priority') {
      const pWeight = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
      result = [...result].sort((a, b) => pWeight[b.priority] - pWeight[a.priority]);
    }

    return result;
  }, [tasks, user, filter, statusFilter, dateFilter, projectFilter, sortBy, search]);

  // Effect to auto-focus new tasks
  useEffect(() => {
    if (focusedTaskId) {
      const element = document.getElementById(`task-input-${focusedTaskId}`);
      if (element) {
        element.focus();
      }
    }
  }, [focusedTaskId]);

  const handleRowClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleToggleStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const newStatus = task.status === Status.DONE ? Status.TODO : Status.DONE;
    updateTask({ ...task, status: newStatus });
  };

  const handleCreateTask = useCallback(async () => {
    if (!user) return;
    
    // Create a new blank task
    const taskData: Partial<Task> = {
      title: '',
      description: '',
      status: Status.TODO,
      priority: Priority.MEDIUM,
      due_date: null,
      assignee_id: user.id,
      project_id: projectFilter !== 'all' ? projectFilter : undefined
    };

    const createdTask = await addTask(taskData);
    if (createdTask) {
      setFocusedTaskId(createdTask.id);
    }
    
    // Reset filters that might hide the new task
    if (filter !== 'assigned_to_me') setFilter('assigned_to_me');
    if (statusFilter !== 'All' && statusFilter !== Status.TODO) setStatusFilter('All');
    if (dateFilter !== 'all') setDateFilter('all');
    setSortBy('default'); 
  }, [user, projectFilter, filter, statusFilter, dateFilter, addTask]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTask();
    }
  }, [handleCreateTask]);

  return (
    <div className="relative min-h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      <div className="flex-1 flex flex-col space-y-4 relative z-10 p-6 pb-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Tasks</h1>
            <p className="text-shadow-neutral-950 text-xs md:text-sm mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          
          <Button
            variant="primary" 
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 transition-all shadow-sm hover:shadow-md"
            onClick={handleCreateTask}
          >
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        </div>

        {/* Controls Bar */}
        <div className="sticky top-0 z-20">
          <div className="bg-white p-3 md:p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2 md:gap-3">
            
            <div className="flex flex-col sm:flex-row gap-2 w-full p-0.5 flex-wrap">
              {/* View Filter */}
              <div className="relative group flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-600">
                  <Filter size={16} />
                </div>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as ViewFilter)}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-xs md:text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full sm:w-48 pl-10 pr-10 py-2 md:py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="assigned_to_me">Assigned to me</option>
                  <option value="assigned_by_me">Assigned by me</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Status Filter */}
              <div className="relative group flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-600">
                  <ListFilter size={16} />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-xs md:text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full sm:w-40 pl-10 pr-10 py-2 md:py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="All">All Statuses</option>
                  {Object.values(Status).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

               {/* Date Filter */}
               <div className="relative group flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-600">
                  <Clock size={16} />
                </div>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-xs md:text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full sm:w-40 pl-10 pr-10 py-2 md:py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="all">Any Date</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="week">Due This Week</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Project Filter */}
              <div className="relative group flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-600">
                  <Layers size={16} />
                </div>
                <select 
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-xs md:text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full sm:w-48 pl-10 pr-10 py-2 md:py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full p-0.5">
              {/* Sort By Dropdown */}
              <div className="relative group w-full sm:flex-1 md:w-40">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-600">
                   <ArrowUpDown size={16} />
                </div>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-xs md:text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full pl-10 pr-10 py-2 md:py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="default">Default</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Search */}
              <div className="relative group w-full sm:flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors text-slate-500 group-focus-within:text-brand-600">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  className="bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-900 text-xs md:text-sm rounded-xl focus:ring-2 focus:ring-brand-500/50 block w-full pl-10 p-2 md:p-2.5 transition-all outline-none placeholder-slate-500 shadow-sm" 
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Glass List View */}
        <div className="flex-1 animate-slide-up pb-6 md:pb-12" style={{ animationDelay: '0.2s' }}>
          
          {/* List Content */}
          <div className="space-y-2 md:space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, idx) => (
                <div 
                  key={task.id} 
                  onClick={() => handleRowClick(task)}
                  className="group relative grid grid-cols-12 gap-3 md:gap-6 p-4 md:p-5 bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl border border-indigo-100/50 shadow-sm hover:shadow-lg hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer items-center overflow-hidden"
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  {/* Hover Gradient Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Selection Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500 transition-all duration-300 ${selectedTaskId === task.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                  {/* Task Status & Title */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-4 relative z-10">
                    <div 
                      onClick={(e) => handleToggleStatus(e, task)}
                      className={`transition-all duration-300 group-hover:scale-110 p-1 rounded-full cursor-pointer z-20 ${
                      task.status === Status.DONE 
                        ? 'text-green-500 bg-green-50/50' 
                        : 'text-slate-400 group-hover:text-brand-500 group-hover:bg-brand-50/50'
                    }`}>
                      {task.status === Status.DONE ? <CheckCircle2 size={20} className="fill-green-100" /> : <Circle size={20} strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Inline Editable Title */}
                      <TaskTitleInput 
                        task={task}
                        onUpdate={updateTask}
                        onKeyDown={handleTitleKeyDown}
                      />
                      
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            task.priority === Priority.HIGH ? 'bg-red-50 text-red-600 border-red-100' :
                            task.priority === Priority.MEDIUM ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {task.priority}
                        </span>
                        {task.project_name && <span className="text-[10px] text-slate-500">• {task.project_name}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Project Tag */}
                  <div className="hidden md:flex col-span-2 items-center relative z-10">
                    {task.project_name ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/50 text-slate-600 border border-slate-200/50 group-hover:border-brand-200 group-hover:text-brand-600 transition-colors">
                        <Layers size={12} />
                        <span className="truncate">{task.project_name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 px-2">-</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="hidden md:flex col-span-2 text-sm relative z-10">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg group-hover:bg-white/50 transition-colors">
                      {task.due_date ? (
                        <>
                          <Calendar size={14} className={new Date(task.due_date) < new Date() ? 'text-red-500' : 'text-slate-400'} />
                          <span className={`font-medium ${new Date(task.due_date) < new Date() ? 'text-red-600' : 'text-slate-600'}`}>
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </>
                      ) : <span className="text-slate-300">-</span>}
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="col-span-3 md:col-span-2 flex items-center gap-2 relative z-10">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 p-[2px] shadow-sm ring-2 ring-white group-hover:ring-brand-100 transition-all">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                          {task.assignee_avatar ? 
                            <img src={task.assignee_avatar} alt="" className="w-full h-full object-cover" /> : 
                            <span className="text-[10px] font-bold text-slate-600">{task.assignee_name.charAt(0)}</span>
                          }
                        </div>
                     </div>
                     <span className="text-xs pr-6 font-medium text-slate-600 truncate hidden lg:block group-hover:text-slate-900 transition-colors">{task.assignee_name}</span>
                     
                     {/* Collaborators indicator */}
                     {task.collaborators && task.collaborators.length > 0 && (
                       <div className="hidden lg:flex items-center gap-1 ml-1" title={task.collaborators.map(c => c.user_name).join(', ')}>
                         <Users size={12} className="text-teal-500" />
                         <span className="text-[10px] text-teal-600 font-medium">+{task.collaborators.length}</span>
                       </div>
                     )}
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
              <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-indigo-200/50">
                <div className="bg-white p-6 rounded-full mb-4 shadow-lg animate-float">
                   <LayoutGrid size={40} className="text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No tasks found</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">Your workspace is looking clean!</p>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-slate-50"
                  onClick={() => {setSearch(''); setStatusFilter('All'); setDateFilter('all'); setSortBy('default'); setProjectFilter('all');}}
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
    </div>
  );
};
