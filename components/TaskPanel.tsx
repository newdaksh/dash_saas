
import React, { useEffect, useMemo, useState } from 'react';
import { Task, Status, Priority, Comment, Collaborator, TaskHistory, HistoryActionType } from '../types';
import { X, Calendar, CheckCircle2, AlertCircle, MessageSquare, Send, ChevronDown, Building2, Crown, Trash2, AlertTriangle, Save, Briefcase, Users, History, Clock, ArrowRight, Edit3, UserPlus, Flag, FileText, Layers } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../context';
import { commentAPI, taskAPI } from '../services/api';
import { websocketService, WebSocketEventType } from '../services/websocket';

// Helper function to get action icon and color
const getHistoryActionDetails = (action: HistoryActionType): { icon: React.ReactNode; color: string; label: string } => {
  switch (action) {
    case 'created':
      return { icon: <CheckCircle2 size={14} />, color: 'text-green-600 bg-green-50', label: 'Created' };
    case 'status_changed':
      return { icon: <Flag size={14} />, color: 'text-blue-600 bg-blue-50', label: 'Status changed' };
    case 'priority_changed':
      return { icon: <AlertCircle size={14} />, color: 'text-orange-600 bg-orange-50', label: 'Priority changed' };
    case 'assignee_changed':
      return { icon: <UserPlus size={14} />, color: 'text-purple-600 bg-purple-50', label: 'Assignee changed' };
    case 'due_date_changed':
      return { icon: <Calendar size={14} />, color: 'text-indigo-600 bg-indigo-50', label: 'Due date changed' };
    case 'project_changed':
      return { icon: <Layers size={14} />, color: 'text-teal-600 bg-teal-50', label: 'Project changed' };
    case 'title_changed':
      return { icon: <Edit3 size={14} />, color: 'text-slate-600 bg-slate-50', label: 'Title changed' };
    case 'description_changed':
      return { icon: <FileText size={14} />, color: 'text-slate-600 bg-slate-50', label: 'Description changed' };
    case 'collaborators_changed':
      return { icon: <Users size={14} />, color: 'text-cyan-600 bg-cyan-50', label: 'Collaborators changed' };
    default:
      return { icon: <Edit3 size={14} />, color: 'text-slate-600 bg-slate-50', label: 'Updated' };
  }
};

interface TaskPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  viewOnly?: boolean; // When true, only status changes are allowed
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ task, isOpen, onClose, viewOnly = false }) => {
  const { user, updateTask, deleteTask, projects, users } = useApp();
  const [commentText, setCommentText] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Local form state for editing (completely independent of API calls)
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Memoized values - must be called before any conditional returns
  const currentProject = useMemo(() => {
    if (!localTask) return undefined;
    return projects.find(p => p.id === localTask.project_id);
  }, [projects, localTask?.project_id]);

  const isOverdue = useMemo(() => {
    if (!localTask) return false;
    return !!(localTask.due_date && new Date(localTask.due_date) < new Date() && localTask.status !== Status.DONE);
  }, [localTask?.due_date, localTask?.status]);

  // Initialize local state when task changes
  useEffect(() => {
    if (task) {
      setLocalTask({ ...task });
      setHasChanges(false);
      setShowHistory(false); // Reset history view when task changes
      setHistory([]); // Clear previous history
    }
  }, [task]);

  // Load comments when task changes
  useEffect(() => {
    if (!task) return;
    let mounted = true;
    (async () => {
      try {
        const data = await commentAPI.getByTask(task.id);
        if (mounted) setComments(data);
      } catch (e) {
        // fail silently in panel
      }
    })();
    return () => { mounted = false; };
  }, [task?.id]);

  // Load history when showHistory is toggled
  useEffect(() => {
    if (!task || !showHistory) return;
    let mounted = true;
    setHistoryLoading(true);
    (async () => {
      try {
        const data = await taskAPI.getHistory(task.id);
        if (mounted) setHistory(data.history || []);
      } catch (e) {
        console.error('Failed to load history:', e);
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [task?.id, showHistory]);

  // WebSocket listener for real-time history updates
  useEffect(() => {
    if (!task) return;
    
    const unsubscribe = websocketService.on(WebSocketEventType.TASK_HISTORY_UPDATED, (message) => {
      // Only update if this is for the current task and history is visible
      if (message.payload?.task_id === task.id && showHistory) {
        const newHistoryEntry = message.payload.history_entry;
        setHistory(prev => [newHistoryEntry, ...prev]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [task?.id, showHistory]);

  // Guard - AFTER all hooks
  if (!task || !user || !localTask) return null;

  // Update local state without API call
  const updateLocalTask = (updates: Partial<Task>) => {
    setLocalTask(prev => prev ? { ...prev, ...updates } : null);
    setHasChanges(true);
  };

  // Save all changes to API
  const handleSave = async () => {
    if (!localTask || !hasChanges) return;
    
    setIsSaving(true);
    try {
      await updateTask(localTask);
      setHasChanges(false);
      // Refresh history after saving to show new changes
      if (showHistory) {
        const data = await taskAPI.getHistory(localTask.id);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setLocalTask({ ...task });
    setHasChanges(false);
  };

  // In view-only mode, status changes are saved immediately
  const handleStatusChange = async () => {
    const nextStatus = localTask.status === Status.DONE ? Status.TODO : Status.DONE;
    if (viewOnly) {
      // Save immediately in view-only mode
      await updateTask({ ...localTask, status: nextStatus });
      setLocalTask(prev => prev ? { ...prev, status: nextStatus } : null);
      // Refresh history after status change
      if (showHistory) {
        const data = await taskAPI.getHistory(localTask.id);
        setHistory(data.history || []);
      }
    } else {
      updateLocalTask({ status: nextStatus });
    }
  };

  // Handle status change from dropdown - also saves immediately in view-only mode
  const handleStatusDropdownChange = async (newStatus: Status) => {
    if (viewOnly) {
      // Save immediately in view-only mode
      await updateTask({ ...localTask, status: newStatus });
      setLocalTask(prev => prev ? { ...prev, status: newStatus } : null);
      // Refresh history after status change
      if (showHistory) {
        const data = await taskAPI.getHistory(localTask.id);
        setHistory(data.history || []);
      }
    } else {
      updateLocalTask({ status: newStatus });
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const created = await commentAPI.create(task.id, commentText.trim());
      setComments(prev => [...prev, created]);
      setCommentText('');
    } catch (_) {}
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const project_id = e.target.value || undefined;
    const project = projects.find(p => p.id === project_id);
    updateLocalTask({ 
        project_id, 
        project_name: project?.name 
    });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      updateLocalTask({
        assignee_id: selectedUser.id,
        assignee_name: selectedUser.name,
        assignee_avatar: selectedUser.avatar_url
      });
    }
  };

  // Safe date conversion for input value (YYYY-MM-DD)
  const dateInputValue = localTask.due_date ? new Date(localTask.due_date).toISOString().split('T')[0] : '';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose}
          aria-label="Close task panel backdrop"
          role="button"
        />
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-live="polite"
      >
        {/* Delete Confirmation Overlay */}
        {isDeleteConfirmOpen && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
                <div className="max-w-sm text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Delete this Task?</h3>
                    <p className="text-slate-500 mb-6">Are you sure you want to delete <span className="font-semibold text-slate-800">"{task.title}"</span>? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete Task</Button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Button 
            variant={localTask.status === Status.DONE ? "ghost" : "outline"}
            className={`flex items-center gap-2 ${localTask.status === Status.DONE ? 'text-green-600 bg-green-50' : ''}`}
            onClick={handleStatusChange}
          >
            <CheckCircle2 size={18} className={localTask.status === Status.DONE ? 'fill-green-600 text-white' : ''} />
            {localTask.status === Status.DONE ? 'Completed' : 'Mark Complete'}
          </Button>
          <div className="flex items-center gap-2">
            {/* Save/Discard buttons when there are changes - hidden in view-only mode */}
            {!viewOnly && hasChanges && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDiscard}
                  className="text-sm"
                >
                  Discard
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 text-sm"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
            {!viewOnly && (
              <button 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-400 transition-colors"
                  title="Delete Task"
              >
                <Trash2 size={20} />
              </button>
            )}
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              title="Close"
              aria-label="Close task panel"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Unsaved Changes Banner - hidden in view-only mode */}
        {!viewOnly && hasChanges && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-sm">
            <AlertCircle size={16} />
            <span>You have unsaved changes</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Overdue Banner */}
          {isOverdue && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3 animate-pulse">
              <AlertCircle className="text-red-600 mt-0.5 shrink-0" size={18} />
              <div>
                 <h4 className="text-sm font-bold text-red-900">Overdue</h4>
                 <p className="text-sm text-red-700 mt-0.5">This task was due on {localTask.due_date ? new Date(localTask.due_date).toLocaleDateString() : ''}. Please update the status or due date.</p>
              </div>
            </div>
          )}

          {/* View-Only Mode Banner */}
          {viewOnly && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-blue-700 text-sm">
              <AlertCircle size={16} />
              <span>View-only mode. You can only change the task status.</span>
            </div>
          )}

          {/* Project Breadcrumb / Selector */}
          <div className="mb-4 flex items-center gap-2 group">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-500">Project</span>
            {viewOnly ? (
              <span className="text-sm text-brand-600 font-medium pl-1">
                {localTask.project_name || 'No Project'}
              </span>
            ) : (
              <div className="relative">
                <select 
                  value={localTask.project_id || ''} 
                  onChange={handleProjectChange}
                  className="appearance-none bg-transparent text-sm text-brand-600 font-medium hover:text-brand-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded pl-1 pr-6 py-0.5 transition-colors"
                  aria-label="Select project"
                >
                  <option value="" className="bg-white text-slate-700">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="bg-white text-slate-700">{p.name}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-brand-600 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Title Input - read-only in view mode */}
          {viewOnly ? (
            <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {localTask.title}
            </h2>
          ) : (
            <input 
              type="text"
              value={localTask.title}
              onChange={(e) => updateLocalTask({ title: e.target.value })}
              className="text-3xl font-bold text-gray-900 mb-6 leading-tight w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-300 transition-colors hover:bg-gray-50/50 rounded"
              placeholder="Task Title"
            />
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
            
            {/* Company - shows which company this task belongs to */}
            {localTask.company_name && (
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</span>
                <div className="flex items-center gap-2 p-1 -ml-1 rounded-md bg-purple-50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    <Briefcase size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-purple-700">{localTask.company_name}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Assignee - read-only in view mode */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assignee</span>
                <div className="relative group">
                    <div className={`flex items-center gap-2 p-1 -ml-1 rounded-md transition-colors ${!viewOnly ? 'hover:bg-slate-50 cursor-pointer' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-white ring-2 ring-gray-50">
                    {localTask.assignee_avatar ? (
                      <img src={localTask.assignee_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                      (localTask.assignee_name || '').charAt(0)
                        )}
                        </div>
                        <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {localTask.assignee_name}
                            {!viewOnly && <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600" />}
                        </span>
                        </div>
                    </div>
                    {/* Invisible select overlay for interaction - disabled in view mode */}
                    {!viewOnly && (
                      <select
                        value={localTask.assignee_id}
                        onChange={handleAssigneeChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full bg-white text-slate-900"
                        aria-label="Select assignee"
                      >
                          <optgroup label="Team Members" className="bg-white text-slate-900">
                              {users.map(u => (
                                  <option key={u.id} value={u.id} className="bg-white text-slate-900">{u.name}</option>
                              ))}
                          </optgroup>
                      </select>
                    )}
                </div>
            </div>

            {/* Collaborators Section */}
            <div className="flex flex-col gap-1 col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Users size={12} />
                Collaborators
                {(localTask.collaborators?.length || 0) > 0 && (
                  <span className="text-xs bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full">
                    {localTask.collaborators?.length}
                  </span>
                )}
              </span>
              
              {viewOnly ? (
                // View-only mode: just show collaborator names
                <div className="flex flex-wrap gap-2 p-1 -ml-1">
                  {(localTask.collaborators?.length || 0) === 0 ? (
                    <span className="text-sm text-slate-400 italic">No collaborators</span>
                  ) : (
                    localTask.collaborators?.map(collab => (
                      <div key={collab.user_id} className="flex items-center gap-2 bg-slate-50 rounded-full px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                          {collab.user_avatar ? (
                            <img src={collab.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            collab.user_name.charAt(0)
                          )}
                        </div>
                        <span className="text-sm text-slate-600">{collab.user_name}</span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Edit mode: show checkboxes to add/remove collaborators
                <div className="border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1 bg-slate-50/50">
                  {users.filter(u => u.id !== localTask.assignee_id).length === 0 ? (
                    <span className="text-sm text-slate-400 italic p-1">No other team members available</span>
                  ) : (
                    users.filter(u => u.id !== localTask.assignee_id).map(potentialCollab => {
                      const isSelected = localTask.collaborators?.some(c => c.user_id === potentialCollab.id) || false;
                      return (
                        <label
                          key={potentialCollab.id}
                          className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-white border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const currentCollabs = localTask.collaborators || [];
                              if (isSelected) {
                                // Remove collaborator
                                updateLocalTask({
                                  collaborators: currentCollabs.filter(c => c.user_id !== potentialCollab.id)
                                });
                              } else {
                                // Add collaborator
                                updateLocalTask({
                                  collaborators: [...currentCollabs, {
                                    user_id: potentialCollab.id,
                                    user_name: potentialCollab.name,
                                    user_avatar: potentialCollab.avatar_url
                                  }]
                                });
                              }
                            }}
                            className="w-3.5 h-3.5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                          />
                          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px] shrink-0">
                            {potentialCollab.avatar_url ? (
                              <img src={potentialCollab.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              potentialCollab.name.charAt(0)
                            )}
                          </div>
                          <span className="text-sm text-slate-600 truncate">{potentialCollab.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Due Date Input - read-only in view mode */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</span>
              <div className={`flex items-center gap-2 p-1 -ml-1 text-sm text-gray-700 group rounded transition-colors relative ${!viewOnly ? 'hover:bg-slate-50 cursor-pointer' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center pointer-events-none ${
                   !localTask.due_date ? 'bg-gray-100 text-gray-400' :
                   isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-brand-600'
                 }`}>
                   <Calendar size={16} />
                 </div>
                 {/* Native date picker with styling - read-only in view mode */}
                 {viewOnly ? (
                   <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                     {localTask.due_date ? new Date(localTask.due_date).toLocaleDateString() : 'No due date'}
                   </span>
                 ) : (
                   <input 
                     type="date"
                     value={dateInputValue}
                     onChange={(e) => updateLocalTask({ due_date: e.target.value || null })}
                     className={`bg-transparent border-none p-0 focus:ring-0 text-sm font-medium cursor-pointer w-full ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}
                     title="Select due date"
                     placeholder="Select due date"
                   />
                 )}
              </div>
            </div>

            {/* Priority Selector - read-only in view mode */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</span>
              <div className="flex items-center gap-2 p-1 -ml-1">
                {viewOnly ? (
                  <span className={`pl-3 pr-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${
                    localTask.priority === Priority.HIGH ? 'bg-red-50 text-red-700 border-red-200' :
                    localTask.priority === Priority.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {localTask.priority}
                  </span>
                ) : (
                  <div className="relative">
                    <select
                      value={localTask.priority}
                      onChange={(e) => updateLocalTask({ priority: e.target.value as Priority })}
                      className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors uppercase tracking-wide ${
                        localTask.priority === Priority.HIGH ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                        localTask.priority === Priority.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' :
                        'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                      aria-label="Select priority"
                    >
                      {Object.values(Priority).map(p => (
                        <option key={p} value={p} className="bg-white text-slate-900">{p}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                       localTask.priority === Priority.HIGH ? 'text-red-700' :
                       localTask.priority === Priority.MEDIUM ? 'text-yellow-700' :
                       'text-blue-700'
                    }`} />
                  </div>
                )}
              </div>
            </div>

             {/* Status Selector - always enabled (users can change status) */}
             <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Status</span>
              <div className="flex items-center gap-2 p-1 -ml-1">
                 <div className="relative w-full">
                    <select
                      value={localTask.status}
                      onChange={(e) => handleStatusDropdownChange(e.target.value as Status)}
                      className="appearance-none w-full bg-white border border-slate-200 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block px-3 py-1.5 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                      aria-label="Select status"
                    >
                      {Object.values(Status).map(s => (
                        <option key={s} value={s} className="bg-white text-slate-900">{s}</option>
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
                      <span className="text-sm font-medium text-gray-700">{currentProject.client_name}</span>
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
                      <span className="text-sm font-medium text-gray-700">{currentProject.owner_name}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Description Textarea - read-only in view mode */}
          <div className="mb-8 relative">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Description</span>
             {viewOnly ? (
               <div className="w-full text-gray-700 text-base leading-relaxed bg-gray-50 border border-slate-200 rounded-md p-3 min-h-[150px]">
                 {localTask.description || <span className="text-gray-400 italic">No description provided</span>}
               </div>
             ) : (
               <textarea
                 value={localTask.description}
                 onChange={(e) => updateLocalTask({ description: e.target.value })}
                 className="w-full text-gray-700 text-base leading-relaxed bg-white border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-md p-3 shadow-sm transition-all resize-none placeholder-gray-400"
                 rows={6}
                 placeholder="Add a description..."
               />
             )}
          </div>

          <div className="h-px bg-gray-200 w-full mb-8"></div>

          {/* Activity / Comments */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              Activity
            </h3>
            
            <div className="space-y-6">
              {comments.length === 0 && (
                <div className="text-center py-6 bg-slate-50 rounded-lg text-slate-400 text-sm">
                  No activity yet. Be the first to comment!
                </div>
              )}
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {comment.user_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{comment.user_name}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg rounded-tl-none">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full mb-8"></div>

          {/* Task History Section */}
          <div className="mb-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between font-semibold text-gray-900 mb-4 hover:text-brand-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History size={18} />
                <span>History</span>
                <span className="text-xs text-gray-400 font-normal">(All changes with IST timestamps)</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showHistory && (
              <div className="space-y-4 animate-fade-in">
                {historyLoading ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <span className="text-slate-500 text-sm">Loading history...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-lg text-slate-400 text-sm">
                    No history recorded yet.
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                    
                    <div className="space-y-4">
                      {history.map((entry, index) => {
                        const { icon, color, label } = getHistoryActionDetails(entry.action);
                        return (
                          <div key={entry.id} className="relative flex gap-4 pl-1">
                            {/* Timeline dot */}
                            <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                              {icon}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 pb-4">
                              <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-[10px]">
                                      {entry.user_avatar ? (
                                        <img src={entry.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        entry.user_name.charAt(0)
                                      )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{entry.user_name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock size={12} />
                                    <span>{entry.created_at_ist}</span>
                                  </div>
                                </div>
                                
                                {/* Action description */}
                                <div className="text-sm text-gray-600">
                                  {entry.action === 'created' ? (
                                    <span>Created this task: <span className="font-medium text-gray-900">"{entry.new_value}"</span></span>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-1">
                                      <span>{label}:</span>
                                      {entry.old_value && (
                                        <>
                                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium line-through">
                                            {String(entry.old_value)}
                                          </span>
                                          <ArrowRight size={12} className="text-gray-400" />
                                        </>
                                      )}
                                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                                        {String(entry.new_value)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input (Sticky Bottom) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 shrink-0 flex items-center justify-center text-white font-bold text-xs">
              {(user.name || '').charAt(0)}
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
                aria-label="Send comment"
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
