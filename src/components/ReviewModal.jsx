import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, item, formatImageUrl, onSubmit, onDelete }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [timeWarning, setTimeWarning] = useState('');

  // Normalize once — both prop names have been used across the app
  const myReview = item?.existingReview || item?.myReview || null;
  const allReviews = item?.productReviews || item?.productId?.reviews || [];

  useEffect(() => {
    if (isOpen && item) {
      const existingReview = item.existingReview || item.myReview;

      if (existingReview) {
        setRating(existingReview.rating || 0);
        setDescription(existingReview.description || '');

        if (existingReview.createdAt) {
          const reviewDate = new Date(existingReview.createdAt);
          const totalDaysPassed = (new Date() - reviewDate) / (1000 * 60 * 60 * 24);

          if (totalDaysPassed > 30) {
            setIsEditable(false);
            setTimeWarning('This review was posted over 30 days ago and can no longer be edited.');
          } else {
            setIsEditable(true);
            setTimeWarning(`You can edit this review for another ${Math.ceil(30 - totalDaysPassed)} day(s).`);
          }
        } else {
          setIsEditable(true);
          setTimeWarning('');
        }
      } else {
        setRating(0);
        setDescription('');
        setIsEditable(true);
        setTimeWarning('');
      }
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const resolveItemId = () =>
    item.itemId || item.productId?._id || item.productId || item.id || item._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) return;

    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        itemId: resolveItemId(),
        rating,
        description
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your review? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await onDelete(resolveItemId());
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-4xl mt-50 overflow-hidden rounded-2xl shadow-2xl border border-gray-100 bg-white text-gray-800 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-600 truncate">
              Product Feedback
            </h3>
            <span className="bg-gray-100 text-gray-600 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              {allReviews.length} Total Reviews
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* LEFT PANEL: Review Form */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto bg-gray-50/50">
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-4">
              {myReview ? 'Your Review' : 'Create New Review'}
            </h4>

            {/* Product Summary */}
            <div className="flex items-center space-x-3 sm:space-x-4 bg-[#003147] p-3 rounded-xl mb-5 shadow-sm">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-white/5 p-0.5">
                <img
                  src={formatImageUrl(item.image || (item.includedProducts && item.includedProducts[0]?.image))}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-xs sm:text-sm truncate">{item.title || item.name}</p>
                <p className="text-[10px] text-teal-300 font-medium mt-0.5">Ordered Qty: {item.quantity || item.qty}</p>
              </div>
            </div>

            {timeWarning && (
              <div className={`p-3 text-xs rounded-xl text-center font-medium mb-4 border ${
                !isEditable
                  ? 'bg-red-50 border-red-100 text-red-700'
                  : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}>
                {timeWarning}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Picker */}
              <div className="bg-white border border-gray-100 p-4 rounded-xl text-center shadow-sm">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Your Star Rating
                </label>
                <div className="flex items-center justify-center space-x-1 sm:space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={!isEditable}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => isEditable && setHoverRating(star)}
                      onMouseLeave={() => isEditable && setHoverRating(0)}
                      className={`p-1 transition-transform transform active:scale-90 ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                    >
                      <Star
                        size={26}
                        className={`transition-colors duration-150 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Review Text Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share your experience regarding item build quality, design or courier shipping speed..."
                  rows={4}
                  required
                  disabled={!isEditable}
                  className="w-full px-3 py-2.5 text-xs border rounded-xl bg-white border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>

              {/* Action buttons — single row, no duplication */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting || deleting}
                  className="px-4 py-2 text-xs font-bold border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-40"
                >
                  Close
                </button>

                {/* {myReview && isEditable && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting || deleting}
                    className="px-4 py-2 text-xs font-bold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {deleting ? 'Deleting...' : 'Delete Review'}
                  </button>
                )} */}

                {isEditable && (
                  <button
                    type="submit"
                    disabled={submitting || deleting}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-[#003147] text-white hover:bg-[#002232] transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {submitting ? 'Processing...' : myReview ? 'Update Review' : 'Post Review'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: Community Reviews */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 overflow-y-auto flex flex-col">
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-4">
               Review Feed
            </h4>

            {allReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center my-auto py-12 text-center border border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                <MessageSquare size={32} className="text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-400">No review logs found</p>
                <p className="text-[11px] text-gray-400 max-w-[200px] mt-0.5">Be the first to leave a feedback rating score!</p>
              </div>
            ) : (
              <div className="space-y-3.5 overflow-y-auto pr-1">
                {allReviews.map((rev, index) => {
                  const isCurrentUserReview = myReview && rev._id === myReview._id;

                  return (
                    <div
                      key={rev._id || index}
                      className={`p-3.5 rounded-xl border transition-all text-xs ${
                        isCurrentUserReview
                          ? 'bg-amber-50/40 border-amber-200 shadow-sm ring-1 ring-amber-400/10'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-extrabold text-gray-800 text-xs truncate">
                            {rev.userName || rev.name || rev.user?.name || 'Verified Buyer'}
                          </span>
                          {isCurrentUserReview && (
                            <span className="bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider whitespace-nowrap">
                              Your review
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                          {formatDate(rev.createdAt || rev.date)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-0.5 text-amber-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < (rev.rating || 0) ? 'fill-current' : 'text-gray-200'}
                          />
                        ))}
                      </div>

                      <p className="text-gray-600 leading-relaxed font-medium break-words text-[12px]">
                        {rev.description || rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}