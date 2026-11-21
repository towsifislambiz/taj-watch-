import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import FlashSaleSection from '../components/FlashSaleSection';
import CategoryBanners from '../components/CategoryBanners';
import ProductGrid from '../components/ProductGrid';
import CustomerReviews from '../components/CustomerReviews';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { Clock, Zap, AlertOctagon, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscribeToProducts } from '../firebase/services';

export default function HomePage({ searchQuery, setSearchQuery }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [productsList, setProductsList] = useState(PRODUCTS);
  const { triggerOneClickOrder } = useCart();

  useEffect(() => {
    const unsub = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) {
        setProductsList(prods);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const wallClocks = productsList.filter((p) => p.category === 'wall-clock');

  return (
    <div className="space-y-0 bg-[#F8FAFC]">
      {/* 1. Hero Carousel */}
      <HeroSlider />

      {/* 2. Flash Sale Section (Live Countdown + Red ORDER NOW CTA) */}
      <FlashSaleSection />

      {/* 3. 4-Grid Category Promo Banners (Matching Naviforce Bangladesh) */}
      <CategoryBanners onSelectCategory={(catId) => setActiveCategory(catId)} />

      {/* 4. Filterable Luxury Watch Catalog */}
      <ProductGrid
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
      />

      {/* 5. Special Luxury Wall Clock Spotlight - Responsive across Mobile, Tablet & Desktop */}
      <section id="wall-clock-section" className="py-10 sm:py-14 bg-[#FFFDF7] border-t border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-amber-200/80 gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>ROYAL LIVING & OFFICE DECOR</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-gray-950">
                বিলাসবহুল সিগনেচার দেয়াল ঘড়ি কালেকশন
              </h2>
            </div>
            <Link
              to="/products/wall-clock"
              className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              সকল দেয়াল ঘড়ি দেখুন →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {wallClocks.map((clock) => {
              const isOutOfStock =
                clock.inStock === false ||
                (typeof clock.stock === 'number' && clock.stock <= 0);

              return (
                <div
                  key={clock.id}
                  className={`bg-white border rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 ${
                    isOutOfStock
                      ? 'border-gray-200 opacity-95'
                      : 'border-gray-200 hover:border-amber-400'
                  }`}
                >
                  <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52 bg-[#F8FAFC] rounded-2xl p-2.5 sm:p-3 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={clock.image}
                      alt={clock.name}
                      className={`w-full h-full object-contain filter drop-shadow-sm transition-all duration-500 ${
                        isOutOfStock
                          ? 'grayscale opacity-35 contrast-75'
                          : 'hover:scale-105'
                      }`}
                    />

                    {/* Stock Out Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 z-10">
                        <div className="bg-gradient-to-b from-[#181a24]/95 via-[#0f1118]/95 to-[#090b10]/95 border border-red-500/60 rounded-2xl py-2 px-3 text-center shadow-xl shadow-red-950/70 transform -rotate-3">
                          <div className="flex items-center justify-center gap-1 text-red-500 mb-0.5">
                            <AlertOctagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-red-400">
                              SOLD OUT
                            </span>
                          </div>
                          <div className="text-white font-black text-xs uppercase tracking-wider">
                            STOCK OUT
                          </div>
                          <div className="text-[9px] text-zinc-300 font-bold border-t border-red-500/30 pt-0.5 mt-0.5">
                            স্টক শেষ
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 sm:space-y-3 text-center sm:text-left flex-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                      <span className="bg-amber-100 text-amber-900 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        {clock.specs?.displayType || 'সাইলেন্ট কোয়ার্টজ'}
                      </span>
                      {isOutOfStock && (
                        <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          স্টক আউট
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-950">
                      {clock.nameBn || clock.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2">
                      {clock.shortDesc || clock.description}
                    </p>
                    <div className="flex items-baseline justify-center sm:justify-start gap-2.5 sm:gap-3 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
                        ৳ {Number(clock.price || 0).toLocaleString('en-IN')}
                      </span>
                      {clock.originalPrice && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                          ৳ {Number(clock.originalPrice || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="bg-zinc-100 border border-zinc-200 text-zinc-400 font-extrabold text-[11px] sm:text-xs px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed select-none"
                        >
                          <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>স্টক শেষ (OUT OF STOCK)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerOneClickOrder(clock)}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] sm:text-xs px-4 sm:px-5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-transform active:scale-95 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>ORDER NOW</span>
                        </button>
                      )}
                      <Link
                        to={`/product/${clock.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] sm:text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl transition-colors border border-gray-200"
                      >
                        বিস্তারিত দেখুন
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews 3D Section */}
      <CustomerReviews />
    </div>
  );
}
