import React, { useState, useEffect } from 'react';
import { getHomeCMS } from '../../api/homeCms'; 

const CancellationReturnPolicy = () => {
  const [policyData, setPolicyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dynamic cancellation and return policy data on component mount
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        const res = await getHomeCMS();
        
        console.log("CMS API Response:", res);
  
        // 1. Direct array assignment if returned directly
        if (Array.isArray(res)) {
          setPolicyData(res);
        } 
        // 2. Extract from standard property wrapper
        else if (res && Array.isArray(res.cancellationReturnPolicy)) {
          setPolicyData(res.cancellationReturnPolicy);
        }
        // 3. Extract from data envelope configuration
        else if (res && res.data && Array.isArray(res.data.cancellationReturnPolicy)) {
          setPolicyData(res.data.cancellationReturnPolicy);
        } else {
          console.warn("Received data structure did not match expectations.");
        }
  
      } catch (err) {
        console.error("Error fetching cancellation policy:", err);
        setError("Failed to load policy configurations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPolicy();
  }, []);

  // Back to top scroll routine targeting bottom-right corner control toggle
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-8 pb-12 font-sans selection:bg-slate-200 relative">
      <div className="max-w-4xl mx-auto px-4 md:px-6 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
        
        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-[#0A3A60] mb-4 text-center">
          Refund & Cancellation Policy
        </h1>

        {/* Introduction */}
        <p className="text-sm sm:text-base leading-relaxed text-gray-600 mb-8 text-center max-w-2xl mx-auto border-b border-gray-100 pb-6">
          At p2j-mart, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you interact with our website, products, or services.
        </p>

        {/* State Indicators */}
        {isLoading && (
          <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
            Loading policy data...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Content Sections */}
        {!isLoading && !error && (
          <div className="space-y-8 mt-6">
            {policyData.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No policy sections available.</p>
            ) : (
              policyData.map((section, index) => (
                <div key={section._id || index} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  {/* Section Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-[#0A3A60] mb-2">
                    {section.title}
                  </h2>

                  {/* Optional Section Description */}
                  {section.description && (
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 leading-relaxed">
                      {section.description}
                    </p>
                  )}

                  {/* Bullet Points */}
                  <ul className="space-y-2">
                    {section.points && section.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start text-gray-600">
                        <span className="text-[#00A3E0] font-bold mr-3 mt-1">•</span>
                        <span className="text-xs sm:text-sm md:text-base leading-relaxed w-full">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* FLOAT BACK TO DOCUMENT APEX CEILING COMPONENT INTERFACE BUTTON */}
      <button
        onClick={handleScrollToTop}
        type="button"
        aria-label="Scroll to Top"
        className="fixed bottom-6 right-6 bg-[#1A1D20] hover:bg-[#2B3035] text-white w-10 h-10 flex items-center justify-center rounded transition-all duration-150 shadow-md active:scale-95 cursor-pointer group"
      >
        <svg 
          className="w-3.5 h-3.5 transform group-hover:-translate-y-0.5 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

    </div>
  );
};

export default CancellationReturnPolicy;