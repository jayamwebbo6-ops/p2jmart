import React from 'react';

const TermsContion = () => {
  const policyData = [
    {
      title: "1. Information We Collect",
      points: [
        "Personal Data: We collect personally identifiable information, such as your name, shipping address, email address, and phone number, when you voluntarily register or make a purchase.",
        "Payment Data: Financial information related to your payment method (such as credit card details or digital wallet data) is securely processed by our third-party payment gateways.",
        "Automated Data: When you visit our website, our servers automatically log standard tracking data like your IP address, browser type, and operating system details to optimize performance."
      ]
    },
    {
      title: "2. How We Use Your Information",
      points: [
        "Order Fulfillment: To process and deliver your purchases, manage product order confirmations, and track logistical updates efficiently.",
        "Customer Experience: To resolve support requests, troubleshoot service errors, and improve website navigation interfaces based on user behavior metrics.",
        "Communications: To send transactional notifications, operational account updates, or promotional marketing newsletters (which you can opt-out of at any time)."
      ]
    },
    {
      title: "3. Data Sharing & Disclosure",
      points: [
        "Third-Party Service Providers: We share necessary data with trusted third parties who perform operational services on our behalf, including secure payment processors and shipping couriers.",
        "Legal Requirements: We may disclose your information if required to do so by applicable law, governmental mandates, or valid judicial court subpoenas."
      ]
    },
    {
      title: "4. Data Security & Storage",
      points: [
        "Protection Standards: We implement administrative, technical, and physical security measures designed to protect your personal information from unauthorized access, modification, or exposure.",
        "Risk Acknowledgment: While we take proactive industry-standard steps to secure your data, no method of transmission over the internet can guarantee absolute vulnerability protection."
      ]
    },
    {
      title: "5. Contact & Support",
      points: [
        "Email: vivaadhgroup@gmail.com",
        "Phone: 9361726968",
        "Address: 25, Vembuliamman koil street, West K.K. Nagar, Chennai 78"
      ]
    }
  ];

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

        {/* Content Sections */}
        <div className="space-y-8 mt-6">
          {policyData.map((section, index) => (
            <div key={index} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
              {/* Section Title */}
              <h2 className="text-lg sm:text-xl font-bold text-primary mb-3">
                {section.title}
              </h2>

              {/* Bullet Points */}
              <ul className="space-y-2">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start text-gray-600">
                    <span className="text-secondary font-bold mr-3 mt-1">•</span>
                    <span className="text-xs sm:text-sm md:text-base leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TermsContion;