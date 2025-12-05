import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Flag, Layers, AlignLeft, Users, Building2, ChevronDown, CheckCircle2, Briefcase, Crown, MessageSquare, History } from 'lucide-react';
import { useApp } from '../context';
import { Task, Status, Priority, Project, User } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { projectAPI, userAPI } from '../services/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, user, projects: allProjects, users: allUsers } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>(Status.TODO);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');

  // Local state for fetched data
  const [fetchedProjects, setFetchedProjects] = useState<Project[]>([]);
  const [fetchedUsers, setFetchedUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (isOpen && user) {
      setTitle('');
      setDescription('');
      setPriority(Priority.MEDIUM);
      setDueDate('');
      setProjectId('');
      setSelectedCollaboratorIds([]);
      setStatus(Status.TODO);
      setAssigneeId(user.id);

      // Default to user's current company if available, or first company
      if (user.current_company_id) {
        setSelectedCompanyId(user.current_company_id);
      } else if (user.company_ids && user.company_ids.length > 0) {
        setSelectedCompanyId(user.company_ids[0]);
      } else {
        setSelectedCompanyId('');
      }
    }
  }, [isOpen, user]);

  // Fetch data when company changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCompanyId) {
        setFetchedProjects([]);
        setFetchedUsers([]);
        return;
      }

      setIsLoadingData(true);
      try {
        // Fetch projects for selected company
        const projectsData = await projectAPI.getAll({ company_id: selectedCompanyId });
        setFetchedProjects(projectsData);

        // Fetch users for selected company
        const usersData = await userAPI.getAll({ company_id: selectedCompanyId });
        setFetchedUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [selectedCompanyId]);

  // Filter collaborators based on selected company (exclude selected assignee)
  const filteredCollaborators = useMemo(() => {
    if (!selectedCompanyId) return [];
    return fetchedUsers.filter(u => u.id !== assigneeId);
  }, [fetchedUsers, selectedCompanyId, assigneeId]);

  // Remove assignee from collaborators if selected
  useEffect(() => {
    if (selectedCollaboratorIds.includes(assigneeId)) {
      setSelectedCollaboratorIds(prev => prev.filter(id => id !== assigneeId));
    }
  }, [assigneeId, selectedCollaboratorIds]);

  // Handle Company Change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    if (!companyId) {
      // Individual Mode
      setProjectId('');
      setSelectedCollaboratorIds([]);
      setAssigneeId(user?.id || '');
    } else {
      // Company Mode - Reset project
      setProjectId('');
      setSelectedCollaboratorIds([]);
      // Reset assignee to self initially, but allow picking from fetched users later
      setAssigneeId(user?.id || '');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    const newTask: Partial<Task> & { collaborator_ids?: string[] } = {
      title,
      description,
      status,
      priority,
      due_date: dueDate || null,
      assignee_id: assigneeId,
      project_id: projectId || null,
      collaborator_ids: selectedCollaboratorIds.length > 0 ? selectedCollaboratorIds : undefined,
      company_id: selectedCompanyId || null  // null for individual/personal tasks
    };

    await addTask(newTask);
    onClose();
  };

  if (!isOpen || !user) return null;

  const currentProject = fetchedProjects.find(p => p.id === projectId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col animate-slide-left">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800">Create New Task</h2>
          </div>
          <div className="flex items-center gap-2">
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

          {/* Project Selector - only show for company tasks */}
          {selectedCompanyId && (
            <div className="mb-4 flex items-center gap-2 group">
              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-500">Project</span>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={isLoadingData}
                  className="appearance-none bg-transparent text-sm text-brand-600 font-medium hover:text-brand-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded pl-1 pr-6 py-0.5 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-white text-slate-700">No Project</option>
                  {fetchedProjects.map(p => (
                    <option key={p.id} value={p.id} className="bg-white text-slate-700">{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-brand-600 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold text-gray-900 mb-6 leading-tight w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-300 transition-colors hover:bg-gray-50/50 rounded"
            placeholder="Task Title"
            autoFocus
          />

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">

            {/* Task Type Selector - Company or Personal */}
            <div className="flex flex-col gap-1 col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company/Type</span>
              <div className="flex items-center gap-2 p-1 -ml-1 rounded-md bg-purple-50 group relative">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs pointer-events-none">
                  <Briefcase size={16} />
                </div>
                <div className="flex-1 relative">
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="appearance-none w-full bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer py-1 pr-6"
                  >
                    <option value="">Personal</option>
                    {user.company_names?.filter(name => name !== 'Individual').map((name, index) => (
                      <option key={user.company_ids?.[index]} value={user.company_ids?.[index]}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assignee</span>
              {selectedCompanyId ? (
                <div className="relative group">
                  <div className="flex items-center gap-2 p-1 -ml-1 rounded-md hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-white ring-2 ring-gray-50">
                      {(fetchedUsers.find(u => u.id === assigneeId)?.avatar_url || (assigneeId === user.id ? user.avatar_url : undefined)) ? (
                        <img src={fetchedUsers.find(u => u.id === assigneeId)?.avatar_url || (assigneeId === user.id ? user.avatar_url : undefined)} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (fetchedUsers.find(u => u.id === assigneeId)?.name || user.name).charAt(0)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        {fetchedUsers.find(u => u.id === assigneeId)?.name || user.name}
                        <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600" />
                      </span>
                    </div>
                  </div>
                  {/* Select Overlay */}
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={isLoadingData}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                  >
                    <option value={user.id}>{user.name} (Me)</option>
                    {filteredCollaborators.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Personal task - fixed to self */
                <div className="flex items-center gap-2 p-1 -ml-1 rounded-md bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs border border-white ring-2 ring-gray-50">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{user.name} (Me)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Collaborators - only show for company tasks */}
            {selectedCompanyId && (
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Users size={12} />
                  Collaborators
                  {selectedCollaboratorIds.length > 0 && (
                    <span className="text-xs bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full">
                      {selectedCollaboratorIds.length}
                    </span>
                  )}
                </span>

                <div className="border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1 bg-slate-50/50">
                  {isLoadingData ? (
                    <span className="text-sm text-slate-400 italic p-1">Loading team members...</span>
                  ) : filteredCollaborators.length === 0 ? (
                    <span className="text-sm text-slate-400 italic p-1">No other team members available</span>
                  ) : (
                    filteredCollaborators.map(collab => (
                      <label
                        key={collab.id}
                        className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors ${selectedCollaboratorIds.includes(collab.id) ? 'bg-teal-50 border border-teal-200' : 'hover:bg-white border border-transparent'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollaboratorIds.includes(collab.id)}
                          onChange={() => {
                            if (selectedCollaboratorIds.includes(collab.id)) {
                              setSelectedCollaboratorIds(prev => prev.filter(id => id !== collab.id));
                            } else {
                              setSelectedCollaboratorIds(prev => [...prev, collab.id]);
                            }
                          }}
                          className="w-3.5 h-3.5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px] shrink-0">
                          {collab.avatar_url ? (
                            <img src={collab.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            collab.name.charAt(0)
                          )}
                        </div>
                        <span className="text-sm text-slate-600 truncate">{collab.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Due Date */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</span>
              <div className="flex items-center gap-2 p-1 -ml-1 text-sm text-gray-700 group rounded transition-colors relative hover:bg-slate-50 cursor-pointer">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center pointer-events-none ${!dueDate ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-brand-600'
                  }`}>
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium cursor-pointer w-full text-slate-700"
                  placeholder="Select due date"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</span>
              <div className="flex items-center gap-2 p-1 -ml-1">
                <div className="relative w-full">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className={`appearance-none w-full pl-3 pr-8 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors uppercase tracking-wide ${priority === Priority.HIGH ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                      priority === Priority.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' :
                        'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                  >
                    {Object.values(Priority).map(p => (
                      <option key={p} value={p} className="bg-white text-slate-900">{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${priority === Priority.HIGH ? 'text-red-700' :
                    priority === Priority.MEDIUM ? 'text-yellow-700' :
                      'text-blue-700'
                    }`} />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Status</span>
              <div className="flex items-center gap-2 p-1 -ml-1">
                <div className="relative w-full">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="appearance-none w-full bg-white border border-slate-200 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block px-3 py-1.5 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {Object.values(Status).map(s => (
                      <option key={s} value={s} className="bg-white text-slate-900">{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Client (if project selected) */}
            {currentProject && (
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
            )}

            {/* Project Owner (if project selected) */}
            {currentProject && (
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
            )}

          </div>

          {/* Description */}
          <div className="mb-8 relative">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-gray-700 text-base leading-relaxed bg-white border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-md p-3 shadow-sm transition-all resize-none placeholder-gray-400"
              rows={6}
              placeholder="Add a description..."
            />
          </div>

          <div className="h-px bg-gray-200 w-full mb-8"></div>

          {/* Activity Placeholder */}
          <div className="mb-4 opacity-50">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              Activity
            </h3>
            <div className="text-center py-6 bg-slate-50 rounded-lg text-slate-400 text-sm">
              Activity will appear here after task creation.
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full mb-8"></div>

          {/* History Placeholder */}
          <div className="mb-4 opacity-50">
            <div className="w-full flex items-center justify-between font-semibold text-gray-900 mb-4">
              <div className="flex items-center gap-2">
                <History size={18} />
                <span>History</span>
              </div>
            </div>
            <div className="text-center py-6 bg-slate-50 rounded-lg text-slate-400 text-sm">
              History will appear here after task creation.
            </div>
          </div>

        </div>

        {/* Footer with Create Task Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-3 text-base shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-shadow"
            onClick={handleSubmit}
          >
            <CheckCircle2 size={20} />
            Create Task
          </Button>
        </div>

      </div>
    </>
  );
};
