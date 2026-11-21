import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Eye, Camera, MapPin, Award, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CUSTOMER_REVIEWS } from '../data/products';
import { subscribeToReviews } from '../firebase/services';

export default function CustomerReviews() {
  const [reviewsList, setReviewsList] = useState(CUSTOMER_REVIEWS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Subscribe to Firestore Reviews
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

  // Responsive window tracker
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevReview();
      } else if (e.key === 'ArrowRight') {
        nextReview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reviewsList.length]);

  // Auto-play timer (pauses when user hovers over carousel)
  useEffect(() => {
    if (isHovered || reviewsList.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviewsList.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered, reviewsList.length]);

  const prevReview = () => {
    if (reviewsList.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + reviewsList.length) % reviewsList.length);
  };

  const nextReview = () => {
    if (reviewsList.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % reviewsList.length);
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextReview();
      } else {
        prevReview();
      }
    }
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isLaptop = windowWidth >= 1024 && windowWidth < 1280;
  const isDesktop = windowWidth >= 1280;
  const total = reviewsList.length;

  if (total === 0) return null;

  return (
    <section
      id="customer-reviews-section"
      className="py-14 sm:py-20 lg:py-24 bg-[#06090F] text-white relative overflow-hidden select-none border-t border-b border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Cinematic Grid Texture Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: isMobile ? '32px 32px' : '48px 48px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, #000 25%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, #000 25%, transparent 80%)',
        }}
      />

      {/* 2. Jewel-Tone Aurora Lighting Behind Stage */}
      <div className="absolute top-1/4 -left-36 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-36 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[360px] bg-gradient-to-r from-red-600/20 via-amber-500/15 to-emerald-500/20 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-3 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>REAL BUYER EXPERIENCES • ১০০% ভেরিফায়েড রিভিউ</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight">
            Customer Reviews{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-red-400 font-sans text-lg sm:text-2xl lg:text-3xl font-bold">
              | ৩ডি কভারফ্লো রিভিউ
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2.5 font-medium max-w-lg mx-auto leading-relaxed">
            আমাদের সম্মানিত গ্রাহকদের ডেলিভারি পাওয়ার পর সরাসরি হাতের ছবি ও খাঁটি অভিজ্ঞতা। যেকোনো কার্ডে ক্লিক করে বিস্তারিত দেখুন।
          </p>
        </div>

        {/* 3D Coverflow Perspective Stage */}
        <div
          className="relative w-full max-w-6xl mx-auto h-[425px] sm:h-[460px] lg:h-[490px] flex items-center justify-center my-2"
          style={{
            perspective: isMobile ? '1200px' : '1600px',
            transformStyle: 'preserve-3d',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {reviewsList.map((review, idx) => {
            let offset = idx - activeIndex;
            if (offset > Math.floor(total / 2)) offset -= total;
            else if (offset < -Math.floor(total / 2)) offset += total;

            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            const dir = Math.sign(offset);

            let translateX = 0;
            let translateZ = 0;
            let rotateY = 0;
            let scale = 1;
            let opacity = 1;
            let isVisible = true;

            if (isCenter) {
              translateX = 0;
              translateZ = isMobile ? 70 : isTablet ? 120 : 155;
              rotateY = 0;
              scale = 1;
              opacity = 1;
            } else if (absOffset === 1) {
              translateX = dir * (isMobile ? 125 : isTablet ? 195 : 270);
              translateZ = isMobile ? -30 : -70;
              rotateY = -dir * (isMobile ? 34 : 44);
              scale = isMobile ? 0.84 : 0.88;
              opacity = 0.88;
            } else if (absOffset === 2) {
              translateX = dir * (isMobile ? 210 : isTablet ? 350 : 470);
              translateZ = isMobile ? -90 : -180;
              rotateY = -dir * (isMobile ? 40 : 48);
              scale = isMobile ? 0.68 : 0.74;
              opacity = isMobile ? 0 : isTablet ? 0.45 : 0.6;
              isVisible = !isMobile;
            } else if (absOffset === 3) {
              translateX = dir * (isMobile ? 280 : isTablet ? 470 : 620);
              translateZ = isMobile ? -150 : -290;
              rotateY = -dir * (isMobile ? 44 : 50);
              scale = 0.6;
              opacity = isMobile || isTablet ? 0 : 0.3;
              isVisible = isLaptop || isDesktop;
            } else {
              translateX = dir * 720;
              translateZ = -400;
              scale = 0.4;
              opacity = 0;
              isVisible = false;
            }

            const wristPhotoSrc = review.wristPhoto || review.image || review.wristImage || '/assets/brand/logo.jpeg';
            const hasCustomAvatar = Boolean(review.avatar || review.image);

            return (
              <div
                key={review.id || idx}
                onClick={() => setActiveIndex(idx)}
                role="button"
                tabIndex={0}
                aria-label={`Customer review by ${review.name}`}
                className={`absolute top-1/2 left-1/2 rounded-[24px] sm:rounded-[30px] transition-all duration-600 ease-out overflow-hidden cursor-pointer select-none group ${
                  isCenter
                    ? 'ring-2 ring-amber-400/90 shadow-[0_25px_65px_-10px_rgba(245,158,11,0.4),0_0_40px_rgba(245,158,11,0.25)]'
                    : 'shadow-[0_20px_50px_rgba(0,0,0,0.85)] hover:border-white/30'
                }`}
                style={{
                  width: isMobile ? '270px' : isTablet ? '295px' : '325px',
                  height: isMobile ? '395px' : isTablet ? '425px' : '450px',
                  marginLeft: isMobile ? '-135px' : isTablet ? '-147.5px' : '-162.5px',
                  marginTop: isMobile ? '-197.5px' : isTablet ? '-212.5px' : '-225px',
                  transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  zIndex: isCenter ? 60 : 50 - absOffset * 10,
                  opacity: opacity,
                  pointerEvents: isVisible ? 'auto' : 'none',
                  filter: isCenter
                    ? 'none'
                    : `brightness(${0.88 - absOffset * 0.14}) contrast(0.95)`,
                  background: 'linear-gradient(165deg, rgba(26, 35, 52, 0.96) 0%, rgba(14, 19, 29, 0.98) 55%, rgba(6, 9, 15, 1) 100%)',
                  border: isCenter
                    ? '1.5px solid rgba(251, 191, 36, 0.7)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {/* 1. Glossy Diagonal Surface Sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-transparent pointer-events-none" />

                {/* 2. Ambient Jewel-Tone Top Glow */}
                <div
                  className="absolute top-0 inset-x-0 h-36 opacity-35 pointer-events-none rounded-t-[30px]"
                  style={{
                    background: `radial-gradient(ellipse at top, ${review.accentColor || '#f59e0b'}, transparent 70%)`,
                  }}
                />

                {/* 3. Watermark Quotation Mark in Background */}
                <span className="absolute -top-3 right-4 font-serif text-8xl text-white/[0.04] pointer-events-none select-none">
                  “
                </span>

                {/* 4. Card Content Layout */}
                <div className="relative p-3.5 sm:p-5 h-full flex flex-col justify-between z-10 text-left">
                  
                  {/* Top: Category Eyebrow & Star Rating */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                      <span
                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1"
                        style={{
                          backgroundColor: `${review.accentColor || '#f59e0b'}20`,
                          borderColor: `${review.accentColor || '#f59e0b'}50`,
                          color: review.accentColor || '#f59e0b',
                        }}
                      >
                        <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>{review.tag || 'VERIFIED BUYER'}</span>
                      </span>
                      
                      {/* 5-Star Rating Pill */}
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                        <div className="flex items-center">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
                          ))}
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-black text-amber-300 ml-1">৫.০</span>
                      </div>
                    </div>

                    {/* Customer Delivery Watch Photo Window */}
                    <div className="relative w-full h-32 sm:h-38 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800/40 via-black/60 to-black/90 border border-white/15 flex items-center justify-center group/img shadow-inner">
                      <img
                        src={wristPhotoSrc}
                        alt={review.watchModel || review.product || 'Watch'}
                        className="w-full h-full object-cover filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] group-hover/img:scale-108 transition-all duration-700 ease-out"
                        loading="lazy"
                        onError={(e) => { e.target.src = '/assets/brand/logo.jpeg'; }}
                      />
                      
                      {/* Subtle Dark Vignette & Reflection */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                      {/* Photo Badge Overlay with Pulsing Dot */}
                      <div className="absolute bottom-1.5 sm:bottom-2 inset-x-2 sm:inset-x-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-center text-[9px] sm:text-[10px] text-amber-300 font-bold flex items-center justify-center gap-1.5 border border-white/10 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                        <span>ডেলিভারি প্রাপ্ত ঘড়ির ছবি</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Watch Model & Customer Review Quote */}
                  <div className="my-1 sm:my-1.5 space-y-0.5 sm:space-y-1">
                    <p className="text-[11px] sm:text-xs font-bold text-amber-200 truncate flex items-center gap-1">
                      <span className="text-amber-400">⌚</span>
                      <span>{review.watchModel || review.product || 'Luxury Watch'}</span>
                    </p>
                    <blockquote className="text-[10px] sm:text-xs text-slate-200 leading-relaxed italic line-clamp-3 font-normal tracking-wide">
                      &ldquo;{review.comment}&rdquo;
                    </blockquote>
                  </div>

                  {/* Bottom: Customer Profile & Action */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        
                        {/* Profile Avatar: Custom Photo OR Luxury Initials Badge (When no pic is uploaded) */}
                        <div className="relative">
                          {hasCustomAvatar ? (
                            <img
                              src={review.avatar || review.image}
                              alt={review.name}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-amber-400/60 shadow-md"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-600 via-zinc-800 to-black border-2 border-amber-400/60 flex items-center justify-center text-[11px] font-black text-amber-300 shadow-md">
                              {review.name ? review.name.slice(0, 1) : <User className="w-3.5 h-3.5 text-zinc-300" />}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-[11px] sm:text-xs flex items-center gap-1">
                            <span>{review.name}</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-500/20" />
                          </h4>
                          <p className="text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2 h-2 text-slate-500" />
                            <span>{review.location || 'ঢাকা'}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium shrink-0 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {review.date || review.timeAgo || 'সম্প্রতি'}
                      </span>
                    </div>

                    {/* On Center Card: Premium Luxury Glow CTA Button */}
                    {isCenter && (
                      <a
                        href="#all-products-section"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 sm:mt-2.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/30 active:scale-95 group/btn"
                      >
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>ঘড়িগুলো দেখুন ও অর্ডার করুন</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Controls Row: Prev Button / Animated Pill Dots / Next Button */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 mt-4 sm:mt-8">
          <button
            onClick={prevReview}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 cursor-pointer"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            {reviewsList.slice(0, 10).map((_, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                    isActive
                      ? 'w-6 sm:w-10 bg-gradient-to-r from-amber-400 via-red-500 to-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.9)]'
                      : 'w-2 sm:w-2.5 bg-white/25 hover:bg-white/50'
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              );
            })}
          </div>

          <button
            onClick={nextReview}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 cursor-pointer"
            aria-label="Next review"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 100% Satisfaction Trust Guarantee Strip */}
        <div className="mt-8 sm:mt-14 bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 sm:p-5 text-center max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <span className="font-semibold">সরাসরি ডেলিভারিম্যানের সামনে চেক করে নেওয়ার সুবিধা</span>
          </div>
          <span className="hidden sm:inline text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">পছন্দ না হলে সাথে সাথেই রিটার্নের নিশ্চয়তা</span>
          </div>
          <span className="hidden sm:inline text-white/20">|</span>
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <span>০ টাকা অগ্রিম পেমেন্টে</span> অর্ডার করুন
          </div>
        </div>

      </div>
    </section>
  );
}