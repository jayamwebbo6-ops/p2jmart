import React, { useState, useEffect } from 'react';
import { getHomeCMS } from '../../api/homeCms'; 

const TermsContion = () => {
  const [policyData, setPolicyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        const res = await getHomeCMS();
        
        console.log("CMS API Response:", res);
  
        // 1. Direct array mapping
        if (Array.isArray(res)) {
          setPolicyData(res);
        } 
        // 2. Extract specifically from termsConditions key
        else if (res && Array.isArray(res.termsConditions)) {
          setPolicyData(res.termsConditions);
        }
        // 3. Extract from data envelope if present
        else if (res && res.data && Array.isArray(res.data.termsConditions)) {
          setPolicyData(res.data.termsConditions);
        } else {
          console.warn("Received data structure did not match expectations.");
        }
  
      } catch (err) {
        console.error("Error fetching terms and conditions:", err);
        setError("Failed to load terms & conditions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPolicy();
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-8 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-6 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
        
        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-primary mb-4 text-center">
          Terms & Conditions
        </h1>

        {/* Introduction */}
        <p className="text-sm sm:text-base leading-relaxed text-gray-600 mb-8 text-center max-w-2xl mx-auto border-b border-gray-100 pb-6">
          At p2j-mart, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you interact with our website, products, or services.
        </p>

        {/* Loading and Error Handlers */}
        {isLoading && (
          <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
            Loading terms & conditions...
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
              <p className="text-center text-gray-500 py-6">No terms and conditions configured.</p>
            ) : (
              policyData.map((section, index) => (
                <div key={section._id || index} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  {/* Section Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-primary mb-3">
                    {section.title}
                  </h2>

                  {/* Bullet Points */}
                  <ul className="space-y-2">
                    {section.points && section.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start text-gray-600">
                        <span className="text-secondary font-bold mr-3 mt-1">•</span>
                        <span className="text-xs sm:text-sm md:text-base leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TermsContion;