import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Mail, KeyRound } from 'lucide-react';
import { adminLogin, forgotPasswordApi, resetPasswordApi } from '../../api/adminApi';
import { toast } from '../../components/toast';

export default function AdminLogin() {
  // Views navigation control: 'login' | 'forgot_email' | 'forgot_otp_pass'
  const [view, setView] = useState('login'); 
  
  // Standard Login Credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Recovery Parameters
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Core Login Form Submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin(username, password);
      if (response.success) {
        toast.success('Signed in successfully!');
        navigate('/admin');
      } else {
        toast.error(response.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || 'Invalid username or password.';
      toast.error(errMsg);
    }
  };

  // Flow Step 1: Dispatches Verification OTP Token
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await forgotPasswordApi(resetEmail);
      if (response.success) {
        toast.success('OTP sent to your email Address!');
        setView('forgot_otp_pass');
      } else {
        toast.error(response.message || 'Failed to send OTP.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Flow Step 2: Validates Code & Sets New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await resetPasswordApi(resetEmail, otp, newPassword);
      if (response.success) {
        toast.success('Password changed successfully!');
        navigate('/admin');
      } else {
        toast.error(response.message || 'Failed to change password.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP or internal error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Banner Section */}
        <div className="bg-primary px-6 py-8 text-center">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="P2J Mart Logo" 
            className="h-16 mx-auto bg-white/10 rounded-lg p-2 mb-4 backdrop-blur-sm"
          />
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-primary-foreground/80 text-sm mt-1 opacity-80 text-gray-200">
            {view === 'login' ? 'Sign in to manage your store' : 'Recover your Admin credentials'}
          </p>
        </div>

        {/* CONDITION 1: STANDARD SYSTEM SIGN IN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="p-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Enter username or email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => setView('forgot_email')}
                  className="text-sm font-medium text-primary hover:underline bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors mt-6 shadow-sm"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* CONDITION 2: DISPATCH REQUEST (COLLECT EMAIL) */}
        {view === 'forgot_email' && (
          <form onSubmit={handleSendOtp} className="p-8">
            <div className="space-y-5">
              <h3 className="text-lg font-medium text-gray-900">Forgot Password</h3>
              <p className="text-xs text-gray-500">Enter your registered admin email. We will send an OTP code to reset your access.</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="admin@p2jmart.com"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* CONDITION 3: CONFIRMATION PROCESS (OTP & PASSWORD RECORD) */}
        {/* CONDITION 3: CONFIRMATION PROCESS (OTP & PASSWORD RECORD) */}
{view === 'forgot_otp_pass' && (
  <form onSubmit={handleResetPassword} className="p-8" autoComplete="off">
    <div className="space-y-5">
      <h3 className="text-lg font-medium text-gray-900">Verification Required</h3>
      <p className="text-xs text-gray-600">An OTP code was sent to <strong className="text-gray-800">{resetEmail}</strong>.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-Digit OTP</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <KeyRound size={18} />
          </div>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoComplete="one-time-code" 
            data-lpignore="true"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm tracking-widest font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            data-lpignore="true"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="Enter new password"
          />
        </div>
      </div>

      <div className="flex space-x-3 mt-6">
        <button
          type="button"
          onClick={() => setView('forgot_email')}
          className="w-1/2 border border-gray-300 text-gray-700 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-1/2 bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset & Login'}
        </button>
      </div>
    </div>
  </form>
)}

        {/* Footer block */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">© 2026 P2J Mart. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}