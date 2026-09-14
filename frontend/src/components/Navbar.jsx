import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartIcon, QrIcon, KitchenIcon } from './Icons';

export default function Navbar() {
  const { session, totals } = useCart();
  const location = useLocation();

  const isStaffRoute = location.pathname.startsWith('/staff') || location.pathname.startsWith('/kitchen');

  return (
    <header className="dv-navbar">
      <div className="container-dv dv-navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" className="dv-logo">
            DINE<span>VO</span>
          </Link>
          <nav style={{ display: 'flex', gap: 20, fontSize: '0.92rem', color: 'var(--cream)', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Home</Link>
            <Link to="/table" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Scanner</Link>
            <Link to="/menu" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Menu</Link>
            <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--gold-soft)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <KitchenIcon width={14} height={14} /> Admin Portal
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {session ? (
            <Link to="/table" className="dv-table-chip">
              <QrIcon width={13} height={13} /> Table {session.tableNumber} &middot; #{session.sessionCode}
            </Link>
          ) : (
            <Link to="/table" className="dv-table-chip">
              <QrIcon width={13} height={13} /> Scan Table QR
            </Link>
          )}

          {!isStaffRoute && (
            <Link to="/cart" className="dv-cart-btn">
              <CartIcon />
              <span>Cart</span>
              {totals.count > 0 && <span className="dv-cart-badge">{totals.count}</span>}
            </Link>
          )}

          <Link
            to="/login"
            title="Restaurant Management & Staff Access"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--gold-soft)',
              padding: '6px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid rgba(255,215,0,0.2)',
              background: 'rgba(255,215,0,0.06)',
              letterSpacing: '0.04em'
            }}
          >
            Staff
          </Link>
        </div>

      </div>
    </header>
  );
}
