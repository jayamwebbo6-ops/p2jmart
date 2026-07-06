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
        if (location.pathname === '/complete-profile') return;

        const stored = localStorage.getItem('p2j_user_profile');
        if (stored) {
          const user = JSON.parse(stored);
          if (!user.phone) {
            navigate('/complete-profile');
            return;
          }
        }

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
    <div className="min-h-screen bg-[#FDFDFB] flex flex-col font-sans">
      <Header wishlist={wishlist} cart={cart} />
      {/* REMOVED layout side padding here so children control their full alignment bounds */}
      <main className="w-full flex-1 pb-10 px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;