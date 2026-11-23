import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'EXCLUSIVE COLLECTION',
    title: 'Audemars Piguet Royal Oak',
    edition: 'ট্যুরবিলন — টিফানি স্কাই ব্লু',
    price: 4950,
    originalPrice: 8500,
    bannerImage: '/assets/banners/banner-ap-tourbillon.webp',
    productId: 'taj-ap-01',
  },
  {
    id: 2,
    tag: 'SWISS DIVER',
    title: 'RADO Captain Cook',
    edition: 'অটোমেটিক সিরামিক ডাইভার',
    price: 4800,
    originalPrice: 8200,
    bannerImage: '/assets/banners/banner-rado-diver.webp',
    productId: 'taj-rado-01',
  },
  {
    id: 3,
    tag: 'EXECUTIVE VIP',
    title: 'Longines Master Collection',
    edition: 'রোজ গোল্ড লেদার এডিশন',
    price: 3850,
    originalPrice: 6800,
    bannerImage: '/assets/banners/banner-longines-leather.webp',
    productId: 'taj-longines-01',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const { triggerOneClickOrder } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative bg-[#FAF7F5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black min-h-[300px] sm:min-h-[380px] lg:min-h-[420px] flex items-center shadow-md">
          
          {/* Background Watch Photos with Buttery Smooth Hardware-Accelerated Crossfade */}
          <div className="absolute inset-0 z-0">
            {HERO_SLIDES.map((s, idx) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === current ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img
                  src={s.bannerImage}
                  alt={s.title}
                  className="w-full h-full object-cover object-right sm:object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
            ))}
            {/* Scrim overlay for crisp minimal text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent sm:w-3/5 z-10 pointer-events-none" />
          </div>

          {/* Clean Minimal Slide Content */}
          <div className="relative z-10 p-5 sm:p-10 lg:p-14 max-w-lg space-y-2 sm:space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 block">
              {slide.tag}
            </span>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {slide.title}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              {slide.edition}
            </p>

            <div className="flex items-baseline gap-2 pt-1 pb-1">
              <span className="text-lg sm:text-2xl font-black text-white">
                ৳ {slide.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ৳ {slide.originalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  triggerOneClickOrder({
                    id: slide.productId,
                    name: slide.title,
                    nameBn: slide.edition,
                    price: slide.price,
                    originalPrice: slide.originalPrice,
                    image: slide.bannerImage,
                  })
                }
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
              </button>
            </div>
          </div>

          {/* Minimal Bottom Dots & Stepper */}
          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    current === idx ? 'w-5 bg-red-600' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 ml-2 text-white/70">
              <button
                onClick={() => setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="p-1 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="p-1 hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
