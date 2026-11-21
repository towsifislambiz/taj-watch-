import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Crown,
  Timer,
  Compass,
  Briefcase,
  Clock,
  SlidersHorizontal,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Search,
  X,
  Grid,
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { subscribeToProducts } from '../firebase/services';

export default function AllProductsPage({ searchQuery: globalSearchQuery, setSearchQuery: setGlobalSearchQuery }) {
  const [productsList, setProductsList] = useState(PRODUCTS);
  const { category: paramCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Subscribe to live Firestore products
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

  // Active Category state initialized from route param or search query param
  const queryCategory = searchParams.get('category');
  const initialCategory = paramCategory || queryCategory || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // In-page search and sort states
  const [inPageSearch, setInPageSearch] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // Sync state when URL param changes
  useEffect(() => {
    const currentCat = paramCategory || searchParams.get('category') || 'all';
    setActiveCategory(currentCat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [paramCategory, searchParams]);

  // Unique brands list for filter pills
  const availableBrands = useMemo(() => {
    const brands = new Set();
    productsList.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return ['all', ...Array.from(brands)];
  }, [productsList]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    // 1. Category Filter
    if (activeCategory && activeCategory !== 'all') {
      if (activeCategory === 'flash-sale') {
        list = list.filter((p) => p.isFlashSale);
      } else {
        list = list.filter((p) => p.category === activeCategory);
      }
    }

    // 2. Brand Filter
    if (selectedBrand && selectedBrand !== 'all') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    // 3. Search Filter (In-page search or Global search)
    const effectiveSearch = (inPageSearch || globalSearchQuery || '').toLowerCase().trim();
    if (effectiveSearch) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(effectiveSearch) ||
          (p.nameBn && p.nameBn.toLowerCase().includes(effectiveSearch)) ||
          (p.brand && p.brand.toLowerCase().includes(effectiveSearch)) ||
          (p.category && p.category.toLowerCase().includes(effectiveSearch)) ||
          (p.shortDesc && p.shortDesc.toLowerCase().includes(effectiveSearch))
      );
    }

    // 4. Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: Popularity
      list.sort((a, b) => (b.rating || 0) * (b.reviewCount || 0) - (a.rating || 0) * (a.reviewCount || 0));
    }

    // Enforce maximum 50 products showcase
    return list.slice(0, 50);
  }, [activeCategory, selectedBrand, inPageSearch, globalSearchQuery, sortBy]);

  // Category change handler
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    navigate(`/products/${catId}`);
  };

  // Get current active category info
  const currentCategoryInfo = useMemo(() => {
    const found = CATEGORIES.find((c) => c.id === activeCategory);
    if (!found || activeCategory === 'all') {
      return {
        name: 'সকল ঘড়ির কালেকশন',
        nameEn: 'All Luxury Watches & Clocks',
        desc: 'আমাদের সমগ্র এক্সক্লুসিভ কালেকশন — সুইস ও জাপানি ইন্সপায়ার্ড মাস্টারপিস টাইমপিস।',
      };
    }
    if (activeCategory === 'flash-sale') {
      return {
        name: '🔥 ফ্ল্যাশ সেল অফার',
        nameEn: 'Limited-Time Flash Sale',
        desc: 'সীমিত সময়ের স্টক ক্লিয়ারেন্স অফার — সর্বোচ্চ ৪৩% পর্যন্ত বিশেষ ছাড়।',
      };
    }
    return {
      name: found.name,
      nameEn: found.nameEn,
      desc: `${found.name} এর প্রিমিয়াম মাস্টারপিসসমূহ — সরাসরি চেক করে নেওয়ার নিশ্চয়তা।`,
    };
  }, [activeCategory]);

  return (
    <div className="py-6 sm:py-10 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* 1. Breadcrumb Bar */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/" className="hover:text-black flex items-center gap-1 font-semibold text-gray-700">
              <ArrowLeft className="w-3.5 h-3.5" /> হোম পেজ
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-black font-semibold text-gray-700">
              সকল কালেকশন
            </Link>
            {activeCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-red-600 font-bold truncate max-w-[150px] sm:max-w-xs">
                  {currentCategoryInfo.name}
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সরাসরি ক্যাশ অন ডেলিভারি</span>
          </div>
        </div>

        {/* 2. Category Hero Billboard Header */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-black via-zinc-950 to-neutral-900 border border-zinc-800 p-6 sm:p-8 lg:p-10 text-white mb-6 sm:mb-8 shadow-xl">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFICIAL CATALOG • {currentCategoryInfo.nameEn}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {currentCategoryInfo.name}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-2xl">
              {currentCategoryInfo.desc}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="bg-red-600/90 text-white font-extrabold px-3 py-1 rounded-full shadow-sm">
                মোট {filteredProducts.length} টি আইটেম পাওয়া গেছে
              </span>
              <span className="bg-white/10 text-gray-200 font-semibold px-3 py-1 rounded-full border border-white/10">
                ২ বছরের ওয়ারেন্টি
              </span>
              <span className="bg-white/10 text-gray-200 font-semibold px-3 py-1 rounded-full border border-white/10 hidden sm:inline">
                ০ টাকা অগ্রিমে অর্ডার
              </span>
            </div>
          </div>
        </div>

        {/* 3. Category Filter Chips (Horizontal Scrollable on Mobile) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-2.5 sm:p-3 mb-6 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-black text-white shadow-md font-black scale-102'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:text-black'
                  }`}
                >
                  {cat.id === 'flash-sale' && <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Filter Toolbar: Search Input + Brand Pills + Sort Dropdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input Box */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={inPageSearch}
                onChange={(e) => setInPageSearch(e.target.value)}
                placeholder="এই ক্যাটাগরিতে নাম বা মডেল সার্চ করুন..."
                className="w-full bg-gray-50 text-xs sm:text-sm text-gray-900 placeholder-gray-400 pl-9 pr-8 py-2.5 rounded-xl border border-gray-300 focus:border-red-600 focus:bg-white focus:outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {inPageSearch && (
                <button
                  onClick={() => setInPageSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Count Controls */}
            <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
              <span className="text-gray-500 font-medium">
                দেখাচ্ছে: <strong className="text-gray-950 font-bold">{filteredProducts.length} টি</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-gray-600 font-semibold hidden sm:inline">সর্ট:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 text-gray-900 text-xs font-bold rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:border-red-600 shadow-sm"
                >
                  <option value="popular">জনপ্রিয়তা (Popularity)</option>
                  <option value="price-low">দাম: কম থেকে বেশি</option>
                  <option value="price-high">দাম: বেশি থেকে কম</option>
                  <option value="discount">সর্বোচ্চ ছাড় (Discount)</option>
                  <option value="rating">রেটিং অনুযায়ী (Top Rated)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Quick Brand Filter Pills */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
              ব্র্যান্ড ফিল্টার:
            </span>
            {availableBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shrink-0 ${
                  selectedBrand === brand
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {brand === 'all' ? 'সকল ব্র্যান্ড' : brand}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Products Grid: 2-Cols on Mobile, 3-Cols on Tablet, 4-Cols on Desktop */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-950">
              কোনো ঘড়ি খুঁজে পাওয়া যায়নি
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              আপনার ফিল্টার অথবা সার্চ কি-ওয়ার্ডে কোনো পণ্য মেলেনি। অন্য ক্যাটাগরি বা ব্র্যান্ড বেছে নিন।
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSelectedBrand('all');
                  setInPageSearch('');
                  navigate('/products');
                }}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs shadow-md"
              >
                সকল কালেকশন রিসেট করুন
              </button>
            </div>
          </div>
        )}

        {/* 6. Bottom Trust Strip */}
        <div className="mt-12 sm:mt-16 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 text-center max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-xs text-gray-700 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="font-semibold">সরাসরি ডেলিভারিম্যানের সামনে চেক করে নেওয়ার সুবিধা</span>
          </div>
          <span className="hidden sm:inline text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">পছন্দ না হলে সাথে সাথেই রিটার্নের নিশ্চয়তা</span>
          </div>
          <span className="hidden sm:inline text-gray-300">|</span>
          <div className="flex items-center gap-2 font-bold text-red-600">
            <span>০ টাকা অগ্রিম পেমেন্টে</span> অর্ডার করুন
          </div>
        </div>

      </div>
    </div>
  );
}
