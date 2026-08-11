import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

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
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const res = await api.get(`/menu?restaurant=${restaurantId}`);
      const items = res.data || [];
      setMenuItems(items);
      const cats = ['All', ...new Set(items.map((i) => i.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.warn('Failed to fetch menu', err);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 3000);
    return () => clearInterval(interval);
  }, [fetchTables]);

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
    if (!currentOrder) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${currentOrder._id}`);
        setCurrentOrder(res.data);
      } catch (e) { /* ignore */ }
    }, 3000);
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

  const handleExecutePaymentAndOrder = async () => {
    if (cart.length === 0 || !selectedTable) return;
    setOrderPlacing(true);
    try {
      const orderPayload = {
        restaurantId: sessionData?.restaurantId,
        tableNumber: selectedTable.tableNumber,
        tableCode: selectedTable.code,
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
      setCurrentOrder(res.data);
      setCart([]);
      setView('order');
    } catch (err) {
      console.error('Order failed:', err);
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
      {selectedTable ? (
        <div className="v40-table-pill">
          <span className="v40-dot-pulse" />
          TABLE {selectedTable.tableNumber}
        </div>
      ) : (
        <div className="v40-mode-tag">VIP DINING</div>
      )}
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
        <span className="v40-nav-icon">✨</span>
        <span>Tables</span>
      </button>
      <button className={view === 'menu' || view === 'confirmed' ? 'active' : ''} onClick={handleNavMenuClick}>
        <span className="v40-nav-icon">🍷</span>
        <span>Menu</span>
      </button>
      <button className={view === 'cart' || view === 'bill' ? 'active' : ''} onClick={handleNavCartClick}>
        <span className="v40-nav-icon">🛍️</span>
        <span>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
      </button>
      <button className={view === 'order' || view === 'payment' ? 'active' : ''} onClick={() => currentOrder && setView('order')} disabled={!currentOrder}>
        <span className="v40-nav-icon">⚜️</span>
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
        <p className="v40-subtitle">Tap an available table to begin your private order session</p>
      </div>

      {bookingError && (
        <div className="v40-error-banner">
          <span>⚠️</span> {bookingError}
        </div>
      )}

      {connectionError && !loading && (
        <div className="v40-error-banner" style={{ background: 'rgba(255, 77, 77, 0.12)', border: '1px solid rgba(255, 77, 77, 0.4)', color: '#FF4D4D', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
          <span>⚠️</span> <strong>CRITICAL CONNECTION ERROR</strong>
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
                  <span>🔒</span> Session Active
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
      <div className="v40-hero-icon">👑</div>
      <span className="v40-eyebrow" style={{ color: '#FFD700' }}>SESSION STARTED</span>
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

  // 6. VIP PAYMENT SCREEN WITH UPI QR
  const renderPayment = () => (
    <div className="v40-content v40-center-hero">
      <span className="v40-eyebrow" style={{ color: '#FFD700' }}>PAYMENT SUMMARY</span>
      <div className="v40-pay-amount">₹{cartTotal}</div>

      <div className="v40-qr-box">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=dinevo@upi%26pn=DINEVO%26am=${cartTotal}`}
          alt="Payment QR"
          className="v40-qr-img"
        />
      </div>

      <div className="v40-upi-id">UPI ID: dinevo@upi</div>

      <div className="v40-status-pill">
        <span className="v40-dot-pulse-amber" />
        Payment Status: Waiting for Authorization
      </div>

      <button
        className="v40-primary-cta"
        style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)' }}
        onClick={handleExecutePaymentAndOrder}
        disabled={orderPlacing}
      >
        {orderPlacing ? <span className="dv-spinner" /> : 'AUTHORIZE TEST PAYMENT & SEND TO KITCHEN'}
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

      {renderBottomNav()}
    </div>
  );
}
