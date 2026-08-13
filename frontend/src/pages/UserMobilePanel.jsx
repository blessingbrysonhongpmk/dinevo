import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';


import RemoteBookingModal from '../components/RemoteBookingModal';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import QRScanner from '../components/QRScanner';
import { FALLBACK_MENU_ITEMS } from '../data/fallbackMenu';
import { UtensilsIcon, ChefHatIcon, CartIcon, ClockIcon, CheckIcon, StarIcon, QrIcon, ShieldCheckIcon } from '../components/Icons';


const STATUS_CONFIG = {
  AVAILABLE: { bg: 'rgba(0, 230, 153, 0.12)', border: 'rgba(0, 230, 153, 0.4)', color: '#00E699', badgeBg: '#00E699', badgeColor: '#0A1A14', label: 'AVAILABLE' },
  OCCUPIED: { bg: 'rgba(255, 77, 77, 0.12)', border: 'rgba(255, 77, 77, 0.3)', color: '#FF4D4D', badgeBg: '#FF4D4D', badgeColor: '#FFFFFF', label: 'OCCUPIED' },
  ORDERING: { bg: 'rgba(255, 179, 0, 0.12)', border: 'rgba(255, 179, 0, 0.4)', color: '#FFB300', badgeBg: '#FFB300', badgeColor: '#1A1400', label: 'ORDERING' },
  PREPARING: { bg: 'rgba(255, 179, 0, 0.12)', border: 'rgba(255, 179, 0, 0.4)', color: '#FFB300', badgeBg: '#FFB300', badgeColor: '#1A1400', label: 'PREPARING' },
  READY: { bg: 'rgba(0, 230, 153, 0.12)', border: 'rgba(0, 230, 153, 0.4)', color: '#00E699', badgeBg: '#00E699', badgeColor: '#0A1A14', label: 'READY' },
  SERVING: { bg: 'rgba(123, 97, 255, 0.12)', border: 'rgba(123, 97, 255, 0.4)', color: '#7B61FF', badgeBg: '#7B61FF', badgeColor: '#FFFFFF', label: 'SERVING' },
  COMPLETED: { bg: 'rgba(150, 150, 160, 0.12)', border: 'rgba(150, 150, 160, 0.3)', color: '#9696A0', badgeBg: '#9696A0', badgeColor: '#111', label: 'COMPLETED' }
};

export default function UserMobilePanel({ embedded = false }) {
  const [view, setView] = useState('tables'); // tables, confirmed, menu, cart, bill, payment, order
  const [tables, setTables] = useState([
    { _id: 't1', tableNumber: '01', code: 'DINEVO-T01', capacity: 4, status: 'AVAILABLE' },
    { _id: 't2', tableNumber: '02', code: 'DINEVO-T02', capacity: 2, status: 'AVAILABLE' },
    { _id: 't3', tableNumber: '03', code: 'DINEVO-T03', capacity: 6, status: 'AVAILABLE' },
    { _id: 't4', tableNumber: '04', code: 'DINEVO-T04', capacity: 4, status: 'OCCUPIED' },
    { _id: 't5', tableNumber: '05', code: 'DINEVO-T05', capacity: 8, status: 'AVAILABLE' },
    { _id: 't6', tableNumber: '06', code: 'DINEVO-T06', capacity: 4, status: 'AVAILABLE' },
    { _id: 't7', tableNumber: '07', code: 'DINEVO-T07', capacity: 2, status: 'AVAILABLE' },
    { _id: 't8', tableNumber: '08', code: 'DINEVO-T08', capacity: 6, status: 'AVAILABLE' }
  ]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState(() =>
    FALLBACK_MENU_ITEMS.filter((item, index, self) =>
      index === self.findIndex((t) => (t.name || '').trim().toLowerCase() === (item.name || '').trim().toLowerCase())
    )
  );
  const [categories, setCategories] = useState([
    'All',
    'Signature',
    'Biryani',
    'Mandi',
    'Parotta & Gravy',
    'Dosa & South Indian',
    'Starters',
    'Grills & Tandoor',
    'Seafood',
    'Kanyakumari Specials',
    'Juices & Cool Drinks',
    'Desserts'
  ]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [foodNotes, setFoodNotes] = useState('');
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [mobilePaymentMethod, setMobilePaymentMethod] = useState('UPI'); // 'UPI', 'CARD', 'NET_BANKING', 'CASH'
  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [tipAmount, setTipAmount] = useState(0);
  const { startSession, session } = useCart();

  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data || []);
      setConnectionError(false);
    } catch (err) {
      console.warn('Failed to fetch tables', err);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenu = useCallback(async (restaurantId) => {
    try {
      const url = restaurantId ? `/foods?restaurant=${restaurantId}` : '/foods';
      const res = await api.get(url);
      const rawData = res.data;
      let items = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
      
      // Fallback if query returned 0 items
      if (items.length === 0) {
        items = FALLBACK_MENU_ITEMS;
      }

      // Strict deduplication filter by food item name
      const uniqueItems = items.filter((item, index, self) =>
        index === self.findIndex((t) => (t.name || '').trim().toLowerCase() === (item.name || '').trim().toLowerCase())
      );

      setMenuItems(uniqueItems);
      const categoryOrder = [
        'All',
        'Signature',
        'Biryani',
        'Mandi',
        'Parotta & Gravy',
        'Dosa & South Indian',
        'Starters',
        'Grills & Tandoor',
        'Seafood',
        'Kanyakumari Specials',
        'Juices & Cool Drinks',
        'Desserts'
      ];
      const rawCats = Array.from(new Set(uniqueItems.map((i) => i.category).filter(Boolean)));
      const sortedCats = ['All', ...categoryOrder.filter(c => c !== 'All' && rawCats.includes(c)), ...rawCats.filter(c => !categoryOrder.includes(c))];
      setCategories(sortedCats);
    } catch (err) {
      console.warn('Backend food API offline, loading instant fallback gourmet menu');
      const uniqueFallback = FALLBACK_MENU_ITEMS.filter((item, index, self) =>
        index === self.findIndex((t) => (t.name || '').trim().toLowerCase() === (item.name || '').trim().toLowerCase())
      );
      setMenuItems(uniqueFallback);
      const categoryOrder = [
        'All',
        'Signature',
        'Biryani',
        'Mandi',
        'Parotta & Gravy',
        'Dosa & South Indian',
        'Starters',
        'Grills & Tandoor',
        'Seafood',
        'Kanyakumari Specials',
        'Juices & Cool Drinks',
        'Desserts'
      ];
      const rawCats = Array.from(new Set(uniqueFallback.map((i) => i.category).filter(Boolean)));
      const sortedCats = ['All', ...categoryOrder.filter(c => c !== 'All' && rawCats.includes(c)), ...rawCats.filter(c => !categoryOrder.includes(c))];
      setCategories(sortedCats);
    }
  }, []);



  useEffect(() => {
    fetchTables();
    fetchMenu();
    const interval = setInterval(fetchTables, 2500);
    return () => clearInterval(interval);
  }, [fetchTables, fetchMenu]);


  const [searchParams] = useSearchParams();
  const urlTableCode = searchParams.get('table') || searchParams.get('tableCode');

  // Auto-detect table code from URL parameter (e.g. /user?table=DINEVO-T01 or /user?table=01)
  useEffect(() => {
    if (urlTableCode && (!selectedTable || selectedTable.code !== urlTableCode.toUpperCase())) {
      const cleanCode = urlTableCode.trim().toUpperCase();
      api.get(`/tables/code/${cleanCode}`).then((res) => {
        const tData = res.data.data || res.data;
        if (tData) {
          const sess = {
            sessionCode: `S-${Date.now().toString().slice(-4)}`,
            tableNumber: tData.tableNumber || '01',
            tableCode: tData.tableCode || cleanCode,
            restaurantId: tData.restaurantId,
            restaurantName: tData.restaurantName || 'DINEVO Kitchen & Bar',
            verified: true
          };
          startSession(sess);
          setSelectedTable({
            tableNumber: tData.tableNumber || '01',
            code: tData.tableCode || cleanCode,
            status: 'OCCUPIED'
          });
          setSessionData(sess);
          if (tData.restaurantId) {
            fetchMenu(tData.restaurantId);
          }
          setView('confirmed');
        }
      }).catch(() => {});
    }
  }, [urlTableCode, selectedTable, startSession, fetchMenu]);

  // Bind active session from CartContext if present
  useEffect(() => {
    if (session?.verified && (!selectedTable || selectedTable.code !== session.tableCode)) {
      setSelectedTable({
        tableNumber: session.tableNumber,
        code: session.tableCode,
        status: 'OCCUPIED'
      });
      setSessionData(session);
      if (session.restaurantId) {
        fetchMenu(session.restaurantId);
      }
      setView((prev) => (prev === 'tables' ? 'confirmed' : prev));
    }
  }, [session, selectedTable, fetchMenu]);


  // Poll order status if active order exists
  useEffect(() => {
    if (!currentOrder || !currentOrder._id) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${currentOrder._id}`);
        const orderData = res.data?.data || res.data;
        if (orderData && orderData._id) {
          setCurrentOrder(orderData);
        }
      } catch (e) { /* ignore */ }
    }, 2500);
    return () => clearInterval(interval);
  }, [currentOrder]);


  const handleBookTable = async (table) => {
    setBooking(table.code);
    setBookingError('');
    try {
      const res = await api.patch(`/tables/${table.code}/book`);
      if (res.data.success) {
        setSelectedTable({ ...table, status: 'OCCUPIED' });
        setSessionData(res.data.session);
        if (res.data.session) {
          startSession(res.data.session);
        }
        if (res.data.restaurantId) {
          await fetchMenu(res.data.restaurantId);
        }
        setView('confirmed');
        await fetchTables();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Table is currently occupied';
      setBookingError(msg);
      await fetchTables();
    } finally {
      setBooking(null);
    }
  };

  const addToCart = (item, options = {}) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) => c._id === item._id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...item, qty: 1, spiceLevel: options.spiceLevel || 'Medium', notes: options.notes || '' }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map((c) => c._id === itemId ? { ...c, qty: c.qty - 1 } : c);
      }
      return prev.filter((c) => c._id !== itemId);
    });
  };

  const cartSubtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartTax = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const cartService = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax + cartService) * 100) / 100;
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleExecutePaymentAndOrder = async (overrideMethod, extraOptions = {}) => {
    if (cart.length === 0) return null;
    let currentTable = selectedTable;
    if (!currentTable) {
      currentTable = tables[0] || { tableNumber: '01', code: 'DINEVO-T01' };
      setSelectedTable(currentTable);
    }
    setOrderPlacing(true);
    const chosenMethod = typeof overrideMethod === 'string' ? overrideMethod : (mobilePaymentMethod || 'UPI');
    try {
      const orderPayload = {
        restaurantId: sessionData?.restaurantId,
        tableNumber: currentTable.tableNumber,
        tableCode: currentTable.code,
        sessionCode: sessionData?.sessionCode || 'DEMO',

        items: cart.map((c) => ({
          menuItem: c._id,
          name: c.name,
          price: c.price,
          quantity: c.qty,
          spiceLevel: c.spiceLevel || 'Medium',
          selectedAddOns: [],
          notes: c.notes || ''
        }))
      };
      const res = await api.post('/orders', orderPayload);
      const createdOrder = res.data.data || res.data;


      let payData = null;
      try {
        const payRes = await api.post('/payments/create', {
          orderId: createdOrder._id,
          method: chosenMethod,
          tipAmount: extraOptions.tipAmount || tipAmount || 0,
          bankName: extraOptions.bankName,
          cardDetails: extraOptions.cardDetails
        });
        payData = payRes.data;
        if (payData.receipt) {
          setCurrentReceipt(payData.receipt);
        }
      } catch (payErr) {
        console.warn('Backend payment status creation error:', payErr);
      }

      setCurrentOrder(createdOrder);
      setCart([]);
      setShowFullPaymentModal(false);
      setView('order');
      return payData;
    } catch (err) {
      console.error('Order failed:', err);
      throw err;
    } finally {
      setOrderPlacing(false);
    }
  };

  const filteredMenu = activeCategory === 'All'
    ? menuItems.filter((i) => i.isAvailable !== false)
    : menuItems.filter((i) => i.category === activeCategory && i.isAvailable !== false);

  // =========== RENDER VIP HEADER & NAV ===========

  const renderHeader = () => (
    <div className="v40-header">
      <div className="v40-logo">DINE<span>VO</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={() => setShowScanModal(true)}
          style={{
            background: 'rgba(255, 215, 0, 0.15)',
            border: '1px solid rgba(255, 215, 0, 0.4)',
            color: '#FFD700',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          📷 SCAN QR
        </button>
        {selectedTable ? (
          <div className="v40-table-pill">
            <span className="v40-dot-pulse" />
            TABLE {selectedTable.tableNumber}
          </div>
        ) : (
          <div className="v40-mode-tag">VIP DINING</div>
        )}
      </div>
    </div>
  );

  const handleNavMenuClick = () => {
    if (!selectedTable) {
      const defaultTbl = tables.find((t) => (t.status || '').toUpperCase() === 'AVAILABLE') || tables[0] || { tableNumber: '01', code: 'DINEVO-T01' };
      setSelectedTable(defaultTbl);
    }
    setView('menu');
  };

  const handleNavCartClick = () => {
    if (!selectedTable) {
      const defaultTbl = tables.find((t) => (t.status || '').toUpperCase() === 'AVAILABLE') || tables[0] || { tableNumber: '01', code: 'DINEVO-T01' };
      setSelectedTable(defaultTbl);
    }
    setView('cart');
  };

  const renderBottomNav = () => (
    <div className="v40-bottom-nav">
      <button className={view === 'tables' ? 'active' : ''} onClick={() => setView('tables')}>
        <UtensilsIcon width={18} height={18} />
        <span>Tables</span>
      </button>
      <button className={view === 'menu' || view === 'confirmed' ? 'active' : ''} onClick={handleNavMenuClick}>
        <ChefHatIcon width={18} height={18} />
        <span>Menu</span>
      </button>
      <button className={view === 'cart' || view === 'bill' ? 'active' : ''} onClick={handleNavCartClick}>
        <CartIcon width={18} height={18} />
        <span>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
      </button>
      <button className={view === 'order' || view === 'payment' ? 'active' : ''} onClick={() => currentOrder && setView('order')} disabled={!currentOrder}>
        <ClockIcon width={18} height={18} />
        <span>Order</span>
      </button>
    </div>
  );

  // 1. TABLE SELECTION VIEW (GOLDEN OBSIDIAN LUXURY)
  const renderTables = () => (
    <div className="v40-content">
      <div className="v40-section-header">
        <span className="v40-eyebrow">TABLE RESERVATION</span>
        <h2 className="v40-title">Select Dining Table</h2>
        <p className="v40-subtitle">Tap an available table or book remotely from long distance</p>
      </div>

      <button
        type="button"
        onClick={() => setShowRemoteModal(true)}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '16px',
          border: '1px solid #00E699',
          background: 'rgba(0, 230, 153, 0.14)',
          color: '#00E699',
          fontSize: '0.92rem',
          fontWeight: 800,
          marginBottom: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 8px 20px rgba(0,230,153,0.15)'
        }}
      >
        REMOTE LONG-DISTANCE TABLE BOOKING & PRE-ORDER
      </button>

      {showRemoteModal && <RemoteBookingModal onClose={() => setShowRemoteModal(false)} />}

      {bookingError && (
        <div className="v40-error-banner">
          {bookingError}
        </div>
      )}

      {connectionError && !loading && (
        <div className="v40-error-banner" style={{ background: 'rgba(255, 77, 77, 0.12)', border: '1px solid rgba(255, 77, 77, 0.4)', color: '#FF4D4D', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
          <strong>CRITICAL CONNECTION ERROR</strong>
          <p style={{ marginTop: '6px', fontSize: '0.85rem', color: '#FFF' }}>The application could not connect to the backend server or MongoDB database. Please ensure the backend is running.</p>
        </div>
      )}

      <div className="v40-table-grid">
        {tables.map((t) => {
          const status = (t.status || 'AVAILABLE').toUpperCase();
          const isAvailable = status === 'AVAILABLE';
          const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE;
          const isBookingThis = booking === t.code;

          return (
            <div
              key={t.code || t.tableNumber}
              className={`v40-table-card ${isAvailable ? 'available' : 'occupied'}`}
              style={{ background: cfg.bg, borderColor: cfg.border }}
            >
              <div className="v40-table-card-top">
                <span className="v40-table-num-large">TABLE {t.tableNumber}</span>
                <span className="v40-status-badge" style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
                  {cfg.label}
                </span>
              </div>

              {isAvailable ? (
                <button
                  className="v40-book-btn"
                  disabled={!!booking}
                  onClick={() => handleBookTable(t)}
                >
                  {isBookingThis ? <span className="dv-spinner" /> : 'RESERVE TABLE'}
                </button>
              ) : (
                <div className="v40-occupied-label">
                  Session Active
                </div>
              )}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="v40-loading-box">
          <span className="dv-spinner" /> Syncing Table States from MongoDB...
        </div>
      )}
    </div>
  );

  // 2. TABLE CONFIRMED VIEW
  const renderConfirmed = () => (
    <div className="v40-content v40-center-hero">
      <div className="v40-hero-icon" style={{ display: 'flex', justifyContent: 'center' }}>
        <ShieldCheckIcon width={48} height={48} style={{ color: 'var(--gold)' }} />
      </div>
      <span className="v40-eyebrow" style={{ color: 'var(--gold)' }}>SESSION STARTED</span>
      <h1 className="v40-hero-title">TABLE {selectedTable?.tableNumber}</h1>
      <div className="v40-verified-badge">✓ Table Verified & Locked</div>
      <p className="v40-hero-desc">
        Welcome to your table at DINEVO Kitchen & Bar. Tap below to browse today's freshly crafted menu.
      </p>


      <button
        className="v40-primary-cta"
        onClick={() => setView('menu')}
      >
        EXPLORE MENU & ORDER
      </button>
    </div>
  );

  // 3. MENU VIEW (LUXURY CARDS WITH DETAIL DIALOG)
  const renderMenu = () => (
    <div className="v40-content">
      <div className="v40-cat-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`v40-cat-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredMenu.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px border rgba(255,255,255,0.1)', marginTop: 20 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🍲</div>
          <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 800 }}>Syncing Menu Dishes...</h3>
          <p style={{ color: '#AAA', fontSize: '0.85rem', marginTop: 4, marginBottom: 20 }}>
            {activeCategory !== 'All' ? `No dishes currently listed in category "${activeCategory}".` : 'Fetching fresh gourmet food menu.'}
          </p>
          <button
            type="button"
            className="v40-primary-cta"
            onClick={() => {
              setActiveCategory('All');
              fetchMenu();
            }}
          >
            🔄 LOAD ALL MENU DISHES
          </button>
        </div>
      ) : (
        <div className="v40-menu-grid">
          {filteredMenu.map((item) => {
            const inCart = cart.find((c) => c._id === item._id);
            return (
              <div key={item._id} className="v40-food-card" onClick={() => setSelectedFoodItem(item)}>
                <div className="v40-food-img-wrap">
                  <img src={item.image} alt={item.name} className="v40-food-img" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400'; }} />
                  {item.isPopular && <span className="v40-popular-tag">★ POPULAR</span>}
                </div>

                <div className="v40-food-details">
                  <div className="v40-food-header">
                    <h3 className="v40-food-title">{item.name}</h3>
                    <div className="v40-food-price">₹{item.price}</div>
                  </div>

                  <p className="v40-food-desc">{item.description}</p>

                  <div className="v40-food-footer">
                    <span className={`v40-veg-tag ${item.veg ? 'veg' : 'non-veg'}`}>
                      {item.veg ? '🌱 VEG' : '🍗 NON-VEG'}
                    </span>

                    <div className="v40-food-action" onClick={(e) => e.stopPropagation()}>
                      {inCart ? (
                        <div className="v40-qty-stepper">
                          <button onClick={() => removeFromCart(item._id)}>−</button>
                          <span>{inCart.qty}</span>
                          <button onClick={() => addToCart(item)}>+</button>
                        </div>
                      ) : (
                        <button className="v40-add-btn" onClick={() => addToCart(item)}>+ ADD</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cartCount > 0 && (
        <div className="v40-floating-cart-bar" onClick={() => setView('cart')}>
          <div className="v40-cart-bar-left">
            <span className="v40-cart-qty-badge">{cartCount}</span>
            <div className="v40-cart-total-text">₹{cartTotal} <small>INC. TAXES</small></div>
          </div>
          <div className="v40-cart-bar-right">VIEW CART →</div>
        </div>
      )}
    </div>
  );

  // 4. CART VIEW
  const renderCart = () => (
    <div className="v40-content">
      <h2 className="v40-title">Your Order Cart ({cartCount})</h2>
      {cart.length === 0 ? (
        <div className="v40-empty-cart">
          <div className="v40-empty-icon">🍷</div>
          <p>Your dining cart is empty</p>
          <button className="v40-add-btn" onClick={() => setView('menu')}>BROWSE MENU</button>
        </div>
      ) : (
        <>
          <div className="v40-cart-items">
            {cart.map((item) => (
              <div key={item._id} className="v40-cart-item-card">
                <div className="v40-cart-item-main">
                  <div className="v40-cart-item-name">{item.name}</div>
                  <div className="v40-cart-item-price">₹{item.price} × {item.qty}</div>
                  {item.notes && <div className="v40-cart-note">Note: {item.notes}</div>}
                </div>
                <div className="v40-qty-stepper">
                  <button onClick={() => removeFromCart(item._id)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="v40-bill-box">
            <div className="v40-bill-line"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
            <div className="v40-bill-line"><span>GST Tax (5%)</span><span>₹{cartTax}</span></div>
            <div className="v40-bill-line"><span>Service Charge (5%)</span><span>₹{cartService}</span></div>
            <div className="v40-bill-line total"><span>TOTAL AMOUNT</span><span>₹{cartTotal}</span></div>
          </div>

          <button
            className="v40-primary-cta"
            onClick={() => setView('bill')}
          >
            REVIEW RESTAURANT BILL →
          </button>
        </>
      )}
    </div>
  );

  // 5. BILL & ORDER SUMMARY VIEW
  const renderBill = () => (
    <div className="v40-content">
      <div className="v40-receipt-card">
        <div className="v40-receipt-header">
          <div className="v40-logo" style={{ fontSize: '1.5rem' }}>DINE<span>VO</span></div>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.85rem' }}>TABLE {selectedTable?.tableNumber}</div>
          <div className="v40-receipt-sub">OFFICIAL DINING BILL SUMMARY</div>
        </div>

        <div className="v40-receipt-body">
          {cart.map((item) => (
            <div key={item._id} className="v40-receipt-row">
              <span>{item.qty}× {item.name}</span>
              <span className="v40-mono">₹{item.price * item.qty}</span>
            </div>
          ))}

          <div className="v40-receipt-divider" />

          <div className="v40-bill-line"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
          <div className="v40-bill-line"><span>Tax (5%)</span><span>₹{cartTax}</span></div>
          <div className="v40-bill-line"><span>Service (5%)</span><span>₹{cartService}</span></div>
          <div className="v40-bill-line total"><span>FINAL TOTAL</span><span>₹{cartTotal}</span></div>
        </div>
      </div>

      <button
        className="v40-primary-cta"
        onClick={() => setView('payment')}
      >
        PROCEED TO PAYMENT →
      </button>
    </div>
  );

  // 6. VIP PAYMENT SCREEN WITH MULTI-METHOD SELECTOR
  const renderPayment = () => (
    <div className="v40-content">
      <div className="v40-section-header" style={{ textAlign: 'center', marginBottom: 16 }}>
        <span className="v40-eyebrow" style={{ color: '#FFD700' }}>EXPRESS MOBILE CHECKOUT</span>
        <h2 className="v40-title">Select Payment Method</h2>
        <div className="v40-pay-amount" style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--gold, #FFD700)', margin: '6px 0' }}>
          ₹{cartTotal}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#AAA' }}>Table {selectedTable?.tableNumber || '01'} &middot; Verified POS Gateway</p>
      </div>

      {/* PAYMENT METHOD SELECTOR CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {[
          { id: 'UPI', icon: '🚀', title: 'Google Pay / PhonePe / UPI', desc: 'Instant 1-tap app launch or scan QR code' },
          { id: 'CARD', icon: '💳', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay & international cards' },
          { id: 'NET_BANKING', icon: '🏛️', title: 'Net Banking', desc: 'HDFC, ICICI, SBI, Axis, Kotak & 50+ banks' },
          { id: 'CASH', icon: '💵', title: 'Cash at Counter', desc: 'Pay directly at billing desk upon serving' }
        ].map((m) => {
          const isSelected = mobilePaymentMethod === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setMobilePaymentMethod(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: '16px',
                border: isSelected ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.12)',
                background: isSelected ? 'rgba(255, 215, 0, 0.12)' : '#181522',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '1.4rem' }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FFF' }}>{m.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#AAA', marginTop: 2 }}>{m.desc}</div>
              </div>
              {isSelected && (
                <span style={{ fontSize: '0.72rem', background: '#FFD700', color: '#000', padding: '3px 10px', borderRadius: '999px', fontWeight: 900 }}>
                  SELECTED
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* METHOD DETAILS SECTION */}
      {mobilePaymentMethod === 'UPI' && (
        <div style={{ background: '#161420', borderRadius: '18px', padding: '16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.84rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ⚡ Fast 1-Tap App Launch
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <a
              href={`gpay://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${cartTotal}&cu=INR`}
              style={{ background: '#4285F4', color: '#FFF', padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '0.82rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(66,133,244,0.3)' }}
            >
              Google Pay ➔
            </a>
            <a
              href={`phonepe://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${cartTotal}&cu=INR`}
              style={{ background: '#5F259F', color: '#FFF', padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '0.82rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(95,37,159,0.3)' }}
            >
              PhonePe ➔
            </a>
          </div>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div className="v40-qr-box" style={{ background: '#FFF', padding: 12, borderRadius: 16, display: 'inline-block', border: '2px solid #FFD700' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=10&data=upi://pay?pa=dinevo@upi%26pn=DINEVO%26am=${cartTotal}`}
                alt="Payment QR"
                style={{ width: 140, height: 140, display: 'block', borderRadius: 8 }}
              />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#AAA', marginTop: 8 }}>Scan via GPay, PhonePe, Paytm, or Mobile Banking</div>
          </div>
        </div>
      )}

      {mobilePaymentMethod === 'CARD' && (
        <div style={{ background: '#161420', borderRadius: '18px', padding: '16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.84rem' }}>Enter Card Details</div>
          <input className="dv-input" placeholder="Cardholder Name" style={{ background: '#0D0C12', color: '#FFF', borderColor: 'rgba(255,255,255,0.15)' }} />
          <input className="dv-input" placeholder="Card Number (4532 •••• •••• 8912)" style={{ background: '#0D0C12', color: '#FFF', borderColor: 'rgba(255,255,255,0.15)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input className="dv-input" placeholder="MM/YY" style={{ background: '#0D0C12', color: '#FFF', borderColor: 'rgba(255,255,255,0.15)' }} />
            <input type="password" maxLength={4} className="dv-input" placeholder="CVV •••" style={{ background: '#0D0C12', color: '#FFF', borderColor: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
      )}

      {mobilePaymentMethod === 'NET_BANKING' && (
        <div style={{ background: '#161420', borderRadius: '18px', padding: '16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.84rem', marginBottom: 6 }}>Select Bank</div>
          <select className="dv-input" style={{ background: '#0D0C12', color: '#FFF', borderColor: 'rgba(255,255,255,0.15)' }}>
            <option value="HDFC">HDFC Bank NetBanking</option>
            <option value="ICICI">ICICI Bank Internet Banking</option>
            <option value="SBI">State Bank of India (SBI)</option>
            <option value="AXIS">Axis Bank NetBanking</option>
            <option value="KOTAK">Kotak Mahindra Bank</option>
          </select>
        </div>
      )}

      {mobilePaymentMethod === 'CASH' && (
        <div style={{ background: '#161420', borderRadius: '18px', padding: '16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.88rem', marginBottom: 4 }}>💵 Pay Cash Upon Delivery</div>
          <p style={{ color: '#AAA', fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>
            Order will be confirmed and sent to kitchen immediately. Pay cash to server or at central cashier desk.
          </p>
        </div>
      )}

      <button
        className="v40-primary-cta"
        style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)', boxShadow: '0 8px 24px rgba(255,153,0,0.3)' }}
        onClick={() => handleExecutePaymentAndOrder(mobilePaymentMethod)}
        disabled={orderPlacing}
      >
        {orderPlacing ? <span className="dv-spinner" /> : `EXECUTE ${mobilePaymentMethod} PAYMENT & SEND TO KITCHEN`}
      </button>

      <button
        type="button"
        onClick={() => setShowFullPaymentModal(true)}
        style={{
          width: '100%',
          background: 'none',
          border: '1px solid rgba(255,215,0,0.4)',
          color: '#FFD700',
          padding: '12px',
          borderRadius: '16px',
          fontSize: '0.84rem',
          fontWeight: 800,
          marginTop: 10,
          cursor: 'pointer'
        }}
      >
        🛡️ OPEN FULL POS GATEWAY POPUP
      </button>
    </div>
  );

  // 7. ORDER TRACKING FLOW
  const renderOrder = () => {
    if (!currentOrder) return null;
    const status = (currentOrder.status || 'received').toUpperCase();
    const steps = ['CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
    const currentStep = steps.findIndex((s) => s === status) >= 0 ? steps.findIndex((s) => s === status) : 0;

    return (
      <div className="v40-content">
        <div className="v40-section-header">
          <span className="v40-eyebrow" style={{ color: '#FFD700' }}>KITCHEN TRANSMISSION ACTIVE</span>
          <h2 className="v40-title">Order #{currentOrder.orderNumber}</h2>
          <div style={{ color: '#00E699', fontWeight: 800, fontSize: '0.9rem' }}>TABLE {currentOrder.tableNumber}</div>
        </div>

        <div className="v40-timeline">
          {steps.map((step, i) => (
            <div key={step} className={`v40-timeline-step ${i <= currentStep ? 'active' : ''} ${i === currentStep ? 'current' : ''}`}>
              <div className="v40-timeline-dot" />
              <span>{i <= currentStep ? '✓ ' : ''}{step}</span>
            </div>
          ))}
        </div>

        {status === 'READY' && (
          <div className="v40-ready-banner">
            <h3>🔔 YOUR ORDER IS READY!</h3>
            <p>Our staff is bringing your food directly to Table {currentOrder.tableNumber}.</p>
          </div>
        )}

        {currentOrder.servingCode && (
          <div className="v40-serving-card">
            <div className="v40-serving-label">STAFF SERVING VERIFICATION CODE</div>
            <div className="v40-serving-value">{currentOrder.servingCode}</div>
            <p>Show this code to staff upon delivery to Table {currentOrder.tableNumber}</p>
          </div>
        )}

        {/* TAX RECEIPT CTA BUTTON */}
        <button
          type="button"
          onClick={async () => {
            if (currentReceipt) {
              setShowReceiptModal(true);
            } else {
              try {
                const res = await api.get(`/payments/receipt/${currentOrder._id}`);
                if (res.data.receipt) {
                  setCurrentReceipt(res.data.receipt);
                  setShowReceiptModal(true);
                }
              } catch (e) {
                console.warn('Failed to load receipt:', e);
              }
            }
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #1C182A 0%, #120F1D 100%)',
            color: '#FFD700',
            border: '1px solid rgba(255,215,0,0.3)',
            padding: '14px',
            borderRadius: '16px',
            fontSize: '0.92rem',
            fontWeight: 800,
            cursor: 'pointer',
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
          }}
        >
          📜 VIEW & PRINT OFFICIAL GST TAX INVOICE RECEIPT
        </button>
      </div>
    );
  };

  return (
    <div className={`v40-wrap ${embedded ? 'embedded' : ''}`}>
      {renderHeader()}
      <div className="v40-body">
        {view === 'tables' && renderTables()}
        {view === 'confirmed' && renderConfirmed()}
        {view === 'menu' && renderMenu()}
        {view === 'cart' && renderCart()}
        {view === 'bill' && renderBill()}
        {view === 'payment' && renderPayment()}
        {view === 'order' && renderOrder()}
      </div>

      {/* FOOD CUSTOMIZATION DIALOG */}
      {selectedFoodItem && (
        <div className="v40-modal-overlay" onClick={() => setSelectedFoodItem(null)}>
          <div className="v40-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <img src={selectedFoodItem.image} alt={selectedFoodItem.name} className="v40-modal-img" />
            <h3 className="v40-modal-title">{selectedFoodItem.name}</h3>
            <p className="v40-modal-desc">{selectedFoodItem.description}</p>
            <div className="v40-modal-price">₹{selectedFoodItem.price}</div>

            <div style={{ margin: '14px 0' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#AAA' }}>CHEF SPICE PREFERENCE</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {['Mild 🌶️', 'Medium 🌶️🌶️', 'High 🌶️🌶️🌶️'].map((lvl) => (
                  <button
                    key={lvl}
                    className={`v40-cat-chip ${spiceLevel === lvl ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => setSpiceLevel(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#AAA' }}>SPECIAL INSTRUCTIONS</label>
              <input
                className="dv-input"
                style={{ marginTop: 6, background: '#17151F', borderColor: 'rgba(255,255,255,0.1)', color: '#FFF' }}
                placeholder="Extra napkins, sauce on side..."
                value={foodNotes}
                onChange={(e) => setFoodNotes(e.target.value)}
              />
            </div>

            <button
              className="v40-primary-cta"
              style={{ marginTop: 20 }}
              onClick={() => {
                addToCart(selectedFoodItem, { spiceLevel, notes: foodNotes });
                setSelectedFoodItem(null);
              }}
            >
              ADD TO ORDER — ₹{selectedFoodItem.price}
            </button>
          </div>
        </div>
      )}

      {/* FULL POS PAYMENT MODAL */}
      {showFullPaymentModal && (
        <PaymentModal
          order={currentOrder || { total: cartTotal, tableNumber: selectedTable?.tableNumber || '01', orderNumber: 'PENDING' }}
          initialMethod={mobilePaymentMethod}
          onPaymentSuccess={async (method, options) => {
            const payRes = await handleExecutePaymentAndOrder(method, options);
            return payRes;
          }}
          onClose={() => setShowFullPaymentModal(false)}
        />
      )}

      {/* RECEIPT MODAL */}
      {showReceiptModal && currentReceipt && (
        <ReceiptModal
          receipt={currentReceipt}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* LIVE CAMERA QR SCANNER MODAL */}
      {showScanModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '20px' }}>
          <div style={{ background: '#181522', borderRadius: '24px', padding: '24px', maxWidth: '420px', width: '100%', border: '1px solid #FFD700', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: 14, color: '#FFD700' }}>
              SCAN TABLE QR CODE
            </h3>
            <QRScanner
              onScanSuccess={(scannedCode) => {
                setShowScanModal(false);
                if (scannedCode) {
                  const clean = scannedCode.trim().toUpperCase();
                  const matchTbl = tables.find((t) => (t.code || '').toUpperCase() === clean || t.tableNumber === clean);
                  if (matchTbl) {
                    setSelectedTable(matchTbl);
                    setView('confirmed');
                  }
                }
              }}
              onClose={() => setShowScanModal(false)}
            />
          </div>
        </div>
      )}

      {renderBottomNav()}
    </div>
  );
}
