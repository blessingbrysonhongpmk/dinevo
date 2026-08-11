import React from 'react';

export default function CartSummary({ totals, session, onCheckout, buttonText = 'Proceed to Checkout' }) {
  return (
    <div className="dv-receipt">
      <h3>Order Summary</h3>
      {session && (
        <>
          <div className="line">
            <span>Restaurant</span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{session.restaurantName}</span>
          </div>
          <div className="line">
            <span>Table / Session</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)' }}>
              Table {session.tableNumber} (#{session.sessionCode})
            </span>
          </div>
          <div className="cut" />
        </>
      )}
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
        <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totals.total.toFixed(2)}</span>
      </div>

      {onCheckout && (
        <button
          className="btn-dv btn-burgundy btn-block"
          style={{ marginTop: 22, padding: '14px 20px', fontSize: '1.02rem' }}
          onClick={onCheckout}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
