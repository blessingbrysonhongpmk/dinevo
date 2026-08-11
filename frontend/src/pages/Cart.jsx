import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyCartIcon, ArrowLeft, FlameIcon } from '../components/Icons';

export default function Cart() {
  const { session, items, updateQuantity, removeItem, totals } = useCart();
  const navigate = useNavigate();

  if (!session) return <Navigate to="/table" replace />;

  if (items.length === 0) {
    return (
      <div className="container-dv">
        <div className="dv-empty-cart">
          <div className="icon">
            <EmptyCartIcon />
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>Your order is empty</h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
            Explore the menu and add dishes to Table {session.tableNumber} &middot; Session #{session.sessionCode}.
          </p>
          <Link to="/menu" className="btn-dv btn-burgundy" style={{ marginTop: 22, padding: '12px 28px' }}>
            Browse Restaurant Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-dv">
      <div style={{ paddingTop: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button
            onClick={() => navigate('/menu')}
            className="dv-back-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10 }}
          >
            <ArrowLeft /> Back to menu
          </button>
          <span className="eyebrow">
            Table {session.tableNumber} &middot; Session #{session.sessionCode}
          </span>
          <h1 style={{ marginTop: 6, fontSize: '1.9rem' }}>Review Table Order</h1>
        </div>
        <span className="dv-table-chip">Table {session.tableNumber}</span>
      </div>

      <div className="dv-cart-layout">
        <div>
          {items.map((i) => (
            <div className="dv-cart-item" key={i.itemKey}>
              {i.image && <img src={i.image} alt={i.name} />}
              <div className="info">
                <div className="row1">
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>{i.name}</strong>

                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', fontSize: '0.78rem' }}>
                      <span style={{ background: 'var(--cream-2)', padding: '2px 8px', borderRadius: 'var(--r-pill)', color: 'var(--ink-soft)' }}>
                        <FlameIcon width={10} height={10} style={{ color: 'var(--burgundy)' }} /> Spice: {i.spiceLevel}
                      </span>
                      {i.selectedAddOns?.map((a) => (
                        <span key={a.name} style={{ background: 'var(--gold-tint)', color: '#8A6417', padding: '2px 8px', borderRadius: 'var(--r-pill)' }}>
                          +{a.name} (₹{a.price})
                        </span>
                      ))}
                    </div>

                    {i.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: 6 }}>
                        Note: {i.notes}
                      </p>
                    )}
                  </div>
                  <span className="dv-price">
                    <small>₹</small>{(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <div className="dv-qty-stepper" style={{ transform: 'scale(0.88)', transformOrigin: 'left center' }}>
                    <button onClick={() => updateQuantity(i.itemKey, -1)} aria-label="Decrease quantity">
                      &minus;
                    </button>
                    <span className="count">{i.quantity}</span>
                    <button onClick={() => updateQuantity(i.itemKey, 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <button className="remove-link" onClick={() => removeItem(i.itemKey)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dv-receipt">
          <h3>Order Summary</h3>
          <div className="line">
            <span>Restaurant</span>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{session.restaurantName}</span>
          </div>
          <div className="line">
            <span>Table / Session</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Table {session.tableNumber} (#{session.sessionCode})</span>
          </div>
          <div className="cut" />
          <div className="line">
            <span>Subtotal ({totals.count} items)</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="line">
            <span>Tax (5% GST)</span>
            <span>₹{totals.tax.toFixed(2)}</span>
          </div>
          <div className="cut" />
          <div className="line total">
            <span>Grand Total</span>
            <span>₹{totals.total.toFixed(2)}</span>
          </div>

          <button
            className="btn-dv btn-burgundy btn-block"
            style={{ marginTop: 22, padding: '14px 20px', fontSize: '1.02rem' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>

          <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', textAlign: 'center', marginTop: 14 }}>
            Direct table ordering &middot; Real-time kitchen transmission
          </p>
        </div>
      </div>
    </div>
  );
}
