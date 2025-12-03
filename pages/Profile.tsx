
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User, Mail, Building, Camera, Save, Building2, Upload, Link, X, Loader2 } from 'lucide-react';
import { profileAPI } from '../services/api';

export const Profile: React.FC = () => {
  const { user, updateUser } = useApp();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync formData with context user when it changes (e.g., from WebSocket updates)
  useEffect(() => {
    if (user) {
      console.log('Profile: User data changed, updating form', { user });
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user?.id, user?.name, user?.email, user?.avatar_url]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        avatar_url: formData.avatar_url
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const updatedUser = await profileAPI.uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatar_url: updatedUser.avatar_url }));
      await updateUser({ avatar_url: updatedUser.avatar_url });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      setUploadError(error.response?.data?.detail || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarUrlSubmit = async () => {
    if (!avatarUrlInput.trim()) return;

    try {
      await updateUser({ avatar_url: avatarUrlInput.trim() });
      setFormData(prev => ({ ...prev, avatar_url: avatarUrlInput.trim() }));
      setShowUrlInput(false);
      setAvatarUrlInput('');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update avatar URL:', error);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await profileAPI.deleteAvatar();
      setFormData(prev => ({ ...prev, avatar_url: '' }));
      await updateUser({ avatar_url: '' });
    } catch (error) {
      console.error('Failed to remove avatar:', error);
    }
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
              
              {/* Upload button */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2.5 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-colors transform hover:scale-105 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>
            </div>
            
            {/* Avatar action buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Upload size={12} />
                Upload
              </button>
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Link size={12} />
                URL
              </button>
              {formData.avatar_url && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <X size={12} />
                  Remove
                </button>
              )}
            </div>

            {/* URL Input */}
            {showUrlInput && (
              <div className="w-full mb-4 space-y-2">
                <input
                  type="url"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAvatarUrlSubmit}
                    className="flex-1 text-xs px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    Apply URL
                  </button>
                  <button
                    onClick={() => { setShowUrlInput(false); setAvatarUrlInput(''); }}
                    className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-600 mb-4">{uploadError}</p>
            )}
            
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
                 <label className="text-sm font-medium text-slate-700">Avatar URL (Alternative)</label>
                 <input 
                   name="avatar_url"
                   className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                   value={formData.avatar_url}
                   onChange={handleChange}
                   placeholder="https://example.com/photo.jpg"
                 />
                 <p className="text-xs text-slate-400">You can also upload an image directly using the buttons above.</p>
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
