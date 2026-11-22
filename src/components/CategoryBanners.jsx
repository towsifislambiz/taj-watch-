import React from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ITEMS = [
  { id: 'all', name: 'সকল ঘড়ি', badge: 'All' },
  { id: 'ap-tourbillon', name: 'ট্যুরবিলন', badge: 'AP' },
  { id: 'ap-offshore', name: 'রয়্যাল ওক', badge: 'Royal Oak' },
  { id: 'swiss-diver', name: 'অটোমেটিক ডাইভার', badge: 'Diver' },
  { id: 'classic-leather', name: 'ক্লাসিক লেদার', badge: 'Longines' },
  { id: 'wall-clock', name: 'দেয়াল ঘড়ি', badge: 'Decor' },
];

export default function CategoryBanners({ onSelectCategory }) {
  const navigate = useNavigate();

  const handleSelect = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORY_ITEMS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-gray-100 hover:bg-gray-950 hover:text-white text-gray-800 transition-colors border border-gray-200/60 shrink-0 cursor-pointer"
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
