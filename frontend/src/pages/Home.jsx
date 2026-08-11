import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import HeroSection from '../components/HeroSection';
import ProcessSteps from '../components/ProcessSteps';
import FoodCard from '../components/FoodCard';
import { QrIcon } from '../components/Icons';
import { useCart } from '../context/CartContext';

export default function Home() {
  const { session } = useCart();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get('/foods')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        const pop = data.filter((i) => i.isPopular).slice(0, 6);
        setFeatured(pop.length > 0 ? pop : data.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const menuLink = session ? '/menu' : '/table';

  return (
    <div>
      <HeroSection session={session} />
      <ProcessSteps />

      {/* Category Preview */}
      <section className="section-pad" style={{ paddingTop: 0 }}>
        <div className="container-dv">
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <span className="eyebrow">Explore Gourmet Categories</span>
            <h2 style={{ marginTop: 8, fontSize: '1.9rem' }}>Crafted for Every Craving</h2>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              '★ Signature',
              '🌴 Kanyakumari Specials',
              '🥤 Juices & Coolers',
              '🍨 Desserts',
              'Burgers',
              'Chicken',
              'Rice & Meals',
              'Spicy',
              'Starters',
              'Sides'
            ].map((cat) => (
              <Link
                to={menuLink}
                key={cat}
                className="dv-cat-chip"
                style={{ padding: '12px 24px', fontSize: '0.92rem' }}
              >
                {cat}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Popular Dishes */}
      {featured.length > 0 && (
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="container-dv">
            <div className="dv-section-head">
              <div>
                <span className="eyebrow">Popular Dishes</span>
                <h2 style={{ marginTop: 8 }}>Guest Favorites Today</h2>
              </div>
              <Link to={menuLink} className="btn-dv btn-outline">
                View Full Menu
              </Link>
            </div>
            <div className="dv-menu-grid">
              {featured.map((item) => (
                <FoodCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!session && (
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="container-dv">
            <div className="card-dv" style={{ padding: '44px 34px', textAlign: 'center', background: 'var(--grad-hero)', color: 'var(--cream)', borderColor: 'rgba(247,127,0,0.3)' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--cream)' }}>Ready to Order from your Table?</h2>
              <p style={{ color: 'rgba(250,246,240,0.8)', marginTop: 10, maxWidth: '44ch', margin: '10px auto 0' }}>
                Scan the QR code on your table to access today's digital menu instantly.
              </p>
              <Link to="/table" className="btn-dv btn-gold" style={{ marginTop: 26, padding: '14px 32px' }}>
                <QrIcon width={18} height={18} /> Enter Table Code
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
