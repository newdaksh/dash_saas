import React, { useState } from 'react';
import { Task, Status, Priority } from '../types';
import { Clock, Building2, Users, Eye, GripVertical } from 'lucide-react';

interface BoardViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: Status | string) => Promise<void>;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onStatusChange,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Status | string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get all unique statuses from tasks or use default ones
  const statuses: (Status | string)[] = [Status.TODO, Status.IN_PROGRESS, Status.REVIEW, Status.DONE];

  // Group tasks by status
  const tasksByStatus = statuses.reduce(
    (acc, status) => {
      acc[status] = tasks.filter(t => t.status === status);
      return acc;
    },
    {} as Record<Status | string, Task[]>
  );

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

  const handleDragOver = (e: React.DragEvent, status: Status | string) => {
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

  const handleDrop = async (e: React.DragEvent, newStatus: Status | string) => {
    e.preventDefault();

    if (draggedTask && draggedTask.status !== newStatus) {
      await onStatusChange(draggedTask.id, newStatus);
    }

    setDraggedTask(null);
    setDragOverColumn(null);
    setIsDragging(false);
  };

  const getStatusColor = (status: Status | string) => {
    switch (status) {
      case Status.TODO:
        return { bg: 'bg-slate-50', border: 'border-slate-200', header: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400', highlight: 'border-slate-400' };
      case Status.IN_PROGRESS:
        return { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500', highlight: 'border-blue-400' };
      case Status.REVIEW:
        return { bg: 'bg-amber-50', border: 'border-amber-200', header: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', highlight: 'border-amber-400' };
      case Status.DONE:
        return { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-50 border-green-200', dot: 'bg-green-500', highlight: 'border-green-400' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', header: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400', highlight: 'border-slate-400' };
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'bg-red-100 text-red-700';
      case Priority.MEDIUM:
        return 'bg-amber-100 text-amber-700';
      case Priority.LOW:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const TaskColumn = ({
    title,
    columnTasks,
    status,
    colors,
  }: {
    title: string;
    columnTasks: Task[];
    status: Status | string;
    colors: ReturnType<typeof getStatusColor>;
  }) => {
    const isDropTarget = dragOverColumn === status;
    const canDrop = draggedTask && draggedTask.status !== status;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
        className={`${colors.bg} backdrop-blur-sm rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200
          ${isDropTarget && canDrop ? `${colors.highlight} scale-[1.02] shadow-lg` : colors.border}
          ${isDragging ? 'ring-1 ring-slate-200' : ''}
        `}
      >
        <div className={`p-4 border-b ${colors.header}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
              <h3 className="font-bold text-slate-800">{title}</h3>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
              {columnTasks.length}
            </span>
          </div>
        </div>

        <div
          className={`p-4 space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto custom-scrollbar transition-colors duration-200
            ${isDropTarget && canDrop ? 'bg-gradient-to-b from-transparent to-purple-50/50' : ''}
          `}
        >
          {/* Drop zone indicator when dragging */}
          {isDragging && columnTasks.length === 0 && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${isDropTarget && canDrop ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-400'}
            `}
            >
              <p className="text-sm font-medium">
                {isDropTarget && canDrop ? 'Release to drop here' : 'Drop task here'}
              </p>
            </div>
          )}

          {columnTasks.length === 0 && !isDragging ? (
            <p className="text-center text-slate-400 text-sm py-8">No tasks</p>
          ) : (
            <>
              {columnTasks.map((task) => {
                const isBeingDragged = draggedTask?.id === task.id;
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectTask(task.id)}
                    className={`p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group
                      ${isBeingDragged ? 'opacity-50 scale-95 ring-2 ring-purple-400' : 'hover:scale-[1.02]'}
                      ${selectedTaskId === task.id ? 'ring-2 ring-brand-500 ring-offset-2' : ''}
                    `}
                  >
                    {/* Header with view indicator */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2">
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
                      {/* Company name tag */}
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
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Collaborators display */}
                    {task.collaborators && task.collaborators.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                        <Users size={12} className="text-teal-600" />
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {task.collaborators.slice(0, 3).map((collab) => (
                              <div
                                key={collab.user_id}
                                className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px] border-2 border-white"
                                title={collab.user_name}
                              >
                                {collab.user_avatar ? (
                                  <img
                                    src={collab.user_avatar}
                                    alt={collab.user_name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
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
                              ? task.collaborators.map((c) => c.user_name).join(', ')
                              : `${task.collaborators.slice(0, 2).map((c) => c.user_name).join(', ')} +${task.collaborators.length - 2}`}
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
              {isDragging && columnTasks.length > 0 && canDrop && isDropTarget && (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
      {statuses.map((status) => (
        <TaskColumn
          key={status}
          title={status}
          columnTasks={tasksByStatus[status]}
          status={status}
          colors={getStatusColor(status)}
        />
      ))}
    </div>
  );
};
