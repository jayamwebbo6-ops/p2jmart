import React from "react";

const OfferFilter = ({ selectedDiscount, onDiscountChange }) => {
  const options = [
    { label: "10% Off or more", value: 10 },
    { label: "25% Off or more", value: 25 },
    { label: "50% Off or more", value: 50 },
  ];

  return (
    <div className="border-t border-gray-100 pt-4">
      <h3 className="font-bold text-gray-800 text-base mb-3">Offers & Discounts</h3>
      <div className="flex flex-col gap-2.5">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={selectedDiscount === opt.value}
              onChange={() => {
                // If clicked item is already selected, uncheck it (set to 0)
                onDiscountChange(selectedDiscount === opt.value ? 0 : opt.value);
              }}
              className="w-4 h-4 rounded border-gray-300 text-[#0A2540] focus:ring-[#0A2540]"
            />
            <span className={selectedDiscount === opt.value ? "text-gray-900 font-semibold" : ""}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default OfferFilter;
