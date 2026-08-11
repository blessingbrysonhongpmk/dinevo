import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="dv-footer">
      <div className="container-dv">
        <div className="dv-footer-inner">
          <div>
            <div className="dv-logo" style={{ fontSize: '1.3rem' }}>
              DINE<span>VO</span>
            </div>
            <p style={{ color: 'var(--ink-faint)', fontSize: '0.82rem', marginTop: 4 }}>
              Scan. Order. Enjoy.
            </p>
          </div>
          <nav className="dv-footer-links">
            <Link to="/">Home</Link>
            <Link to="/table">Scan QR</Link>
            <Link to="/menu">Menu</Link>
            <Link to="/cart">Cart</Link>
          </nav>
        </div>
        <div className="dv-footer-bottom">
          <span>&copy; {new Date().getFullYear()} DINEVO Smart Restaurant Platform. All rights reserved.</span>
          <span style={{ color: 'var(--gold-soft)' }}>Table-side Ordering Engine</span>
        </div>
      </div>
    </footer>
  );
}
