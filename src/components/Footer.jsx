import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, PhoneCall, MessageCircle, Mail, MapPin, ExternalLink, Heart } from 'lucide-react';
import { STORE_SETTINGS } from '../data/products';
import { subscribeToStoreSettings } from '../firebase/services';

export default function Footer() {
  const navigate = useNavigate();
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimerRef = useRef(null);
  const [storeSettings, setStoreSettings] = useState(STORE_SETTINGS);

  useEffect(() => {
    const unsub = subscribeToStoreSettings((liveSettings) => {
      if (liveSettings) setStoreSettings(liveSettings);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Hidden 5-Click Admin Easter Egg
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

    if (nextClicks > 1) {
      e.preventDefault();
    }

    clickTimerRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 2500);
  };

  return (
    <footer className="bg-[#05070a] border-t border-zinc-800 text-zinc-400 text-xs pb-16 md:pb-0">
      
      {/* 4 Feature Trust Pillars */}
      <div className="border-b border-zinc-800/80 py-8 bg-[#080b11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">সারা দেশে ক্যাশ অন ডেলিভারি</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">পণ্য হাতে পেয়ে চেক করে টাকা দিন</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">২ বছরের মেকানিজম ওয়ারেন্টি</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">নির্ভুল কোয়ার্টজ ও অটোমেটিক মুভমেন্ট</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">৭ দিনের সহজ রিপ্লেসমেন্ট</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">যেকোনো ত্রুটিতে তাৎক্ষণিক সমাধান</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">২৪/৭ কাস্টমার সাপোর্ট</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">কল করুন: {storeSettings.hotline || STORE_SETTINGS.hotline}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 select-none cursor-pointer group"
              title="TAJ WATCH"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-brand-gold/60">
                <img
                  src="/assets/brand/logo.webp"
                  alt="TAJ WATCH"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-wider text-white">
                  TAJ <span className="text-brand-gold font-light">WATCH</span>
                </span>
                <p className="text-[9px] tracking-[0.25em] text-zinc-500 uppercase">
                  {storeSettings.tagline || STORE_SETTINGS.tagline}
                </p>
              </div>
            </Link>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              TAJ WATCH বাংলাদেশের শীর্ষস্থানীয় লাক্সারি হোরোলজি ও টাইমপিস সংগ্রহশালা। সুইস ও জাপানি প্রিমিয়াম ডিজাইনে তৈরি ওডেমার্স পিগে, রাডো, সেইকো এবং এক্সিকিউটিভ রাজকীয় দেয়াল ঘড়ির নির্ভরযোগ্য বিশ্বস্ত ঠিকানা।
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={storeSettings.facebookPage || STORE_SETTINGS.facebookPage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-blue-900/40 border border-blue-500/40 text-blue-300 hover:bg-blue-800/50 flex items-center gap-2 text-xs transition-colors"
              >
                <span>অফিসিয়াল ফেসবুক পেজ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://wa.me/88${storeSettings.whatsapp || STORE_SETTINGS.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-800/50 flex items-center gap-2 text-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-gold">
              জনপ্রিয় কালেকশন
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#flash-sale-section" className="hover:text-brand-gold transition-colors">
                  🔥 ফ্ল্যাশ সেল অফার
                </a>
              </li>
              <li>
                <a href="#all-products-section" className="hover:text-brand-gold transition-colors">
                  👑 ট্যুরবিলন ও স্কেলেটন
                </a>
              </li>
              <li>
                <a href="#all-products-section" className="hover:text-brand-gold transition-colors">
                  ⏱️ রয়্যাল ক্রোনোগ্রাফ
                </a>
              </li>
              <li>
                <a href="#all-products-section" className="hover:text-brand-gold transition-colors">
                  🧭 ডাইভার ও স্পোর্টস ওয়াচ
                </a>
              </li>
              <li>
                <a href="#wall-clock-section" className="hover:text-brand-gold transition-colors">
                  🕰️ লাক্সারি দেয়াল ঘড়ি
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-gold">
              গ্রাহক সেবা ও পলিসি
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#customer-reviews-section" className="hover:text-brand-gold transition-colors">
                  ⭐ কাস্টমার রিভিউ
                </a>
              </li>
              <li>
                <span className="text-zinc-400">ডেলিভারি পলিসি (সারা বাংলাদেশ)</span>
              </li>
              <li>
                <span className="text-zinc-400">রিপ্লেসমেন্ট ও ওয়ারেন্টি সুবিধা</span>
              </li>
              <li>
                <span className="text-zinc-400">ম্যানুয়াল বিকাশ / নগদ পেমেন্ট</span>
              </li>
              <li>
                <span className="text-zinc-400">অর্ডার ট্র্যাকিং ও সাপোর্ট</span>
              </li>
            </ul>
          </div>

          {/* Contact Details (Dynamic Email & Showroom Address) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-brand-gold">
              যোগাযোগ ও শোরুমের ঠিকানা
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {storeSettings.showroomAddress || 'লেভেল ৪, ব্লক সি, যমুনা ফিউচার পার্ক / বসুন্ধরা সিটি, ঢাকা'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-brand-gold shrink-0" />
                <a href={`tel:${storeSettings.hotline || STORE_SETTINGS.hotline}`} className="hover:text-brand-gold font-mono">
                  {storeSettings.hotline || STORE_SETTINGS.hotline}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-gold shrink-0" />
                <a href={`mailto:${storeSettings.email || STORE_SETTINGS.email}`} className="hover:text-brand-gold truncate">
                  {storeSettings.email || STORE_SETTINGS.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono">WhatsApp: {storeSettings.whatsapp || STORE_SETTINGS.whatsapp}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Payment Methods & Copyright */}
        <div className="pt-8 mt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-white">TAJ WATCH</strong>. All Rights Reserved. Built with Luxury Precision.
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">পেমেন্ট মেথড:</span>
            <span className="bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded text-[10px]">
              ক্যাশ অন ডেলিভারি
            </span>
            <span className="bg-pink-900/60 border border-pink-500/40 text-pink-300 font-bold px-2 py-0.5 rounded text-[10px]">
              বিকাশ
            </span>
            <span className="bg-orange-900/60 border border-orange-500/40 text-orange-300 font-bold px-2 py-0.5 rounded text-[10px]">
              নগদ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}