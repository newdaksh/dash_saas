
import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { useApp } from '../context';
import { Button } from './Button';
import { Input } from './Input';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose }) => {
  const { inviteUser } = useApp();
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      inviteUser(email);
      handleClose();
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-[slideUp_0.4s_ease-out] relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start bg-gradient-to-b from-slate-50/80 to-white">
          <div>
            <h3 className="font-bold text-slate-800 text-xl tracking-tight">Invite Team Member</h3>
            <p className="text-xs text-slate-500 mt-1">Send an invitation to join your workspace.</p>
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
               label="Email Address"
               type="email"
               value={email}
               onChange={e => setEmail(e.target.value)}
               placeholder="colleague@company.com"
               required
               autoFocus
               icon={<Mail size={16} />}
             />
             <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
               An email will be sent to this address with instructions to join your company workspace.
             </p>
           </div>

           <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
             <Button type="button" variant="ghost" onClick={handleClose} className="hover:bg-slate-100 text-slate-500">Cancel</Button>
             <Button type="submit" className="shadow-lg shadow-blue-500/20">
               <Send size={16} className="mr-2" />
               Send Invitation
             </Button>
           </div>
        </form>
      </div>
    </div>
  );
};
