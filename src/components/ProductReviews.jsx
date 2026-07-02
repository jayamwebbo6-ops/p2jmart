import React, { useState, useEffect, useMemo } from 'react';
import { Star, ShieldCheck, MessageSquare, Loader } from 'lucide-react';
import { getProductReviewsAPI } from '../api/productApi';

export default function ProductReviews({ productId, initialRating = 0, initialReviewCount = 0 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getProductReviewsAPI(productId);
        if (isMounted && res.success) {
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to load product reviews:", err);
        if (isMounted) setError("Couldn't load reviews right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => { isMounted = false; };
  }, [productId]);

  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: initialRating || 0,
        distribution: [0, 0, 0, 0, 0] // index 0 = 5★ ... index 4 = 1★
      };
    }

    const distribution = [0, 0, 0, 0, 0];
    let sum = 0;
    reviews.forEach(rev => {
      const r = Math.round(rev.rating || 0);
      sum += rev.rating || 0;
      if (r >= 1 && r <= 5) distribution[5 - r]++;
    });

    return { total, average: sum / total, distribution };
  }, [reviews, initialRating]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitial = (name) => (name || 'U').trim().charAt(0).toUpperCase();

  const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
  const getAvatarColor = (name) => {
    const code = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return avatarColors[code % avatarColors.length];
  };

  const displayTotal = stats.total || initialReviewCount || 0;

  return (
    <div className="w-full mt-10 bg-white rounded-xl border border-gray-200 shadow-2xs p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1">Customer Reviews</h3>
      <p className="text-xs text-gray-500 mb-6">Real feedback from verified buyers who purchased this product</p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-14 text-gray-400">
          <Loader className="w-6 h-6 animate-spin mb-2" />
          <p className="text-xs font-medium">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-sm text-red-500 font-medium">{error}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT: Rating Summary */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-black text-gray-900">{stats.average.toFixed(1)}</span>
              <div>
                <div className="flex text-amber-400 mb-1">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFull = stats.average >= starValue;
                    const isHalf = !isFull && stats.average >= starValue - 0.5;
                    return (
                      <Star
                        key={starValue}
                        size={16}
                        fill={isFull ? "currentColor" : "none"}
                        className={isFull ? "text-amber-400" : isHalf ? "text-amber-400 opacity-50" : "text-gray-300"}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {displayTotal} Customer Review{displayTotal !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, idx) => {
                const count = stats.distribution[idx];
                const percent = displayTotal > 0 ? Math.round((count / displayTotal) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-gray-500 font-medium">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-8 text-right text-gray-400 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Individual Reviews */}
          <div className="flex-1 min-w-0">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <MessageSquare size={30} className="text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-500">No reviews yet</p>
                <p className="text-xs text-gray-400 mt-0.5 max-w-[240px]">
                  Be the first buyer to share your experience with this product.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                {reviews
                  .slice()
                  .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                  .map((rev, index) => {
                    const name = rev.name || rev.userName || rev.user?.name || 'Verified Buyer';
                    const currentRating = rev.rating || 0;

                    return (
                      <div key={rev._id || index} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${getAvatarColor(name)}`}>
                            {getInitial(name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-gray-800 text-sm truncate">{name}</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  <ShieldCheck size={10} /> Verified Purchase
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                                {formatDate(rev.createdAt)}
                              </span>
                            </div>

                            {/* FIXED: Individual Real Data Stars Loop */}
                            <div className="flex items-center text-amber-400 mt-1.5 mb-2">
                              {[1, 2, 3, 4, 5].map((starValue) => (
                                <Star 
                                  key={starValue} 
                                  size={13} 
                                  fill={starValue <= currentRating ? 'currentColor' : 'none'} 
                                  className={starValue <= currentRating ? 'text-amber-400' : 'text-gray-200'} 
                                />
                              ))}
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed break-words">
                              {rev.description || rev.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}