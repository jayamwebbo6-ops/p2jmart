import React from 'react';

const ReturnPolicy = () => {
  const policyData = [
    {
      title: "1. Return Conditions",
      points: [
        "Eligibility: We accept returns within 30 days of delivery for standard items.",
        "Condition: The item must be unused, in its original packaging, and in the same condition as when you received it.",
        "Customized Products: Products with custom embroidery, printing, or designs cannot be returned unless there is a manufacturing defect or printing error on our part.",
        "Proof of Purchase: A receipt, order confirmation email, or invoice is required to process any return request."
      ]
    },
    {
      title: "2. Refund Process",
      points: [
        "Inspection: Once we receive and inspect your returned item, we will notify you via email or phone regarding the approval or rejection of your refund.",
        "Refund Method: Approved refunds will be processed and automatically credited back to your original payment method within 5-7 business days.",
        "Shipping Cost: Shipping fees are non-refundable unless the return is due to an error on our part (such as a wrong or defective item)."
      ]
    },
    {
      title: "3. Order Cancellation",
      points: [
        "Standard Items: You may cancel your order at any time before it has been shipped. Once shipped, the return policy will apply.",
        "Customized Orders: Cancellation requests for customized items must be made within 12 hours of placing the order. Once production has started, customized orders cannot be cancelled or refunded."
      ]
    },
    {
      title: "4. Damaged or Defective Items",
      points: [
        "Notification: If you receive a damaged, defective, or incorrect product, please contact us immediately.",
        "Deadline: Report damage within 48 hours of delivery, along with order details and photographs of the defect.",
        "Replacement: We will arrange a free replacement or issue a full refund (including shipping fees) for verified damaged goods."
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
          Refund & Cancellation Policy
        </h1>

        {/* Introduction */}
        <p className="text-sm sm:text-base leading-relaxed text-gray-600 mb-8 text-center max-w-2xl mx-auto border-b border-gray-100 pb-6">
          At p2j-mart, we want you to be completely satisfied with your purchase. This page explains our terms for cancellations, returns, and refunds.
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

export default ReturnPolicy;
