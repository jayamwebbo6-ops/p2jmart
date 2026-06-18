import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="flex flex-col items-center">
        {/* Simple modern spinner */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-primary font-medium text-sm tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
