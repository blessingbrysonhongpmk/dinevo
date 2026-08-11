import React, { useState } from 'react';

export default function AdminReceiptModal({ order, onClose }) {
  if (!order) return null;

  const [serviceChargeRate, setServiceChargeRate] = useState(0); // 0% or 5%

  const handlePrint = () => {
    window.print();
  };

  const orderNum = order.orderNumber || order._id?.slice(-6) || '1001';
  const tableNum = order.tableNumber || '01';
  const items = order.items || [];
  const subtotal = order.subtotal || items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  
  const cgst = Math.round((subtotal * 0.025) * 100) / 100;
  const sgst = Math.round((subtotal * 0.025) * 100) / 100;
  const serviceCharge = Math.round((subtotal * (serviceChargeRate / 100)) * 100) / 100;
  const grandTotal = Math.round((subtotal + cgst + sgst + serviceCharge) * 100) / 100;

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
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .dv-receipt-modal, .dv-receipt-modal * {
            visibility: visible !important;
          }
          .dv-receipt-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 10px !important;
            color: #000000 !important;
            background: #FFFFFF !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="dv-receipt-modal"
        style={{
          background: '#FFFFFF',
          color: '#111111',
          borderRadius: '20px',
          padding: '28px 24px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          border: '3px solid #1A1721',
          position: 'relative',
          fontFamily: 'monospace'
        }}
      >
        {/* BRAND HEADER */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #111', paddingBottom: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, fontFamily: 'serif', letterSpacing: '0.04em' }}>
            DINE<span style={{ color: '#F77F00' }}>VO</span>
          </div>
          <div style={{ fontSize: '0.74rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', marginTop: 2, fontWeight: 800 }}>
            5-STAR LUXURY RESORT & POS INVOICE
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: 4 }}>
            GSTIN: 33ABCDE1234F1Z5 · FSSAI: 12421001000188
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666' }}>
            12 Marina Walk · Helpline: +91 98765 43210
          </div>
        </div>

        {/* ORDER DETAILS */}
        <div style={{ fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '14px', borderBottom: '1px solid #EEE', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Order No: <strong>#{orderNum}</strong></span>
            <span>Date: {dateStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Table: <strong style={{ fontSize: '0.9rem', color: '#F77F00' }}>TABLE {tableNum}</strong></span>
            <span>Payment: <strong style={{ color: '#048A65' }}>ONLINE / PAID ✓</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span>Serving Verification PIN: <strong style={{ color: '#E63946', fontSize: '0.9rem' }}>{servingCode}</strong></span>
          </div>
        </div>

        {/* ITEM TABLE */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 1fr 1fr', fontWeight: 800, fontSize: '0.75rem', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '8px' }}>
            <span>ITEM DESCRIPTION</span>
            <span style={{ textAlign: 'center' }}>QTY</span>
            <span style={{ textAlign: 'right' }}>RATE</span>
            <span style={{ textAlign: 'right' }}>AMOUNT</span>
          </div>

          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 1fr 1fr', fontSize: '0.78rem', marginBottom: '6px' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                {item.spiceLevel && <div style={{ fontSize: '0.68rem', color: '#666' }}>🌶️ Spice: {item.spiceLevel}</div>}
                {item.notes && <div style={{ fontSize: '0.68rem', color: '#E63946' }}>Note: "{item.notes}"</div>}
              </div>
              <span style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
              <span style={{ textAlign: 'right' }}>₹{Number(item.price).toFixed(0)}</span>
              <span style={{ textAlign: 'right', fontWeight: 700 }}>₹{(Number(item.price) * Number(item.quantity)).toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* TOTAL CALCULATIONS & TAX BREAKDOWN */}
        <div style={{ borderTop: '2px dashed #111', paddingTop: '10px', fontSize: '0.82rem', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Item Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>CGST (2.5%):</span>
            <span>₹{cgst.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>SGST (2.5%):</span>
            <span>₹{sgst.toFixed(2)}</span>
          </div>

          {serviceChargeRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Service Charge ({serviceChargeRate}%):</span>
              <span>₹{serviceCharge.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, marginTop: '8px', borderTop: '2px solid #111', paddingTop: '6px' }}>
            <span>NET PAYABLE:</span>
            <span style={{ color: '#048A65' }}>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* SERVICE CHARGE TOGGLE (NO-PRINT) */}
        <div className="no-print" style={{ marginTop: 12, padding: '8px', background: '#F5F2EC', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
          <span>Service Charge:</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setServiceChargeRate(0)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: serviceChargeRate === 0 ? '#111' : '#DDD',
                color: serviceChargeRate === 0 ? '#FFF' : '#111',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              0%
            </button>
            <button
              onClick={() => setServiceChargeRate(5)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: serviceChargeRate === 5 ? '#111' : '#DDD',
                color: serviceChargeRate === 5 ? '#FFF' : '#111',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              5%
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.72rem', color: '#555', borderTop: '1px solid #EEE', paddingTop: '8px' }}>
          <div>★ Thank you for dining at DINEVO 5-Star Resort ★</div>
          <div>Visit Again · Powered by DINEVO Enterprise POS</div>
        </div>

        {/* ACTION BUTTONS (NO-PRINT) */}
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <button
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #E63946 0%, #B81D2B 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(230, 57, 70, 0.4)'
            }}
          >
            🖨 Print Thermal Receipt
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#F5F2EC',
              color: '#111',
              border: '1px solid #CCC',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '0.85rem',
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
