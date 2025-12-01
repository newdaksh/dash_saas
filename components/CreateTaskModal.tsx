
import React, { useState } from 'react';
import { X, Calendar, Flag, Layers, AlignLeft, Users } from 'lucide-react';
import { useApp } from '../context';
import { Task, Status, Priority } from '../types';
import { Button } from './Button';
import { Input } from './Input';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, user, projects, users } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>([]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Partial<Task> & { collaborator_ids?: string[] } = {
      title,
      description,
      status: Status.TODO,
      priority,
      due_date: dueDate || null,
      assignee_id: user.id, // Assign to self by default
      project_id: projectId || undefined,
      collaborator_ids: selectedCollaboratorIds.length > 0 ? selectedCollaboratorIds : undefined
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
    setSelectedCollaboratorIds([]);
    onClose();
  };

  const toggleCollaborator = (userId: string) => {
    setSelectedCollaboratorIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Filter out current user from collaborator options
  const availableCollaborators = users.filter(u => u.id !== user.id);

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
                       <option key={p} value={p} className="bg-white text-slate-900">{p}</option>
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
                   className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 bg-white transition-colors text-slate-600 cursor-pointer"
                   value={dueDate}
                   onChange={e => setDueDate(e.target.value)}
                   onClick={(e) => e.currentTarget.showPicker()}
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
                   <option value="" className="bg-white text-slate-900">No Project (Personal Task)</option>
                   {projects.map(p => (
                     <option key={p.id} value={p.id} className="bg-white text-slate-900">{p.name}</option>
                   ))}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
               </div>
             </div>

             {/* Collaborators Section */}
             {availableCollaborators.length > 0 && (
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <Users size={14} className="text-brand-500" />
                   Collaborators
                   {selectedCollaboratorIds.length > 0 && (
                     <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full">
                       {selectedCollaboratorIds.length} selected
                     </span>
                   )}
                 </label>
                 <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 bg-slate-50/50">
                   {availableCollaborators.map(collaborator => (
                     <label
                       key={collaborator.id}
                       className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                         selectedCollaboratorIds.includes(collaborator.id)
                           ? 'bg-brand-50 border border-brand-200'
                           : 'hover:bg-white border border-transparent'
                       }`}
                     >
                       <input
                         type="checkbox"
                         checked={selectedCollaboratorIds.includes(collaborator.id)}
                         onChange={() => toggleCollaborator(collaborator.id)}
                         className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                       />
                       <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                         {collaborator.avatar_url ? (
                           <img src={collaborator.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                         ) : (
                           collaborator.name.charAt(0)
                         )}
                       </div>
                       <div className="flex flex-col min-w-0">
                         <span className="text-sm font-medium text-slate-700 truncate">{collaborator.name}</span>
                         <span className="text-xs text-slate-500 truncate">{collaborator.email}</span>
                       </div>
                     </label>
                   ))}
                 </div>
                 <p className="text-xs text-slate-500">
                   Select team members to collaborate on this task
                 </p>
               </div>
             )}
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
