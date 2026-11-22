import React, { useState, useEffect, useMemo, memo } from 'react';
import { Flame, Clock } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import ProductCard from './ProductCard';
import { subscribeToProducts, subscribeToFlashSaleConfig } from '../firebase/services';

const formatNumber = (num) => String(num).padStart(2, '0');

// Isolated Subcomponent: only this re-renders every 1s, preventing the 9 product cards from diffing every second!
const FlashCountdownTimer = memo(function FlashCountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      let target = new Date(endTime).getTime();
      let diff = target - Date.now();

      // If expired or invalid, set rolling daily countdown to midnight
      if (isNaN(diff) || diff <= 0) {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        diff = midnight.getTime() - Date.now();
        if (diff <= 0) diff = 86400000;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1 font-mono font-bold text-xs text-white">
      <span className="bg-red-600 px-1.5 py-0.5 rounded">{formatNumber(timeLeft.hours)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-red-600 px-1.5 py-0.5 rounded">{formatNumber(timeLeft.minutes)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-red-600 px-1.5 py-0.5 rounded">{formatNumber(timeLeft.seconds)}</span>
    </div>
  );
});

export default function FlashSaleSection() {
  const [products, setProducts] = useState(PRODUCTS);
  const [flashConfig, setFlashConfig] = useState({
    active: true,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    title: 'Flash Sale | ফ্ল্যাশ সেল',
    subtitle: 'সীমিত সময়ের বিশেষ অফার',
  });

  useEffect(() => {
    const unsubProducts = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) setProducts(prods);
    });

    const unsubConfig = subscribeToFlashSaleConfig((cfg) => {
      if (cfg) setFlashConfig(cfg);
    });

    return () => {
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubConfig === 'function') unsubConfig();
    };
  }, []);

  const displayProducts = useMemo(() => {
    const active = products.filter((p) => p.isFlashSale);
    return active.length > 0 ? active : products.slice(0, 4);
  }, [products]);

  return (
    <section id="flash-sale-section" className="py-6 sm:py-8 bg-red-50/40 border-b border-red-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Minimal Flash Header with Compact Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-red-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 fill-white" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-950 flex items-center gap-1.5">
                <span>ফ্ল্যাশ সেল অফার</span>
                <span className="text-xs text-red-600 font-bold uppercase">(সীমিত স্টক)</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-red-600" />
            <span>অফার শেষ হতে:</span>
            <FlashCountdownTimer endTime={flashConfig.endTime} />
          </div>
        </div>

        {/* Clean Responsive Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {displayProducts.map((product) => (
            <ProductCard key={`flash-${product.id}`} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
