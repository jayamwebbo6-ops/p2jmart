import React from 'react';

const DeliveryPolicy = () => {
  // Back to top scroll routine targeting bottom-right corner control toggle
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const policyData = [
    {
      title: "1. Return Conditions",
      points: [
        <><strong>Eligibility:</strong> We accept returns within 30 days of delivery for standard items.</>,
        <><strong>Condition:</strong> The item must be unused, in its original packaging, and in the same condition as when you received it.</>,
        <><strong>Customized Products:</strong> Products with custom embroidery, printing, or designs cannot be returned unless there is a manufacturing defect or printing error on our part.</>,
        <><strong>Proof of Purchase:</strong> A receipt, order confirmation email, or invoice is required to process any return request.</>
      ]
    },
    {
      title: "2. Shipping Options & Costs",
      points: [
        <><strong>Standard Shipping:</strong> [X] business days – [Cost or "Free over $X"].</>,
        <><strong>Express Shipping:</strong> [X] business days – [Additional Cost].</>,
        <><strong>International Shipping:</strong> Available to [list countries] – Delivery times vary by location.</>,
        <span className="italic text-gray-500">Shipping costs are calculated at checkout based on weight, destination, and selected method.</span>
      ]
    },
    {
      title: "3. Processing Time",
      points: [
        <>Orders are processed within <strong>[X] business days</strong> (excluding weekends/holidays).</>,
        "You’ll receive a confirmation email with tracking details once your order ships."
      ]
    },
    {
      title: "4. Delivery Timelines",
      points: [
        <><strong>Domestic:</strong> [X-X] business days after processing.</>,
        <><strong>International:</strong> [X-X] business days (customs delays may apply).</>
      ]
    },
    {
      title: "5. Tracking Your Order",
      points: [
        "Track your package via the link in your shipping confirmation email.",
        <>Contact <span className="font-semibold text-gray-900">support@p2j-mart.com</span> if your tracking hasn’t updated in [X] days.</>
      ]
    },
    {
      title: "6. Undeliverable Orders",
      points: [
        "If a package is returned due to an incorrect address or failed delivery, we’ll contact you to reship (additional fees may apply)."
      ]
    },
    {
      title: "7. Returns & Missing Items",
      points: [
        <>Damaged/lost shipments? Email us within [X] days at <span className="font-semibold text-gray-900">support@p2j-mart.com</span>.</>,
        <>See our <span className="text-primary hover:underline font-medium cursor-pointer">Return Policy</span> for full details.</>,
        <><strong>Note:</strong> Shipping partners may require signatures for high-value orders.</>
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-8 pb-12 font-sans selection:bg-slate-200 relative">
      <div className="max-w-4xl mx-auto px-4 md:px-6 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
        
        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-[#0A3A60] mb-4 text-center">
          Shipping & Delivery Policy
        </h1>

        {/* Introduction */}
        <p className="text-sm sm:text-base leading-relaxed text-gray-600 mb-8 text-center max-w-2xl mx-auto border-b border-gray-100 pb-6">
          At p2j-mart, we want to ensure your orders are distributed safely, accurately, and as quickly as possible. This policy details our shipping options, processing estimates, tracking frameworks, and product return guidelines.
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

export default DeliveryPolicy;