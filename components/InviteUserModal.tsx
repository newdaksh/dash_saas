
import React, { useState } from 'react';
import { X, Mail, Send, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      setError(null);
      try {
        await inviteUser(email);
        handleClose();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to send invitation');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-[slideUp_0.4s_ease-out] relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start bg-gradient-to-b from-slate-50/80 to-white">
          <div>
            <h3 className="font-bold text-slate-800 text-xl tracking-tight">Invite Team Member</h3>
            <p className="text-xs text-slate-500 mt-1">Invite a registered user to join your company.</p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           {error && (
             <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
               <AlertCircle size={16} />
               <span>{error}</span>
             </div>
           )}
           
           <div className="space-y-4">
             <Input
               label="Email Address"
               type="email"
               value={email}
               onChange={e => setEmail(e.target.value)}
               placeholder="user@example.com"
               required
               autoFocus
               icon={<Mail size={16} />}
             />
             <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
               The user must already be registered. An invitation will be sent for them to accept or decline.
             </p>
           </div>

           <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
             <Button type="button" variant="ghost" onClick={handleClose} className="hover:bg-slate-100 text-slate-500" disabled={loading}>Cancel</Button>
             <Button type="submit" className="shadow-lg shadow-blue-500/20" disabled={loading}>
               {loading ? (
                 <>
                   <span className="animate-spin mr-2">⏳</span>
                   Sending...
                 </>
               ) : (
                 <>
                   <Send size={16} className="mr-2" />
                   Send Invitation
                 </>
               )}
             </Button>
           </div>
        </form>
      </div>
    </div>
  );
};
