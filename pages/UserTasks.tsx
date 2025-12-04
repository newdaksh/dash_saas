import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Clock, Building2, Eye, GripVertical, Users, List, Kanban, Calendar, Layers, CheckCircle2, Circle, LayoutGrid } from 'lucide-react';
import { Task, Status } from '../types';
import { TaskPanel } from '../components/TaskPanel';
import { BoardView } from '../components/BoardView';
import { CalendarView } from '../components/CalendarView';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { Button } from '../components/Button';
import { Plus } from 'lucide-react';

type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
type ViewMode = 'list' | 'board' | 'calendar';

export const UserTasks: React.FC = () => {
  const { user, tasks, updateTask } = useApp();

  // Selected task for viewing details
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Collaborators display */}
                    {task.collaborators && task.collaborators.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                        <Users size={12} className="text-teal-600" />
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {task.collaborators.slice(0, 3).map(collab => (
                              <div
                                key={collab.user_id}
                                className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px] border-2 border-white"
                                title={collab.user_name}
                              >
                                {collab.user_avatar ? (
                                  <img src={collab.user_avatar} alt={collab.user_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  collab.user_name.charAt(0)
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {task.collaborators.length === 1
                              ? task.collaborators[0].user_name
                              : task.collaborators.length <= 3
                                ? task.collaborators.map(c => c.user_name).join(', ')
                                : `${task.collaborators.slice(0, 2).map(c => c.user_name).join(', ')} +${task.collaborators.length - 2}`
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    {task.due_date && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                        <Clock size={12} />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
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
    <div className="relative min-h-full flex flex-col">
      <div className="flex-1 flex flex-col space-y-6 relative z-10 p-1 pb-8">

        {/* Header */}
        <div className="animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-purple-100/80 text-purple-700">
                  Personal
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
                My Tasks
              </h1>
              <p className="text-slate-600 font-medium mt-1">
                View and manage tasks assigned to you.
              </p>
            </div>

            <Button
              variant="primary"
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 transition-all shadow-sm hover:shadow-md"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'list'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="List View"
              >
                <List size={18} />
                <span className="text-sm font-medium hidden sm:inline">List</span>
              </button>

              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'board'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Board View"
              >
                <Kanban size={18} />
                <span className="text-sm font-medium hidden sm:inline">Board</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'calendar'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
                title="Calendar View"
              >
                <Calendar size={18} />
                <span className="text-sm font-medium hidden sm:inline">Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board / List / Calendar View */}
        {viewMode === 'board' ? (
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
        ) : viewMode === 'list' ? (
          // List View
          <div className="flex-1 space-y-2 md:space-y-3">
            {myTasks.length > 0 ? (
              myTasks.map((task, idx) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="group relative grid grid-cols-12 gap-3 md:gap-6 p-4 md:p-5 bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl border border-indigo-100/50 shadow-sm hover:shadow-lg hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer items-center overflow-hidden"
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  {/* Hover Gradient Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Selection Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500 transition-all duration-300 ${selectedTaskId === task.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                  {/* Task Title */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-4 relative z-10">
                    <div className={`transition-all duration-300 p-1 rounded-full cursor-pointer z-20`}>
                      {task.status === 'Done' ? (
                        <CheckCircle2 size={20} className="fill-green-100 text-green-500" />
                      ) : (
                        <Circle size={20} strokeWidth={2.5} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-semibold text-sm md:text-base block transition-all ${task.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                          task.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
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
                  </div>

                  {/* Priority */}
                  <div className="hidden md:flex col-span-1 text-right justify-end items-center relative z-10">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-transform group-hover:scale-105 ${task.priority === 'High' ? 'bg-red-50/80 text-red-600 border-red-100' :
                      task.priority === 'Medium' ? 'bg-orange-50/80 text-orange-600 border-orange-100' :
                        'bg-emerald-50/80 text-emerald-600 border-emerald-100'
                      }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-indigo-200/50">
                <div className="bg-white p-6 rounded-full mb-4 shadow-lg">
                  <LayoutGrid size={40} className="text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No tasks found</h3>
                <p className="text-slate-500 text-sm mt-1">Your workspace is looking clean!</p>
              </div>
            )}
          </div>
        ) : (
          // Calendar View
          <CalendarView
            tasks={myTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        )}
      </div>

      {/* Task Detail Panel - View Only Mode */}
      {/* Task Detail Panel - View Only if not creator */}
      <TaskPanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTaskId(null)}
        viewOnly={selectedTask?.creator_id !== user?.id}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
