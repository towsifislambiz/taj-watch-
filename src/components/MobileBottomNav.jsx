import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Flame, ShoppingBag, MessageCircle, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STORE_SETTINGS } from '../data/products';

export default function MobileBottomNav() {
  const { totalItemCount, openCart } = useCart();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 py-1.5 px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 items-center text-center">
        
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 transition-colors ${
            isHome ? 'text-red-600 font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">হোম</span>
        </Link>

        {/* 2. Offers / Flash Sale */}
        <a
          href="#flash-sale-section"
          className="flex flex-col items-center py-1 text-gray-500 hover:text-red-600 transition-colors font-medium"
        >
          <Flame className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight">অফার</span>
        </a>

        {/* 3. Centered WhatsApp Quick Contact */}
        <a
          href={`https://wa.me/88${STORE_SETTINGS.whatsapp}?text=Hello%20TAJ%20WATCH%2C%20I%20want%20to%20order%20a%20luxury%20watch`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center -mt-4 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white transition-transform active:scale-95">
            <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5">WhatsApp</span>
        </a>

        {/* 4. Cart Drawer Toggle */}
        <button
          onClick={openCart}
          className="flex flex-col items-center py-1 text-gray-500 hover:text-gray-900 transition-colors font-medium relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-2" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">কার্ট</span>
        </button>

        {/* 5. Direct Hotline Call */}
        <a
          href={`tel:${STORE_SETTINGS.hotline}`}
          className="flex flex-col items-center py-1 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <PhoneCall className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight">হটলাইন</span>
        </a>

      </div>
    </div>
  );
}
