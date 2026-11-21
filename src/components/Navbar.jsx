import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';

export default function Navbar({ activeCategory, onSelectCategory }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { id: 'all', label: 'HOME', path: '/', isHome: true },
    { id: 'flash-sale', label: 'FLASH SALE', path: '/products/flash-sale', isHot: true },
    { id: 'tourbillon', label: 'TOURBILLON', path: '/products/tourbillon' },
    { id: 'chronograph', label: 'CHRONOGRAPH', path: '/products/chronograph' },
    { id: 'diver', label: 'DIVER WATCH', path: '/products/diver' },
    { id: 'leather', label: 'LEATHER CLASSIC', path: '/products/leather' },
    { id: 'wall-clock', label: 'WALL CLOCK', path: '/products/wall-clock' },
    { id: 'reviews', label: 'CUSTOMER REVIEWS', path: '/#customer-reviews-section', isReview: true },
  ];

  const handleLinkClick = (e, nav) => {
    if (nav.isReview) {
      if (isHomePage) {
        e.preventDefault();
        const elem = document.getElementById('customer-reviews-section');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#customer-reviews-section');
      }
      return;
    }

    if (onSelectCategory && nav.id) {
      onSelectCategory(nav.id);
    }
  };

  return (
    <>
      {/* 1. Desktop, Laptop & Tablet Bar (md:block) - Solid Black */}
      <nav className="hidden md:block bg-black text-white sticky top-[80px] sm:top-[92px] z-30 shadow-md border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12">
            <ul className="flex items-center space-x-1 lg:space-x-4 h-full w-full overflow-x-auto no-scrollbar">
              {navLinks.map((nav) => {
                const isActive =
                  (nav.isHome && location.pathname === '/') ||
                  (location.pathname === nav.path) ||
                  (location.pathname.startsWith('/products') && location.pathname.includes(nav.id));

                return (
                  <li key={nav.id} className="h-full flex items-center">
                    <Link
                      to={nav.path}
                      onClick={(e) => handleLinkClick(e, nav)}
                      className={`relative px-3.5 lg:px-4 py-2 text-xs lg:text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 h-full ${
                        nav.isHot
                          ? 'text-red-500 hover:text-red-400 font-extrabold'
                          : isActive
                          ? 'text-white border-b-2 border-red-600 font-black'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {nav.isHot && <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
                      <span>{nav.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* 2. Mobile Responsive Horizontal Scrollable Chip Bar (< md) */}
      <div className="block md:hidden bg-black text-white sticky top-[75px] sm:top-[80px] z-25 shadow-sm border-b border-gray-900 py-2 px-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          {navLinks.map((nav) => {
            const isActive =
              (nav.isHome && location.pathname === '/') ||
              (location.pathname === nav.path) ||
              (location.pathname.startsWith('/products') && location.pathname.includes(nav.id));

            return (
              <Link
                key={nav.id}
                to={nav.path}
                onClick={(e) => handleLinkClick(e, nav)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 ${
                  nav.isHot
                    ? 'bg-red-600 text-white shadow-sm'
                    : isActive
                    ? 'bg-white text-black font-black'
                    : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/15'
                }`}
              >
                {nav.isHot && <Flame className="w-3 h-3 fill-white text-white" />}
                <span>{nav.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
