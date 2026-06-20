import React from 'react';

const CancellationReturnPolicy = () => {
  // Back to top scroll routine targeting bottom-right corner control toggle
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const policyData = [
    {
      title: "1. Information We Collect",
      description: "We may collect the following types of information:",
      points: [
        <><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and billing details when you place an order or contact us.</>,
        <><strong>Payment Information:</strong> Payment card details or other payment method data (processed securely via third-party payment gateways).</>,
        <><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, and browsing patterns, collected via cookies or similar technologies.</>,
        <><strong>Order Details:</strong> Information about your purchases, including customizations for machine embroidery or T-shirt printing.</>
      ]
    },
    {
      title: "2. How We Use Your Information",
      description: "We use the information we collect for the following purposes:",
      points: [
        "To process and fulfill your orders, including shipping and delivery.",
        "To communicate with you about your orders, inquiries, or requests.",
        "To improve our website, products, and customer experience.",
        "To send promotional offers, newsletters, or updates (with your consent).",
        "To comply with legal obligations and prevent fraudulent activities."
      ]
    },
    {
      title: "3. Data Sharing and Disclosure",
      description: "We do not sell or rent your personal data. However, we may share your information with:",
      points: [
        <><strong>Service Providers:</strong> Shipping companies, payment gateways, or IT service providers to process and deliver your orders.</>,
        <><strong>Legal Authorities:</strong> If required by law or to protect our legal rights.</>,
        <><strong>Analytics Providers:</strong> To analyze website performance and user behavior (e.g., Google Analytics).</>
      ]
    },
    {
      title: "4. Data Security",
      description: "We implement robust security measures to protect your personal information, including:",
      points: [
        "Data encryption during transmission.",
        "Secure servers and firewalls to prevent unauthorized access.",
        "Regular monitoring and updates to our security protocols.",
        <span className="text-gray-500 font-medium">Despite our efforts, no online platform can guarantee 100% security.</span>
      ]
    },
    {
      title: "5. Cookies and Tracking Technologies",
      description: "We use cookies to enhance your browsing experience. These may include:",
      points: [
        <><strong>Essential Cookies:</strong> Necessary for the website to function properly.</>,
        <><strong>Performance Cookies:</strong> Help us analyze website usage.</>,
        <><strong>Advertising Cookies:</strong> Used to deliver relevant ads to you.</>,
        <span className="italic text-gray-500">You can manage or disable cookies through your browser settings.</span>
      ]
    },
    {
      title: "6. Your Rights",
      description: "You have the following rights regarding your personal data:",
      points: [
        <><strong>Access and Correction:</strong> Request access to or correction of your personal information.</>,
        <><strong>Deletion:</strong> Request deletion of your data, subject to legal and operational requirements.</>,
        <><strong>Opt-out:</strong> Unsubscribe from promotional emails or opt-out of data collection through cookies.</>,
        <span className="block mt-2 font-medium text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
          To exercise these rights, contact us at <span className="text-blue-600 underline">vivaadhgroup@gmail.com</span> / <span className="font-semibold">9361726968</span>.
        </span>
      ]
    },
    {
      title: "7. Legal Compliance",
      points: [
        "This Privacy Policy is governed by Indian laws. By using our services, you consent to the collection and use of your information as outlined in this policy."
      ]
    },
    {
      title: "8. Updates to This Policy",
      points: [
        "We may update this Privacy Policy periodically. Changes will be communicated through our website, and the updated policy will take effect immediately upon posting."
      ]
    }
  ];

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

        {/* Content Sections 1 to 8 */}
        <div className="space-y-8 mt-6">
          {policyData.map((section, index) => (
            <div key={index} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
              {/* Section Title */}
              <h2 className="text-lg sm:text-xl font-bold text-[#0A3A60] mb-2">
                {section.title}
              </h2>

              {/* Optional Section Description Descriptor Context */}
              {section.description && (
                <p className="text-xs sm:text-sm text-gray-500 mb-3 leading-relaxed">
                  {section.description}
                </p>
              )}

              {/* Bullet Points */}
              <ul className="space-y-2">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start text-gray-600">
                    <span className="text-[#00A3E0] font-bold mr-3 mt-1">•</span>
                    <span className="text-xs sm:text-sm md:text-base leading-relaxed w-full">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Section 9: Contact Us Structural Layout Footer Block Blockout */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-[#0A3A60] mb-4">
            9. Contact Us
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
            For questions or concerns regarding this Privacy Policy, please contact us at:
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 max-w-md">
            <div className="flex items-center text-xs sm:text-sm text-gray-700">
              <span className="font-bold text-gray-900 w-16 block">Email:</span>
              <a href="mailto:vivaadhgroup@gmail.com" className="text-blue-600 hover:underline">
                vivaadhgroup@gmail.com
              </a>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-700">
              <span className="font-bold text-gray-900 w-16 block">Phone:</span>
              <a href="tel:9361726968" className="hover:text-blue-600 font-medium">
                9361726968
              </a>
            </div>
          </div>
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

export default CancellationReturnPolicy;