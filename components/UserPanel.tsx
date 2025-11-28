
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { X, Mail, Shield, Building, User as UserIcon, Trash2, CheckCircle2, AlertTriangle, Camera, LogIn, Lock, ExternalLink, AlertCircle, Save } from 'lucide-react';
import { useApp } from '../context';
import { Button } from './Button';
import { Input } from './Input';

interface UserPanelProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({ user: selectedUser, isOpen, onClose }) => {
  const { updateTeamMember, deleteTeamMember, user: currentUser, loginAsUser } = useApp();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Local form state for editing (completely independent of API calls)
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local state when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setLocalUser({ ...selectedUser });
      setHasChanges(false);
    }
  }, [selectedUser]);

  if (!selectedUser || !localUser) return null;

  // Update local state without API call
  const updateLocalUser = (updates: Partial<User>) => {
    setLocalUser(prev => prev ? { ...prev, ...updates } : null);
    setHasChanges(true);
  };

  // Save all changes to API
  const handleSave = async () => {
    if (!localUser || !hasChanges) return;
    
    setIsSaving(true);
    try {
      await updateTeamMember(localUser);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setLocalUser({ ...selectedUser });
    setHasChanges(false);
  };

  const handleDelete = () => {
    deleteTeamMember(selectedUser.id);
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  const handleLoginAsUser = async () => {
    if (!selectedUser || !loginPassword) return;
    
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      await loginAsUser(selectedUser.email, loginPassword);
      setIsLoginModalOpen(false);
      setLoginPassword('');
      onClose();
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || 'Login failed. Please check your password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openInNewWindow = () => {
    // Open a new window with the login page pre-filled with user email
    const newWindow = window.open(window.location.origin + window.location.pathname + '#/login?email=' + encodeURIComponent(selectedUser.email), '_blank');
    setIsLoginModalOpen(false);
    setLoginPassword('');
  };

  const isSelf = currentUser?.id === selectedUser.id;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-[60] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Delete Confirmation Overlay */}
        {isDeleteConfirmOpen && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
                <div className="max-w-sm text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Remove User?</h3>
                    <p className="text-slate-500 mb-6">Are you sure you want to remove <span className="font-semibold text-slate-800">"{selectedUser.name}"</span>? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Remove User</Button>
                    </div>
                </div>
            </div>
        )}

        {/* Login as User Modal */}
        {isLoginModalOpen && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
                <div className="max-w-sm w-full">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <LogIn size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Login as {selectedUser.name}</h3>
                    <p className="text-slate-500 mb-6 text-center text-sm">Enter the password for <span className="font-semibold text-slate-800">{selectedUser.email}</span> to switch to this account.</p>
                    
                    {loginError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                            {loginError}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input 
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleLoginAsUser()}
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => { setIsLoginModalOpen(false); setLoginPassword(''); setLoginError(''); }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleLoginAsUser}
                                disabled={isLoggingIn || !loginPassword}
                                className="flex-1"
                            >
                                {isLoggingIn ? 'Logging in...' : 'Login'}
                            </Button>
                        </div>
                        
                        <div className="text-center">
                            <button
                                onClick={openInNewWindow}
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mx-auto"
                            >
                                <ExternalLink size={14} />
                                Open in new window
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-white text-blue-600 rounded-xl shadow-sm border border-blue-100">
                <UserIcon size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">User Profile</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                       selectedUser.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                   }`}>
                     {selectedUser.status}
                   </span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Save/Discard buttons when there are changes */}
            {hasChanges && isSelf && (
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
            {!isSelf && selectedUser.status === 'Active' && (
                <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-full text-gray-400 transition-colors"
                    title="Login as this user"
                >
                <LogIn size={20} />
                </button>
            )}
            {!isSelf && (
                <button 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-400 transition-colors"
                    title="Remove User"
                >
                <Trash2 size={20} />
                </button>
            )}
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:shadow-sm rounded-full text-gray-400 hover:text-gray-600 transition-all"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Unsaved Changes Banner */}
        {hasChanges && isSelf && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-sm">
            <AlertCircle size={16} />
            <span>You have unsaved changes</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
               <div className="w-24 h-24 rounded-full bg-slate-100 p-1 ring-4 ring-slate-50 shadow-md overflow-hidden">
                   {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                   ) : (
                      <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                          {selectedUser.name.charAt(0)}
                      </div>
                   )}
                </div>
            </div>
          </div>

          <div className="space-y-6">
             <Input 
                label="Full Name"
                value={localUser.name}
                onChange={(e) => updateLocalUser({ name: e.target.value })}
                icon={<UserIcon size={16} />}
                disabled={!isSelf}
                className={!isSelf ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}
             />

             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-slate-700">Email Address</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                 </div>
                 <input 
                    type="email"
                    value={localUser.email}
                    onChange={(e) => updateLocalUser({ email: e.target.value })}
                    className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-10 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isSelf ? "bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-300" : ""}`}
                    disabled={!isSelf}
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-slate-700">Role</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Shield size={16} />
                      </div>
                      <select
                        value={localUser.role}
                        onChange={(e) => updateLocalUser({ role: e.target.value as any })}
                        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${!isSelf ? "bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-300" : ""}`}
                        disabled={!isSelf}
                        aria-label="Select role"
                      >
                         <option value="Admin">Admin</option>
                         <option value="Member">Member</option>
                         <option value="Viewer">Viewer</option>
                      </select>
                   </div>
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-slate-700">Status</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CheckCircle2 size={16} />
                      </div>
                      <select
                        value={localUser.status}
                        onChange={(e) => updateLocalUser({ status: e.target.value as any })}
                        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer ${!isSelf ? "bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-300" : ""}`}
                        disabled={!isSelf}
                        aria-label="Select status"
                      >
                         <option value="Active">Active</option>
                         <option value="Invited">Invited</option>
                      </select>
                   </div>
                 </div>
             </div>

             <Input 
                label="Company"
                value={localUser.company_name}
                onChange={(e) => updateLocalUser({ company_name: e.target.value })}
                icon={<Building size={16} />}
                disabled={!isSelf}
                className={!isSelf ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}
             />
             
             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-slate-700">Avatar URL</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Camera size={16} />
                 </div>
                 <input 
                    type="text"
                    value={localUser.avatar_url || ''}
                    onChange={(e) => updateLocalUser({ avatar_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-10 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isSelf ? "bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-300" : ""}`}
                    disabled={!isSelf}
                 />
               </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
