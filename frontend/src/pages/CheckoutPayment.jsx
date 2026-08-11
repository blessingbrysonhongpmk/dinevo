import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { ShieldCheckIcon, ArrowLeft } from '../components/Icons';
import PaymentModal from '../components/PaymentModal';

export default function CheckoutPayment() {
  const { session, items, totals, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!session) return <Navigate to="/table" replace />;
  if (items.length === 0 && !showPaymentModal) return <Navigate to="/menu" replace />;

  const handleOpenPaymentPopup = async () => {
    setProcessing(true);
    setError('');

    try {
      // 1. Create Pending Order on backend (Backend recalculates prices and tax)
      const orderRes = await api.post('/orders', {
        restaurantId: session.restaurantId,
        tableNumber: session.tableNumber,
        sessionCode: session.sessionCode,
        items: items.map((i) => ({
          menuItem: i.menuItem,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          spiceLevel: i.spiceLevel,
          selectedAddOns: i.selectedAddOns,
          notes: i.notes
        }))
      });

      const order = orderRes.data;
      setPendingOrder(order);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Checkout order creation error:', err);
      setError(err.response?.data?.message || 'Failed to create order. Please check item availability and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentVerified = async () => {
    if (!pendingOrder) return;
    try {
      const payRes = await api.post('/payments/create', {
        orderId: pendingOrder._id,
        method: paymentMethod
      });

      if (payRes.data.success || payRes.data.order) {
        clearCart();
        setShowPaymentModal(false);
        navigate(`/order/${pendingOrder._id}/confirmation`);
      } else {
        throw new Error('Payment verification failed on backend');
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Backend payment verification failed');
    }
  };

  return (
    <div className="container-dv" style={{ paddingBottom: 90 }}>
      <div style={{ paddingTop: 36, maxWidth: 680, margin: '0 auto' }}>
        <button
          onClick={() => navigate('/cart')}
          className="dv-back-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft /> Back to cart
        </button>

        <span className="eyebrow">Checkout & Secure Payment</span>
        <h1 style={{ marginTop: 6, fontSize: '1.9rem' }}>Confirm Table Order</h1>

        <div
          style={{
            background: 'var(--sage-tint)',
            color: 'var(--sage)',
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 16
          }}
        >
          <ShieldCheckIcon width={18} height={18} /> Verified Table {session.tableNumber} &middot; Session #{session.sessionCode}
        </div>

        {/* Order Summary Box */}
        <div className="card-dv" style={{ padding: '24px 26px', marginTop: 24 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Order Items</h3>
          {items.map((i) => (
            <div key={i.itemKey} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', padding: '6px 0' }}>
              <span>
                <strong>{i.quantity}×</strong> {i.name}
                {i.selectedAddOns?.length > 0 && (
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                    + {i.selectedAddOns.map((a) => a.name).join(', ')}
                  </span>
                )}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed var(--line)', margin: '14px 0 10px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--ink-soft)', marginTop: 4 }}>
            <span>Tax (5% GST)</span>
            <span>₹{totals.tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginTop: 10 }}>
            <span>Total Payable</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--burgundy)' }}>₹{totals.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="card-dv" style={{ padding: '24px 26px', marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem' }}>Select Payment Method</h3>
            <span style={{ fontSize: '0.74rem', background: 'var(--gold-tint)', color: 'var(--gold)', padding: '3px 10px', borderRadius: 'var(--r-pill)', fontWeight: 600 }}>
              ⚡ Payment Verification Mode
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { id: 'UPI', title: 'UPI / QR Scan', desc: 'Scan and pay securely via GPay / PhonePe / Paytm', active: true },
              { id: 'CARD', title: 'Credit / Debit Card', desc: 'Visa / Mastercard / RuPay (Coming Soon)', active: false },
              { id: 'CASH', title: 'Cash at Counter', desc: 'Pay directly at billing counter', active: true },
              { id: 'NET_BANKING', title: 'Net Banking', desc: 'All major Indian banks (Coming Soon)', active: false }
            ].map((m) => (
              <label
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 18px',
                  borderRadius: 'var(--r-md)',
                  border: '2px solid ' + (paymentMethod === m.id ? 'var(--burgundy)' : 'var(--line)'),
                  background: paymentMethod === m.id ? 'var(--burgundy-tint)' : 'var(--surface)',
                  cursor: m.active ? 'pointer' : 'not-allowed',
                  opacity: m.active ? 1 : 0.65
                }}
                onClick={() => m.active && setPaymentMethod(m.id)}
              >
                <input type="radio" checked={paymentMethod === m.id} disabled={!m.active} onChange={() => {}} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--ink)' }}>
                    {m.title} {!m.active && <small style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>(Disabled)</small>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: 2 }}>{m.desc}</div>
                </div>
                {paymentMethod === m.id && (
                  <span style={{ fontSize: '0.78rem', background: 'var(--burgundy)', color: '#fff', padding: '3px 10px', borderRadius: 'var(--r-pill)', fontWeight: 700 }}>
                    SELECTED
                  </span>
                )}
              </label>
            ))}
          </div>


          {error && (
            <div style={{ background: 'var(--chili-tint)', color: 'var(--chili)', padding: '12px', borderRadius: 'var(--r-sm)', fontSize: '0.86rem', marginTop: 16 }}>
              {error}
            </div>
          )}

          <button
            className="btn-dv btn-burgundy btn-block"
            style={{ marginTop: 24, padding: '15px 20px', fontSize: '1.05rem' }}
            onClick={handleOpenPaymentPopup}
            disabled={processing}
          >
            {processing ? <span className="dv-spinner" /> : `Open Payment QR Popup (₹${totals.total.toFixed(2)})`}
          </button>

          <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', textAlign: 'center', marginTop: 12 }}>
            🔒 Payment modal will launch on the current page &middot; Table #{session.tableNumber}
          </p>
        </div>
      </div>

      {/* Centered Payment QR Modal */}
      {showPaymentModal && pendingOrder && (
        <PaymentModal
          order={pendingOrder}
          onPaymentSuccess={handlePaymentVerified}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
