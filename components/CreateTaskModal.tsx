import React, { useState } from 'react';
import { X, Calendar, Flag, Layers, AlignLeft } from 'lucide-react';
import { useApp } from '../context';
import { Task, Status, Priority } from '../types';
import { Button } from './Button';
import { Input } from './Input';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, user, projects } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProject = projects.find(p => p.id === projectId);

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: Status.TODO,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: user.id, // Assign to self by default
      assigneeName: user.name,
      assigneeAvatar: user.avatarUrl,
      creatorId: user.id,
      projectId: selectedProject?.id,
      projectName: selectedProject?.name,
      comments: []
    };

    addTask(newTask);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setPriority(Priority.MEDIUM);
    setDueDate('');
    setProjectId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-[slideUp_0.4s_ease-out] relative"
      >
        {/* Gradient Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"></div>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start bg-gradient-to-b from-slate-50/80 to-white">
          <div>
            <h3 className="font-bold text-slate-800 text-xl tracking-tight">Create New Task</h3>
            <p className="text-xs text-slate-500 mt-1">Fill in the details to add a new task to your board.</p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div className="space-y-4">
             <Input
               label="Task Title"
               value={title}
               onChange={e => setTitle(e.target.value)}
               placeholder="What needs to be done?"
               required
               autoFocus
               className="text-lg font-medium"
             />
             
             <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                 <AlignLeft size={14} className="text-brand-500" />
                 Description
               </label>
               <textarea
                 className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 min-h-[100px] resize-none bg-white transition-colors"
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 placeholder="Add context, requirements, or acceptance criteria..."
               />
             </div>

             <div className="grid grid-cols-2 gap-5">
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <Flag size={14} className="text-brand-500" />
                   Priority
                 </label>
                 <div className="relative">
                   <select
                     className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 bg-white transition-colors cursor-pointer"
                     value={priority}
                     onChange={e => setPriority(e.target.value as Priority)}
                   >
                     {Object.values(Priority).map(p => (
                       <option key={p} value={p}>{p}</option>
                     ))}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                     <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </div>
                 </div>
               </div>
               
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <Calendar size={14} className="text-brand-500" />
                   Due Date
                 </label>
                 <input
                   type="date"
                   className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 bg-white transition-colors text-slate-600"
                   value={dueDate}
                   onChange={e => setDueDate(e.target.value)}
                 />
               </div>
             </div>

             <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                 <Layers size={14} className="text-brand-500" />
                 Project
               </label>
               <div className="relative">
                 <select
                   className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 bg-white transition-colors cursor-pointer"
                   value={projectId}
                   onChange={e => setProjectId(e.target.value)}
                 >
                   <option value="">No Project (Personal Task)</option>
                   {projects.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                   ))}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
               </div>
             </div>
           </div>

           <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/30 -mx-6 px-6 -mb-6 pb-6 mt-2">
             <Button type="button" variant="ghost" onClick={handleClose} className="hover:bg-slate-100 text-slate-500">Cancel</Button>
             <Button type="submit" className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-shadow">Create Task</Button>
           </div>
        </form>
      </div>
    </div>
  );
};