import React, { useState } from 'react';
import { Task, Status, Priority, Comment } from '../types';
import { X, Calendar, User, CheckCircle2, Circle, AlertCircle, MessageSquare, Paperclip, Send } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../context';

interface TaskPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ task, isOpen, onClose }) => {
  const { user, updateTask } = useApp();
  const [commentText, setCommentText] = useState('');

  if (!task || !user) return null;

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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
          
          {/* Project Breadcrumb */}
          {task.projectName && (
            <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">Project</span>
              <span>{task.projectName}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{task.title}</h1>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
            
            {/* Assignee */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assignee</span>
              <div className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded-md transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-white ring-2 ring-gray-50">
                   {task.assigneeAvatar ? (
                      <img src={task.assigneeAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                   ) : (
                      task.assigneeName.charAt(0)
                   )}
                </div>
                <span className="text-sm font-medium text-gray-700">{task.assigneeName}</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</span>
              <div className="flex items-center gap-2 p-1 -ml-1 text-sm text-gray-700">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.dueDate ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Calendar size={16} />
                </div>
                <span>{task.dueDate ? task.dueDate.toLocaleDateString() : 'No Due Date'}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</span>
              <div className="flex items-center gap-2 p-1 -ml-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  task.priority === Priority.HIGH ? 'bg-red-50 text-red-700 border-red-200' :
                  task.priority === Priority.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>

             {/* Status */}
             <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Status</span>
              <div className="flex items-center gap-2 p-1 -ml-1 text-sm font-medium text-gray-700">
                {task.status}
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="mb-8">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Description</span>
             <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
               {task.description || "No description provided."}
             </div>
          </div>

          <div className="h-px bg-gray-200 w-full mb-8"></div>

          {/* Activity / Comments */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              Activity
            </h3>
            
            <div className="space-y-6">
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
                className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
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