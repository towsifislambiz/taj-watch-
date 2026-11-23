import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Lock, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { triggerOneClickOrder, addToCart } = useCart();

  const isOutOfStock =
    product.inStock === false ||
    (typeof product.stock === 'number' && product.stock <= 0);

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
        isOutOfStock ? 'border-gray-200 opacity-90' : 'border-gray-100'
      }`}
      style={{ contentVisibility: 'auto' }}
    >
      {/* Watch Photo Box */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-full aspect-square bg-[#0b0f17] rounded-xl overflow-hidden flex items-center justify-center p-1.5 mb-2 group-hover:opacity-95 transition-all"
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover rounded-lg transition-transform duration-300 ${
            isOutOfStock ? 'grayscale opacity-30 contrast-75' : 'group-hover:scale-105'
          }`}
          loading="lazy"
          decoding="async"
        />

        {/* Subtle Luxury Authenticity Badge (Like Naviforce reference) */}
        {!isOutOfStock && (
          <span className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-[2px] text-amber-400 text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm border border-amber-400/20">
            Original
          </span>
        )}

        {/* Minimal Stock Out Stamp */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2 z-10">
            <span className="border border-red-500/80 bg-red-950/90 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
              SOLD OUT
            </span>
          </div>
        )}
      </Link>

      {/* Minimal Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Subtle Brand Tag */}
          {product.brand && (
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
              {product.brand}
            </span>
          )}

          {/* Clean Title */}
          <Link
            to={`/product/${product.id}`}
            className="block text-xs sm:text-[13px] font-bold text-gray-900 hover:text-red-600 line-clamp-2 transition-colors leading-snug min-h-[2.1rem]"
            title={product.name}
          >
            {product.nameBn || product.name}
          </Link>
        </div>

        {/* Clean Price Line with Naviforce-style Discount Pill Below */}
        <div className="mt-1.5 mb-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-red-600 tracking-tight">
              ৳ {Number(product.price || 0).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-gray-400 line-through font-medium">
                ৳ {Number(product.originalPrice || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {product.discountPercent ? (
            <div className="mt-1">
              <span className="bg-red-700 text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider shadow-xs">
                {product.discountPercent}% OFF
              </span>
            </div>
          ) : null}
        </div>

        {/* Actions: 1-Click Fast Order + Add to Cart (Harmonized, Spacious) */}
        {isOutOfStock ? (
          <button
            disabled
            className="w-full bg-zinc-100 text-zinc-400 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 cursor-not-allowed select-none"
          >
            <Lock className="w-3 h-3 text-zinc-400" />
            <span>স্টক শেষ</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerOneClickOrder(product)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] sm:text-xs py-2 sm:py-2.5 rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>অর্ডার করুন</span>
            </button>
            <button
              onClick={() => addToCart(product, 1)}
              className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
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
}
