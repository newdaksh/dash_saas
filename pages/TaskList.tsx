import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Task, ViewFilter, Status, Priority } from '../types';
import { Search, Filter, Plus, Calendar, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TaskPanel } from '../components/TaskPanel';

interface TaskListProps {
  mode: 'all_tasks' | 'projects_view';
}

export const TaskList: React.FC<TaskListProps> = ({ mode }) => {
  const { user, tasks } = useApp();
  const [filter, setFilter] = useState<ViewFilter>('assigned_to_me');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    if (!user) return [];
    
    let result = tasks;

    // 1. Primary Filter (Assigned To / Assigned By)
    if (filter === 'assigned_to_me') {
      result = result.filter(t => t.assigneeId === user.id);
    } else {
      result = result.filter(t => t.creatorId === user.id);
    }

    // 2. Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) ||
        t.assigneeName.toLowerCase().includes(lowerSearch) ||
        t.projectName?.toLowerCase().includes(lowerSearch)
      );
    }

    // 3. Project Mode Check
    if (mode === 'projects_view') {
       // Only show tasks that belong to a project
       result = result.filter(t => !!t.projectId);
    }

    return result;
  }, [tasks, user, filter, search, mode]);

  const handleRowClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'projects_view' ? 'Projects Overview' : 'My Tasks'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track your {mode === 'projects_view' ? 'project deliverables' : 'daily to-dos'}.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="primary" className="shadow-lg shadow-brand-500/30">
            <Plus size={18} className="mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Left: View Filter Dropdown */}
        <div className="relative w-full lg:w-64">
           <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 lg:mb-0 lg:absolute lg:-top-6 lg:left-0">
             <Filter size={12} /> View
           </div>
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value as ViewFilter)}
             className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
           >
             <option value="assigned_to_me">Tasks assigned to me</option>
             <option value="assigned_by_me">Tasks assigned by me</option>
           </select>
           <ChevronDown size={16} className="absolute right-3 top-3.5 lg:top-3.5 pointer-events-none text-slate-500" />
        </div>

        {/* Right: Search */}
        <div className="w-full lg:w-96">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-2.5" 
              placeholder="Search tasks, people, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Task List (Table Style) */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5">Task Name</div>
          <div className="hidden md:block col-span-2">Project</div>
          <div className="hidden md:block col-span-2">Due Date</div>
          <div className="col-span-3 md:col-span-2">Assignee</div>
          <div className="col-span-3 md:col-span-1 text-right">Priority</div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleRowClick(task)}
                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-50 hover:bg-brand-50/50 transition-colors cursor-pointer group items-center"
              >
                <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                  <div className={`flex-shrink-0 ${task.status === Status.DONE ? 'text-green-500' : 'text-slate-300 group-hover:text-brand-500'}`}>
                    {task.status === Status.DONE ? <CheckCircle2 size={20} className="fill-green-100" /> : <Circle size={20} />}
                  </div>
                  <span className={`text-sm font-medium ${task.status === Status.DONE ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </span>
                </div>

                <div className="hidden md:block col-span-2">
                  {task.projectName ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {task.projectName}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>

                <div className="hidden md:block col-span-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {task.dueDate ? (
                      <>
                        <Calendar size={14} className={task.dueDate < new Date() ? 'text-red-500' : ''} />
                        <span className={task.dueDate < new Date() ? 'text-red-600 font-medium' : ''}>
                          {task.dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </>
                    ) : '-'}
                  </div>
                </div>

                <div className="col-span-3 md:col-span-2 flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden">
                      {task.assigneeAvatar ? <img src={task.assigneeAvatar} alt="" /> : task.assigneeName.charAt(0)}
                   </div>
                   <span className="text-xs text-slate-600 truncate hidden lg:block">{task.assigneeName}</span>
                </div>

                <div className="col-span-3 md:col-span-1 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    task.priority === Priority.HIGH ? 'bg-red-50 text-red-700 border-red-100' :
                    task.priority === Priority.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                    'bg-green-50 text-green-700 border-green-100'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                 <CheckCircle2 size={32} className="text-slate-300" />
              </div>
              <p>No tasks found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Slide-over */}
      <TaskPanel 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
};