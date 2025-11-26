import React, { useMemo } from 'react';
import { Project, Status, Priority } from '../types';
import { X, Calendar, Building2, Crown, ChevronDown, CheckCircle2, Circle, ArrowUpRight } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../context';

interface ProjectPanelProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectPanel: React.FC<ProjectPanelProps> = ({ project, isOpen, onClose }) => {
  const { user, updateProject, tasks } = useApp();

  // Filter tasks belonging to this project
  const projectTasks = useMemo(() => {
    if (!project) return [];
    return tasks.filter(t => t.projectId === project.id);
  }, [tasks, project]);

  if (!project || !user) return null;

  const projectStatusOptions = ['Active', 'On Hold', 'Archived'];

  // Safe date conversion
  const dateInputValue = project.dueDate ? new Date(project.dueDate.getTime() - (project.dueDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';

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
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[700px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header - Distinct Purple Gradient for Projects */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-white text-purple-600 rounded-xl shadow-sm border border-purple-100">
                <Building2 size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Project Overview</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                     {project.clientName}
                   </span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:shadow-sm rounded-full text-gray-400 hover:text-gray-600 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Title Input */}
          <div className="mb-8 group">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Name</label>
             <input 
                type="text"
                value={project.name}
                onChange={(e) => updateProject({ ...project, name: e.target.value })}
                className="text-3xl font-black text-gray-900 leading-tight w-full bg-transparent border-b-2 border-transparent hover:border-gray-100 focus:border-purple-500 p-0 pb-2 focus:ring-0 focus:outline-none placeholder-gray-300 transition-colors rounded-none"
             />
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
              <div className="relative">
                <select
                    value={project.status}
                    onChange={(e) => updateProject({ ...project, status: e.target.value as any })}
                    className={`appearance-none w-full pl-3 pr-8 py-2 rounded-lg text-sm font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors uppercase tracking-wide bg-white shadow-sm ${
                    project.status === 'Active' ? 'text-green-700 border-green-200' :
                    project.status === 'On Hold' ? 'text-amber-700 border-amber-200' :
                    'text-slate-700 border-slate-200'
                    }`}
                >
                    {projectStatusOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Client */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</span>
              <div className="flex items-center gap-2">
                 <Building2 size={16} className="text-gray-400" />
                 <input 
                   value={project.clientName}
                   onChange={(e) => updateProject({...project, clientName: e.target.value})}
                   className="bg-white border border-gray-200 rounded-md px-2 py-1.5 text-sm font-medium text-gray-800 w-full focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                 />
              </div>
            </div>

            {/* Owner */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Owner</span>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-1.5">
                 <Crown size={16} className="text-amber-500" />
                 <span className="text-sm font-medium text-gray-800">{project.ownerName}</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</span>
              <div className="flex items-center gap-2 relative">
                 <div className="absolute left-2 pointer-events-none text-gray-400">
                    <Calendar size={16} />
                 </div>
                 <input 
                   type="date"
                   value={dateInputValue}
                   onChange={(e) => updateProject({ ...project, dueDate: e.target.value ? new Date(e.target.value) : new Date() })}
                   className="bg-white border border-gray-200 rounded-md pl-8 pr-2 py-1.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-800 cursor-pointer w-full"
                 />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">Description</span>
             <textarea
               value={project.description}
               onChange={(e) => updateProject({ ...project, description: e.target.value })}
               className="w-full text-gray-700 text-base leading-relaxed bg-white border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 rounded-xl p-4 transition-all resize-none placeholder-gray-400 shadow-sm"
               rows={4}
             />
          </div>

          {/* Associated Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                 <CheckCircle2 className="text-purple-600" size={20} />
                 Project Tasks
               </h3>
               <span className="text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full">{projectTasks.length} Tasks</span>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[120px]">
               {projectTasks.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-24 text-center">
                    <p className="text-slate-400 text-sm">No tasks assigned to this project yet.</p>
                 </div>
               ) : (
                 projectTasks.map(task => (
                   <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-purple-200 group cursor-default">
                      <div className={task.status === Status.DONE ? "text-green-500" : "text-slate-300"}>
                        {task.status === Status.DONE ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className={`text-sm font-semibold truncate ${task.status === Status.DONE ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.title}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                               <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">{task.assigneeName.charAt(0)}</div>
                               {task.assigneeName}
                            </span>
                            <span className={`text-[10px] px-1.5 rounded-full ${
                                task.priority === Priority.HIGH ? 'bg-red-50 text-red-600' :
                                task.priority === Priority.MEDIUM ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}>{task.priority}</span>
                         </div>
                      </div>
                      <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                         {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : ''}
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};