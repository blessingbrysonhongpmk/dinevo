import React, { useEffect, useState, useRef } from 'react';
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
import AdminReceiptModal from '../components/AdminReceiptModal';
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrderCountRef = useRef(0);
  const navigate = useNavigate();

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all'); // 'all', 'active', 'ready', 'completed'
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('All');

  // QR Modal State
  const [selectedTableQr, setSelectedTableQr] = useState(null);

  // Menu Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '', category: 'Arabian Mandhi', price: '', description: '', image: '', veg: true, spiceLevel: 0, isAvailable: true
  });

  // Table Modal State
  const [showTableModal, setShowTableModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');

  // Merge Modal State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeForm, setMergeForm] = useState({ source: '', target: '' });

  // Web Audio Chime for new order alert
  const playAudioAlert = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio permission or unsupported
    }
  };

  const fetchData = async () => {
    try {
      const [ordRes, tblRes, foodRes, analyticsRes] = await Promise.all([
        api.get('/orders/restaurant/all').catch(() => ({ data: [] })),
        api.get('/tables').catch(() => ({ data: [] })),
        api.get('/foods').catch(() => ({ data: [] })),
        api.get('/orders/analytics').catch(() => ({ data: [] }))
      ]);

      const newOrders = Array.isArray(ordRes.data) ? ordRes.data : [];
      if (prevOrderCountRef.current > 0 && newOrders.length > prevOrderCountRef.current && soundEnabled) {
        playAudioAlert();
      }
      prevOrderCountRef.current = newOrders.length;

      setOrders(newOrders);
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
  }, [soundEnabled]);

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

  const handleOpenEditFood = (food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name || '',
      category: food.category || 'Arabian Mandhi',
      price: food.price || '',
      description: food.description || '',
      image: food.image || '',
      veg: food.veg !== false,
      spiceLevel: food.spiceLevel || 0,
      isAvailable: food.isAvailable !== false
    });
    setShowFoodModal(true);
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
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTables.length / tables.length) * 100) : 0;
  const avgTicketPrice = historyOrders.length > 0 ? Math.round(totalRevenue / historyOrders.length) : 0;

  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard POS' },
    { id: 'orders', icon: '📋', label: `Live Orders (${orders.length})` },
    { id: 'kitchen', icon: '🍳', label: `Kitchen Queue (${activeOrders.length})` },
    { id: 'tables', icon: '🪑', label: `Tables & QRs (${tables.length})` },
    { id: 'menu', icon: '🍔', label: `5-Star Menu (${foods.length})` },
    { id: 'settings', icon: '⚙️', label: 'POS & Store Settings' }
  ];

  const menuCategoriesList = [
    'All',
    'Arabian Mandhi',
    'Juices & Coolers',
    'Snacks & Finger Foods',
    'Starters & Tandoori',
    'Burgers & Wraps',
    'Kanyakumari Specials',
    '5-Star Desserts',
    'Soups & Beverages'
  ];

  // Filtering Logic for Orders
  const filteredOrders = orders.filter((o) => {
    const statusMatch =
      orderFilter === 'all'
        ? true
        : orderFilter === 'active'
        ? ['received', 'CONFIRMED', 'PREPARING', 'confirmed', 'preparing'].includes(o.status)
        : orderFilter === 'ready'
        ? ['READY', 'ready'].includes(o.status)
        : ['SERVED', 'COMPLETED', 'served', 'completed'].includes(o.status);

    const term = orderSearch.toLowerCase();
    const textMatch =
      !term ||
      o.orderNumber?.toLowerCase().includes(term) ||
      o.tableNumber?.toLowerCase().includes(term) ||
      o.items?.some((i) => i.name.toLowerCase().includes(term));

    return statusMatch && textMatch;
  });

  // Filtering Logic for Foods
  const filteredFoods = foods.filter((f) => {
    const catMatch = menuCatFilter === 'All' || f.category?.toLowerCase() === menuCatFilter.toLowerCase();
    const term = menuSearch.toLowerCase();
    const nameMatch = !term || f.name?.toLowerCase().includes(term) || f.description?.toLowerCase().includes(term);
    return catMatch && nameMatch;
  });

  // ========== RENDER SECTIONS ==========

  const renderDashboard = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Restaurant Analytics & Live Ops</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Enterprise real-time POS dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid var(--line)',
              background: soundEnabled ? 'rgba(6,214,160,0.14)' : 'rgba(230,57,70,0.14)',
              color: soundEnabled ? '#048A65' : '#E63946',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {soundEnabled ? '🔔 Order Chime Sound ON' : '🔕 Sound Muted'}
          </button>
        </div>
      </div>

      <div className="adm-stats-grid">
        <div className="adm-stat-card" style={{ borderLeftColor: '#06D6A0' }}>
          <div className="adm-stat-label">Total Revenue Today</div>
          <div className="adm-stat-value" style={{ color: '#048A65' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>✓ All Verified Payments</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#F77F00' }}>
          <div className="adm-stat-label">Live Occupancy Rate</div>
          <div className="adm-stat-value" style={{ color: '#F77F00' }}>{occupancyRate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>{occupiedTables.length} / {tables.length} Tables Busy</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#E63946' }}>
          <div className="adm-stat-label">Kitchen Active Queue</div>
          <div className="adm-stat-value" style={{ color: '#E63946' }}>{activeOrders.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>In Preparation Right Now</div>
        </div>
        <div className="adm-stat-card" style={{ borderLeftColor: '#5454D4' }}>
          <div className="adm-stat-label">Average Ticket Size</div>
          <div className="adm-stat-value" style={{ color: '#5454D4' }}>₹{avgTicketPrice}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>Per Completed Order</div>
        </div>
      </div>

      {/* Revenue Analytics Chart */}
      <div style={{ marginTop: 28, padding: '24px', background: '#FFFFFF', borderRadius: '18px', border: '1px solid var(--line)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Weekly Revenue Trend (₹)</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 700, background: 'rgba(247,127,0,0.12)', padding: '4px 12px', borderRadius: '999px' }}>Live POS Sync</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 14, paddingBottom: 10, borderBottom: '1px dashed var(--line)' }}>
          {salesData.map((d, i) => {
            const maxRev = Math.max(...salesData.map((s) => s.revenue), 1);
            const heightPct = Math.max((d.revenue / maxRev) * 100, 12);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 800 }}>₹{d.revenue}</div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 44,
                    height: `${heightPct}%`,
                    background: 'linear-gradient(180deg, #F77F00 0%, #E63946 100%)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 4px 12px rgba(230,57,70,0.3)'
                  }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontWeight: 700, marginTop: 4 }}>{d.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Orders Grid Preview */}
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>🔴 Live Active Kitchen Orders</h3>
        <button className="btn-dv btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => setActiveTab('orders')}>View All Orders →</button>
      </div>

      {activeOrders.length === 0 ? (
        <div className="dv-empty"><p>No active orders right now. Kitchen is clear!</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 14 }}>
          {activeOrders.slice(0, 6).map((o) => (
            <div className="card-dv" key={o._id} style={{ padding: 18, borderLeft: '4px solid var(--gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--gold)' }}>#{o.orderNumber}</span>
                <span
                  className="tag"
                  style={{
                    background: o.status.toLowerCase().includes('prepar') ? 'var(--burgundy-tint)' : 'var(--sage-tint)',
                    color: o.status.toLowerCase().includes('prepar') ? 'var(--burgundy)' : 'var(--sage-dark)',
                    fontWeight: 800
                  }}
                >
                  {o.status.toUpperCase()}
                </span>
              </div>
              <h3 style={{ margin: '4px 0', fontSize: '1.3rem', fontWeight: 800 }}>TABLE {o.tableNumber}</h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                {o.items.length} item{o.items.length > 1 ? 's' : ''} · ₹{o.total?.toFixed(2)}
              </div>
              <button
                onClick={() => setReceiptOrder(o)}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--cream)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🖨 POS Bill Invoice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Live Orders Management</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Track & update customer table orders</p>
        </div>

        {/* Filter Pills & Search */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              className="dv-input"
              style={{ padding: '8px 14px 8px 34px', fontSize: '0.85rem', width: '220px' }}
              placeholder="Search Order # or Table..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>

          <div style={{ display: 'flex', gap: 6, background: '#FAF6F0', padding: 4, borderRadius: '999px', border: '1px solid var(--line)' }}>
            {['all', 'active', 'ready', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setOrderFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: orderFilter === f ? 'var(--espresso)' : 'transparent',
                  color: orderFilter === f ? 'var(--cream)' : 'var(--ink-soft)'
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="dv-empty"><p>No orders match the current search or status filter.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filteredOrders.map((o) => (
            <div className="card-dv" key={o._id} style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700 }}>#{o.orderNumber}</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 0' }}>TABLE {o.tableNumber}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    className="tag"
                    style={{
                      background: o.status === 'READY' || o.status === 'ready' ? 'var(--gold-tint)' : o.status === 'PREPARING' || o.status === 'preparing' ? 'var(--burgundy-tint)' : 'var(--sage-tint)',
                      color: o.status === 'READY' || o.status === 'ready' ? '#8A6417' : o.status === 'PREPARING' || o.status === 'preparing' ? 'var(--burgundy)' : 'var(--sage-dark)',
                      fontWeight: 800
                    }}
                  >
                    {o.status.toUpperCase()}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: '#048A65', fontWeight: 800, marginTop: 4 }}>✓ PAID ONLINE</div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--line)', padding: '12px 0', flex: 1 }}>
                {o.items.map((i, idx) => (
                  <div key={idx} style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{i.quantity} × {i.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                    {(i.spiceLevel || i.addOns?.length > 0 || i.notes) && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                        {i.spiceLevel && <span>Spice: {i.spiceLevel} · </span>}
                        {i.addOns?.map((a) => a.name).join(', ')}
                        {i.notes && <span style={{ color: 'var(--burgundy)' }}> Note: "{i.notes}"</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', fontWeight: 800, marginBottom: 12 }}>
                  <span>Total Amount</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--burgundy)' }}>₹{o.total?.toFixed(2)}</span>
                </div>

                {errorMap[o._id] && <p style={{ color: 'var(--chili)', fontSize: '0.8rem', marginBottom: 8 }}>{errorMap[o._id]}</p>}

                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
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
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                        Staff Serving Code: <strong style={{ color: 'var(--burgundy)' }}>{o.servingCode}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input className="dv-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} placeholder="Code" value={servingInputs[o._id] || ''} onChange={(e) => setServingInputs({ ...servingInputs, [o._id]: e.target.value })} />
                        <button className="btn-dv btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleUpdateStatus(o._id, 'SERVED', servingInputs[o._id])}>Verify & Serve</button>
                      </div>
                    </div>
                  )}

                  {(o.status === 'served' || o.status === 'SERVED') && (
                    <button className="btn-dv btn-primary btn-block" style={{ padding: '10px', fontSize: '0.88rem' }} onClick={() => handleUpdateStatus(o._id, 'COMPLETED')}>
                      ✓ Complete Order
                    </button>
                  )}

                  <button
                    onClick={() => setReceiptOrder(o)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                      background: 'var(--surface)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🖨 Thermal Bill Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderKitchen = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kitchen Preparation Screen (KDS)</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Live orders queued for chef & kitchen staff</p>
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold)', background: 'rgba(247,127,0,0.12)', padding: '6px 14px', borderRadius: '999px' }}>
          Queue: {activeOrders.length} Orders
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="dv-empty"><p>No orders currently in kitchen prep queue.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {activeOrders.map((o) => (
            <div className="card-dv" key={o._id} style={{ padding: '24px', background: '#18151D', color: 'var(--cream)', border: '2px solid var(--gold)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ color: 'var(--cream)', fontSize: '2rem', margin: 0, fontWeight: 900 }}>TABLE {o.tableNumber}</h2>
                <span className="tag tag-popular" style={{ fontSize: '0.85rem' }}>#{o.orderNumber}</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '14px 0' }}>
                {o.items.map((i, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--gold-soft)' }}>{i.quantity} × {i.name}</div>
                    {i.spiceLevel && <div style={{ fontSize: '0.85rem', color: '#E63946', fontWeight: 700 }}>🌶️ Spice: {i.spiceLevel}</div>}
                    {i.addOns?.length > 0 && <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Add-ons: {i.addOns.map((a) => a.name).join(', ')}</div>}
                    {i.notes && <div style={{ fontSize: '0.85rem', color: 'var(--gold-soft)', fontStyle: 'italic', marginTop: 2, background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '6px' }}>Note: "{i.notes}"</div>}
                  </div>
                ))}
              </div>

              <button className="btn-dv btn-gold btn-block" style={{ marginTop: 10, padding: '12px', fontSize: '0.95rem' }} onClick={() => handleUpdateStatus(o._id, 'READY')}>
                🔔 Mark Order Ready for Table {o.tableNumber}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTables = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Table & QR Management</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Manage restaurant tables, view QR codes, merge orders</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-dv btn-outline" style={{ fontSize: '0.88rem' }} onClick={() => setShowMergeModal(true)}>
            🔗 Merge Tables
          </button>
          <button className="btn-dv btn-primary" style={{ fontSize: '0.88rem' }} onClick={() => setShowTableModal(true)}>
            <PlusIcon width={16} height={16} /> Add Table
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
        {tables.map((t, idx) => {
          const status = (t.status || 'AVAILABLE').toUpperCase();
          const sc = STATUS_COLORS[status] || STATUS_COLORS.AVAILABLE;
          const targetUrl = getQrTargetUrl(t.code);
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&margin=15&data=${encodeURIComponent(targetUrl)}`;

          return (
            <div className="card-dv" key={idx} style={{ padding: '20px', textAlign: 'center', border: status === 'OCCUPIED' ? '2px solid rgba(230,57,70,0.4)' : '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{status}</span>
              </div>

              <h3 style={{ fontSize: '1.6rem', margin: '4px 0 2px', fontWeight: 800 }}>TABLE {t.tableNumber}</h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gold)', marginBottom: 12, fontWeight: 700 }}>{t.code}</div>

              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '14px', display: 'inline-block', border: '1px solid var(--line)', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <img src={qrUrl} alt={`Table ${t.tableNumber} QR`} style={{ width: '110px', height: '110px', display: 'block' }} />
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-dv btn-gold" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => setSelectedTableQr({ ...t, qrUrl })}>
                  View QR
                </button>
                {status !== 'AVAILABLE' && (
                  <button className="btn-dv btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => handleReleaseTable(t.code)}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>5-Star Digital Menu Manager</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Add dishes, edit pricing, toggle availability live</p>
        </div>
        <button
          className="btn-dv btn-burgundy"
          style={{ fontSize: '0.88rem' }}
          onClick={() => {
            setEditingFood(null);
            setFoodForm({ name: '', category: 'Arabian Mandhi', price: '', description: '', image: '', veg: true, spiceLevel: 0, isAvailable: true });
            setShowFoodModal(true);
          }}
        >
          <PlusIcon width={16} height={16} /> Add New Dish
        </button>
      </div>

      {/* Category Pills & Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="dv-input"
          style={{ padding: '8px 14px', fontSize: '0.85rem', maxWidth: '240px' }}
          placeholder="Search food item..."
          value={menuSearch}
          onChange={(e) => setMenuSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {menuCategoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setMenuCatFilter(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: '1px solid var(--line)',
                background: menuCatFilter === cat ? 'var(--espresso)' : '#FFFFFF',
                color: menuCatFilter === cat ? 'var(--cream)' : 'var(--ink-soft)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <div className="dv-empty"><p>No menu items found for the selected filter.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredFoods.map((food) => (
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
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="tag" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{food.category}</span>
                  <span className={`tag ${food.veg ? 'tag-veg' : 'tag-nonveg'}`} style={{ fontSize: '0.65rem' }}>{food.veg ? 'Veg' : 'Non-Veg'}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--burgundy)', fontSize: '0.98rem' }}>₹{Number(food.price).toFixed(2)}</div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleAvailability(food._id, food.isAvailable)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      background: food.isAvailable ? 'var(--sage-tint)' : 'var(--chili-tint)',
                      color: food.isAvailable ? 'var(--sage-dark)' : 'var(--chili)'
                    }}
                  >
                    {food.isAvailable ? '✓ IN STOCK' : 'OUT OF STOCK'}
                  </button>
                  <button onClick={() => handleOpenEditFood(food)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}>✏️ Edit</button>
                  <button onClick={() => handleDeleteFood(food._id)} style={{ background: 'none', border: 'none', color: 'var(--chili)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Restaurant POS & Store Settings</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Configure tax rates, store branding, receipts & POS defaults</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        <div className="card-dv" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>🏢 Store Branding & Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>Restaurant Name</label>
              <input className="dv-input" defaultValue="DINEVO 5-Star Luxury Resort & Bar" />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>Helpline / Contact Phone</label>
              <input className="dv-input" defaultValue="+91 98765 43210" />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>Address</label>
              <textarea className="dv-note-box" rows={2} defaultValue="12 Marina Walk, Five-Star Luxury Zone" />
            </div>
          </div>
        </div>

        <div className="card-dv" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>🧾 POS Invoice & Tax Configuration</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>GSTIN Registration</label>
              <input className="dv-input" defaultValue="33ABCDE1234F1Z5" />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>FSSAI License No</label>
              <input className="dv-input" defaultValue="12421001000188" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>CGST %</label>
                <input className="dv-input" defaultValue="2.5%" disabled />
              </div>
              <div>
                <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>SGST %</label>
                <input className="dv-input" defaultValue="2.5%" disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="card-dv" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>🔔 Audio & Hardware Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>New Order Audio Chime</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Plays sound on incoming table orders</div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  background: soundEnabled ? 'var(--sage)' : '#DDD',
                  color: soundEnabled ? '#FFF' : '#111',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {soundEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vite Dev Server Binding</div>
              <div style={{ fontSize: '0.78rem', color: '#048A65', fontWeight: 700, marginTop: 2 }}>✓ Host 0.0.0.0 (LAN Connected)</div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Active Wi-Fi LAN IP</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--burgundy)', fontWeight: 800, marginTop: 2 }}>http://10.115.242.218:3000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`adm-layout ${embedded ? 'embedded' : ''}`}>
      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <div className="dv-logo" style={{ fontSize: '1.6rem', fontWeight: 900 }}>DINE<span style={{ color: 'var(--gold)' }}>VO</span></div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 800, marginTop: 2 }}>5-Star Resort POS v2.1</div>
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
            <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
              <KitchenIcon /> DINEVO 5-STAR RESORT POS MANAGEMENT
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn-dv btn-outline" style={{ fontSize: '0.82rem', padding: '6px 14px' }} onClick={fetchData}>
              ↻ Sync Data
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="adm-content">
          {loading ? (
            <div className="dv-loading-screen"><span className="dv-spinner" /> Loading POS System...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'kitchen' && renderKitchen()}
              {activeTab === 'tables' && renderTables()}
              {activeTab === 'menu' && renderMenu()}
              {activeTab === 'settings' && renderSettings()}
            </>
          )}
        </div>
      </main>

      {/* MODALS */}
      {selectedTableQr && <AdminQRDisplay table={selectedTableQr} onClose={() => setSelectedTableQr(null)} />}
      {receiptOrder && <AdminReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}

      {showFoodModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: '20px' }}>
          <form onSubmit={handleSaveFood} style={{ background: '#FFFFFF', borderRadius: '24px', padding: '30px', maxWidth: '520px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 18 }}>{editingFood ? '✏️ Edit Dish Details' : '➕ Add New Dish'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Food Name</label>
                <input className="dv-input" required value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Category</label>
                  <select className="dv-input" value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}>
                    {menuCategoriesList.filter(c => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Price (₹)</label>
                  <input type="number" className="dv-input" required value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Image URL</label>
                <input className="dv-input" placeholder="https://images.unsplash.com/..." value={foodForm.image} onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Description</label>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: '20px' }}>
          <form onSubmit={handleCreateTable} style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 14 }}>Create Table</h3>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: '20px' }}>
          <form onSubmit={handleMergeTables} style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 14 }}>Merge Tables</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 16 }}>Combine orders from Source Table into Target Table.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Source Table (e.g. 02)</label>
                <input className="dv-input" placeholder="Table Number" value={mergeForm.source} onChange={(e) => setMergeForm({ ...mergeForm, source: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Target Table (e.g. 01)</label>
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
