
import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { UserPlus, Search, Mail, Shield, User as UserIcon, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { InviteUserModal } from '../components/InviteUserModal';
import { UserPanel } from '../components/UserPanel';

export const UserList: React.FC = () => {
  const { users, invitations, revokeInvitation } = useApp();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const activeUsers = users.filter(u => u.status === 'Active' && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );
  
  // Filter pending invitations from the invitations array
  const pendingInvitations = invitations.filter(inv => 
    inv.status === 'Pending' &&
    inv.invitee_email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId) || null, [users, selectedUserId]);

  return (
    <div className="relative min-h-full flex flex-col">
       <div className="flex-1 flex flex-col space-y-8 relative z-10 p-1 pb-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-blue-100/80 text-blue-700">
                 Team
               </span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              Users & Members
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Manage access and view team composition.
            </p>
          </div>
          
          <Button 
            variant="primary" 
            className="bg-blue-600/90 hover:bg-blue-600 backdrop-blur text-white shadow-xl shadow-blue-500/20 rounded-xl px-6 py-3 transition-all hover:scale-105 active:scale-95 border border-blue-400/30"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus size={18} className="mr-2 stroke-[2.5]" />
            Invite Member
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
            </div>
            <input 
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
            />
        </div>

        {/* Active Users Grid */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-500" />
                Active Members 
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{activeUsers.length}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeUsers.map(user => (
                    <div 
                        key={user.id} 
                        onClick={() => setSelectedUserId(user.id)}
                        className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-blue-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-100 to-blue-200 p-[3px] ring-2 ring-white shadow-md">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover bg-white" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl font-bold text-blue-600">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{user.name}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 mb-4">
                            <Mail size={14} />
                            <span className="truncate">{user.email}</span>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-green-600">
                             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                             Active Now
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Pending Invitations Grid */}
        {pendingInvitations.length > 0 && (
             <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mt-4">
                    <Clock size={20} className="text-amber-500" />
                    Pending Invitations
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{pendingInvitations.length}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingInvitations.map(invitation => (
                        <div 
                            key={invitation.id} 
                            className="bg-slate-50/80 border border-slate-200 border-dashed rounded-2xl p-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Mail size={64} />
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700">Invitation Sent</h3>
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending Acceptance</span>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3 border border-slate-100 mb-4">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Sent To</p>
                                <p className="text-sm font-medium text-slate-800 truncate">{invitation.invitee_email}</p>
                                <p className="text-xs text-slate-500 mt-1">Role: {invitation.role || 'Member'}</p>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    if (confirm(`Are you sure you want to revoke the invitation for ${invitation.invitee_email}?`)) {
                                        setRevokingId(invitation.id);
                                        revokeInvitation(invitation.id).finally(() => setRevokingId(null));
                                    }
                                }}
                                disabled={revokingId === invitation.id}
                                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition-colors disabled:opacity-50"
                            >
                                <Trash2 size={12} />
                                {revokingId === invitation.id ? 'Revoking...' : 'Revoke Invitation'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
       </div>

       <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
       
       <UserPanel 
         user={selectedUser} 
         isOpen={!!selectedUser} 
         onClose={() => setSelectedUserId(null)} 
       />
    </div>
  );
};
