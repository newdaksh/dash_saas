import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { Project } from '../types';
import { Search, Plus, Calendar, Layers, Building2, LayoutGrid, Check, ChevronDown, ArrowUpDown, User } from 'lucide-react';
import { Button } from '../components/Button';
import { ProjectPanel } from '../components/ProjectPanel';
import { CreateProjectModal } from '../components/CreateProjectModal';

export const ProjectList: React.FC = () => {
  const { user, projects, updateProject } = useApp();
  
  // Filter States
  const [statusFilters, setStatusFilters] = useState<string[]>([]); // Empty = All
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  
  // Sort State
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // UI States for custom dropdowns
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [quickStatusEditId, setQuickStatusEditId] = useState<string | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (quickStatusEditId && !(event.target as Element).closest('.status-trigger')) {
         setQuickStatusEditId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [quickStatusEditId]);


  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || null
  , [projects, selectedProjectId]);

  const uniqueOwners = useMemo(() => {
    const owners = new Set(projects.map(p => p.owner_name));
    return Array.from(owners);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!user) return [];
    
    let result = projects;

    // Multi-select Status Filter
    if (statusFilters.length > 0) {
      result = result.filter(p => statusFilters.includes(p.status));
    }

    // Owner Filter
    if (ownerFilter !== 'All') {
      result = result.filter(p => p.owner_name === ownerFilter);
    }

    // Client Name Filter (Searchable)
    if (clientFilter) {
      result = result.filter(p => p.client_name.toLowerCase().includes(clientFilter.toLowerCase()));
    }

    // General Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Sorting
    if (sortOrder) {
       result = [...result].sort((a, b) => {
          const dateA = new Date(a.due_date || '').getTime();
          const dateB = new Date(b.due_date || '').getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
       });
    }

    return result;
  }, [projects, user, statusFilters, ownerFilter, clientFilter, search, sortOrder]);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleQuickStatusUpdate = (e: React.MouseEvent, project: Project, newStatus: 'Active' | 'On Hold' | 'Archived') => {
    e.stopPropagation(); // Prevent card click
    updateProject({ ...project, status: newStatus });
    setQuickStatusEditId(null);
  };

  const toggleSort = () => {
     if (sortOrder === null) setSortOrder('asc');
     else if (sortOrder === 'asc') setSortOrder('desc');
     else setSortOrder(null);
  };

  const allStatuses = ['Active', 'On Hold', 'Archived'];

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
              {filteredProjects.length} {filteredProjects.length === 1 ? 'initiative' : 'initiatives'} found
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
          <div className="bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-[0_8px_32px_rgb(0,0,0,0.05)] flex flex-col xl:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Filter Group 1: Specific Filters */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              
              {/* Multi-select Status Filter */}
              <div className="relative" ref={statusDropdownRef}>
                <button 
                   onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                   className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all w-full sm:w-48 bg-white/50 hover:bg-white/80 ${isStatusDropdownOpen ? 'ring-2 ring-purple-500/50 border-transparent bg-white' : 'border-transparent'}`}
                >
                   <span className="truncate text-slate-700">
                      {statusFilters.length === 0 ? 'All Statuses' : `${statusFilters.length} Selected`}
                   </span>
                   <ChevronDown size={14} className="text-slate-400" />
                </button>
                
                {isStatusDropdownOpen && (
                   <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 animate-[fadeIn_0.1s_ease-out]">
                      {allStatuses.map(status => (
                         <div 
                           key={status} 
                           onClick={() => toggleStatusFilter(status)}
                           className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                         >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${statusFilters.includes(status) ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                               {statusFilters.includes(status) && <Check size={10} className="text-white" />}
                            </div>
                            <span className="text-sm text-slate-700">{status}</span>
                         </div>
                      ))}
                   </div>
                )}
              </div>

              {/* Owner Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <select 
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="appearance-none bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 block w-full sm:w-48 pl-10 pr-10 py-2.5 font-medium transition-all cursor-pointer outline-none shadow-sm"
                >
                  <option value="All">All Owners</option>
                  {uniqueOwners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Client Name Filter */}
              <div className="relative group flex-1">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Building2 size={16} />
                 </div>
                 <input 
                    type="text"
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    placeholder="Filter by Client..."
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white rounded-xl text-slate-700 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm transition-all"
                 />
              </div>

            </div>

             {/* Filter Group 2: Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
               {/* General Search */}
               <div className="relative group w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors text-slate-500">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  className="bg-white/50 hover:bg-white/80 border border-transparent focus:bg-white text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 block w-full pl-10 p-2.5 transition-all outline-none placeholder-slate-500 shadow-sm" 
                  placeholder="Keyword search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

               {/* Sort Button */}
               <button 
                  onClick={toggleSort}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all min-w-[140px] shadow-sm ${
                     sortOrder 
                     ? 'bg-purple-100 text-purple-700 border-purple-200' 
                     : 'bg-white/50 text-slate-600 hover:bg-white/80 border-transparent hover:text-slate-900'
                  }`}
               >
                  <ArrowUpDown size={16} />
                  {sortOrder === 'asc' ? 'Date: Oldest' : sortOrder === 'desc' ? 'Date: Newest' : 'Sort by Date'}
               </button>
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
                     <div className="flex justify-between items-start mb-4 relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 ${
                           project.status === 'Active' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-slate-500'
                        }`}>
                           <Layers size={24} />
                        </div>
                        
                        {/* Interactive Status Badge */}
                        <div className="relative status-trigger" onClick={(e) => e.stopPropagation()}>
                           <button 
                              onClick={() => setQuickStatusEditId(quickStatusEditId === project.id ? null : project.id)}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 hover:brightness-95 transition-all ${
                                 project.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                                 project.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                 'bg-slate-50 text-slate-600 border-slate-100'
                              }`}
                           >
                              {project.status}
                              <ChevronDown size={10} className="stroke-[3]" />
                           </button>

                           {/* Quick Status Dropdown */}
                           {quickStatusEditId === project.id && (
                              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-40 animate-[fadeIn_0.1s_ease-out]">
                                 {allStatuses.map(s => (
                                    <button
                                       key={s}
                                       onClick={(e) => handleQuickStatusUpdate(e, project, s as any)}
                                       className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors ${
                                          s === 'Active' ? 'text-green-700' : s === 'On Hold' ? 'text-amber-700' : 'text-slate-600'
                                       }`}
                                    >
                                       {s}
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>

                     <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">{project.name}</h3>
                     <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">{project.description}</p>

                     <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2 text-slate-600">
                              <Building2 size={16} className="text-slate-400" />
                              <span className="font-medium truncate max-w-[120px]">{project.client_name}</span>
                           </div>
                           <div className="text-slate-400 text-xs">Client</div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={16} className="text-slate-400" />
                              <span>{project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No date'}</span>
                           </div>
                           <div className="text-slate-400 text-xs">Due Date</div>
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
                <p className="text-slate-500 text-sm mt-1 mb-6">Try adjusting your filters.</p>
                <Button 
                  variant="outline" 
                  className="bg-white hover:bg-slate-50"
                  onClick={() => {
                     setSearch(''); 
                     setStatusFilters([]);
                     setOwnerFilter('All');
                     setClientFilter('');
                  }}
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