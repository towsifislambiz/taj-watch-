import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Star,
  Clock,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { searchProducts, POPULAR_SEARCH_TAGS } from '../utils/searchIndex';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { subscribeToProducts } from '../firebase/services';

export default function SearchEngine({ searchQuery, setSearchQuery, isMobile = false, onCloseMobile }) {
  const [query, setQuery] = useState(searchQuery || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'watches' | 'clocks' | 'budget'
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [productsPool, setProductsPool] = useState(PRODUCTS);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { triggerOneClickOrder } = useCart();

  // Subscribe to live Firestore products so newly added products are instantly searchable
  useEffect(() => {
    const unsub = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) {
        setProductsPool(prods);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Instant in-memory search results powered by live products
  const results = searchProducts(query, filterType, productsPool);

  // Sync with parent query
  useEffect(() => {
    setQuery(searchQuery || '');
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectProduct(results[selectedIndex]);
      } else {
        handleViewAllResults();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectProduct = (product) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    navigate(`/product/${product.id}`);
  };

  const handleSelectTag = (tagQuery) => {
    setQuery(tagQuery);
    setSearchQuery(tagQuery);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery('');
    setSearchQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleViewAllResults = () => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    setSearchQuery(query);
    navigate(`/?q=${encodeURIComponent(query)}`);
    const elem = document.getElementById('all-products-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field Container */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="ঘড়ির নাম বা মডেল সার্চ করুন (যেমন: Audemars, Rado, দেয়াল ঘড়ি)..."
          className="w-full bg-gray-50 text-xs sm:text-sm text-gray-900 placeholder-gray-400 pl-4 pr-20 py-2.5 rounded-full border border-gray-300 focus:border-red-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
        />

        {/* Clear Button (X) */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
            title="সার্চ মুছুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search Submit Icon Button */}
        <button
          type="button"
          onClick={handleViewAllResults}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-200 shadow-sm"
          title="সার্চ করুন"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Advanced Search Hub & Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn max-h-[82vh] sm:max-h-[580px] flex flex-col">
          
          {/* ==================== STATE 1: EMPTY QUERY (SEARCH HUB) ==================== */}
          {!query.trim() ? (
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Trending Keywords */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span>জনপ্রিয় ও ট্রেন্ডিং সার্চ</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag.query}
                      type="button"
                      onClick={() => handleSelectTag(tag.query)}
                      className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-gray-200 text-xs font-semibold text-gray-700 transition-all flex items-center gap-1"
                    >
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Category Jump */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>কুইক কালেকশন নেভিগেশন</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTag('tourbillon')}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-gray-900 block">👑 ট্যুরবিলন</span>
                    <span className="text-[10px] text-gray-500">AP ও স্কেলেটন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTag('diver')}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-gray-900 block">🧭 ডাইভার ওয়াচ</span>
                    <span className="text-[10px] text-gray-500">Rado ও Seiko</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTag('clock')}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-gray-900 block">🕰️ দেয়াল ঘড়ি</span>
                    <span className="text-[10px] text-gray-500">রয়্যাল হোম ডেকর</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTag('leather')}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-300 text-left transition-all"
                  >
                    <span className="text-xs font-bold text-gray-900 block">💼 লেদার ক্ল্যাসিক</span>
                    <span className="text-[10px] text-gray-500">Longines এক্সিকিউটিভ</span>
                  </button>
                </div>
              </div>

              {/* Recommended Top Pick Preview */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  ⭐ আজকের বিশেষ রিকমেন্ডেশন:
                </p>
                {productsPool.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="cursor-pointer p-2 rounded-xl hover:bg-gray-50 flex items-center justify-between transition-colors border border-transparent hover:border-gray-200 mb-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 p-1 flex items-center justify-center shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{p.nameBn || p.name}</p>
                        <p className="text-[10px] text-gray-500">{p.brand} • {p.specs?.movement || 'Automatic'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-red-600 block">৳{p.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-400 line-through">৳{p.originalPrice?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ==================== STATE 2: ACTIVE SEARCH RESULTS ====================
            <div className="flex flex-col h-full">
              {/* Header with Results Count & Filter Chips */}
              <div className="bg-gray-50 border-b border-gray-200 p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <span>ফলাফল:</span>
                  <strong className="text-red-600 font-extrabold">{results.length}</strong>
                  <span>টি ঘড়ি পাওয়া গেছে</span>
                </div>

                {/* Filter Chips inside search */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                      filterType === 'all'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    সব ({searchProducts(query, 'all').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('watches')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                      filterType === 'watches'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    হাত ঘড়ি
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('clocks')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                      filterType === 'clocks'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    দেয়াল ঘড়ি
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('budget')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                      filterType === 'budget'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ≤ ৳৩৫০০
                  </button>
                </div>
              </div>

              {/* Scrollable Results List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 sm:p-3 max-h-[360px]">
                {results.length > 0 ? (
                  results.map((product, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isOutOfStock =
                      product.inStock === false ||
                      (typeof product.stock === 'number' && product.stock <= 0);

                    return (
                      <div
                        key={product.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group p-2.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-50/70 border border-red-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        {/* Thumbnail & Title */}
                        <div
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`w-full h-full object-contain ${
                                isOutOfStock ? 'grayscale opacity-40' : ''
                              }`}
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-[8px] font-black text-white bg-red-600 px-1 py-0.5 rounded">
                                  OUT
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              {isOutOfStock ? (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white shadow-sm">
                                  স্টক আউট
                                </span>
                              ) : null}
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                {product.brand}
                              </span>
                              {product.discountPercent && !isOutOfStock && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                  {product.discountPercent}% OFF
                                </span>
                              )}
                              <div className="flex items-center text-amber-500 text-[10px]">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-bold ml-0.5 text-gray-700">{product.rating}</span>
                              </div>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-1 transition-colors">
                              {product.nameBn || product.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 line-clamp-1">
                              {product.specs?.movement || product.specs?.features || product.category} • {product.specs?.glass || product.specs?.dimensions || 'Sapphire'}
                            </p>
                          </div>
                        </div>

                        {/* Price & In-Dropdown 1-Click Order Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-sm sm:text-base font-black text-red-600 block tracking-tight">
                              ৳ {Number(product.price || 0).toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ৳ {Number(product.originalPrice || 0).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {/* Direct 1-Click Fast Checkout CTA right from search */}
                          {isOutOfStock ? (
                            <span className="bg-zinc-100 text-zinc-400 border border-zinc-200 text-[10px] font-bold px-2.5 py-1.5 rounded-xl select-none">
                              স্টক শেষ
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                if (onCloseMobile) onCloseMobile();
                                triggerOneClickOrder(product);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-black text-[11px] px-3 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                              title="ইনস্ট্যান্ট ১-ক্লিক অর্ডার"
                            >
                              <Zap className="w-3 h-3 fill-white" />
                              <span className="hidden sm:inline">ORDER</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-sm font-bold text-gray-700">
                      &quot;{query}&quot; সম্পর্কিত কোনো ঘড়ি পাওয়া যায়নি
                    </p>
                    <p className="text-xs text-gray-500">
                      বানান চেক করুন অথবা জনপ্রিয় ব্র্যান্ড (যেমন: Audemars, Rado, Seiko) লিখে খুঁজুন।
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTag('tourbillon')}
                        className="px-3 py-1 bg-gray-100 hover:bg-red-50 text-xs font-semibold rounded-full text-gray-700"
                      >
                        ট্যুরবিলন ঘড়ি
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTag('clock')}
                        className="px-3 py-1 bg-gray-100 hover:bg-red-50 text-xs font-semibold rounded-full text-gray-700"
                      >
                        দেয়াল ঘড়ি
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer: View All Results */}
              {results.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    টিপস: <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono">↓</kbd> দিয়ে সিলেক্ট করুন
                  </span>
                  <button
                    type="button"
                    onClick={handleViewAllResults}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    <span>পেজে সব ({results.length}) ফলাফল দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
