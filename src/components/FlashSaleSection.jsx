import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ShoppingCart, Zap, Star, Sparkles, Crown, AlertOctagon, Lock } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { subscribeToProducts, subscribeToFlashSaleConfig } from '../firebase/services';

export default function FlashSaleSection() {
  const { triggerOneClickOrder, addToCart } = useCart();
  
  const [products, setProducts] = useState(PRODUCTS);
  const [flashConfig, setFlashConfig] = useState({
    active: true,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    title: 'Flash Sale | ফ্ল্যাশ সেল',
    subtitle: 'সীমিত সময়ের বিশেষ স্টক ক্লিয়ারেন্স অফার',
  });

  // Real-time Firestore sync
  useEffect(() => {
    const unsubProducts = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) setProducts(prods);
    });

    const unsubConfig = subscribeToFlashSaleConfig((cfg) => {
      if (cfg) setFlashConfig(cfg);
    });

    return () => {
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubConfig === 'function') unsubConfig();
    };
  }, []);

  // Filter flash sale products
  const activeFlashProducts = products.filter((p) => p.isFlashSale);
  // If no products explicitly marked as flash sale, use the top 4
  const displayProducts = activeFlashProducts.length > 0 ? activeFlashProducts : products.slice(0, 4);

  // Live Reverse Countdown Timer (Calculated against flashConfig.endTime)
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!flashConfig.active) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const target = new Date(flashConfig.endTime).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [flashConfig]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  // When Flash sale time has ended or disabled: Switch to normal product section
  const isFlashActive = flashConfig.active && !timeLeft.isExpired;

  return (
    <section
      id="flash-sale-section"
      className={`py-8 sm:py-12 border-b border-gray-200 transition-colors duration-500 ${
        isFlashActive ? 'bg-[#FFF8F8]' : 'bg-slate-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header: Dynamic Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-5 mb-5 sm:mb-8 border-b border-gray-200 gap-3 sm:gap-4">
          
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isFlashActive
                  ? 'bg-red-100 border-red-200 text-red-600 animate-pulse'
                  : 'bg-amber-100 border-amber-300 text-amber-600'
              }`}
            >
              {isFlashActive ? (
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-red-600" />
              ) : (
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                {isFlashActive ? (
                  <>
                    <span>Flash Sale</span>
                    <span className="text-red-600 font-sans text-sm sm:text-lg font-bold">| ফ্ল্যাশ সেল</span>
                  </>
                ) : (
                  <>
                    <span>Featured Timepieces</span>
                    <span className="text-amber-600 font-sans text-sm sm:text-lg font-bold">| বিশেষ কালেকশন</span>
                  </>
                )}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                {isFlashActive
                  ? flashConfig.subtitle || 'সীমিত সময়ের বিশেষ স্টক ক্লিয়ারেন্স অফার'
                  : 'আমাদের এক্সক্লুসিভ জনপ্রিয় লাক্সারি টাইমপিস ও রয়্যাল দেয়াল ঘড়ি'}
              </p>
            </div>
          </div>

          {/* Ending Offer Live Countdown Clock (Only visible when Flash Sale is active!) */}
          {isFlashActive ? (
            <div className="flex items-center gap-2 bg-white border border-red-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm self-stretch sm:self-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-gray-700">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>অফার শেষ হতে বাকি:</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-black">
                <span className="bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-bold shadow-sm">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span className="text-gray-400 font-bold">:</span>
                <span className="bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-bold shadow-sm">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span className="text-gray-400 font-bold">:</span>
                <span className="bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-bold shadow-sm">
                  {formatNumber(timeLeft.seconds)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-gray-600 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>১০০% অথেনটিক সুইস ও জাপানি ডিজাইন</span>
            </div>
          )}

        </div>

        {/* Product Cards Grid: 2-Cols on Mobile, 3-Cols on Tablet, 4-Cols on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {displayProducts.map((product) => {
            const isOutOfStock =
              product.inStock === false ||
              (typeof product.stock === 'number' && product.stock <= 0);

            return (
              <div
                key={product.id}
                className={`group relative bg-white border rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isOutOfStock
                    ? 'border-gray-200 opacity-95'
                    : isFlashActive
                    ? 'border-gray-200 hover:border-red-400'
                    : 'border-gray-200 hover:border-amber-400'
                }`}
              >
                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-30 flex flex-col gap-1 items-start">
                  {isOutOfStock ? (
                    <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      স্টক আউট
                    </span>
                  ) : (
                    <>
                      {isFlashActive && product.discountPercent ? (
                        <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                          {product.discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="bg-amber-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                          EXCLUSIVE
                        </span>
                      )}
                    </>
                  )}
                  {product.brand && (
                    <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Stock Indicator */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30">
                  {isOutOfStock ? (
                    <span className="bg-red-50 border border-red-200 text-red-600 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>স্টক আউট</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="hidden xs:inline">স্টক</span> {product.stock || 8} টি
                    </span>
                  )}
                </div>

                {/* Watch Image Box with Luxury Stock Out Overlay */}
                <Link
                  to={`/product/${product.id}`}
                  className="relative w-full aspect-square bg-[#0c1019] rounded-xl overflow-hidden flex items-center justify-center p-1.5 mb-2.5 mt-3 sm:mt-4 group-hover:bg-black transition-colors"
                >
                  <img
                    src={product.image || '/assets/brand/logo.jpeg'}
                    alt={product.name}
                    className={`w-full h-full object-cover rounded-lg transition-all duration-500 ${
                      isOutOfStock
                        ? 'grayscale opacity-35 contrast-75'
                        : 'group-hover:scale-105'
                    }`}
                    loading="lazy"
                    onError={(e) => { e.target.src = '/assets/brand/logo.jpeg'; }}
                  />

                  {/* Superb Luxury Stock Out Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-3 z-20">
                      <div className="w-full max-w-[130px] sm:max-w-[150px] bg-gradient-to-b from-[#181a24]/95 via-[#0f1118]/95 to-[#090b10]/95 border border-red-500/60 rounded-2xl py-2 px-2.5 sm:px-3 text-center shadow-2xl shadow-red-950/80 transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                        <div className="inline-flex items-center justify-center gap-1 text-red-500 mb-0.5">
                          <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
                          <span className="font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-red-400">
                            SOLD OUT
                          </span>
                        </div>
                        <div className="text-white font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow font-display">
                          STOCK OUT
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-zinc-300 font-bold border-t border-red-500/30 pt-0.5 mt-0.5 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>স্টক শেষ</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-gray-800 text-[10px] sm:text-xs">{product.rating || 4.9}</span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400">({product.reviewCount || 45})</span>
                    </div>

                    <Link
                      to={`/product/${product.id}`}
                      className={`block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 transition-colors min-h-[2.3rem] leading-snug ${
                        isFlashActive ? 'hover:text-red-600' : 'hover:text-amber-600'
                      }`}
                      title={product.name}
                    >
                      {product.nameBn || product.name}
                    </Link>
                  </div>

                  {/* Price Display */}
                  <div className="mt-1.5 sm:mt-2 mb-2 sm:mb-2.5">
                    <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                      <span
                        className={`text-sm sm:text-base md:text-lg font-black tracking-tight ${
                          isFlashActive ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        ৳ {Number(product.price || 0).toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[11px] sm:text-xs text-gray-400 line-through font-medium">
                          ৳ {Number(product.originalPrice || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Action Buttons OR Stock Out Disabled State */}
                  {isOutOfStock ? (
                    <div className="pt-1">
                      <button
                        disabled
                        className="w-full bg-zinc-100 border border-zinc-200 text-zinc-400 font-extrabold text-[10px] sm:text-xs py-2 sm:py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed select-none transition-colors"
                        title="এই ঘড়িটির স্টক শেষ হয়ে গেছে"
                      >
                        <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>স্টক শেষ (OUT OF STOCK)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      <button
                        onClick={() => triggerOneClickOrder(product)}
                        className={`col-span-4 font-extrabold text-[10px] sm:text-xs py-2 sm:py-2.5 px-1 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-1 transform active:scale-95 whitespace-nowrap text-white cursor-pointer ${
                          isFlashActive
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                            : 'bg-gray-900 hover:bg-black shadow-gray-900/20'
                        }`}
                      >
                        <Zap className="w-3 h-3 fill-white shrink-0" />
                        <span>ORDER NOW</span>
                      </button>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="col-span-1 bg-gray-100 hover:bg-amber-400 hover:text-black text-gray-700 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center border border-gray-200 cursor-pointer"
                        title="কার্টে যোগ করুন"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}