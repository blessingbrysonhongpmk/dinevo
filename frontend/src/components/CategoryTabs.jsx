import React from 'react';

export default function CategoryTabs({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="dv-cat-scroll">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`dv-cat-chip ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat === 'Signature' ? '★ Signature' : cat === 'Spicy' ? '🌶️ Spicy' : cat === 'Popular' ? '🔥 Popular' : cat}
        </button>
      ))}
    </div>
  );
}
