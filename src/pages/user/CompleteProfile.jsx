import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';
import { isUserAuthenticated, getUserProfile, updateUserProfile } from '../../api/userApi';
import { toast } from '../../components/toast';

const CompleteProfile = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated at all, redirect to login
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }

    // Load initial profile data
    const verifyAndLoad = async () => {
      try {
        const stored = localStorage.getItem('p2j_user_profile');
        if (stored) {
          const user = JSON.parse(stored);
          if (user.phone) {
            // Already completed, send to home
            navigate('/');
            return;
          }
          setName(user.name || '');
        }

        const response = await getUserProfile();
        if (response && response.success) {
          if (response.data.phone) {
            // Already completed
            navigate('/');
            return;
          }
          setName(response.data.name || '');
        }
      } catch (err) {
        console.error('Error loading complete profile status:', err);
      }
    };

    verifyAndLoad();
  }, [navigate]);

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateUserProfile({
        name,
        phone: phone.trim()
      });
      if (response && response.success) {
        toast.success('Profile completed successfully!');
        window.dispatchEvent(new Event('userLoginStateChange'));
        navigate('/');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header Panel */}
        <div className="bg-primary text-white text-center flex flex-col items-center justify-center pt-10 pb-8 px-6">
          <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center mb-4 border border-white/30 backdrop-blur-sm">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-white">Complete Profile</h1>
          <p className="text-red-100 text-sm font-medium">Just one last step to get started!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCompleteSubmit} className="flex flex-col gap-5 p-8">
          {/* Full Name Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
              <User size={16} className="text-gray-500" />
              <label>Full Name</label>
            </div>
            <input 
              type="text" 
              required
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl indent-4 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-55/50 transition-all placeholder-gray-400"
            />
          </div>

          {/* Phone Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
              <ShieldCheck size={16} className="text-gray-500" />
              <label>Phone Number</label>
            </div>
            <input 
              type="tel" 
              required
              maxLength={10}
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border border-gray-200 rounded-xl indent-4 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-55/50 transition-all placeholder-gray-400"
            />
          </div>

          {/* Complete Profile Button */}
          <button 
            type="submit"
            disabled={isLoading || phone.length !== 10}
            className={`w-full text-white font-bold h-12 rounded-xl text-sm transition-all shadow-md mt-2 cursor-pointer ${
              phone.length === 10 && !isLoading
                ? 'bg-primary hover:bg-secondary active:scale-[0.99] shadow-red-900/10'
                : 'bg-gray-300 shadow-none cursor-not-allowed text-white'
            }`}
          >
            {isLoading ? 'Saving...' : 'Complete Profile & Enter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
