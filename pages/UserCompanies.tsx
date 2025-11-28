import React from 'react';
import { useApp } from '../context';
import { Building2, Users, ExternalLink, Clock, Sparkles, ArrowRight, Mail, Shield } from 'lucide-react';

export const UserCompanies: React.FC = () => {
  const { user, invitations } = useApp();
  
  // Get accepted invitations (companies user has joined)
  const joinedCompanies = invitations.filter(inv => inv.status === 'Accepted');

  // Generate gradient colors based on company name
  const getGradient = (name: string) => {
    const gradients = [
      'from-indigo-500 via-purple-500 to-pink-500',
      'from-cyan-500 via-blue-500 to-indigo-500',
      'from-emerald-500 via-teal-500 to-cyan-500',
      'from-orange-500 via-red-500 to-pink-500',
      'from-violet-500 via-purple-500 to-fuchsia-500',
      'from-rose-500 via-pink-500 to-purple-500',
      'from-amber-500 via-orange-500 to-red-500',
      'from-lime-500 via-green-500 to-emerald-500',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col space-y-6 relative z-10 p-1">
        
        {/* Header */}
        <div className="animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-indigo-100/80 text-indigo-700">
                Organizations
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              My Companies
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Companies you've joined and collaborate with.
            </p>
          </div>
        </div>

        {/* Companies Grid */}
        {joinedCompanies.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <Building2 size={48} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">No companies yet</h2>
              <p className="text-slate-500 max-w-md">
                When company admins invite you and you accept, they will appear here.
                Check your notifications for pending invitations.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {joinedCompanies.map(company => (
              <div 
                key={company.id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/60"
              >
                {/* Gradient header section */}
                <div className={`h-28 bg-gradient-to-r ${getGradient(company.company_name)} relative overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20 blur-xl"></div>
                    <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white/10 blur-lg"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/90 to-transparent"></div>
                  
                  {/* Sparkle icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Sparkles size={20} className="text-white/80" />
                  </div>
                </div>
                
                {/* Company logo/initial */}
                <div className="absolute top-16 left-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getGradient(company.company_name)} flex items-center justify-center text-white font-black text-3xl shadow-xl border-4 border-white ring-4 ring-white/50 transform group-hover:scale-105 transition-transform duration-300`}>
                    {company.company_name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-14 pb-6 px-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors duration-300 tracking-tight">
                        {company.company_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                          company.role === 'Member' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                            : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                        }`}>
                          <Shield size={12} />
                          {company.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info cards */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Mail size={14} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-medium">Invited by</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{company.inviter_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Clock size={14} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-medium">Joined on</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {new Date(company.updated_at || company.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 group/btn">
                    <span>View Workspace</span>
                    <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
