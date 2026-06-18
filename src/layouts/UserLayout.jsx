import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// 1. Destructure the wishlist prop passed from App.jsx
const UserLayout = ({ wishlist = [] }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header wishlist={wishlist} />
      <main className="px-3 md:px-5 lg:px-7 flex-1 pb-7">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;