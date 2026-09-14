import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="dv-footer">
      <div className="container-dv">
        <div
          className="dv-footer-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 36,
            paddingBottom: 40
          }}
        >
          {/* Column 1: Brand & Philosophy */}
          <div>
            <div className="dv-logo" style={{ fontSize: '1.6rem', marginBottom: 10 }}>
              DINE<span>VO</span>
            </div>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.86rem', lineHeight: 1.6, maxWidth: '280px' }}>
              Crafted culinary heritage, 100 signature global dishes, and seamless contactless tableside hospitality.
            </p>
          </div>

          {/* Column 2: Dining Hours */}
          <div>
            <h4
              style={{
                color: '#FAF6F0',
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 14,
                fontWeight: 700
              }}
            >
              Dining Hours
            </h4>
            <div style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', lineHeight: 1.8 }}>
              <div>Lunch Service: 12:00 PM – 4:00 PM</div>
              <div>Dinner Service: 7:00 PM – 11:30 PM</div>
              <div>Open 7 Days a Week</div>
            </div>
          </div>

          {/* Column 3: Guest Services */}
          <div>
            <h4
              style={{
                color: '#FAF6F0',
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 14,
                fontWeight: 700
              }}
            >
              Guest Services
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <Link to="/menu" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>
                Full Culinary Menu
              </Link>
              <Link to="/table" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>
                Order at Table
              </Link>
              <Link to="/cart" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>
                Active Table Cart
              </Link>
              <Link to="/login" style={{ color: 'var(--gold-soft)', textDecoration: 'none', fontWeight: 600 }}>
                Staff & Kitchen Portal
              </Link>
            </nav>
          </div>

          {/* Column 4: Concierge & Location */}
          <div>
            <h4
              style={{
                color: '#FAF6F0',
                fontSize: '0.88rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 14,
                fontWeight: 700
              }}
            >
              Concierge & Location
            </h4>
            <div style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', lineHeight: 1.8 }}>
              <div>The Grand Promenade, Luxury District</div>
              <div>Reservations: +91 98765 43210</div>
              <div>concierge@dinevo.com</div>
            </div>
          </div>
        </div>

        <div
          className="dv-footer-bottom"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.78rem',
            color: 'var(--ink-faint)'
          }}
        >
          <span>&copy; {new Date().getFullYear()} DINEVO Grand Dining House. FSSAI Lic. 10022021000492. GST Reg: 27AADCB2230M1Z2.</span>
          <span style={{ color: 'var(--gold-soft)' }}>Crafted Hospitality & Contactless Dining</span>
        </div>
      </div>
    </footer>
  );
}
