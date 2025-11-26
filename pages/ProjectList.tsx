
import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { Project } from '../types';
import { Search, Filter, Plus, Calendar, Layers, Building2, MoreHorizontal, LayoutGrid } from 'lucide-react';
import { Button } from '../components/Button';
import { ProjectPanel } from '../components/ProjectPanel';
import { CreateProjectModal } from '../components/CreateProjectModal';

export const ProjectList: React.FC = () => {
  const { user, projects } = useApp();
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'On Hold' | 'Archived'>('All');
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || null
  , [projects, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    if (!user) return [];
    
    let result = projects;

    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.clientName.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [projects, user, statusFilter, search]);

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      
      <div className="flex-1 flex flex-col space-y-6 relative z-10 p-1">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-purple-100/80 text-purple-700">
                 Projects
               </span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              All Projects
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'active initiative' : 'active initiatives'}
            </p>
          </div>
          
          <Button 
            variant="primary" 
            className="bg-purple-600/90 hover:bg-purple-600 backdrop-blur text-white shadow-xl shadow-purple-500/20 rounded-xl px-6 py-3 transition-all hover:scale-105 active:scale-95 border border-purple-400/30"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} className="mr-2 stroke-[2.5]" />
            New Project
          </Button>
        </div>

        {/* Floating Controls Bar */}
        <div className="sticky top-0 z-20 mx-1">
          <div className="bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-[0_8px_32px_rgb(0,0,0,0.05)] flex flex-col lg:flex-row gap-4 justify-between items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto p-1">
              {/* Status Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-600">
                  <Filter size={16} />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 block w-full sm:w-56 pl-10 pr-10 py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="All">All Projects</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Archived">Archived</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="w-full lg:w-80 p-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors text-slate-500 group-focus-within:text-purple-600">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  className="bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 block w-full pl-10 p-2.5 transition-all outline-none placeholder-slate-500 shadow-sm" 
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid View */}
        <div className="flex-1 animate-slide-up pb-12" style={{ animationDelay: '0.2s' }}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, idx) => (
                <div 
                  key={project.id} 
                  onClick={() => setSelectedProjectId(project.id)}
                  className="group relative bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  {/* Card Header Gradient */}
                  <div className={`h-2 w-full bg-gradient-to-r ${
                    project.status === 'Active' ? 'from-green-400 to-emerald-500' :
                    project.status === 'On Hold' ? 'from-amber-400 to-orange-500' :
                    'from-slate-300 to-slate-400'
                  }`} />

                  <div className="p-6 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 ${
                           project.status === 'Active' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-slate-500'
                        }`}>
                           <Layers size={24} />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                            project.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                            project.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {project.status}
                        </span>
                     </div>

                     <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">{project.name}</h3>
                     <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">{project.description}</p>

                     <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2 text-slate-600">
                              <Building2 size={16} className="text-slate-400" />
                              <span className="font-medium">{project.clientName}</span>
                           </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={16} className="text-slate-400" />
                              <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300/50">
                <div className="bg-white p-6 rounded-full mb-4 shadow-lg animate-float">
                   <LayoutGrid size={40} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No projects found</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">Create a new project to get started.</p>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-slate-50"
                  onClick={() => {setSearch(''); setStatusFilter('All');}}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Slide-over */}
      <ProjectPanel 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProjectId(null)} 
      />

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};
