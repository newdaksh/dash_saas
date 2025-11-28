
import React, { useState } from 'react';
import { useApp } from '../context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User, Mail, Building, Camera, Save, Building2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useApp();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company_name: user?.company_name || '',
    avatar_url: user?.avatar_url || ''
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-slide-up">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Profile</h1>
          <p className="text-slate-500 font-medium">Manage your personal information and account details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center h-full">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full bg-slate-100 p-1 ring-4 ring-white shadow-lg overflow-hidden">
                 {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                 ) : (
                    <div className="w-full h-full rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-4xl">
                        {formData.name.charAt(0)}
                    </div>
                 )}
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-colors transform hover:scale-105 border-2 border-white">
                <Camera size={18} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
            <div className="text-slate-500 text-sm mb-6">
              {user.company_names && user.company_names.length > 0 ? (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {user.company_names.map((company, index) => (
                    <span 
                      key={index}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        company === user.current_company_name
                          ? 'bg-brand-100 text-brand-700 border border-brand-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Building2 size={10} className="mr-1" />
                      {company}
                      {company === user.current_company_name && (
                        <span className="ml-1 text-brand-500">•</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <span>{user.company_name || 'Individual'}</span>
              )}
            </div>

            <div className="w-full mt-auto pt-6 border-t border-slate-50">
               <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Type</div>
               <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                  user.role === 'Admin' 
                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                    : user.role === 'Member'
                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                    : 'bg-slate-50 text-slate-700 border-slate-100'
               }`}>
                  {user.role === 'Admin' ? 'Workspace Admin' : user.role}
               </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <User size={20} />
               </div>
               <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input 
                   label="Full Name" 
                   name="name" 
                   value={formData.name} 
                   onChange={handleChange}
                   icon={<User size={16} />}
                 />
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-slate-700">Companies</label>
                   <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                     {user.company_names && user.company_names.length > 0 ? (
                       <div className="flex flex-wrap gap-1">
                         {user.company_names.map((company, index) => (
                           <span 
                             key={index}
                             className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                               company === user.current_company_name
                                 ? 'bg-brand-100 text-brand-700'
                                 : 'bg-slate-200 text-slate-600'
                             }`}
                           >
                             {company}
                           </span>
                         ))}
                       </div>
                     ) : (
                       <span className="text-slate-500">{user.company_name || 'Individual'}</span>
                     )}
                   </div>
                   <p className="text-xs text-slate-400">Companies are managed through invitations.</p>
                 </div>
              </div>

              <Input 
                 label="Email Address" 
                 name="email" 
                 type="email" 
                 value={formData.email} 
                 onChange={handleChange}
                 icon={<Mail size={16} />}
              />

              <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700">Avatar URL</label>
                 <input 
                   name="avatar_url"
                   className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                   value={formData.avatar_url}
                   onChange={handleChange}
                   placeholder="https://example.com/photo.jpg"
                 />
                 <p className="text-xs text-slate-400">Paste a direct link to an image to update your avatar.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-4">
                 {isSaved && (
                    <span className="text-green-600 text-sm font-medium animate-fade-in flex items-center gap-2">
                       Saved Successfully!
                    </span>
                 )}
                 <Button type="submit" disabled={isSaved} className="min-w-[120px]">
                    <Save size={18} className="mr-2" />
                    Save Changes
                 </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
