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
          <nav style={{ display: 'flex', gap: 16, fontSize: '0.88rem', color: 'var(--cream)', opacity: 0.9 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
            <Link to={session ? "/menu" : "/table"} style={{ textDecoration: 'none', color: 'inherit' }}>Menu</Link>
            <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--gold-soft)', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
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
        </div>

      </div>
    </header>
  );
}
