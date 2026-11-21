import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, MessageCircle } from 'lucide-react';
import { STORE_SETTINGS } from '../data/products';
import { useCart } from '../context/CartContext';

const HERO_SLIDES = [
  {
    id: 1,
    tag: 'EXCLUSIVE HOROLOGY',
    title: 'Audemars Piguet Royal Oak',
    edition: 'Tourbillon — Tiffany Sky Blue',
    price: '৳৪,৯৫০',
    originalPrice: '৳৮,৫০০',
    discount: '৪২% ছাড়',
    bannerImage: '/assets/banners/banner-ap-tourbillon.jpg',
    productId: 'taj-ap-01',
    tabName: 'Tourbillon Tiffany',
  },
  {
    id: 2,
    tag: 'SWISS DIVER LEGEND',
    title: 'RADO Captain Cook',
    edition: 'Automatic Ceramic Diver — 300M',
    price: '৳৪,৮০০',
    originalPrice: '৳৮,২০০',
    discount: '৪১% ছাড়',
    bannerImage: '/assets/banners/banner-rado-diver.jpg',
    productId: 'taj-rado-01',
    tabName: 'RADO Captain Cook',
  },
  {
    id: 3,
    tag: 'EXECUTIVE VIP HERITAGE',
    title: 'Longines Master Collection',
    edition: 'Rose Gold & Cognac Leather',
    price: '৳৩,৮৫০',
    originalPrice: '৳৬,৮০০',
    discount: '৪৩% ছাড়',
    bannerImage: '/assets/banners/banner-longines-leather.jpg',
    productId: 'taj-longines-01',
    tabName: 'Longines Master',
  },
  {
    id: 4,
    tag: 'PENTHOUSE LIVING DECOR',
    title: 'DILING Executive Wooden Clock',
    edition: '3D Floating Oak Wood & Thermometer',
    price: '৳২,৬৫০',
    originalPrice: '৳৪,৫০০',
    discount: '৪১% ছাড়',
    bannerImage: '/assets/banners/banner-wall-clock.jpg',
    productId: 'taj-clock-01',
    tabName: 'Royal Wall Clock',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { triggerOneClickOrder } = useCart();

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SLIDES[current];

  return (
    <section
      className="relative overflow-hidden bg-[#F1F5F9] py-2 sm:py-4 lg:py-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Responsive Luxury Billboard Canvas */}
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl bg-black border border-gray-200/40 min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] flex flex-col justify-between"
        >
          {/* Background Image with Responsive Scrim Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={slide.bannerImage}
              alt={slide.title}
              className="w-full h-full object-cover object-right sm:object-center transition-all duration-1000 ease-out"
            />
            {/* Scrim: Darker on mobile for high legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent z-10 w-full md:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 z-10" />
          </div>

          {/* Typography & Action Stage */}
          <div className="relative z-20 flex flex-col justify-between p-4 sm:p-8 lg:p-12 flex-1">
            
            {/* Top Tag & Discount */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-amber-400 uppercase">
                {slide.tag}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-red-400 uppercase tracking-wider">
                {slide.discount}
              </span>
            </div>

            {/* Main Content */}
            <div className="max-w-xl space-y-2.5 sm:space-y-4 my-auto py-3 sm:py-6">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl font-sans font-semibold text-gray-200 drop-shadow">
                  {slide.edition}
                </p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 sm:gap-3 pt-1 flex-wrap">
                <span className="text-xl sm:text-3xl lg:text-4xl font-black text-amber-400 drop-shadow tracking-tight">
                  {slide.price}
                </span>
                <span className="text-xs sm:text-base text-gray-300/80 line-through font-medium">
                  {slide.originalPrice}
                </span>
                <span className="bg-red-600/90 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                  ফ্ল্যাশ সেল
                </span>
              </div>

              {/* Dual Action Buttons (Mobile Optimized: Stack or Equal Grid) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    const priceNum = parseInt(slide.price.replace(/[^\d]/g, ''), 10) || 4950;
                    const origNum = parseInt(slide.originalPrice.replace(/[^\d]/g, ''), 10) || 8500;
                    triggerOneClickOrder({
                      id: slide.productId,
                      name: slide.title,
                      nameBn: slide.edition,
                      price: priceNum,
                      originalPrice: origNum,
                      image: slide.bannerImage,
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
                </button>

                <a
                  href={`https://wa.me/88${STORE_SETTINGS.whatsapp}?text=Hello%20TAJ%20WATCH%2C%20I%20am%20interested%20in%20${encodeURIComponent(slide.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/30 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp অর্ডার</span>
                </a>
              </div>
            </div>

            {/* Bottom Steppers & Tabs (Fully Responsive) */}
            <div className="flex items-center justify-between pt-3 border-t border-white/15 gap-2">
              {/* Tabs: Horizontally Scrollable on Mobile, Clean row on Tablet & Desktop */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrent(idx)}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                      current === idx
                        ? 'bg-white text-black font-bold shadow'
                        : 'text-gray-300 hover:text-white bg-black/30 hover:bg-black/50'
                    }`}
                  >
                    <span>{s.tabName}</span>
                  </button>
                ))}
              </div>

              {/* Arrow Steppers */}
              <div className="flex items-center gap-1 text-white shrink-0">
                <button
                  onClick={() => setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-gray-300 px-1">
                  0{current + 1} / 0{HERO_SLIDES.length}
                </span>
                <button
                  onClick={() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
