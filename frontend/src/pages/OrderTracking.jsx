import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { CheckIcon, StarIcon, ShieldCheckIcon, ClockIcon } from '../components/Icons';

const STEPS = [
  { key: 'PAID', title: 'Payment Verified', desc: 'Secure backend payment confirmed.' },
  { key: 'CONFIRMED', title: 'Order Confirmed', desc: 'Restaurant kitchen received your order.' },
  { key: 'PREPARING', title: 'Preparing', desc: 'Chefs are cooking your dishes fresh.' },
  { key: 'READY', title: 'Ready to Serve', desc: 'Plated and ready at counter.' },
  { key: 'SERVED', title: 'Served at Table', desc: 'Served at your table. Enjoy your meal!' }
];

export default function OrderTracking({ viewMode }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [rated, setRated] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    api
      .get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data);
        setError(false);
      })
      .catch((err) => {
        console.error('Failed to fetch order:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAdvanceStatus = async () => {
    if (!order) return;
    const orderStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
    const currentIdx = orderStatuses.indexOf(order.status);
    if (currentIdx < orderStatuses.length - 1) {
      const nextStatus = orderStatuses[currentIdx + 1];
      try {
        const payload = { status: nextStatus };
        if (nextStatus === 'SERVED') {
          payload.servingCode = order.servingCode;
        }
        const res = await api.patch(`/orders/${id}/status`, payload);
        setOrder(res.data);
      } catch (err) {
        console.error('Status update error:', err);
      }
    }
  };

  const submitRating = async () => {
    if (!rating) return;
    try {
      const res = await api.post(`/orders/${id}/rate`, { rating, feedback });
      setOrder(res.data);
      setRated(true);
    } catch (err) {
      console.error('Rating error:', err);
    }
  };

  if (loading && !order) {
    return (
      <div className="dv-loading-screen">
        <span className="dv-spinner" /> Fetching live order status...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="dv-empty">
        <h2>Order Not Found</h2>
        <p style={{ marginTop: 8 }}>We couldn't locate order details for #{id}.</p>
        <Link to="/menu" className="btn-dv btn-primary" style={{ marginTop: 20 }}>
          Back to Menu
        </Link>
      </div>
    );
  }

  const normalizedStatus = order.status === 'placed' ? 'PAID' : order.status === 'confirmed' ? 'CONFIRMED' : order.status === 'preparing' ? 'PREPARING' : order.status === 'ready' ? 'READY' : order.status === 'served' ? 'SERVED' : order.status;
  const currentIndex = STEPS.findIndex((s) => s.key === normalizedStatus);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'cancelled';
  const isServedOrDone = normalizedStatus === 'SERVED' || normalizedStatus === 'COMPLETED';

  return (
    <div className="dv-track-wrap">
      <div className="container-dv">
        {viewMode === 'confirmation' && (
          <div
            style={{
              background: 'var(--grad-sage)',
              color: '#FFFFFF',
              borderRadius: 'var(--r-lg)',
              padding: '24px 28px',
              marginBottom: 24,
              textAlign: 'center',
              boxShadow: 'var(--shadow-glow-sage)',
              animation: 'fadeInSlideUp 0.5s ease'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>✓</div>
            <h2 style={{ color: '#FFFFFF', fontSize: '1.8rem', margin: 0 }}>
              ORDER CONFIRMED & PAID
            </h2>
            <p style={{ marginTop: 6, fontSize: '0.95rem', opacity: 0.9 }}>
              Your order has been sent to the DINEVO kitchen for Table {order.tableNumber}.
            </p>
          </div>
        )}

        <div className="dv-ticket">
          <div className="dv-ticket-head">
            <span className="status-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheckIcon width={14} height={14} /> ORDER CONFIRMED &middot; ✓ Payment Verified
            </span>
            <h2 style={{ color: 'var(--cream)', margin: '8px 0 4px' }}>
              Table {order.tableNumber}
            </h2>
            <p className="dv-order-number">Order #{order.orderNumber}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gold-soft)', marginTop: 8 }}>
              Estimated preparation: 15–20 min
            </p>
          </div>


          <div className="dv-ticket-body">
            {/* Serving Code Badge */}
            {order.servingCode && !isCancelled && (
              <div className="dv-serving-code-badge">
                <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
                  Staff Serving Code
                </span>
                <div className="code">{order.servingCode}</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: 4 }}>
                  Provide this 4-digit code to staff when your food is served
                </p>
              </div>
            )}

            {!isCancelled && (
              <div className="dv-stepper" style={{ marginTop: 24 }}>
                {STEPS.map((step, idx) => {
                  const done = idx <= currentIndex;
                  const active = idx === currentIndex;
                  return (
                    <div className={`step ${done ? 'done' : ''} ${active ? 'active' : ''}`} key={step.key}>
                      <div className="rail">
                        <div className="dot">
                          {done ? (
                            <CheckIcon />
                          ) : (
                            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        {idx < STEPS.length - 1 && <div className="connector" />}
                      </div>
                      <div className="content">
                        <h4 style={{ color: active ? 'var(--gold)' : done ? 'var(--sage)' : 'var(--ink)' }}>
                          {done ? '✓ ' : ''}{step.title}
                        </h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ margin: '24px 0 10px', textAlign: 'center', display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-dv btn-outline"
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={fetchOrder}
              >
                ↻ Refresh Status
              </button>

              {!isServedOrDone && (
                <button
                  className="btn-dv btn-gold"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  onClick={handleAdvanceStatus}
                >
                  ⚡ Simulate Kitchen Status Update
                </button>
              )}
            </div>

            {/* Experience Rating Card */}
            {isServedOrDone && (
              <div className="card-dv" style={{ padding: '20px', marginTop: 20, textAlign: 'center', background: 'var(--gold-tint)', borderColor: 'var(--gold-soft)' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--espresso)' }}>How was your dining experience?</h4>
                {rated || order.rating > 0 ? (
                  <p style={{ color: 'var(--sage)', fontWeight: 600, marginTop: 8, fontSize: '0.9rem' }}>
                    ✓ Thank you for dining with DINEVO! Your feedback has been received.
                  </p>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: rating >= star ? 'var(--gold)' : 'var(--line)'
                          }}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="dv-note-box"
                      placeholder="Optional feedback for the kitchen..."
                      style={{ minHeight: 50, fontSize: '0.82rem' }}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <button className="btn-dv btn-burgundy" style={{ marginTop: 10, fontSize: '0.82rem', padding: '8px 18px' }} onClick={submitRating} disabled={!rating}>
                      Submit Rating
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Itemized Order Summary */}
            <div className="dv-track-items">
              <h4 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Items Ordered</h4>
              {order.items.map((i, idx) => (
                <div className="row" key={idx} style={{ flexDirection: 'column', padding: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>
                      <strong>{i.quantity}×</strong> {i.name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                  {(i.spiceLevel || i.addOns?.length > 0 || i.notes) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                      {i.spiceLevel && <span>Spice: {i.spiceLevel} &middot; </span>}
                      {i.addOns?.map((a) => a.name).join(', ')}
                      {i.notes && <span style={{ color: 'var(--gold)' }}> Note: {i.notes}</span>}
                    </div>
                  )}
                </div>
              ))}

              <div className="cut" style={{ borderTop: '1px dashed var(--line)', margin: '14px 0 10px' }} />

              <div className="row" style={{ fontSize: '0.86rem' }}>
                <span>Subtotal</span>
                <span>₹{(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="row" style={{ fontSize: '0.86rem' }}>
                <span>Tax (5% GST)</span>
                <span>₹{(order.tax || 0).toFixed(2)}</span>
              </div>

              <div className="row" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)', marginTop: 6 }}>
                <span>Total Paid</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/menu" className="btn-dv btn-primary btn-block" style={{ marginTop: 24 }}>
              Add More Items to Table {order.tableNumber}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
