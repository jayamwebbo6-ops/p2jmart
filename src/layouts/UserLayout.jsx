import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <main className="px-4 md:px-8 lg:px-12 flex-1 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
