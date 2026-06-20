import React, { useState, useEffect } from 'react';
import { Camera, Save, Edit2, X } from 'lucide-react';
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

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const stored = localStorage.getItem('p2j_admin_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile(parsed);
      setOriginalProfile(parsed);
    }
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
    setMessage({ type: '', text: '' });
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    
    // Check if password change was attempted
    if (passwords.new || passwords.current || passwords.confirm) {
      if (passwords.new !== passwords.confirm) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
      if (!passwords.current) {
        setMessage({ type: 'error', text: 'Current password is required to change password.' });
        return;
      }
      // Password validation passed (simulated)
    }

    localStorage.setItem('p2j_admin_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('adminProfileUpdate'));
    setOriginalProfile({ ...profile });
    setPasswords({ current: '', new: '', confirm: '' });
    setIsEditing(false);
    
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Profile Settings">
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </PageHeader>

      {message.text && (
        <div className={`p-4 mb-6 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Single Card Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
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
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={profile.username}
                    onChange={e => setProfile({...profile, username: e.target.value})}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Change Password Section (Only show if editing) */}
         
              <section className="animate-in fade-in slide-in-from-top-4 duration-300">
              
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none md:max-w-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input 
                        type="password" 
                        value={passwords.new}
                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                  className="flex items-center space-x-2 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit" 
                  className="flex items-center space-x-2 bg-primary text-white px-6 py-2.5 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
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
