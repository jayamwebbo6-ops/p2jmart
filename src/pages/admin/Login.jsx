import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../../api/adminApi';
import { toast } from '../../components/toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary px-6 py-8 text-center">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="P2J Mart Logo" 
            className="h-16 mx-auto bg-white/10 rounded-lg p-2 mb-4 backdrop-blur-sm"
          />
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-primary-foreground/80 text-sm mt-1 opacity-80 text-gray-200">Sign in to manage your store</p>
        </div>

        {/* Form */}
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
            
            <div className="flex items-center justify-between mt-2">
        
              <a href="#" className="text-sm font-medium text-primary hover:underline text-align-right">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors mt-6 shadow-sm"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">© 2026 P2J Mart. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
