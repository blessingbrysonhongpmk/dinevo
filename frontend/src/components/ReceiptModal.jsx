import React from 'react';
import { ShieldCheckIcon, CheckIcon } from './Icons';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(10, 8, 14, 0.86)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div
        id="printable-tax-receipt"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          color: '#1A1824',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          maxHeight: '92vh',
          overflowY: 'auto',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* TOP BADGE */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#E6F9F0',
              color: '#00875A',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800
            }}
          >
            <ShieldCheckIcon width={14} height={14} /> OFFICIAL GST TAX INVOICE
          </div>
        </div>

        {/* RESTAURANT HEADER */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #E0E0E0', paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F0C1B', letterSpacing: '-0.02em' }}>
            {receipt.restaurantName || 'DINEVO Kitchen & Bar'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>
            {receipt.restaurantAddress || 'Grand Culinary Plaza, Luxury Promenade'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4, fontWeight: 700 }}>
            GSTIN: <span style={{ fontFamily: 'monospace', color: '#333' }}>{receipt.gstin || '27AABCD1234E1Z5'}</span>
          </div>
        </div>

        {/* METADATA GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem', background: '#F8F9FB', padding: 12, borderRadius: 14, marginBottom: 16 }}>
          <div>
            <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Receipt No</div>
            <div style={{ fontWeight: 800, color: '#111', fontFamily: 'monospace' }}>{receipt.receiptNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Table & Session</div>
            <div style={{ fontWeight: 800, color: '#C0392B' }}>Table #{receipt.tableNumber} &middot; {receipt.sessionCode}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</div>
            <div style={{ fontWeight: 600, color: '#333' }}>{formattedDate}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Payment Method</div>
            <div style={{ fontWeight: 800, color: '#00875A' }}>✓ {receipt.paymentMethod || 'UPI'}</div>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Ordered Billed Items
          </div>
          <div style={{ borderTop: '1px solid #EEE', borderBottom: '1px solid #EEE' }}>
            {receipt.items && receipt.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.86rem', borderBottom: idx === receipt.items.length - 1 ? 'none' : '1px dashed #F0F0F0' }}>
                <div style={{ flex: 1, paddingRight: 10 }}>
                  <div style={{ fontWeight: 700, color: '#222' }}>
                    {item.quantity}× {item.name}
                  </div>
                  {item.notes && <div style={{ fontSize: '0.75rem', color: '#777' }}>Note: {item.notes}</div>}
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#111' }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TAX BREAKDOWN & GRAND TOTAL */}
        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
            <span>Items Subtotal</span>
            <span style={{ fontFamily: 'monospace' }}>₹{Number(receipt.subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.8rem' }}>
            <span>CGST (2.5%)</span>
            <span style={{ fontFamily: 'monospace' }}>₹{Number(receipt.cgst || receipt.totalTax / 2).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.8rem' }}>
            <span>SGST (2.5%)</span>
            <span style={{ fontFamily: 'monospace' }}>₹{Number(receipt.sgst || receipt.totalTax / 2).toFixed(2)}</span>
          </div>
          {receipt.tipAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D35400', fontSize: '0.82rem', fontWeight: 700 }}>
              <span>Staff Courtesy Tip</span>
              <span style={{ fontFamily: 'monospace' }}>+₹{Number(receipt.tipAmount).toFixed(2)}</span>
            </div>
          )}

          <div style={{ borderTop: '2px solid #222', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, color: '#0F0C1B' }}>
            <span>TOTAL PAID</span>
            <span style={{ fontFamily: 'monospace', color: '#C0392B' }}>₹{Number(receipt.grandTotal).toFixed(2)}</span>
          </div>
        </div>

        {/* TRANSACTION UTR FOOTER */}
        <div style={{ background: '#F4F5F7', padding: '10px 12px', borderRadius: 12, fontSize: '0.78rem', color: '#555', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Transaction Ref ID:</span>
            <strong style={{ fontFamily: 'monospace', color: '#222' }}>{receipt.transactionId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bank UTR Number:</span>
            <strong style={{ fontFamily: 'monospace', color: '#00875A' }}>{receipt.utrNumber}</strong>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="no-print" style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              background: '#0F0C1B',
              color: '#FFF',
              border: 'none',
              padding: '12px',
              borderRadius: 14,
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            🖨️ PRINT / SAVE TAX INVOICE
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#EAEAEA',
              color: '#333',
              border: 'none',
              padding: '12px 18px',
              borderRadius: 14,
              fontSize: '0.9rem',
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
