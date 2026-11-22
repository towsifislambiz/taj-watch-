import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '../data/products';
import { subscribeToReviews } from '../firebase/services';

export default function CustomerReviews() {
  const [reviewsList, setReviewsList] = useState(CUSTOMER_REVIEWS);

  useEffect(() => {
    const unsubscribe = subscribeToReviews((liveRevs) => {
      if (liveRevs && liveRevs.length > 0) {
        setReviewsList(liveRevs);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const displayReviews = reviewsList.slice(0, 3);

  return (
    <section className="py-8 sm:py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Minimal Section Header */}
        <div className="text-center max-w-md mx-auto mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-black text-gray-950">
            সম্মানিত গ্রাহকদের রিভিউ
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            সন্তুষ্ট গ্রাহকদের বাস্তব অভিজ্ঞতা
          </p>
        </div>

        {/* Clean Minimal 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {displayReviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between space-y-3"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  &ldquo;{rev.review || rev.comment || rev.text}&rdquo;
                </p>
              </div>

              {/* Customer Info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{rev.name}</span>
                  <span className="text-[10px] text-gray-400">{rev.location || rev.city || 'ঢাকা'}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>ভেরিফাইড ক্রেতা</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
