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

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 20;

  // Update table dataset dynamically if the parent combo properties change
  useEffect(() => {
  setReviewList(activeCombo.reviews || []);
  setCurrentPage(1);
}, [activeCombo]);

  // Configure target headers for the AdminTable interface
  const tableHeaders = [
  { key: 'name', label: 'Customer Name', sortable: true, align: 'left' },
  { key: 'rating', label: 'Rating', sortable: true, align: 'left' },
  { key: 'description', label: 'Content Feedback', sortable: false, align: 'left' },
  { key: 'createdAt', label: 'Date', sortable: true, align: 'left' }
];

const totalPages = Math.ceil(reviewList.length / reviewsPerPage);

const startIndex = (currentPage - 1) * reviewsPerPage;
const endIndex = startIndex + reviewsPerPage;

const paginatedReviews = reviewList.slice(startIndex, endIndex);

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
            <span className="font-bold text-gray-800 text-xs">{review.name}</span>
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
            {review.description || "No feedback provided"}
          </p>
        </td>

        {/* Localized Date Column */}
        <td className="py-4 px-3 whitespace-nowrap text-gray-400 font-semibold text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="opacity-70" />
            <span>
              {new Date(review.createdAt).toLocaleDateString('en-IN', { 
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
        data={paginatedReviews}
        renderRow={renderReviewRow}
        onSort={handleSort}
        sortConfig={sortConfig}
        minWidth="min-w-[800px]"
        emptyMessage="No customer evaluation reviews left discovered for this bundle pack."
      />

      {reviewList.length > 0 && totalPages > 1 && (
  <div className="flex items-center justify-between mt-4 px-2">
    <p className="text-xs text-gray-500 font-medium">
      Showing <span className="font-bold">{startIndex + 1}</span> to{" "}
      <span className="font-bold">
        {Math.min(endIndex, reviewList.length)}
      </span>{" "}
      of <span className="font-bold">{reviewList.length}</span> reviews
    </p>

    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-md text-xs font-bold border transition ${
              currentPage === page
                ? "bg-[#001E3C] text-white border-[#001E3C]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default ProductReviews;