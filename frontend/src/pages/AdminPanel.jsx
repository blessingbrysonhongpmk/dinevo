import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AdminQRDisplay from '../components/AdminQRDisplay';
import { getQrTargetUrl } from '../utils/qrUrl';

const STATUS_COLORS = {
  AVAILABLE: { bg: 'rgba(6,214,160,0.12)', color: '#048A65', dot: '#06D6A0' },
  OCCUPIED: { bg: 'rgba(230,57,70,0.12)', color: '#E63946', dot: '#E63946' },
  ORDERING: { bg: 'rgba(247,127,0,0.12)', color: '#F77F00', dot: '#F77F00' },
  PREPARING: { bg: 'rgba(247,127,0,0.12)', color: '#C45E00', dot: '#F77F00' },
  READY: { bg: 'rgba(6,214,160,0.12)', color: '#048A65', dot: '#06D6A0' },
  SERVING: { bg: 'rgba(100,100,255,0.12)', color: '#5454D4', dot: '#5454D4' },
  COMPLETED: { bg: 'rgba(120,120,120,0.1)', color: '#888', dot: '#888' }
};

export default function AdminPanel({ embedded = false }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servingInputs, setServingInputs] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [salesData, setSalesData] = useState([]);
  const navigate = useNavigate();

  // QR Modal State
  const [selectedTableQr, setSelectedTableQr] = useState(null);

  // Menu Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '', category: 'Signature', price: '', description: '', image: '', veg: true, spiceLevel: 0, isAvailable: true
  });

  // Table Modal State
  const [showTableModal, setShowTableModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');

  // Merge Modal State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeForm, setMergeForm] = useState({ source: '', target: '' });

  const fetchData = async () => {
    try {
      const [ordRes, tblRes, foodRes, analyticsRes] = await Promise.all([
        api.get('/orders/restaurant/all').catch(() => ({ data: [] })),
        api.get('/tables').catch(() => ({ data: [] })),
        api.get('/foods').catch(() => ({ data: [] })),
        api.get('/orders/analytics').catch(() => ({ data: [] }))
      ]);
      setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
      setTables(Array.isArray(tblRes.data) ? tblRes.data : []);
      setFoods(Array.isArray(foodRes.data) ? foodRes.data : foodRes.data?.data || []);
      setSalesData(Array.isArray(analyticsRes.data) ? analyticsRes.data : []);
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

  const handleReleaseTable = async (tableCode) => {
    try {
      await api.patch(`/tables/${tableCode}/release`);
      fetchData();
    } catch (err) {
      console.error('Failed to release table:', err);
    }
  };

  const handleMergeTables = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tables/merge', { 
        sourceCode: mergeForm.source, 
        targetCode: mergeForm.target 
      });
      setShowMergeModal(false);
      setMergeForm({ source: '', target: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to merge tables');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dinevo_token');
    localStorage.removeItem('dinevo_user');
    navigate('/login');
  };

  const activeOrders = orders.filter((o) => ['received', 'CONFIRMED', 'PREPARING', 'confirmed', 'preparing'].includes(o.status));
  const readyOrders = orders.filter((o) => ['READY', 'ready'].includes(o.status));
  const historyOrders = orders.filter((o) => ['SERVED', 'COMPLETED', 'served', 'completed'].includes(o.status));
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const availableTables = tables.filter((t) => (t.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE');
  const occupiedTables = tables.filter((t) => (t.status || 'AVAILABLE').toUpperCase() !== 'AVAILABLE');

  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders', icon: '📋', label: `Orders (${orders.length})` },
    { id: 'kitchen', icon: '🍳', label: `Kitchen (${activeOrders.length})` },
    { id: 'tables', icon: '🪑', label: `Tables (${tables.length})` },
    { id: 'menu', icon: '🍔', label: `Menu (${foods.length})` }
  ];

  // ========== RENDER SECTIONS ==========

  const renderDashboard = () => (
    <div>
      <h2 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Dashboard Overview</h2>
      <div className="adm-stats-grid">
        <div className="adm-stat-card" style={{ borderLeftColor: '#06D6A0' }}>
          <div className="adm-stat-label">Available Tables</div>
          <div className="adm-stat-value" style={{ color: '#048A65' }}>{availableTables.length}</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#E63946' }}>
          <div className="adm-stat-label">Active Tables</div>
          <div className="adm-stat-value" style={{ color: '#E63946' }}>{occupiedTables.length}</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#F77F00' }}>
          <div className="adm-stat-label">New Orders</div>
          <div className="adm-stat-value" style={{ color: '#F77F00' }}>{activeOrders.length}</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#5454D4' }}>
          <div className="adm-stat-label">Preparing</div>
          <div className="adm-stat-value" style={{ color: '#5454D4' }}>{orders.filter(o => ['PREPARING','preparing'].includes(o.status)).length}</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#06D6A0' }}>
          <div className="adm-stat-label">Ready to Serve</div>
          <div className="adm-stat-value" style={{ color: '#06D6A0' }}>{readyOrders.length}</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#1A1721' }}>
          <div className="adm-stat-label">Today's Orders</div>
          <div className="adm-stat-value">{orders.length}</div>
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--line)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Revenue Analytics (Last 7 Days)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
          {salesData.map((d, i) => {
            const maxRev = Math.max(...salesData.map(s => s.revenue), 1);
            const heightPct = (d.revenue / maxRev) * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 600 }}>₹{d.revenue}</div>
                <div style={{ width: '100%', maxWidth: 40, height: `${heightPct}%`, background: 'var(--burgundy)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-faint)', marginTop: 4 }}>{d.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Orders Preview */}
      <h3 style={{ fontSize: '1.2rem', marginTop: 32, marginBottom: 14 }}>🔴 Live Orders</h3>
      {activeOrders.length === 0 ? (
        <div className="dv-empty"><p>No active orders right now.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {activeOrders.slice(0, 6).map((o) => (
            <div className="card-dv" key={o._id} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)' }}>#{o.orderNumber}</span>
                <span className="tag" style={{
                  background: o.status.toLowerCase().includes('prepar') ? 'var(--burgundy-tint)' : 'var(--sage-tint)',
                  color: o.status.toLowerCase().includes('prepar') ? 'var(--burgundy)' : 'var(--sage-dark)',
                  fontWeight: 700
                }}>{o.status.toUpperCase()}</span>
              </div>
              <h4 style={{ margin: '4px 0' }}>Table {o.tableNumber}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                {o.items.length} item{o.items.length > 1 ? 's' : ''} · ₹{o.total?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div>
      <h2 style={{ fontSize: '1.4rem', marginBottom: 20 }}>Live Orders</h2>
      {orders.length === 0 ? (
        <div className="dv-empty"><p>No active orders placed yet.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {orders.map((o) => (
            <div className="card-dv" key={o._id} style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>#{o.orderNumber}</span>
                  <h3 style={{ fontSize: '1.3rem' }}>Table {o.tableNumber}</h3>
                </div>
                <span className="tag" style={{
                  background: (o.status === 'READY' || o.status === 'ready') ? 'var(--gold-tint)' : (o.status === 'PREPARING' || o.status === 'preparing') ? 'var(--burgundy-tint)' : 'var(--sage-tint)',
                  color: (o.status === 'READY' || o.status === 'ready') ? '#8A6417' : (o.status === 'PREPARING' || o.status === 'preparing') ? 'var(--burgundy)' : 'var(--sage)',
                  fontWeight: 700
                }}>{o.status.toUpperCase()} · ✓ PAID</span>
              </div>

              <div style={{ borderTop: '1px dashed var(--line)', padding: '12px 0', flex: 1 }}>
                {o.items.map((i, idx) => (
                  <div key={idx} style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{i.quantity} × {i.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                    {(i.spiceLevel || i.addOns?.length > 0 || i.notes) && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                        {i.spiceLevel && <span>Spice: {i.spiceLevel} · </span>}
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
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{o.total?.toFixed(2)}</span>
                </div>

                {errorMap[o._id] && <p style={{ color: 'var(--chili)', fontSize: '0.8rem', marginBottom: 8 }}>{errorMap[o._id]}</p>}

                {(o.status === 'received' || o.status === 'CONFIRMED' || o.status === 'confirmed') && (
                  <button className="btn-dv btn-burgundy btn-block" style={{ padding: '10px', fontSize: '0.88rem' }} onClick={() => handleUpdateStatus(o._id, 'PREPARING')}>
                    🍳 Start Kitchen Preparation
                  </button>
                )}

                {(o.status === 'PREPARING' || o.status === 'preparing') && (
                  <button className="btn-dv btn-gold btn-block" style={{ padding: '10px', fontSize: '0.88rem' }} onClick={() => handleUpdateStatus(o._id, 'READY')}>
                    🔔 Mark Ready to Serve
                  </button>
                )}

                {(o.status === 'READY' || o.status === 'ready') && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                      Staff Serving Code Verification: <strong>{o.servingCode}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input className="dv-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} placeholder="Enter 4-digit code" value={servingInputs[o._id] || ''} onChange={(e) => setServingInputs({ ...servingInputs, [o._id]: e.target.value })} />
                      <button className="btn-dv btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleUpdateStatus(o._id, 'SERVED', servingInputs[o._id])}>Verify & Serve</button>
                    </div>
                  </div>
                )}

                {(o.status === 'served' || o.status === 'SERVED') && (
                  <button className="btn-dv btn-primary btn-block" style={{ padding: '10px', fontSize: '0.88rem' }} onClick={() => handleUpdateStatus(o._id, 'COMPLETED')}>
                    ✓ Complete Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderKitchen = () => (
    <div>
      <h2 style={{ fontSize: '1.4rem', marginBottom: 20 }}>Kitchen Prep Queue</h2>
      {activeOrders.length === 0 ? (
        <div className="dv-empty"><p>No orders currently in prep queue.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {activeOrders.map((o) => (
            <div className="card-dv" key={o._id} style={{ padding: '24px', background: '#18151D', color: 'var(--cream)', border: '2px solid var(--gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ color: 'var(--cream)', fontSize: '1.8rem', margin: 0 }}>Table {o.tableNumber}</h2>
                <span className="tag tag-popular">#{o.orderNumber}</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '14px 0' }}>
                {o.items.map((i, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gold-soft)' }}>{i.quantity} × {i.name}</div>
                    {i.spiceLevel && <div style={{ fontSize: '0.85rem', color: 'var(--chili)', fontWeight: 600 }}>🌶️ Spice: {i.spiceLevel}</div>}
                    {i.addOns?.length > 0 && <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Add-ons: {i.addOns.map((a) => a.name).join(', ')}</div>}
                    {i.notes && <div style={{ fontSize: '0.82rem', color: 'var(--gold-soft)', fontStyle: 'italic', marginTop: 2 }}>Note: "{i.notes}"</div>}
                  </div>
                ))}
              </div>

              <button className="btn-dv btn-gold btn-block" style={{ marginTop: 10 }} onClick={() => handleUpdateStatus(o._id, 'READY')}>
                🔔 Mark Order Ready
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTables = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Table & QR Management</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Live table statuses from MongoDB</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-dv btn-outline" style={{ fontSize: '0.88rem' }} onClick={() => setShowMergeModal(true)}>
             Merge Tables
          </button>
          <button className="btn-dv btn-primary" style={{ fontSize: '0.88rem' }} onClick={() => setShowTableModal(true)}>
            <PlusIcon width={16} height={16} /> Add Table
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {tables.map((t, idx) => {
          const status = (t.status || 'AVAILABLE').toUpperCase();
          const targetUrl = getQrTargetUrl(t.code);
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`;

          return (
            <div className="card-dv" key={idx} style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{status}</span>
              </div>

              <h3 style={{ fontSize: '1.6rem', margin: '4px 0 2px' }}>TABLE {t.tableNumber}</h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gold)', marginBottom: 12 }}>{t.code}</div>

              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '12px', display: 'inline-block', border: '1px solid var(--line)' }}>
                <img src={qrUrl} alt={`Table ${t.tableNumber} QR`} style={{ width: '110px', height: '110px', display: 'block' }} />
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-dv btn-gold" style={{ fontSize: '0.75rem', padding: '5px 10px' }} onClick={() => setSelectedTableQr({ ...t, qrUrl })}>
                  View QR
                </button>
                {status !== 'AVAILABLE' && (
                  <button className="btn-dv btn-outline" style={{ fontSize: '0.75rem', padding: '5px 10px' }} onClick={() => handleReleaseTable(t.code)}>
                    Release
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMenu = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Digital Menu Management</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Add new items, adjust prices, toggle availability</p>
        </div>
        <button className="btn-dv btn-burgundy" style={{ fontSize: '0.88rem' }} onClick={() => {
          setEditingFood(null);
          setFoodForm({ name: '', category: 'Signature', price: '', description: '', image: '', veg: true, spiceLevel: 0, isAvailable: true });
          setShowFoodModal(true);
        }}>
          <PlusIcon width={16} height={16} /> Add Food
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {foods.map((food) => (
          <div className="card-dv" key={food._id} style={{ padding: '16px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <img src={food.image} alt={food.name} style={{ width: '84px', height: '84px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400'; }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="tag" style={{ fontSize: '0.68rem', padding: '2px 8px', marginBottom: 4 }}>{food.category}</span>
              <h4 style={{ fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</h4>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--burgundy)', fontSize: '0.95rem', marginTop: 2 }}>₹{Number(food.price).toFixed(2)}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <button onClick={() => handleToggleAvailability(food._id, food.isAvailable)} style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: food.isAvailable ? 'var(--sage-tint)' : 'var(--chili-tint)', color: food.isAvailable ? 'var(--sage-dark)' : 'var(--chili)' }}>
                  {food.isAvailable ? '✓ AVAILABLE' : 'OUT OF STOCK'}
                </button>
                <button onClick={() => handleDeleteFood(food._id)} style={{ background: 'none', border: 'none', color: 'var(--chili)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`adm-layout ${embedded ? 'embedded' : ''}`}>
      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <div className="dv-logo" style={{ fontSize: '1.5rem' }}>DINE<span style={{ color: 'var(--gold)' }}>VO</span></div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>Restaurant Ops</div>
        </div>

        <nav className="adm-sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`adm-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="adm-sidebar-icon">{item.icon}</span>
              <span className="adm-sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-sidebar-item" onClick={handleLogout}>
            <span className="adm-sidebar-icon">🚪</span>
            <span className="adm-sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="adm-main">
        {/* Top Bar */}
        <div className="adm-topbar">
          <div>
            <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <KitchenIcon /> DINEVO RESTAURANT MANAGEMENT
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn-dv btn-outline" style={{ fontSize: '0.82rem', padding: '6px 14px' }} onClick={fetchData}>
              ↻ Sync
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="adm-content">
          {loading ? (
            <div className="dv-loading-screen"><span className="dv-spinner" /> Loading...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'kitchen' && renderKitchen()}
              {activeTab === 'tables' && renderTables()}
              {activeTab === 'menu' && renderMenu()}
            </>
          )}
        </div>
      </main>

      {/* MODALS */}
      {selectedTableQr && <AdminQRDisplay table={selectedTableQr} onClose={() => setSelectedTableQr(null)} />}

      {showFoodModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '20px' }}>
          <form onSubmit={handleSaveFood} style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: 18 }}>{editingFood ? 'Edit Food Item' : 'Add New Food Item'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Food Name</label>
                <input className="dv-input" required value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
                  <select className="dv-input" value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}>
                    {['Signature', 'Kanyakumari Specials', 'Juices & Coolers', 'Desserts', 'Chicken', 'Burgers', 'Rice & Meals', 'Starters', 'Sides', 'Spicy'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Price (₹)</label>
                  <input type="number" className="dv-input" required value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Image URL</label>
                <input className="dv-input" placeholder="https://images.unsplash.com/..." value={foodForm.image} onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                <textarea className="dv-note-box" rows={3} value={foodForm.description} onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-dv btn-outline" onClick={() => setShowFoodModal(false)}>Cancel</button>
              <button type="submit" className="btn-dv btn-burgundy">Save Item</button>
            </div>
          </form>
        </div>
      )}

      {showTableModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '20px' }}>
          <form onSubmit={handleCreateTable} style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 14 }}>Create Table</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 16 }}>Enter table number (e.g. 05, 09, 12)</p>
            <input className="dv-input" placeholder="Table Number (e.g. 05)" value={newTableNum} onChange={(e) => setNewTableNum(e.target.value)} required />
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
              <button type="button" className="btn-dv btn-outline" onClick={() => setShowTableModal(false)}>Cancel</button>
              <button type="submit" className="btn-dv btn-primary">Add Table</button>
            </div>
          </form>
        </div>
      )}

      {showMergeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '20px' }}>
          <form onSubmit={handleMergeTables} style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 14 }}>Merge Tables</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 16 }}>Combine orders from Source Table into Target Table.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Source Table (e.g. 02)</label>
                 <input className="dv-input" placeholder="Table Number" value={mergeForm.source} onChange={(e) => setMergeForm({ ...mergeForm, source: e.target.value })} required />
               </div>
               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Target Table (e.g. 01)</label>
                 <input className="dv-input" placeholder="Table Number" value={mergeForm.target} onChange={(e) => setMergeForm({ ...mergeForm, target: e.target.value })} required />
               </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-dv btn-outline" onClick={() => setShowMergeModal(false)}>Cancel</button>
              <button type="submit" className="btn-dv btn-primary">Merge Tables</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
