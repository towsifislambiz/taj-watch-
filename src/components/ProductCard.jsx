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
      className={`group relative bg-white border rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
        isOutOfStock ? 'border-gray-200 opacity-90' : 'border-gray-200 hover:border-gray-400'
      }`}
      style={{ contentVisibility: 'auto' }}
    >
      {/* Minimal Discount or Stock Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1">
        {isOutOfStock ? (
          <span className="bg-zinc-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            স্টক শেষ
          </span>
        ) : product.discountPercent ? (
          <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
            -{product.discountPercent}%
          </span>
        ) : null}
      </div>

      {/* Watch Photo Box */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-full aspect-square bg-[#0c1019] rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2 group-hover:opacity-95 transition-opacity"
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

        {/* Minimal Stock Out Stamp */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-2 z-10">
            <span className="border border-red-500/80 bg-red-950/80 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
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
            className="block text-xs sm:text-sm font-bold text-gray-950 hover:text-red-600 line-clamp-2 transition-colors leading-snug min-h-[2rem]"
            title={product.name}
          >
            {product.nameBn || product.name}
          </Link>
        </div>

        {/* Clean Price Line */}
        <div className="mt-1.5 mb-2.5 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-black text-gray-950 tracking-tight">
            ৳ {Number(product.price || 0).toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-gray-400 line-through font-medium">
              ৳ {Number(product.originalPrice || 0).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Actions: 1-Click Fast Order + Add to Cart */}
        {isOutOfStock ? (
          <button
            disabled
            className="w-full bg-zinc-100 text-zinc-400 font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 cursor-not-allowed select-none"
          >
            <Lock className="w-3 h-3 text-zinc-400" />
            <span>স্টক আউট</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerOneClickOrder(product)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] sm:text-xs py-2 sm:py-2.5 rounded-xl uppercase tracking-wider transition-transform active:scale-95 flex items-center justify-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>অর্ডার করুন</span>
            </button>
            <button
              onClick={() => addToCart(product, 1)}
              className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-gray-100 hover:bg-amber-400 hover:text-black text-gray-700 rounded-xl transition-all flex items-center justify-center border border-gray-200 active:scale-95 cursor-pointer"
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
