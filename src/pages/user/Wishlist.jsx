import React from 'react';

const Wishlist = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h2>
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Your wishlist is empty.</p>
        <button className="mt-4 bg-[#b31b26] text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors">
          Explore Products
        </button>
      </div>
    </div>
  );
};

export default Wishlist;
