import React from 'react';

const PrivacyPolicy = () => {
  // Back to top scroll routine targeting bottom-right corner control toggle
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const policyData = [
    {
      title: "1. Information We Collect",
      points: [
        <><strong>Personal Data:</strong> Name, email, shipping/billing address, phone number, and payment details.</>,
        <><strong>Automated Data:</strong> Cookies, IP address, browser type, and browsing behavior for analytics.</>,
        <><strong>Order Details:</strong> Purchase history, preferences, and interactions with customer support.</>
      ]
    },
    {
      title: "2. How We Use Your Information",
      points: [
        "Process and fulfill your orders.",
        "Improve our website, products, and services.",
        "Send transactional emails (order confirmations, shipping updates).",
        "Provide personalized offers (with your consent).",
        "Comply with legal obligations."
      ]
    },
    {
      title: "3. Data Sharing & Protection",
      points: [
        <>We <span className="font-bold text-gray-900">never sell</span> your data to third parties.</>,
        "Trusted partners (payment processors, shipping carriers) only receive necessary information.",
        "Data is secured via encryption (SSL) and industry-standard safeguards."
      ]
    },
    {
      title: "4. Your Rights",
      points: [
        "Access, correct, or delete your personal data.",
        "Opt out of marketing emails (unsubscribe link in every email).",
        "Disable cookies via browser settings (may affect site functionality)."
      ]
    },
    {
      title: "5. Policy Updates",
      points: [
        "We may update this policy periodically. Changes will be posted here with the effective date.",
        <><strong>Last Updated:</strong> 17/6/2024</>,
        <><strong>Contact Us:</strong> For privacy-related questions, email <span className="font-bold text-gray-900">[privacy@p2j-mart.gmail.com]</span>.</>
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-8 pb-12 font-sans selection:bg-slate-200 relative">
      <div className="max-w-4xl mx-auto px-4 md:px-6 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
        
        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-[#0A3A60] mb-4 text-center">
          Privacy Policy
        </h1>

        {/* Introduction */}
        <p className="text-sm sm:text-base leading-relaxed text-gray-600 mb-8 text-center max-w-2xl mx-auto border-b border-gray-100 pb-6">
          At p2j-mart, we value your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.
        </p>

        {/* Content Sections */}
        <div className="space-y-8 mt-6">
          {policyData.map((section, index) => (
            <div key={index} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
              {/* Section Title */}
              <h2 className="text-lg sm:text-xl font-bold text-[#0A3A60] mb-3">
                {section.title}
              </h2>

              {/* Bullet Points */}
              <ul className="space-y-2">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start text-gray-600">
                    <span className="text-[#00A3E0] font-bold mr-3 mt-1">•</span>
                    <span className="text-xs sm:text-sm md:text-base leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

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

export default PrivacyPolicy;