
import React, { useState } from 'react';
import { Bell, Lock, Eye, Monitor, Moon, Shield, Save } from 'lucide-react';
import { Button } from '../components/Button';

export const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    updates: true,
    marketing: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    publicProfile: true
  });

  const handleToggle = (category: 'notifications' | 'security', key: string) => {
    if (category === 'notifications') {
      setNotifications(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }));
    } else {
      setSecurity(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your workspace preferences and security configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar (Visual only for now) */}
        <div className="hidden md:block col-span-1">
           <nav className="space-y-1 sticky top-6">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 font-bold rounded-xl border border-brand-100 transition-colors">
                 <Bell size={18} />
                 Notifications
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                 <Shield size={18} />
                 Security
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                 <Eye size={18} />
                 Appearance
              </button>
           </nav>
        </div>

        {/* Content Area */}
        <div className="col-span-2 space-y-6">
          
          {/* Notifications Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Bell size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-800 leading-none">Notifications</h3>
                 <p className="text-sm text-slate-400 mt-1">Choose how you want to stay updated.</p>
               </div>
            </div>

            <div className="space-y-6">
               <ToggleItem 
                 label="Email Notifications" 
                 description="Receive daily summaries and urgent alerts via email."
                 checked={notifications.email}
                 onChange={() => handleToggle('notifications', 'email')}
               />
               <ToggleItem 
                 label="Desktop Push Notifications" 
                 description="Get real-time popups when tasks are assigned to you."
                 checked={notifications.desktop}
                 onChange={() => handleToggle('notifications', 'desktop')}
               />
               <ToggleItem 
                 label="Product Updates" 
                 description="Stay informed about new features and improvements."
                 checked={notifications.updates}
                 onChange={() => handleToggle('notifications', 'updates')}
               />
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Shield size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-800 leading-none">Privacy & Security</h3>
                 <p className="text-sm text-slate-400 mt-1">Manage your account security settings.</p>
               </div>
            </div>

            <div className="space-y-6">
               <ToggleItem 
                 label="Two-Factor Authentication" 
                 description="Add an extra layer of security to your account."
                 checked={security.twoFactor}
                 onChange={() => handleToggle('security', 'twoFactor')}
               />
               <ToggleItem 
                 label="Public Profile" 
                 description="Allow other team members to see your profile details."
                 checked={security.publicProfile}
                 onChange={() => handleToggle('security', 'publicProfile')}
               />
               
               <div className="pt-4 border-t border-slate-50">
                  <h4 className="text-sm font-bold text-slate-700 mb-4">Change Password</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <input type="password" placeholder="Current Password" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                     <input type="password" placeholder="New Password" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                  </div>
                  <Button variant="outline" size="sm">Update Password</Button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between">
     <div className="pr-4">
        <h4 className="text-sm font-bold text-slate-800">{label}</h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
     </div>
     <button 
       onClick={onChange}
       className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
     >
       <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
     </button>
  </div>
);
