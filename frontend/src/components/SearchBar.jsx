import React from 'react';
import { SearchIcon } from './Icons';

export default function SearchBar({ value, onChange, placeholder = 'Search dishes, ingredients, drinks...' }) {
  return (
    <div className="dv-search-bar">
      <SearchIcon />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          style={{ background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', opacity: 0.8 }}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
}
