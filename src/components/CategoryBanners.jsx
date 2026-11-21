import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Crown, Shield, Clock, Briefcase } from 'lucide-react';

export default function CategoryBanners({ onSelectCategory }) {
  const navigate = useNavigate();
  const banners = [
    {
      id: 'tourbillon',
      title: 'BUY TOURBILLON',
      titleBn: 'ট্যুরবিলন কালেকশন',
      subtitle: 'Audemars Piguet & Skeleton',
      discount: '43% OFF',
      image: '/assets/banners/banner-ap-tourbillon.jpg',
      badgeBg: 'bg-red-600',
      accentGlow: 'hover:shadow-cyan-900/40',
      borderColor: 'group-hover:border-cyan-500/60',
      icon: Crown,
    },
    {
      id: 'diver',
      title: 'BUY DIVER & SPORTS',
      titleBn: 'ডাইভার ও স্পোর্টস',
      subtitle: 'RADO Captain Cook & Seiko GMT',
      discount: '42% OFF',
      image: '/assets/banners/banner-rado-diver.jpg',
      badgeBg: 'bg-emerald-600',
      accentGlow: 'hover:shadow-emerald-900/40',
      borderColor: 'group-hover:border-emerald-500/60',
      icon: Shield,
    },
    {
      id: 'leather',
      title: 'BUY EXECUTIVE LEATHER',
      titleBn: 'এক্সিকিউটিভ লেদার',
      subtitle: 'Longines Master & VIP Chrono',
      discount: '43% OFF',
      image: '/assets/banners/banner-longines-leather.jpg',
      badgeBg: 'bg-amber-600',
      accentGlow: 'hover:shadow-amber-900/40',
      borderColor: 'group-hover:border-amber-500/60',
      icon: Briefcase,
    },
    {
      id: 'wall-clock',
      title: 'BUY ROYAL WALL CLOCK',
      titleBn: 'রয়্যাল দেয়াল ঘড়ি',
      subtitle: 'DILING Wooden & CITISUN 3D',
      discount: '42% OFF',
      image: '/assets/banners/banner-wall-clock.jpg',
      badgeBg: 'bg-amber-500 text-black',
      accentGlow: 'hover:shadow-yellow-900/40',
      borderColor: 'group-hover:border-amber-400/60',
      icon: Clock,
    },
  ];

  const handleBannerClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    navigate(`/products/${catId}`);
  };

  return (
    <section className="py-6 sm:py-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h2 className="text-base sm:text-2xl font-black text-gray-950">
              টপ ক্যাটাগরি কালেকশন <span className="text-red-600 font-sans text-xs sm:text-base font-bold hidden xs:inline">| Special Categories</span>
            </h2>
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold text-gray-500">
            ক্যাশ অন ডেলিভারিতে চেক করে অর্ডার করুন
          </span>
        </div>

        {/* 4 Dynamic Animated Category Cards: 2-Cols on Mobile, 4-Cols on Desktop/Laptop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              onClick={() => handleBannerClick(b.id)}
              className={`group cursor-pointer relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-gray-200/80 ${b.borderColor} min-h-[145px] sm:min-h-[185px] p-3 sm:p-5 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${b.accentGlow}`}
            >
              {/* Background 8K Commercial Watch Artwork with Zoom Motion */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out filter brightness-[0.82] group-hover:brightness-95"
                  loading="lazy"
                />
                {/* Left Scrim Gradient for Crisp Typography */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent z-10 w-full sm:w-4/5" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />

                {/* Shimmer Light Flare sweeping across on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent z-20 pointer-events-none" />
              </div>

              {/* Card Content Top: Discount Badge */}
              <div className="relative z-20 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md ${b.badgeBg} text-white`}>
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>UP TO {b.discount}</span>
                </span>
              </div>

              {/* Card Content Bottom: Title, Subtitle & Interactive Arrow CTA */}
              <div className="relative z-20 space-y-1 pt-2 sm:pt-4">
                <h3 className="text-xs sm:text-base lg:text-lg font-black text-white tracking-wide leading-tight group-hover:text-amber-400 transition-colors drop-shadow-md">
                  {b.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-gray-300 line-clamp-1 drop-shadow">
                  {b.subtitle}
                </p>

                <div className="pt-1 sm:pt-2 flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 group-hover:bg-red-600 backdrop-blur-md border border-white/20 group-hover:border-red-600 text-[10px] sm:text-[11px] font-bold text-white transition-all shadow-sm">
                    <span>কালেকশন দেখুন</span>
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
