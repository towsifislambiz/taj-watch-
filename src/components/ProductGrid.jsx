import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Sparkles, ChevronDown, ChevronUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { subscribeToProducts } from '../firebase/services';

const INITIAL_LIMIT = 8;
const MAX_CATALOG_LIMIT = 50;

export default function ProductGrid({ activeCategory, setActiveCategory, searchQuery }) {
  const [productsList, setProductsList] = useState(PRODUCTS);
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT);

  // Subscribe to live Firestore products for real-time stock sync
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

  // Reset pagination limit when category or search query changes
  useEffect(() => {
    setVisibleCount(INITIAL_LIMIT);
  }, [activeCategory, searchQuery]);

  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // Filter by Category
    if (activeCategory && activeCategory !== 'all') {
      if (activeCategory === 'flash-sale') {
        list = list.filter((p) => p.isFlashSale);
      } else {
        list = list.filter((p) => p.category === activeCategory);
      }
    }

    // Filter by Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameBn && p.nameBn.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else {
      // popular
      list.sort((a, b) => (b.rating || 0) * (b.reviewCount || 0) - (a.rating || 0) * (a.reviewCount || 0));
    }

    return list;
  }, [activeCategory, searchQuery, sortBy]);

  // Limit catalog pool to up to 50 products maximum
  const catalogPool = useMemo(() => {
    return filteredProducts.slice(0, MAX_CATALOG_LIMIT);
  }, [filteredProducts]);

  // Sliced products for pagination (Max 8 initially, up to 50)
  const displayedProducts = catalogPool.slice(0, visibleCount);
  const hasMore = visibleCount < catalogPool.length;
  const remainingCount = catalogPool.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(MAX_CATALOG_LIMIT, prev + 8));
  };

  const handleShowLess = () => {
    setVisibleCount(INITIAL_LIMIT);
    const elem = document.getElementById('all-products-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="all-products-section" className="py-12 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>EXCLUSIVE CURATED CATALOG</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
            সকল বিলাসবহুল ঘড়ির কালেকশন
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 font-sans font-medium">
            সরাসরি সুইজারল্যান্ড ও জাপান প্রিমিয়াম ইন্সপায়ার্ড মাস্টারপিস — ক্যাশ অন ডেলিভারিতে চেক করে নিন
          </p>
        </div>

        {/* Categories Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-black text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar: Count & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200 text-xs text-gray-600">
          <div>
            প্রদর্শিত <strong className="text-gray-950 font-bold">{displayedProducts.length}</strong> / <span className="font-bold">{filteredProducts.length}</span> টি প্রিমিয়াম ঘড়ি
            {searchQuery && (
              <span className="ml-2 text-red-600 font-semibold">
                (সার্চ ফিল্টার: &quot;{searchQuery}&quot;)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-gray-600 font-medium">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white text-gray-900 text-xs font-semibold rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:border-amber-500 shadow-sm"
            >
              <option value="popular">জনপ্রিয়তা (Popularity)</option>
              <option value="price-low">দাম: কম থেকে বেশি</option>
              <option value="price-high">দাম: বেশি থেকে কম</option>
              <option value="discount">সর্বোচ্চ ছাড় (Discount)</option>
            </select>
          </div>
        </div>

        {/* Products Grid (At Most 8 Initially) */}
        {displayedProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button Theory Module */}
            <div className="mt-12 text-center space-y-3">
              {/* Progress Count Bar */}
              <div className="max-w-xs mx-auto space-y-1.5">
                <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
                  <span>দেখাচ্ছে {displayedProducts.length} টি</span>
                  <span>মোট {filteredProducts.length} টি</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-red-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (displayedProducts.length / filteredProducts.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Button: Load More OR Show Less */}
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-black hover:bg-gray-800 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>আরও {remainingCount} টি ঘড়ি দেখুন (Load More)</span>
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </button>
              ) : filteredProducts.length > INITIAL_LIMIT ? (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>সকল {filteredProducts.length} টি ঘড়ি প্রদর্শিত হয়েছে</span>
                  </p>
                  <button
                    onClick={handleShowLess}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors border border-gray-200"
                  >
                    <span>কম দেখুন (Show Less)</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-base text-gray-700 font-bold mb-2">কোনো ঘড়ি পাওয়া যায়নি</p>
            <p className="text-xs text-gray-500">অন্য কোনো নাম বা ক্যাটাগরি সিলেক্ট করে চেষ্টা করুন</p>
            <button
              onClick={() => {
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
            >
              সকল কালেকশন দেখুন
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
