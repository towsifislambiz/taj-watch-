import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import FlashSaleSection from '../components/FlashSaleSection';
import CategoryBanners from '../components/CategoryBanners';
import ProductGrid from '../components/ProductGrid';
import CustomerReviews from '../components/CustomerReviews';

export default function HomePage({ searchQuery, setSearchQuery }) {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* 1. Clean Minimal Hero */}
      <HeroSlider />

      {/* 2. Quick Horizontal Category Filter */}
      <CategoryBanners onSelectCategory={(catId) => setActiveCategory(catId)} />

      {/* 3. Flash Sale Section (if active) */}
      <FlashSaleSection />

      {/* 4. Luxury Watch Catalog (Grid) */}
      <ProductGrid
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
      />

      {/* 5. Clean Customer Reviews */}
      <CustomerReviews />
    </div>
  );
}
