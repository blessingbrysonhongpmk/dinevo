import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  KitchenIcon,
  CheckIcon,
  ShieldCheckIcon,
  QrIcon,
  PlusIcon,
  SearchIcon,
  ClockIcon
} from '../components/Icons';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'kitchen', 'tables', 'menu'
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servingInputs, setServingInputs] = useState({});
  const [errorMap, setErrorMap] = useState({});

  // QR Modal State
  const [selectedTableQr, setSelectedTableQr] = useState(null);

  // Menu Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'Signature',
    price: '',
    description: '',
    image: '',
    veg: true,
    spiceLevel: 0,
    isAvailable: true
  });

  // Table Modal State
  const [showTableModal, setShowTableModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');

  const fetchData = async () => {
    try {
      const [ordRes, tblRes, foodRes] = await Promise.all([
        api.get('/orders/restaurant/all').catch(() => ({ data: [] })),
        api.get('/tables').catch(() => ({ data: [] })),
        api.get('/foods').catch(() => ({ data: [] }))
      ]);
      setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
      setTables(Array.isArray(tblRes.data) ? tblRes.data : []);
      setFoods(Array.isArray(foodRes.data) ? foodRes.data : foodRes.data?.data || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, status, servingCode = null) => {
    setErrorMap((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const payload = { status };
      if (servingCode) payload.servingCode = servingCode;
      await api.patch(`/orders/${orderId}/status`, payload);
      fetchData();
    } catch (err) {
      setErrorMap((prev) => ({
        ...prev,
        [orderId]: err.response?.data?.message || 'Status transition failed'
      }));
    }
  };

  const handleToggleAvailability = async (foodId, currentStatus) => {
    try {
      await api.patch(`/foods/${foodId}/availability`, { isAvailable: !currentStatus });
      fetchData();
    } catch (err) {
      console.error('Availability toggle error:', err);
    }
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      if (editingFood) {
        await api.put(`/foods/${editingFood._id}`, foodForm);
      } else {
        await api.post('/foods', foodForm);
      }
      setShowFoodModal(false);
      setEditingFood(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save food item');
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/foods/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete food item');
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;
    try {
      const num = newTableNum.padStart(2, '0');
      await api.post('/tables', { tableNumber: num, code: `DINEVO-T${num}` });
      setNewTableNum('');
      setShowTableModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to create table');
    }
  };

  const activeOrders = orders.filter((o) => ['received', 'CONFIRMED', 'PREPARING', 'confirmed', 'preparing'].includes(o.status));
  const readyOrders = orders.filter((o) => ['READY', 'ready'].includes(o.status));
  const historyOrders = orders.filter((o) => ['SERVED', 'COMPLETED', 'served', 'completed'].includes(o.status));
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);

  return (
    <div className="container-dv" style={{ paddingTop: 32, paddingBottom: 90 }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <KitchenIcon /> DINEVO RESTAURANT MANAGEMENT SYSTEM
          </span>
          <h1 style={{ marginTop: 4, fontSize: '1.9rem' }}>Admin Operations Portal</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-dv btn-outline" style={{ fontSize: '0.85rem' }} onClick={fetchData}>
            ↻ Sync System
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginTop: 24
        }}
      >
        <div className="card-dv" style={{ padding: '16px 20px', background: 'var(--surface)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase' }}>
            Today's Orders
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, marginTop: 4 }}>
            {orders.length}
          </div>
        </div>
        <div className="card-dv" style={{ padding: '16px 20px', background: 'var(--burgundy-tint)', borderColor: 'rgba(230,57,70,0.3)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--burgundy)', fontWeight: 600, textTransform: 'uppercase' }}>
            Kitchen Prep
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--burgundy)', marginTop: 4 }}>
            {activeOrders.length}
          </div>
        </div>
        <div className="card-dv" style={{ padding: '16px 20px', background: 'var(--gold-tint)', borderColor: 'rgba(247,127,0,0.3)' }}>
          <span style={{ fontSize: '0.78rem', color: '#8A6417', fontWeight: 600, textTransform: 'uppercase' }}>
            Ready to Serve
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#C45E00', marginTop: 4 }}>
            {readyOrders.length}
          </div>
        </div>
        <div className="card-dv" style={{ padding: '16px 20px', background: 'var(--sage-tint)', borderColor: 'rgba(6,214,160,0.3)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--sage-dark)', fontWeight: 600, textTransform: 'uppercase' }}>
            Served & Done
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--sage-dark)', marginTop: 4 }}>
            {historyOrders.length}
          </div>
        </div>
        <div className="card-dv" style={{ padding: '16px 20px', background: 'var(--espresso)', color: 'var(--cream)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--gold-soft)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Revenue
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--cream)', marginTop: 4 }}>
            ₹{totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 10, marginTop: 28, borderBottom: '1px solid var(--line)', paddingBottom: 12, overflowX: 'auto' }}>
        {[
          { id: 'orders', label: `📋 Live Orders (${orders.length})` },
          { id: 'kitchen', label: `🍳 Kitchen Prep (${activeOrders.length})` },
          { id: 'tables', label: `🪑 Table & QR Management (${tables.length || 9})` },
          { id: 'menu', label: `🍔 Menu Items (${foods.length})` }
        ].map((t) => (
          <button
            key={t.id}
            className={`dv-cat-chip ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LIVE ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ marginTop: 24 }}>
          {orders.length === 0 ? (
            <div className="dv-empty">
              <p>No active orders placed yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {orders.map((o) => (
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
                        background:
                          o.status === 'READY' || o.status === 'ready'
                            ? 'var(--gold-tint)'
                            : o.status === 'PREPARING' || o.status === 'preparing'
                            ? 'var(--burgundy-tint)'
                            : 'var(--sage-tint)',
                        color:
                          o.status === 'READY' || o.status === 'ready'
                            ? '#8A6417'
                            : o.status === 'PREPARING' || o.status === 'preparing'
                            ? 'var(--burgundy)'
                            : 'var(--sage)',
                        fontWeight: 700
                      }}
                    >
                      {o.status.toUpperCase()} &middot; ✓ PAID
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
                            {i.spiceLevel && <span>Spice: {i.spiceLevel} &middot; </span>}
                            {i.addOns?.map((a) => a.name).join(', ')}
                            {i.notes && <span style={{ color: 'var(--burgundy)' }}> Note: {i.notes}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>
                      <span>Total Amount</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{o.total.toFixed(2)}</span>
                    </div>

                    {errorMap[o._id] && (
                      <p style={{ color: 'var(--chili)', fontSize: '0.8rem', marginBottom: 8 }}>
                        {errorMap[o._id]}
                      </p>
                    )}

                    {/* Status Action Workflow Buttons */}
                    {(o.status === 'received' || o.status === 'CONFIRMED' || o.status === 'confirmed') && (
                      <button
                        className="btn-dv btn-burgundy btn-block"
                        style={{ padding: '10px', fontSize: '0.88rem' }}
                        onClick={() => handleUpdateStatus(o._id, 'PREPARING')}
                      >
                        🍳 Start Kitchen Preparation
                      </button>
                    )}

                    {(o.status === 'PREPARING' || o.status === 'preparing') && (
                      <button
                        className="btn-dv btn-gold btn-block"
                        style={{ padding: '10px', fontSize: '0.88rem' }}
                        onClick={() => handleUpdateStatus(o._id, 'READY')}
                      >
                        🔔 Mark Ready to Serve
                      </button>
                    )}

                    {(o.status === 'READY' || o.status === 'ready') && (
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                          Staff Serving Code Verification: <strong>{o.servingCode}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            className="dv-input"
                            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                            placeholder="Enter 4-digit code"
                            value={servingInputs[o._id] || ''}
                            onChange={(e) => setServingInputs({ ...servingInputs, [o._id]: e.target.value })}
                          />
                          <button
                            className="btn-dv btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleUpdateStatus(o._id, 'SERVED', servingInputs[o._id])}
                          >
                            Verify & Serve
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KITCHEN PREP VIEW */}
      {activeTab === 'kitchen' && (
        <div style={{ marginTop: 24 }}>
          {activeOrders.length === 0 ? (
            <div className="dv-empty">
              <p>No orders currently in prep queue.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {activeOrders.map((o) => (
                <div
                  className="card-dv"
                  key={o._id}
                  style={{
                    padding: '24px',
                    background: '#18151D',
                    color: 'var(--cream)',
                    border: '2px solid var(--gold)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={{ color: 'var(--cream)', fontSize: '1.8rem', margin: 0 }}>
                      Table {o.tableNumber}
                    </h2>
                    <span className="tag tag-popular">#{o.orderNumber}</span>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '14px 0' }}>
                    {o.items.map((i, idx) => (
                      <div key={idx} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gold-soft)' }}>
                          {i.quantity} × {i.name}
                        </div>
                        {i.spiceLevel && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--chili)', fontWeight: 600 }}>
                            🌶️ Spice: {i.spiceLevel}
                          </div>
                        )}
                        {i.addOns?.length > 0 && (
                          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                            Add-ons: {i.addOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                        {i.notes && (
                          <div style={{ fontSize: '0.82rem', color: 'var(--gold-soft)', fontStyle: 'italic', marginTop: 2 }}>
                            Note: "{i.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn-dv btn-gold btn-block"
                    style={{ marginTop: 10 }}
                    onClick={() => handleUpdateStatus(o._id, 'READY')}
                  >
                    🔔 Mark Order Ready
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TABLE & QR MANAGEMENT */}
      {activeTab === 'tables' && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem' }}>Restaurant Tables & Printable QRs</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
                Dynamic QR codes linking directly to table ordering sessions (`/table/CODE`)
              </p>
            </div>
            <button
              className="btn-dv btn-primary"
              style={{ fontSize: '0.88rem' }}
              onClick={() => setShowTableModal(true)}
            >
              <PlusIcon width={16} height={16} /> Add New Table
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {(tables.length > 0
              ? tables
              : [
                  { tableNumber: '01', code: 'DINEVO-T01', status: 'Available' },
                  { tableNumber: '02', code: 'DINEVO-T02', status: 'Available' },
                  { tableNumber: '03', code: 'DINEVO-T03', status: 'Available' },
                  { tableNumber: '04', code: 'DINEVO-T04', status: 'Available' },
                  { tableNumber: '05', code: 'DINEVO-T05', status: 'Available' },
                  { tableNumber: '08', code: 'DINEVO-T08', status: 'Available' },
                  { tableNumber: 'T1', code: 'DV-T1', status: 'Available' },
                  { tableNumber: 'T2', code: 'DV-T2', status: 'Available' },
                  { tableNumber: 'T3', code: 'DV-T3', status: 'Available' }
                ]
            ).map((t, idx) => {
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}/table/${t.code}`;
              return (
                <div className="card-dv" key={idx} style={{ padding: '20px', textAlign: 'center' }}>
                  <span className="eyebrow">DINEVO QR</span>
                  <h3 style={{ fontSize: '1.4rem', margin: '4px 0 2px' }}>Table {t.tableNumber}</h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: 14 }}>
                    {t.code}
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '12px', display: 'inline-block', border: '1px solid var(--line)' }}>
                    <img src={qrUrl} alt={`Table ${t.tableNumber} QR`} style={{ width: '130px', height: '130px', display: 'block' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center' }}>
                    <button
                      className="btn-dv btn-gold"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      onClick={() => setSelectedTableQr({ ...t, qrUrl })}
                    >
                      View QR
                    </button>
                    <button
                      className="btn-dv btn-outline"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      onClick={() => setSelectedTableQr({ ...t, qrUrl })}
                    >
                      Open QR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem' }}>Digital Menu Management</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
                Add new items, adjust prices, edit categories, and toggle Availability (In Stock / Out of Stock)
              </p>
            </div>
            <button
              className="btn-dv btn-burgundy"
              style={{ fontSize: '0.88rem' }}
              onClick={() => {
                setEditingFood(null);
                setFoodForm({
                  name: '',
                  category: 'Signature',
                  price: '',
                  description: '',
                  image: '',
                  veg: true,
                  spiceLevel: 0,
                  isAvailable: true
                });
                setShowFoodModal(true);
              }}
            >
              <PlusIcon width={16} height={16} /> Add Food Item
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {foods.map((food) => (
              <div className="card-dv" key={food._id} style={{ padding: '16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <img
                  src={food.image}
                  alt={food.name}
                  style={{ width: '84px', height: '84px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400';
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="tag" style={{ fontSize: '0.68rem', padding: '2px 8px', marginBottom: 4 }}>
                    {food.category}
                  </span>
                  <h4 style={{ fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {food.name}
                  </h4>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--burgundy)', fontSize: '0.95rem', marginTop: 2 }}>
                    ₹{Number(food.price).toFixed(2)}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleAvailability(food._id, food.isAvailable)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: food.isAvailable ? 'var(--sage-tint)' : 'var(--chili-tint)',
                        color: food.isAvailable ? 'var(--sage-dark)' : 'var(--chili)'
                      }}
                    >
                      {food.isAvailable ? '✓ AVAILABLE' : 'OUT OF STOCK'}
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--chili)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE / FULL SCREEN QR CARD MODAL */}
      {selectedTableQr && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px 30px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '4px solid var(--espresso)'
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--espresso)' }}>
              DINE<span style={{ color: 'var(--gold)' }}>VO</span>
            </div>
            <div style={{ fontSize: '0.82rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 2 }}>
              TABLE ORDERING QR CARD
            </div>

            <div style={{ margin: '20px 0', padding: '20px', background: 'var(--cream)', borderRadius: '20px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--sage-dark)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                Table Status: Available
              </div>
              <h2 style={{ fontSize: '2.2rem', margin: '0 0 4px', color: 'var(--ink)' }}>
                TABLE {selectedTableQr.tableNumber}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: 14 }}>
                Scan this QR using the customer's mobile phone
              </p>

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', display: 'inline-block', border: '2px dashed var(--gold)' }}>
                <img src={selectedTableQr.qrUrl} alt="Table QR" style={{ width: '200px', height: '200px', borderRadius: '8px', display: 'block', margin: '0 auto' }} />
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold)', marginTop: 12 }}>
                {selectedTableQr.code}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-dv btn-gold" style={{ fontSize: '0.85rem' }} onClick={() => window.open(selectedTableQr.qrUrl, '_blank')}>
                Full Screen QR
              </button>
              <button className="btn-dv btn-burgundy" style={{ fontSize: '0.85rem' }} onClick={() => window.print()}>
                Print QR Card
              </button>
              <button className="btn-dv btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => setSelectedTableQr(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* CREATE / EDIT FOOD ITEM MODAL */}
      {showFoodModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            padding: '20px'
          }}
        >
          <form
            onSubmit={handleSaveFood}
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ fontSize: '1.4rem', marginBottom: 18 }}>
              {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Food Name</label>
                <input
                  className="dv-input"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
                  <select
                    className="dv-input"
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                  >
                    {[
                      'Signature',
                      'Kanyakumari Specials',
                      'Juices & Coolers',
                      'Desserts',
                      'Chicken',
                      'Burgers',
                      'Rice & Meals',
                      'Starters',
                      'Sides',
                      'Spicy'
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Price (₹)</label>
                  <input
                    type="number"
                    className="dv-input"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Image URL</label>
                <input
                  className="dv-input"
                  placeholder="https://images.unsplash.com/..."
                  value={foodForm.image}
                  onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                <textarea
                  className="dv-note-box"
                  rows={3}
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-dv btn-outline" onClick={() => setShowFoodModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-dv btn-burgundy">
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE TABLE MODAL */}
      {showTableModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            padding: '20px'
          }}
        >
          <form
            onSubmit={handleCreateTable}
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '28px',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '1.3rem', marginBottom: 14 }}>Create Table</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 16 }}>
              Enter table number (e.g. 05, 09, 12). Unique code will be auto-generated (`DINEVO-T05`).
            </p>
            <input
              className="dv-input"
              placeholder="Table Number (e.g. 05)"
              value={newTableNum}
              onChange={(e) => setNewTableNum(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
              <button type="button" className="btn-dv btn-outline" onClick={() => setShowTableModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-dv btn-primary">
                Add Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
