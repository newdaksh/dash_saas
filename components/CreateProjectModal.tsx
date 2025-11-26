import React, { useState } from 'react';
import { X, Calendar, Layers, Building2 } from 'lucide-react';
import { useApp } from '../context';
import { Project } from '../types';
import { Button } from './Button';
import { Input } from './Input';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, user } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      status: 'Active',
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      ownerId: user.id,
      ownerName: user.name,
      clientName: clientName || 'Internal'
    };

    addProject(newProject);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setClientName('');
    setDueDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-[slideUp_0.4s_ease-out] relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>

        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start bg-gradient-to-b from-slate-50/80 to-white">
          <div>
            <h3 className="font-bold text-slate-800 text-xl tracking-tight">Create New Project</h3>
            <p className="text-xs text-slate-500 mt-1">Start a new initiative and track its progress.</p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div className="space-y-4">
             <Input
               label="Project Name"
               value={name}
               onChange={e => setName(e.target.value)}
               placeholder="e.g. Website Redesign"
               required
               autoFocus
               className="text-lg font-medium"
             />
             
             <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                 <Layers size={14} className="text-purple-500" />
                 Description
               </label>
               <textarea
                 className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 min-h-[100px] resize-none bg-white transition-colors"
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 placeholder="What is this project about?"
                 required
               />
             </div>

             <div className="grid grid-cols-2 gap-5">
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <Building2 size={14} className="text-purple-500" />
                   Client Name
                 </label>
                 <Input 
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                 />
               </div>
               
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                   <Calendar size={14} className="text-purple-500" />
                   Target Due Date
                 </label>
                 <input
                   type="date"
                   className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white transition-colors text-slate-600"
                   value={dueDate}
                   onChange={e => setDueDate(e.target.value)}
                   required
                 />
               </div>
             </div>
           </div>

           <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/30 -mx-6 px-6 -mb-6 pb-6 mt-2">
             <Button type="button" variant="ghost" onClick={handleClose} className="hover:bg-slate-100 text-slate-500">Cancel</Button>
             <Button type="submit" className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 shadow-lg shadow-purple-500/20">Create Project</Button>
           </div>
        </form>
      </div>
    </div>
  );
};