import React from 'react';

const CATEGORY_ITEMS = [
  { id: 'all', name: 'সকল ঘড়ি', badge: 'All' },
  { id: 'ap-tourbillon', name: 'ট্যুরবিলন', badge: 'AP' },
  { id: 'ap-offshore', name: 'রয়্যাল ওক', badge: 'Royal Oak' },
  { id: 'swiss-diver', name: 'অটোমেটিক ডাইভার', badge: 'Diver' },
  { id: 'classic-leather', name: 'ক্লাসিক লেদার', badge: 'Longines' },
  { id: 'wall-clock', name: 'দেয়াল ঘড়ি', badge: 'Decor' },
];

export default function CategoryBanners({ activeCategory = 'all', onSelectCategory }) {
  const handleSelect = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  return (
    <div className="bg-[#FAF7F5] py-2.5 sm:py-3.5 border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORY_ITEMS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm scale-102 border border-red-600 font-extrabold'
                    : 'bg-white hover:bg-gray-100 text-gray-700 hover:text-black border border-gray-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
