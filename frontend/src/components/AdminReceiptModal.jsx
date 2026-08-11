import React from 'react';

export default function AdminReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderNum = order.orderNumber || order._id?.slice(-6) || '1001';
  const tableNum = order.tableNumber || '01';
  const items = order.items || [];
  const subtotal = order.subtotal || items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const tax = order.tax || Math.round(subtotal * 0.05 * 100) / 100;
  const total = order.total || subtotal + tax;
  const servingCode = order.servingCode || '4982';
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '20px'
      }}
    >
      <div
        className="dv-receipt-modal"
        style={{
          background: '#FFFFFF',
          color: '#111111',
          borderRadius: '20px',
          padding: '28px 24px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '3px solid #1A1721',
          position: 'relative',
          fontFamily: 'monospace'
        }}
      >
        {/* BRAND HEADER */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #111', paddingBottom: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'serif', letterSpacing: '0.04em' }}>
            DINE<span style={{ color: '#F77F00' }}>VO</span>
          </div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginTop: 2, fontWeight: 700 }}>
            GOURMET RESTAURANT POS INVOICE
          </div>
          <div style={{ fontSize: '0.7rem', color: '#777', marginTop: 4 }}>
            GSTIN: 33ABCDE1234F1Z5 · Tel: +91 98765 43210
          </div>
        </div>

        {/* ORDER DETAILS */}
        <div style={{ fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '14px', borderBottom: '1px solid #EEE', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order ID: <strong>#{orderNum}</strong></span>
            <span>Date: {dateStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Table: <strong>TABLE {tableNum}</strong></span>
            <span>Status: <strong style={{ color: '#048A65' }}>PAID ✓</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Serving Code: <strong style={{ color: '#E63946' }}>{servingCode}</strong></span>
            <span>Payment: <strong>UPI / ONLINE</strong></span>
          </div>
        </div>

        {/* ITEM TABLE */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontWeight: 800, fontSize: '0.75rem', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '8px' }}>
            <span>ITEM</span>
            <span style={{ textAlign: 'center' }}>QTY</span>
            <span style={{ textAlign: 'right' }}>RATE</span>
            <span style={{ textAlign: 'right' }}>AMT</span>
          </div>

          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: '0.78rem', marginBottom: '6px' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                {item.spiceLevel && <div style={{ fontSize: '0.68rem', color: '#666' }}>Spice: {item.spiceLevel}</div>}
                {item.notes && <div style={{ fontSize: '0.68rem', color: '#E63946' }}>Note: {item.notes}</div>}
              </div>
              <span style={{ textAlign: 'center' }}>{item.quantity}</span>
              <span style={{ textAlign: 'right' }}>₹{Number(item.price).toFixed(0)}</span>
              <span style={{ textAlign: 'right', fontWeight: 700 }}>₹{(Number(item.price) * Number(item.quantity)).toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* TOTAL CALCULATIONS */}
        <div style={{ borderTop: '2px dashed #111', paddingTop: '10px', fontSize: '0.82rem', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST (5%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, marginTop: '6px', borderTop: '1px solid #111', paddingTop: '6px' }}>
            <span>GRAND TOTAL:</span>
            <span style={{ color: '#048A65' }}>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.72rem', color: '#666', borderTop: '1px solid #EEE', paddingTop: '10px' }}>
          <div>★ Thank you for dining with DINEVO ★</div>
          <div>Visit Again · Powered by DINEVO POS v2.1</div>
        </div>

        {/* BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
          <button
            onClick={handlePrint}
            style={{
              background: '#1A1721',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🖨 Print Invoice
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#F5F2EC',
              color: '#111',
              border: '1px solid #CCC',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
