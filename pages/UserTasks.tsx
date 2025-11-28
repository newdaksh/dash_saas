import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Clock, Building2, Eye, GripVertical } from 'lucide-react';
import { Task } from '../types';
import { TaskPanel } from '../components/TaskPanel';

type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';

export const UserTasks: React.FC = () => {
  const { user, tasks, updateTask } = useApp();
  
  // Selected task for viewing details
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Filter tasks assigned to this user
  const myTasks = tasks.filter(t => t.assignee_id === user?.id);
  
  // Derive selected task from the latest tasks array
  const selectedTask = useMemo(() => 
    tasks.find(t => t.id === selectedTaskId) || null
  , [tasks, selectedTaskId]);
  
  // Group by status
  const todoTasks = myTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = myTasks.filter(t => t.status === 'In Progress');
  const reviewTasks = myTasks.filter(t => t.status === 'Review');
  const doneTasks = myTasks.filter(t => t.status === 'Done');

  // Check if user has tasks from multiple companies
  const uniqueCompanies = new Set(myTasks.map(t => t.company_name).filter(Boolean));
  const hasMultipleCompanies = uniqueCompanies.size > 1;

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = myTasks.find(t => t.id === taskId);
    if (task) {
      await updateTask({ ...task, status: newStatus as any });
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    setIsDragging(false);
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== newStatus) {
      await handleStatusChange(draggedTask.id, newStatus);
    }
    
    setDraggedTask(null);
    setDragOverColumn(null);
    setIsDragging(false);
  };

  const TaskColumn = ({ 
    title, 
    tasks, 
    color, 
    icon, 
    status,
    dropHighlightColor 
  }: { 
    title: string, 
    tasks: Task[], 
    color: string, 
    icon: React.ReactNode,
    status: TaskStatus,
    dropHighlightColor: string
  }) => {
    const isDropTarget = dragOverColumn === status;
    const canDrop = draggedTask && draggedTask.status !== status;
    
    return (
      <div 
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
        className={`bg-white/60 backdrop-blur-sm rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200
          ${isDropTarget && canDrop 
            ? `${dropHighlightColor} scale-[1.02] shadow-lg` 
            : 'border-white'
          }
          ${isDragging ? 'ring-1 ring-slate-200' : ''}
        `}
      >
        <div className={`p-4 border-b ${color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-bold text-slate-800">{title}</h3>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
        
        <div className={`p-4 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto custom-scrollbar transition-colors duration-200
          ${isDropTarget && canDrop ? 'bg-gradient-to-b from-transparent to-purple-50/50' : ''}
        `}>
          {/* Drop zone indicator when dragging */}
          {isDragging && tasks.length === 0 && (
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${isDropTarget && canDrop 
                ? 'border-purple-400 bg-purple-50 text-purple-600' 
                : 'border-slate-200 text-slate-400'
              }
            `}>
              <p className="text-sm font-medium">
                {isDropTarget && canDrop ? 'Release to drop here' : 'Drop task here'}
              </p>
            </div>
          )}
          
          {tasks.length === 0 && !isDragging ? (
            <p className="text-center text-slate-400 text-sm py-8">No tasks</p>
          ) : (
            <>
              {tasks.map(task => {
                const isBeingDragged = draggedTask?.id === task.id;
                return (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group
                      ${isBeingDragged ? 'opacity-50 scale-95 ring-2 ring-purple-400' : 'hover:scale-[1.02]'}
                    `}
                  >
                    {/* Header with view indicator */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 group-hover:text-purple-600 transition-colors">
                          {task.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-purple-500">
                          <Eye size={16} />
                        </span>
                        <span className="text-slate-400">
                          <GripVertical size={16} />
                        </span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center flex-wrap gap-2 mt-3">
                      {/* Company name tag - always shows for clarity, especially when multiple companies */}
                      {task.company_name && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <Building2 size={10} />
                          {task.company_name}
                        </span>
                      )}
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
                    
                    {/* Quick status change buttons - still enabled for users */}
                    <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100">
                      {(['To Do', 'In Progress', 'Review', 'Done'] as TaskStatus[]).map(statusOption => (
                        <button
                          key={statusOption}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, statusOption);
                          }}
                          className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                            task.status === statusOption 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Show drop indicator at end of non-empty columns */}
              {isDragging && tasks.length > 0 && canDrop && isDropTarget && (
                <div className="border-2 border-dashed border-purple-400 rounded-xl p-4 text-center bg-purple-50 transition-all duration-200">
                  <p className="text-sm font-medium text-purple-600">Release to drop here</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className={`flex-1 flex flex-col space-y-6 relative z-10 p-1 transition-all duration-300 ${
        selectedTask ? 'md:mr-[600px]' : ''
      }`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-purple-100/80 text-purple-700">
                Personal
              </span>
              {hasMultipleCompanies && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-blue-100/80 text-blue-700">
                  {uniqueCompanies.size} Companies
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              My Tasks
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              View and manage tasks assigned to you across all companies.
            </p>
            <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
              <GripVertical size={14} className="text-purple-500" />
              <span>Drag and drop tasks or use buttons to change status</span>
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
            status="To Do"
            dropHighlightColor="border-slate-400"
          />
          <TaskColumn 
            title="In Progress" 
            tasks={inProgressTasks} 
            color="bg-blue-50 border-blue-200"
            icon={<div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            status="In Progress"
            dropHighlightColor="border-blue-400"
          />
          <TaskColumn 
            title="Review" 
            tasks={reviewTasks} 
            color="bg-amber-50 border-amber-200"
            icon={<div className="w-3 h-3 rounded-full bg-amber-500"></div>}
            status="Review"
            dropHighlightColor="border-amber-400"
          />
          <TaskColumn 
            title="Done" 
            tasks={doneTasks} 
            color="bg-green-50 border-green-200"
            icon={<div className="w-3 h-3 rounded-full bg-green-500"></div>}
            status="Done"
            dropHighlightColor="border-green-400"
          />
        </div>
      </div>
      
      {/* Task Detail Panel - View Only Mode */}
      <TaskPanel 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTaskId(null)}
        viewOnly={true}
      />
    </div>
  );
};
