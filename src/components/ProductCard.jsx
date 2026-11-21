import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Zap, ShoppingCart, Eye, AlertOctagon, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { triggerOneClickOrder, addToCart } = useCart();

  const isOutOfStock =
    product.inStock === false ||
    (typeof product.stock === 'number' && product.stock <= 0);

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isOutOfStock
          ? 'border-gray-200 opacity-95'
          : 'border-gray-200 hover:border-amber-400'
      }`}
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-30 flex flex-col gap-1 items-start">
        {isOutOfStock ? (
          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            স্টক আউট
          </span>
        ) : (
          <>
            {product.discountPercent && (
              <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                {product.discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                FEATURED
              </span>
            )}
          </>
        )}
      </div>

      {/* Quick View Link overlay */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          to={`/product/${product.id}`}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-amber-400 hover:text-black text-gray-800 border border-gray-300 flex items-center justify-center transition-colors shadow-md cursor-pointer"
          title="বিস্তারিত দেখুন"
        >
          <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Watch Photo Box with Luxury Stock Out Overlay */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-full aspect-square bg-[#0c1019] rounded-xl overflow-hidden flex items-center justify-center p-1.5 sm:p-2 mb-2.5 sm:mb-3 mt-3 sm:mt-4 group-hover:bg-black transition-colors"
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover rounded-lg transition-all duration-500 ${
            isOutOfStock
              ? 'grayscale opacity-35 contrast-75'
              : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {/* Superb Luxury Stock Out Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-3 z-20">
            <div className="w-full max-w-[130px] sm:max-w-[150px] bg-gradient-to-b from-[#181a24]/95 via-[#0f1118]/95 to-[#090b10]/95 border border-red-500/60 rounded-2xl py-2 px-2.5 sm:px-3 text-center shadow-2xl shadow-red-950/80 transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
              <div className="inline-flex items-center justify-center gap-1 text-red-500 mb-0.5">
                <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
                <span className="font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-red-400">
                  SOLD OUT
                </span>
              </div>
              <div className="text-white font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow font-display">
                STOCK OUT
              </div>
              <div className="text-[9px] sm:text-[10px] text-zinc-300 font-bold border-t border-red-500/30 pt-0.5 mt-0.5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>স্টক শেষ</span>
              </div>
            </div>
          </div>
        )}
      </Link>

      {/* Info Block */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-gray-700 text-[10px] sm:text-[11px]">{product.rating}</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400">({product.reviewCount || 42})</span>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.id}`}
            className="block text-xs sm:text-sm font-bold text-gray-900 hover:text-red-600 line-clamp-2 transition-colors min-h-[2.3rem] leading-snug"
            title={product.name}
          >
            {product.nameBn || product.name}
          </Link>

          {/* Quick Specs Pill */}
          {product.specs?.glass && (
            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
              {product.specs.glass} • {product.specs.caseDiameter || '41mm'}
            </p>
          )}
        </div>

        {/* Price Row */}
        <div className="mt-2 mb-2 sm:mt-2.5 sm:mb-2.5">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-base md:text-lg font-black text-red-600 tracking-tight">
              ৳ {Number(product.price || 0).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through font-medium">
                ৳ {Number(product.originalPrice || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Dual Actions: High Converting Red ORDER NOW button OR Stock Out Disabled State */}
        {isOutOfStock ? (
          <div className="pt-1">
            <button
              disabled
              className="w-full bg-zinc-100 border border-zinc-200 text-zinc-400 font-extrabold text-[10px] sm:text-xs py-2 sm:py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed select-none transition-colors"
              title="এই ঘড়িটির স্টক শেষ হয়ে গেছে"
            >
              <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
              <span>স্টক শেষ (OUT OF STOCK)</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1 pt-1">
            <button
              onClick={() => triggerOneClickOrder(product)}
              className="col-span-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] sm:text-xs py-2 sm:py-2.5 px-1 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md shadow-red-500/20 flex items-center justify-center gap-1 transform active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-white shrink-0" />
              <span>ORDER NOW</span>
            </button>

            <button
              onClick={() => addToCart(product, 1)}
              className="col-span-1 bg-gray-100 hover:bg-amber-400 hover:text-black text-gray-700 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center border border-gray-200 cursor-pointer"
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
