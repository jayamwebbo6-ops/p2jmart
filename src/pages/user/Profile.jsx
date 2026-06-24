import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mail, User, Phone, Edit2, Check, X } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../../../public/api/userApi';
import { toast } from '../../components/toast';
import { compressAndConvertToWebP } from '../../utils/helpers';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response && response.success) {
          setName(response.data.name || '');
          setEmail(response.data.email || '');
          setPhone(response.data.phone || '');
          setPhotoUrl(response.data.photo || null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (updatedFields) => {
    try {
      const response = await updateUserProfile(updatedFields);
      if (response && response.success) {
        setName(response.data.name || '');
        setPhone(response.data.phone || '');
        setPhotoUrl(response.data.photo || null);
        setEmail(response.data.email || '');
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('An error occurred while updating profile.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size and type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file.');
        return;
      }
      try {
        const compressed = await compressAndConvertToWebP(file);
        handleUpdateProfile({ photo: compressed });
      } catch (err) {
        toast.error(err.message || 'Failed to process photo');
        e.target.value = '';
      }
    }
  };

  const saveName = () => {
    const trimmed = tempName.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty.');
      return;
    }
    if (trimmed.length < 2) {
      toast.error('Name must be at least 2 characters long.');
      return;
    }
    handleUpdateProfile({ name: trimmed });
    setIsEditingName(false);
  };

  const savePhone = () => {
    const trimmed = tempPhone.trim();
    if (trimmed) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(trimmed)) {
        toast.error('Phone number must be exactly 10 digits.');
        return;
      }
    }
    handleUpdateProfile({ phone: trimmed });
    setIsEditingPhone(false);
  };

  return (
    <div className="w-full flex flex-col h-full">
      
      {/* Top Banner */}
      <div className="bg-primary p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border border-white/30 backdrop-blur-sm shadow-inner overflow-hidden flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-white min-w-0">
            <h2 className="text-xl font-bold tracking-wide text-white truncate">{name}</h2>
            <p className="text-sm text-red-100 opacity-90 mt-0.5 truncate">{email}</p>
          </div>
        </div>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handlePhotoUpload} 
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          className="px-5 py-2 border border-white/40 rounded-md text-white text-sm font-medium hover:bg-white hover:text-primary transition-colors shadow-sm cursor-pointer flex-shrink-0"
        >
          Change Photo
        </button>
      </div>

      {/* Profile Details */}
      <div className="p-8 flex flex-col bg-white flex-1">
        
        {/* Email Field */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-6">
          <div className="flex space-x-4">
            <Mail className="text-primary mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">Email Address</p>
              <p className="text-base text-gray-700 font-medium break-all">{email}</p>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Full Name Field */}
        <div className="flex items-start justify-between border-b border-gray-100 py-6">
          <div className="flex space-x-4 w-full max-w-md">
            <User className="text-primary mt-1 flex-shrink-0" size={20} />
            <div className="w-full">
              <p className="text-sm font-bold text-gray-800 mb-2">Full Name</p>
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button onClick={saveName} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setIsEditingName(false)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <p className="text-base text-gray-700 font-medium">{name}</p>
              )}
            </div>
          </div>
          {!isEditingName && (
            <button 
              onClick={() => { setTempName(name); setIsEditingName(true); }}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer flex-shrink-0"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="flex items-start justify-between py-6">
          <div className="flex space-x-4 w-full max-w-md">
            <Phone className="text-primary mt-1 flex-shrink-0" size={20} />
            <div className="w-full">
              <p className="text-sm font-bold text-gray-800 mb-2">Phone Number</p>
              {isEditingPhone ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={tempPhone} 
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button onClick={savePhone} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setIsEditingPhone(false)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <p className="text-base text-gray-700 font-medium">{phone || <span className="text-gray-400 italic">Not set</span>}</p>
              )}
            </div>
          </div>
          {!isEditingPhone && (
            <button 
              onClick={() => { setTempPhone(phone); setIsEditingPhone(true); }}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer flex-shrink-0"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

      </div>
      
    </div>
  );
};

export default Profile;
