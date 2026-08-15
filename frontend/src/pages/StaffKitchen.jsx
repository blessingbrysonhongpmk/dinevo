import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { KitchenIcon, CheckIcon, ShieldCheckIcon, FlameIcon, ClockIcon } from '../components/Icons';
import { getSocket } from '../utils/socket';

export default function StaffKitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // 'active', 'ready', 'history'
  const [servingInputs, setServingInputs] = useState({});
  const [errorMap, setErrorMap] = useState({});

  const fetchOrders = async () => {
    try {
      let res = await api.get('/orders/restaurant/all').catch(() => null);
      let raw = res?.data?.data || res?.data;
      if (!Array.isArray(raw) || raw.length === 0) {
        res = await api.get('/orders').catch(() => null);
        raw = res?.data?.data || res?.data;
      }
      setOrders(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Kitchen error:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();

    const socket = getSocket();

    const handleUpdate = () => {
      fetchOrders();
    };

    socket.on('new_order', handleUpdate);
    socket.on('order_created', handleUpdate);
    socket.on('order_updated', handleUpdate);

    const interval = setInterval(fetchOrders, 3000);
    return () => {
      socket.off('new_order', handleUpdate);
      socket.off('order_created', handleUpdate);
      socket.off('order_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);


  const handleUpdateStatus = async (orderId, status, servingCode = null) => {
    setErrorMap((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const payload = { status };
      if (servingCode) payload.servingCode = servingCode;
      await api.patch(`/orders/${orderId}/status`, payload);
      fetchOrders();
    } catch (err) {
      setErrorMap((prev) => ({
        ...prev,
        [orderId]: err.response?.data?.message || 'Status transition failed'
      }));
    }
  };

  const activeOrders = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'confirmed', 'preparing'].includes(o.status));
  const readyOrders = orders.filter((o) => ['READY', 'ready'].includes(o.status));
  const historyOrders = orders.filter((o) => ['SERVED', 'COMPLETED', 'served', 'completed'].includes(o.status));

  const displayedOrders = tab === 'active' ? activeOrders : tab === 'ready' ? readyOrders : historyOrders;

  return (
    <div className="container-dv" style={{ paddingTop: 36, paddingBottom: 90 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <KitchenIcon /> Restaurant Operational Dashboard
          </span>
          <h1 style={{ marginTop: 6, fontSize: '1.9rem' }}>Kitchen & Serving Board</h1>
        </div>
        <button className="btn-dv btn-outline" style={{ fontSize: '0.85rem' }} onClick={fetchOrders}>
          ↻ Refresh Orders
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
        <button
          className={`dv-cat-chip ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
        >
          🍳 Kitchen Prep ({activeOrders.length})
        </button>
        <button
          className={`dv-cat-chip ${tab === 'ready' ? 'active' : ''}`}
          onClick={() => setTab('ready')}
        >
          🔔 Ready to Serve ({readyOrders.length})
        </button>
        <button
          className={`dv-cat-chip ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          ✓ Served History ({historyOrders.length})
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="dv-loading-screen">
          <span className="dv-spinner" /> Loading orders...
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="dv-empty">
          <p>No orders in this status category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginTop: 24 }}>
          {displayedOrders.map((o) => {
            const isConfirmed = o.status === 'CONFIRMED' || o.status === 'confirmed';
            const isPreparing = o.status === 'PREPARING' || o.status === 'preparing';
            const isReady = o.status === 'READY' || o.status === 'ready';

            return (
              <div className="card-dv" key={o._id} style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                      #{o.orderNumber}
                    </span>
                    <h3 style={{ fontSize: '1.3rem' }}>Table {o.tableNumber}</h3>
                  </div>
                  <span
                    className="tag"
                    style={{
                      background: isReady ? 'var(--gold-tint)' : isPreparing ? 'var(--burgundy-tint)' : 'var(--sage-tint)',
                      color: isReady ? '#8A6417' : isPreparing ? 'var(--burgundy)' : 'var(--sage)',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    {o.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed var(--line)', padding: '12px 0', flex: 1 }}>
                  {o.items.map((i, idx) => (
                    <div key={idx} style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>
                          {i.quantity} × {i.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                      {(i.spiceLevel || i.addOns?.length > 0 || i.notes) && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                          {i.spiceLevel && <span>🌶️ {i.spiceLevel} &middot; </span>}
                          {i.addOns?.map((a) => a.name).join(', ')}
                          {i.notes && <span style={{ color: 'var(--burgundy)' }}> Note: {i.notes}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>
                    <span>Total Amount</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{o.total.toFixed(2)}</span>
                  </div>

                  {errorMap[o._id] && (
                    <p style={{ color: 'var(--chili)', fontSize: '0.8rem', marginBottom: 10 }}>
                      {errorMap[o._id]}
                    </p>
                  )}

                  {isConfirmed && (
                    <button
                      className="btn-dv btn-burgundy btn-block"
                      style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                      onClick={() => handleUpdateStatus(o._id, 'PREPARING')}
                    >
                      🍳 Start Preparing
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      className="btn-dv btn-gold btn-block"
                      style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                      onClick={() => handleUpdateStatus(o._id, 'READY')}
                    >
                      🔔 Mark Ready to Serve
                    </button>
                  )}

                  {isReady && (
                    <div style={{ marginTop: 6 }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                        Verify Staff Serving Code:
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          className="dv-input"
                          style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                          placeholder="e.g. 5831"
                          value={servingInputs[o._id] || ''}
                          onChange={(e) =>
                            setServingInputs({ ...servingInputs, [o._id]: e.target.value })
                          }
                        />
                        <button
                          className="btn-dv btn-primary"
                          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                          onClick={() => handleUpdateStatus(o._id, 'SERVED', servingInputs[o._id])}
                        >
                          Verify & Serve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
