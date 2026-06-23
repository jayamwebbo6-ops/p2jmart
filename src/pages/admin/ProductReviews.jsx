import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, Star } from 'lucide-react';
import AdminTable from '../../components/AdminTable'; // Update this path to match your file structure

const ProductReviews = ({ combo, onBack }) => {
  // Use data fallback safeguards if no combo object is provided
  const activeCombo = combo || {
    name: "Product Reviews",
    rating: 0,
    reviewCount: 0,
    reviews: []
  };

  // Local state to manage internal table sorting conditions
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [reviewList, setReviewList] = useState(activeCombo.reviews || []);

  // Update table dataset dynamically if the parent combo properties change
  useEffect(() => {
    setReviewList(activeCombo.reviews || []);
  }, [combo]);

  // Configure target headers for the AdminTable interface
  const tableHeaders = [
    { key: 'userName', label: 'Customer Name', sortable: true, align: 'left' },
    { key: 'rating', label: 'Rating', sortable: true, align: 'left' },
    { key: 'comment', label: 'Content Feedback', sortable: false, align: 'left' },
    { key: 'date', label: 'Date', sortable: true, align: 'left' }
  ];

  // Simple column sort event execution mapping logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...reviewList].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'date') {
        return direction === 'asc' 
          ? new Date(valA) - new Date(valB) 
          : new Date(valB) - new Date(valA);
      }
      if (typeof valA === 'string') {
        return direction === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    setReviewList(sortedData);
  };

  // Render format loop instructions executed inside AdminTable rows
  const renderReviewRow = (review, index) => {
    return (
      <tr key={review.id || index} className="hover:bg-slate-50/50 transition-colors font-medium">
        {/* Customer Name */}
        <td className="py-4 px-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-gray-500 shrink-0">
              <User size={14} />
            </div>
            <span className="font-bold text-gray-800 text-xs">{review.userName}</span>
          </div>
        </td>

        {/* Rating Block Rendering */}
        <td className="py-4 px-3 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  fill={i < review.rating ? "currentColor" : "none"} 
                  className={i < review.rating ? "text-amber-500" : "text-gray-200"}
                />
              ))}
            </div>
            <span className="text-gray-500 text-[11px] font-bold">({review.rating.toFixed(1)})</span>
          </div>
        </td>

        {/* Content Review Payload */}
        <td className="py-4 px-3 max-w-md">
          <p className="text-gray-600 font-normal leading-relaxed text-xs break-words">
            {review.comment}
          </p>
        </td>

        {/* Localized Date Column */}
        <td className="py-4 px-3 whitespace-nowrap text-gray-400 font-semibold text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="opacity-70" />
            <span>
              {new Date(review.date).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full font-sans antialiased text-primary">
      {/* Return Navigation Button calling parent function state reset */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> 
        Back to Combo List
      </button>

      {/* Aggregate Header Frame Area */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Feedback Audit View</span>
          <h1 className="text-lg font-extrabold text-gray-800 tracking-tight">{activeCombo.name}</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 border border-gray-100 px-4 py-2.5 rounded-lg self-start md:self-auto">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={16} fill="currentColor" />
            <span className="text-sm font-black text-gray-800">{Number(activeCombo.rating).toFixed(1)}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="text-xs font-bold text-gray-500">{activeCombo.reviewCount} Total Submissions</span>
        </div>
      </div>

      {/* Integrated Admin Table Element Component Module Container */}
      <AdminTable
        headers={tableHeaders}
        data={reviewList}
        renderRow={renderReviewRow}
        onSort={handleSort}
        sortConfig={sortConfig}
        minWidth="min-w-[800px]"
        emptyMessage="No customer evaluation reviews left discovered for this bundle pack."
      />
    </div>
  );
};

export default ProductReviews;