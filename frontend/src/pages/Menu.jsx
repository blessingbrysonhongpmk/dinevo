import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import FoodCard from '../components/FoodCard';
import { SearchIcon, FlameIcon, StarIcon } from '../components/Icons';
import { useCart } from '../context/CartContext';

export default function Menu() {
  const { session } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('All'); // 'All', 'Veg', 'NonVeg', 'Spicy', 'Signature'

  useEffect(() => {
    setLoading(true);
    setError(false);

    api
      .get('/foods')
      .then((res) => {
        setItems(res.data);
      })
      .catch((err) => {
        console.error('Failed to load menu:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const defaultCats = [
      'All',
      '★ Signature',
      '🌴 Kanyakumari Specials',
      '🥤 Juices & Coolers',
      '🍨 Desserts',
      'Chicken',
      'Burgers',
      'Rice & Meals',
      'Starters',
      'Sides',
      'Spicy'
    ];
    return defaultCats;
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      let matchCategory = true;
      if (category !== 'All') {
        const cleanCat = category.replace(/[^a-zA-Z &]/g, '').trim().toLowerCase();
        if (cleanCat.includes('signature')) {
          matchCategory = !!i.isSignature || i.category.toLowerCase().includes('signature');
        } else if (cleanCat.includes('kanyakumari')) {
          matchCategory = !!i.isKanyakumariSpecial || i.category.toLowerCase().includes('kanyakumari');
        } else if (cleanCat.includes('juices') || cleanCat.includes('coolers')) {
          matchCategory = !!i.isJuice || i.category.toLowerCase().includes('juice') || i.category.toLowerCase().includes('beverage');
        } else if (cleanCat.includes('dessert')) {
          matchCategory = !!i.isDessert || i.category.toLowerCase().includes('dessert');
        } else if (cleanCat.includes('spicy')) {
          matchCategory = !!i.isSpicy || i.spiceLevel > 1 || i.category.toLowerCase().includes('spicy');
        } else {
          matchCategory = i.category.toLowerCase().includes(cleanCat);
        }
      }


      let matchDiet = true;
      if (dietFilter === 'Veg') matchDiet = !!i.veg;
      if (dietFilter === 'NonVeg') matchDiet = !i.veg;
      if (dietFilter === 'Spicy') matchDiet = !!i.isSpicy || i.spiceLevel > 1;
      if (dietFilter === 'Signature') matchDiet = !!i.isSignature;

      const matchQuery =
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.description && i.description.toLowerCase().includes(query.toLowerCase())) ||
        (i.category && i.category.toLowerCase().includes(query.toLowerCase()));

      return matchCategory && matchDiet && matchQuery;
    });
  }, [items, category, dietFilter, query]);

  if (!session) return <Navigate to="/table" replace />;

  return (
    <div>
      <section className="dv-menu-hero">
        <div className="container-dv">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
                Table {session.tableNumber} &middot; Session #{session.sessionCode}
              </span>
              <h1 style={{ marginTop: 6 }}>{session.restaurantName || 'DINEVO Kitchen'}</h1>
              <p className="sub">In-Restaurant Menu &middot; Select, Customize & Order</p>
            </div>
            <span
              className="dv-table-chip"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Table {session.tableNumber} &middot; #{session.sessionCode}
            </span>
          </div>

          <div className="dv-search-bar">
            <SearchIcon />
            <input
              placeholder="Search dishes, ingredients, e.g. Burger, Salmon, Biryani, Truffle..."
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
          <div className="dv-cat-scroll" style={{ marginBottom: 10 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`dv-cat-chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
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
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onClick={() => setDietFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-dv">
        {loading ? (
          <div className="dv-loading-screen">
            <span className="dv-spinner" /> Loading full restaurant menu...
          </div>
        ) : error ? (
          <div className="dv-empty">
            <h3>Unable to load menu</h3>
            <p>Please check backend API connection and try refreshing.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dv-empty">
            <h3>No dishes match your filters</h3>
            <p>Try clearing search keywords or switching category filters.</p>
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
