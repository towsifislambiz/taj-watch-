import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, PhoneCall, MessageCircle, ShieldCheck, Truck, RefreshCw, Menu, X } from 'lucide-react';
import { STORE_SETTINGS } from '../data/products';
import { useCart } from '../context/CartContext';
import SearchEngine from './SearchEngine';

export default function Header({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const { totalItemCount, subtotal, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hidden 5-Click Admin Easter Egg
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimerRef = useRef(null);

  const handleLogoClick = (e) => {
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (nextClicks >= 5) {
      e.preventDefault();
      setLogoClicks(0);
      const isAuth = localStorage.getItem('tajwatch_admin_authenticated') === 'true';
      navigate(isAuth ? '/admin' : '/admin/login');
      return;
    }

    // On rapid consecutive clicks (2, 3, 4), prevent page reload/scroll so 5 clicks register smoothly
    if (nextClicks > 1) {
      e.preventDefault();
    }

    clickTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 2500);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      {/* 1. Top Minimal Ribbon */}
      <div className="bg-[#FAF7F5] border-b border-gray-200/60 py-1 px-3 sm:px-4 text-[10px] sm:text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-gray-900">
              <Truck className="w-3 h-3 text-red-600 shrink-0" />
              <span>ক্যাশ অন ডেলিভারি (চেক করে মূল্য দিন)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs">
            <a
              href={`tel:${STORE_SETTINGS.hotline}`}
              className="flex items-center gap-1 font-bold text-gray-950 hover:text-red-600 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-red-600 shrink-0" />
              <span>{STORE_SETTINGS.hotline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-gray-800 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Brand Identity (5-click secret admin panel access) */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-3 group shrink-0 select-none cursor-pointer"
            title="TAJ WATCH"
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-400 shadow-sm group-hover:border-amber-600 transition-all duration-300">
              <img
                src="/assets/brand/logo.webp"
                alt="TAJ WATCH Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-black tracking-wider text-gray-950 group-hover:text-amber-700 transition-colors leading-none">
                TAJ <span className="text-amber-600 font-normal">WATCH</span>
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-gray-500 uppercase font-sans font-semibold mt-0.5">
                {STORE_SETTINGS.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop & Laptop Search Engine */}
          <div className="hidden md:block flex-1 max-w-xl mx-4 lg:mx-6">
            <SearchEngine
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Right Actions: Hotline & Cart Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Call Us Button (Desktop/Laptop) */}
            <a
              href={`tel:${STORE_SETTINGS.hotline}`}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <PhoneCall className="w-3 h-3" />
              </div>
              <div className="text-left">
                <p className="text-[9px] text-gray-500 leading-none">কল করুন ২৪/৭</p>
                <p className="font-bold text-gray-900 tracking-wide text-xs">{STORE_SETTINGS.hotline}</p>
              </div>
            </a>

            {/* Cart Button Pill */}
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-950 font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 transform active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-gray-950" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight hidden xs:block">
                <p className="text-[9px] uppercase font-extrabold tracking-wider text-black/70">
                  {totalItemCount} ITEMS
                </p>
                <p className="text-xs font-black text-gray-950">
                  ৳{subtotal.toLocaleString('en-IN')}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Engine: Compact, Clean on Mobile */}
        <div className="mt-2.5 md:hidden">
          <SearchEngine
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isMobile={true}
          />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-2.5 shadow-xl animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-amber-600 py-1.5 border-b border-gray-100"
          >
            🏠 হোম পেজ
          </Link>
          <Link
            to="/products/flash-sale"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-red-600 py-1.5 border-b border-gray-100 flex items-center justify-between"
          >
            <span>🔥 ফ্ল্যাশ সেল (অফার)</span>
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase font-bold">HOT</span>
          </Link>
          <Link
            to="/products/tourbillon"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-amber-600 py-1.5 border-b border-gray-100"
          >
            👑 ওডেমার্স পিগে ট্যুরবিলন
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-amber-600 py-1.5 border-b border-gray-100 flex items-center justify-between"
          >
            <span>⌚ সকল ঘড়ির কালেকশন</span>
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full uppercase font-bold">SEE ALL</span>
          </Link>
          <Link
            to="/products/diver"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-amber-600 py-1.5 border-b border-gray-100"
          >
            🧭 ডাইভার ও স্পোর্টস ঘড়ি
          </Link>
          <Link
            to="/products/leather"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-amber-600 py-1.5 border-b border-gray-100"
          >
            💼 এক্সিকিউটিভ লেদার কালেকশন
          </Link>
          <Link
            to="/products/wall-clock"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-amber-600 py-1.5 border-b border-gray-100"
          >
            🕰️ বিলাসবহুল দেয়াল ঘড়ি
          </Link>
          <a
            href="/#customer-reviews-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-amber-600 py-1.5 border-b border-gray-100"
          >
            ⭐ সম্মানিত গ্রাহকদের রিভিউ
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`tel:${STORE_SETTINGS.hotline}`}
              className="w-full text-center py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-amber-600" /> হটলাইনে কল করুন ({STORE_SETTINGS.hotline})
            </a>
            <a
              href={`https://wa.me/88${STORE_SETTINGS.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
