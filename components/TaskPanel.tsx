import React, { useState } from 'react';
import { Task, Status, Priority, Comment } from '../types';
import { X, Calendar, User, CheckCircle2, AlertCircle, MessageSquare, Paperclip, Send, ChevronDown, Building2, Crown } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../context';

interface TaskPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ task, isOpen, onClose }) => {
  const { user, updateTask, projects } = useApp();
  const [commentText, setCommentText] = useState('');

  if (!task || !user) return null;

  const currentProject = projects.find(p => p.id === task.projectId);

  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== Status.DONE;
  const isAssignedToMe = user.id === task.assigneeId;

  const handleStatusChange = () => {
    const nextStatus = task.status === Status.DONE ? Status.TODO : Status.DONE;
    updateTask({ ...task, status: nextStatus });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      content: commentText,
      createdAt: new Date()
    };
    updateTask({ ...task, comments: [...task.comments, newComment] });
    setCommentText('');
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    const project = projects.find(p => p.id === projectId);
    updateTask({ 
        ...task, 
        projectId: projectId || undefined, 
        projectName: project?.name || undefined 
    });
  };

  // Safe date conversion for input value (YYYY-MM-DD)
  const dateInputValue = task.dueDate ? new Date(task.dueDate.getTime() - (task.dueDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Button 
            variant={task.status === Status.DONE ? "ghost" : "outline"}
            className={`flex items-center gap-2 ${task.status === Status.DONE ? 'text-green-600 bg-green-50' : ''}`}
            onClick={handleStatusChange}
          >
            <CheckCircle2 size={18} className={task.status === Status.DONE ? 'fill-green-600 text-white' : ''} />
            {task.status === Status.DONE ? 'Completed' : 'Mark Complete'}
          </Button>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <Paperclip size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Overdue Banner */}
          {isOverdue && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3 animate-pulse">
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
              <div>
                 <h4 className="text-sm font-bold text-red-900">Overdue</h4>
                 <p className="text-sm text-red-700 mt-0.5">This task was due on {task.dueDate?.toLocaleDateString()}. Please update the status or due date.</p>
              </div>
            </div>
          )}

          {/* Project Breadcrumb / Selector */}
          <div className="mb-4 flex items-center gap-2 group">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-500">Project</span>
            <div className="relative">
              <select 
                value={task.projectId || ''} 
                onChange={handleProjectChange}
                className="appearance-none bg-transparent text-sm text-brand-600 font-medium hover:text-brand-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded pl-1 pr-6 py-0.5 transition-colors"
              >
                <option value="">No Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-brand-600 pointer-events-none" />
            </div>
          </div>

          {/* Title Input */}
          <input 
            type="text"
            value={task.title}
            onChange={(e) => updateTask({ ...task, title: e.target.value })}
            className="text-3xl font-bold text-gray-900 mb-6 leading-tight w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-300 transition-colors hover:bg-gray-50/50 rounded"
            placeholder="Task Title"
          />

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
            
            {/* Assignee */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assignee</span>
              <div className="flex items-center gap-2 p-1 -ml-1 rounded-md">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-white ring-2 ring-gray-50">
                   {task.assigneeAvatar ? (
                      <img src={task.assigneeAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                   ) : (
                      task.assigneeName.charAt(0)
                   )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {task.assigneeName}
                    {isAssignedToMe && (
                      <span className="bg-brand-100 text-brand-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">You</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date Input */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</span>
              <div className="flex items-center gap-2 p-1 -ml-1 text-sm text-gray-700 group hover:bg-slate-50 rounded transition-colors cursor-pointer relative">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center pointer-events-none ${
                   !task.dueDate ? 'bg-gray-100 text-gray-400' :
                   isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-brand-600'
                 }`}>
                   <Calendar size={16} />
                 </div>
                 <input 
                   type="date"
                   value={dateInputValue}
                   onChange={(e) => updateTask({ ...task, dueDate: e.target.value ? new Date(e.target.value) : null })}
                   className={`bg-transparent border-none p-0 focus:ring-0 text-sm font-medium cursor-pointer w-full ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}
                 />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</span>
              <div className="flex items-center gap-2 p-1 -ml-1">
                <div className="relative">
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask({ ...task, priority: e.target.value as Priority })}
                    className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors uppercase tracking-wide ${
                      task.priority === Priority.HIGH ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                      task.priority === Priority.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' :
                      'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                     task.priority === Priority.HIGH ? 'text-red-700' :
                     task.priority === Priority.MEDIUM ? 'text-yellow-700' :
                     'text-blue-700'
                  }`} />
                </div>
              </div>
            </div>

             {/* Status Selector */}
             <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Status</span>
              <div className="flex items-center gap-2 p-1 -ml-1">
                 <div className="relative w-full">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask({ ...task, status: e.target.value as Status })}
                      className="appearance-none w-full bg-white border border-slate-200 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block px-3 py-1.5 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {Object.values(Status).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                 </div>
              </div>
            </div>

            {/* Dynamic Project Details Fields */}
            {currentProject && (
              <>
                 {/* Client Name */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</span>
                  <div className="flex items-center gap-2 p-1 -ml-1 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">
                      <Building2 size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{currentProject.clientName}</span>
                    </div>
                  </div>
                </div>

                {/* Project Owner */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Owner</span>
                  <div className="flex items-center gap-2 p-1 -ml-1 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
                      <Crown size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">{currentProject.ownerName}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Description Textarea */}
          <div className="mb-8">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Description</span>
             <textarea
               value={task.description}
               onChange={(e) => updateTask({ ...task, description: e.target.value })}
               className="w-full text-gray-700 text-base leading-relaxed bg-white border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-md p-3 shadow-sm transition-all resize-none placeholder-gray-400"
               rows={6}
               placeholder="Add a description..."
             />
          </div>

          <div className="h-px bg-gray-200 w-full mb-8"></div>

          {/* Activity / Comments */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              Activity
            </h3>
            
            <div className="space-y-6">
              {task.comments.length === 0 && (
                <div className="text-center py-6 bg-slate-50 rounded-lg text-slate-400 text-sm">
                  No activity yet. Be the first to comment!
                </div>
              )}
              {task.comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {comment.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-400">{comment.createdAt.toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg rounded-tl-none">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Input (Sticky Bottom) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a question or post an update..."
                className="w-full border border-gray-300 bg-white rounded-lg pl-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button 
                onClick={handleAddComment}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-600 hover:text-brand-700 p-1"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
