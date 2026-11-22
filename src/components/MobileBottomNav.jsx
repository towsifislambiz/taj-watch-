import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Flame, ShoppingBag, MessageCircle, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STORE_SETTINGS } from '../data/products';

export default function MobileBottomNav() {
  const { totalItemCount, openCart } = useCart();
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-1.5 px-3 shadow-lg">
      <div className="grid grid-cols-5 items-center text-center">
        
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 ${
            location.pathname === '/' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">হোম</span>
        </Link>

        {/* Flash Sale */}
        <a
          href="#flash-sale-section"
          className="flex flex-col items-center py-1 text-red-600 hover:text-red-700"
        >
          <Flame className="w-5 h-5 fill-red-600" />
          <span className="text-[10px] mt-0.5 font-bold">অফার</span>
        </a>

        {/* WhatsApp Quick Order Floating Circle Button (Clean, no continuous bouncing lag) */}
        <a
          href={`https://wa.me/88${STORE_SETTINGS.whatsapp}?text=Hello%20TAJ%20WATCH%2C%20I%20want%20to%20order%20a%20luxury%20watch`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white">
            <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
          </div>
          <span className="text-[10px] font-bold text-emerald-600 mt-0.5">WhatsApp</span>
        </a>

        {/* Cart */}
        <button
          onClick={openCart}
          className="flex flex-col items-center py-1 text-gray-500 hover:text-black relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">কার্ট</span>
        </button>

        {/* Direct Call */}
        <a
          href={`tel:${STORE_SETTINGS.hotline}`}
          className="flex flex-col items-center py-1 text-amber-700 hover:text-amber-800"
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">কল করুন</span>
        </a>

      </div>
    </div>
  );
}
