import React, { useState, useEffect } from 'react';
import { Camera, Save, Edit2, X } from 'lucide-react';
import axios from 'axios';
import { toast } from '../../components/toast';
import PageHeader from '../../components/PageHeader';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: 'Admin User',
    email: 'admin@p2jmart.com',
    photo: ''
  });
  
  // Keep a copy of the original profile for canceling edits
  const [originalProfile, setOriginalProfile] = useState({
    username: 'Admin User',
    email: 'admin@p2jmart.com',
    photo: ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/profile');
      if (response.data && response.data.success) {
        const data = response.data.data;
        const profileData = {
          username: data.username || 'Admin User',
          email: data.email || 'admin@p2jmart.com',
          photo: data.photo || ''
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
        localStorage.setItem('p2j_admin_profile', JSON.stringify(profileData));
      }
    } catch (error) {
      console.error('Failed to fetch profile from server, using local storage:', error);
      const stored = localStorage.getItem('p2j_admin_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
        setOriginalProfile(parsed);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePhotoUpload = (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setPasswords({ current: '', new: '', confirm: '' });
    setIsEditing(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    
    // Check if password change was attempted
    if (passwords.new || passwords.current || passwords.confirm) {
      if (passwords.new !== passwords.confirm) {
        toast.error('New passwords do not match.');
        return;
      }
      if (!passwords.current) {
        toast.error('Current password is required to change password.');
        return;
      }
    }

    try {
      const payload = {
        username: profile.username,
        email: profile.email,
        photo: profile.photo
      };

      if (passwords.current && passwords.new) {
        payload.currentPassword = passwords.current;
        payload.newPassword = passwords.new;
      }

      const response = await axios.put('http://localhost:5000/api/admin/profile', payload);

      if (response.data && response.data.success) {
        const updated = {
          username: response.data.data.username,
          email: response.data.data.email,
          photo: response.data.data.photo
        };
        setProfile(updated);
        setOriginalProfile(updated);
        localStorage.setItem('p2j_admin_profile', JSON.stringify(updated));
        window.dispatchEvent(new Event('adminProfileUpdate'));
        setPasswords({ current: '', new: '', confirm: '' });
        setIsEditing(false);
        
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errMsg = error.response?.data?.message || 'Failed to connect to backend server.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader 
        title="Profile Settings" 
        subtitle="Manage your personal information, contact email, and secure credentials"
      >
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-2xl hover:bg-primary/95 transition-all text-xs sm:text-sm font-bold shadow-[0_4px_12px_rgba(0,49,71,0.2)]"
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </PageHeader>

      {/* Single Card Layout */}
      <div className="bg-white rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Header Background */}
        <div className="h-32 bg-primary w-full relative"></div>

        <form onSubmit={handleProfileSave} className="px-8 pb-8">
          
          {/* Profile Photo Area */}
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''}`}>
                {profile.photo ? (
                  <img 
                    src={profile.photo} 
                    alt="Profile" 
                    onError={() => setProfile(prev => ({ ...prev, photo: '' }))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary text-white flex items-center justify-center font-black text-4xl uppercase select-none">
                    {profile.username ? profile.username.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" size={24} />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
            
            <div className="mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">Administrator</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* General Info Section */}
            <section>
              <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                  <input 
                    type="text" 
                    value={profile.username}
                    onChange={e => setProfile({...profile, username: e.target.value})}
                    disabled={!isEditing}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Change Password Section (Only show if editing) */}
            <section className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                  <input 
                    type="password" 
                    value={passwords.current}
                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                    disabled={!isEditing}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none md:max-w-md disabled:bg-gray-50 disabled:text-gray-450 transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      disabled={!isEditing}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-450 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      disabled={!isEditing}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-450 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end items-center space-x-4 pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-650 px-4 py-2.5 rounded-2xl hover:bg-gray-50 transition-all text-xs sm:text-sm font-bold"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit" 
                  className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-2xl hover:bg-primary/95 transition-all text-xs sm:text-sm font-bold shadow-[0_4px_12px_rgba(0,49,71,0.2)]"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
