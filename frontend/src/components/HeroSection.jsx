import React from 'react';
import { Link } from 'react-router-dom';
import { QrIcon, ClockIcon } from './Icons';

export default function HeroSection({ session }) {
  const menuLink = session ? '/menu' : '/table';

  return (
    <section className="dv-hero">
      <div className="container-dv dv-hero-grid">
        <div className="anim-fade-up">
          <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
            ⚡ DINEVO TABLE ORDERING SYSTEM
          </span>
          <h1 style={{ marginTop: 14 }}>
            Your table. Your order. <em>Your experience.</em>
          </h1>
          <p className="lead">
            Welcome to DINEVO. Scan the QR code at your table to access today's digital menu, customize your meal with precision, and send orders straight to our kitchen.
          </p>
          <div className="dv-hero-cta">
            <Link to="/table" className="btn-dv btn-gold" style={{ padding: '15px 32px', fontSize: '1.05rem' }}>
              <QrIcon width={20} height={20} /> {session ? `Table ${session.tableNumber} Menu` : 'SCAN TABLE QR'}
            </Link>
            <Link
              to="/table/DINEVO-T01"
              className="btn-dv btn-outline"
              style={{ color: '#FAF6F0', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)' }}
            >
              Demo Table 01
            </Link>
          </div>
        </div>
        <div className="dv-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1400&auto=format&fit=crop"
            alt="DINEVO Luxury Restaurant Experience"
          />
          <div className="dv-hero-badge">
            <ClockIcon /> Direct to Kitchen &middot; Instant Table Verification
          </div>
        </div>
      </div>
    </section>
  );
}

