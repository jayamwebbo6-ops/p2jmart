import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isUserAuthenticated, getUserProfile } from '../api/userApi';

const UserLayout = ({ wishlist = [], cart = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (isUserAuthenticated()) {
        // Skip check if already on the complete-profile path
        if (location.pathname === '/complete-profile') return;

        // 1. Check cached local storage profile first
        const stored = localStorage.getItem('p2j_user_profile');
        if (stored) {
          const user = JSON.parse(stored);
          if (!user.phone) {
            navigate('/complete-profile');
            return;
          }
        }

        // 2. Double-check backend server status
        try {
          const response = await getUserProfile();
          if (response && response.success && !response.data.phone) {
            navigate('/complete-profile');
          }
        } catch (e) {
          console.error('Error checking profile status in UserLayout:', e);
        }
      }
    };

    checkProfileStatus();
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header wishlist={wishlist} cart={cart} />
      <main className="px-3 md:px-5 lg:px-7 flex-1 pb-7">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;