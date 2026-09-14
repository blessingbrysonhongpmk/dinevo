import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import FoodCard from '../components/FoodCard';
import { SearchIcon, FlameIcon, StarIcon } from '../components/Icons';
import { useCart } from '../context/CartContext';
import { FALLBACK_MENU_ITEMS } from '../data/fallbackMenu';

export default function Menu() {
  const { session } = useCart();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState(urlCategory || 'All');
  const [query, setQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('All'); // 'All', 'Veg', 'NonVeg', 'Spicy', 'Signature'
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'rating', 'price-asc', 'price-desc'

  useEffect(() => {
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, [urlCategory]);

  useEffect(() => {
    setLoading(true);
    setError(false);

    api
      .get('/foods')
      .then((res) => {
        const rawData = res.data;
        const fetched = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
        const targetList = fetched.length > 0 ? fetched : FALLBACK_MENU_ITEMS;
        const uniqueList = targetList.filter((item, index, self) =>
          index === self.findIndex((t) => (t.name || '').trim().toLowerCase() === (item.name || '').trim().toLowerCase())
        );
        setItems(uniqueList);
      })
      .catch((err) => {
        console.warn('Failed to load menu from API, loading fallback gourmet items:', err);
        const uniqueFallback = FALLBACK_MENU_ITEMS.filter((item, index, self) =>
          index === self.findIndex((t) => (t.name || '').trim().toLowerCase() === (item.name || '').trim().toLowerCase())
        );
        setItems(uniqueFallback);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const rawCategories = items.map((i) => i.category).filter(Boolean);
    const unique = Array.from(new Set(rawCategories));
    return ['All', ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter((i) => {
      let matchCategory = true;
      if (category !== 'All') {
        matchCategory = (i.category || '').trim().toLowerCase() === category.trim().toLowerCase();
      }

      let matchDiet = true;
      if (dietFilter === 'Veg') matchDiet = !!i.veg;
      if (dietFilter === 'NonVeg') matchDiet = !i.veg;
      if (dietFilter === 'Spicy') matchDiet = !!i.isSpicy || (Number(i.spiceLevel) > 1);
      if (dietFilter === 'Signature') matchDiet = !!i.isSignature || (i.category || '').toLowerCase().includes('signature');

      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q)) ||
        (i.ingredients && i.ingredients.some((ing) => ing.toLowerCase().includes(q)));

      return matchCategory && matchDiet && matchQuery;
    });

    if (sortBy === 'rating') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [items, category, dietFilter, query, sortBy]);

  return (
    <div>
      <section className="dv-menu-hero">
        <div className="container-dv">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              {session ? (
                <>
                  <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
                    Table {session.tableNumber} &middot; Session #{session.sessionCode}
                  </span>
                  <h1 style={{ marginTop: 6 }}>{session.restaurantName || 'DINEVO Grand Dining House'}</h1>
                  <p className="sub">Gourmet World Cuisine &middot; 100 Handcrafted Dishes</p>
                </>
              ) : (
                <>
                  <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
                    Grand Dining Menu &middot; 100 Handcrafted Dishes
                  </span>
                  <h1 style={{ marginTop: 6 }}>DINEVO Grand Dining House</h1>
                  <p className="sub">Explore 12 signature global categories curated by our Master Chefs</p>
                </>
              )}
            </div>
            {session ? (
              <span
                className="dv-table-chip"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Table {session.tableNumber} &middot; #{session.sessionCode}
              </span>
            ) : (
              <Link
                to="/table"
                className="btn-dv btn-outline"
                style={{ padding: '8px 18px', fontSize: '0.82rem', borderColor: 'rgba(255,215,0,0.4)', color: 'var(--gold-soft)' }}
              >
                Connect to Dining Table
              </Link>
            )}
          </div>

          <div className="dv-search-bar">
            <SearchIcon />
            <input
              placeholder="Search dishes, ingredients, e.g. Wagyu, Lobster, Biryani, Truffle, Mojito..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                style={{ background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', opacity: 0.7 }}
                onClick={() => setQuery('')}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="dv-cat-bar">
        <div className="container-dv">
          <div className="dv-cat-scroll" style={{ marginBottom: 14 }}>
            {categories.map((cat) => {
              const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`dv-cat-chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat} <span style={{ opacity: 0.75, fontSize: '0.78rem', marginLeft: 4 }}>({count})</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Filter:</span>
              {[
                { id: 'All', label: 'All Items' },
                { id: 'Signature', label: '★ Signature' },
                { id: 'Veg', label: '🟢 Veg Only' },
                { id: 'NonVeg', label: '🔴 Non-Veg' },
                { id: 'Spicy', label: '🌶️ Spicy Only' }
              ].map((f) => (
                <button
                  key={f.id}
                  style={{
                    background: dietFilter === f.id ? 'var(--espresso)' : 'var(--surface)',
                    color: dietFilter === f.id ? 'var(--cream)' : 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-pill)',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setDietFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="featured">Featured / Default</option>
                <option value="rating">Top Rated (★ High to Low)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container-dv" style={{ paddingBottom: 60 }}>
        {/* Counter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px', color: 'var(--ink-soft)', fontSize: '0.86rem' }}>
          <span>
            Showing <strong>{filtered.length}</strong> of {items.length} gourmet creations
          </span>
          {(category !== 'All' || dietFilter !== 'All' || query) && (
            <button
              onClick={() => {
                setCategory('All');
                setDietFilter('All');
                setQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--burgundy)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Reset Filters ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="dv-loading-screen">
            <span className="dv-spinner" /> Loading 100 luxury dining dishes...
          </div>
        ) : error ? (
          <div className="dv-empty">
            <h3>Unable to load menu</h3>
            <p>Please check backend API connection and try refreshing.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dv-empty">
            <h3>No dishes match your selected filters</h3>
            <p>Try clearing search keywords or switching category filters.</p>
            <button
              onClick={() => {
                setCategory('All');
                setDietFilter('All');
                setQuery('');
              }}
              className="btn-dv btn-burgundy"
              style={{ marginTop: 14 }}
            >
              View All Dishes
            </button>
          </div>
        ) : (
          <div className="dv-menu-grid">
            {filtered.map((item) => (
              <FoodCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
