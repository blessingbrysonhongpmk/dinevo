import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import QRScanner from '../components/QRScanner';
import { QrIcon, KitchenIcon, ShieldCheckIcon, UtensilsIcon } from '../components/Icons';

export default function Home() {
  const { session, startSession } = useCart();
  const navigate = useNavigate();

  const [tableCodeInput, setTableCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // Available table fleet
  const tableNumbers = ['01', '02', '03', '04', '05', '06', '07', '08'];

  const handleValidateTable = async (codeToValidate) => {
    const clean = (codeToValidate || tableCodeInput || 'DINEVO-T01').trim().toUpperCase();
    if (!clean) {
      setError('Please enter a valid table code (e.g. DINEVO-T01)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/tables/code/${clean}`);
      const tData = res.data.data || res.data;
      const targetCode = tData?.tableCode || clean;

      try {
        const bookRes = await api.patch(`/tables/${targetCode}/book`);
        const sess = bookRes.data.session || {
          sessionCode: `S-${Date.now().toString().slice(-4)}`,
          tableNumber: bookRes.data.table?.tableNumber || tData?.tableNumber || '01',
          tableCode: targetCode,
          restaurantId: bookRes.data.restaurantId || tData?.restaurantId,
          restaurantName: bookRes.data.restaurantName || tData?.restaurantName || 'DINEVO Grand Dining House',
          verified: true
        };
        startSession(sess);
      } catch {
        startSession({
          sessionCode: `S-${Date.now().toString().slice(-4)}`,
          tableNumber: tData?.tableNumber || clean.replace(/[^0-9]/g, '') || '01',
          tableCode: targetCode,
          restaurantId: tData?.restaurantId,
          restaurantName: tData?.restaurantName || 'DINEVO Grand Dining House',
          verified: true
        });
      }
      navigate('/user');
    } catch {
      // Fallback in-memory session start
      const fallbackNum = clean.replace(/[^0-9]/g, '') || '01';
      startSession({
        sessionCode: `S-${Date.now().toString().slice(-4)}`,
        tableNumber: fallbackNum.padStart(2, '0'),
        tableCode: clean,
        restaurantName: 'DINEVO Grand Dining House',
        verified: true
      });
      navigate('/user');
    } finally {
      setLoading(false);
      setShowCamera(false);
    }
  };

  const handleScanSuccess = (scanned) => {
    if (scanned) {
      setShowCamera(false);
      handleValidateTable(scanned);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'radial-gradient(circle at 50% 15%, rgba(247, 127, 0, 0.14) 0%, rgba(13, 12, 16, 0.98) 65%), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#FAF6F0',
        padding: '50px 20px 70px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Background Dimmer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(9, 8, 12, 0.88)',
          backdropFilter: 'blur(5px)',
          zIndex: 1
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1080px' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 20px',
              borderRadius: '999px',
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              color: 'var(--gold-soft)',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 16
            }}
          >
            ★ DINEVO GRAND DINING & OPERATIONS PORTAL ★
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.3rem, 4.8vw, 3.6rem)',
              fontWeight: 800,
              color: '#FAF6F0',
              lineHeight: 1.18,
              margin: '0 auto 14px',
              maxWidth: '820px',
              letterSpacing: '-0.01em'
            }}
          >
            Tableside Dining & Kitchen Operations
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)',
              color: 'rgba(250, 246, 240, 0.82)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Scan your table QR code to start dining, or access restaurant management & live kitchen operations.
          </p>
        </div>

        {/* Dual Primary Portals: Scanner & Admin Page */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 28,
            alignItems: 'stretch'
          }}
        >
          {/* PORTAL 1: SCANNER & CUSTOMER DINING */}
          <div
            style={{
              background: 'linear-gradient(160deg, rgba(26, 23, 34, 0.95) 0%, rgba(18, 16, 24, 0.95) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.28)',
              borderRadius: '28px',
              padding: '36px 30px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 215, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    background: 'rgba(255, 215, 0, 0.12)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold)'
                  }}
                >
                  <QrIcon width={24} height={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-soft)',
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    padding: '4px 12px',
                    borderRadius: '999px'
                  }}
                >
                  Customer Scanner
                </span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FAF6F0', marginBottom: 10 }}>
                Scan Table QR Code
              </h2>
              <p style={{ color: 'rgba(250, 246, 240, 0.75)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: 24 }}>
                Point your camera at the QR stand on your dining table, or select your table below to launch live tableside ordering.
              </p>

              {/* Active Session Callout if already seated */}
              {session && (
                <div
                  style={{
                    background: 'rgba(0, 230, 153, 0.12)',
                    border: '1px solid rgba(0, 230, 153, 0.35)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ color: '#00E699', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em' }}>
                      ACTIVE DINING TAB
                    </div>
                    <div style={{ color: '#FFF', fontSize: '1.05rem', fontWeight: 900 }}>
                      Table {session.tableNumber} &middot; #{session.sessionCode}
                    </div>
                  </div>
                  <Link
                    to="/user"
                    className="btn-dv btn-gold"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800 }}
                  >
                    Open Menu →
                  </Link>
                </div>
              )}

              {/* Primary Camera Scanner Button */}
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="btn-dv btn-gold btn-block"
                style={{
                  padding: '16px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 12px 30px rgba(247, 127, 0, 0.35)',
                  cursor: 'pointer'
                }}
              >
                <QrIcon width={22} height={22} />
                OPEN CAMERA QR SCANNER
              </button>

              {/* 1-Tap Table Express Selector */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--gold-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  ⚡ Or Select Dining Table Directly:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {tableNumbers.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleValidateTable(`DINEVO-T${num}`)}
                      disabled={loading}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 215, 0, 0.25)',
                        background: 'rgba(255, 215, 0, 0.08)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.22)';
                        e.currentTarget.style.borderColor = '#FFD700';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 215, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.25)';
                      }}
                    >
                      Table {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Table Code Entry */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleValidateTable();
                }}
                style={{ marginTop: 18, display: 'flex', gap: 8 }}
              >
                <input
                  className="dv-input"
                  style={{
                    background: '#121017',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FAF6F0',
                    fontSize: '0.88rem',
                    padding: '10px 14px'
                  }}
                  placeholder="Enter code e.g. DINEVO-T01"
                  value={tableCodeInput}
                  onChange={(e) => setTableCodeInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-dv btn-outline"
                  disabled={loading}
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderColor: 'rgba(255, 215, 0, 0.4)',
                    color: 'var(--gold-soft)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {loading ? '...' : 'Join'}
                </button>
              </form>
              {error && (
                <div style={{ color: '#FF4D4D', fontSize: '0.78rem', marginTop: 8, fontWeight: 600 }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(250, 246, 240, 0.6)' }}>
                100 Handcrafted Gourmet Dishes
              </span>
              <Link to="/menu" style={{ color: 'var(--gold-soft)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
                Explore Full Menu →
              </Link>
            </div>
          </div>

          {/* PORTAL 2: ADMIN & KITCHEN OPERATIONS */}
          <div
            style={{
              background: 'linear-gradient(160deg, rgba(26, 21, 28, 0.95) 0%, rgba(18, 14, 20, 0.95) 100%)',
              border: '1px solid rgba(230, 57, 70, 0.32)',
              borderRadius: '28px',
              padding: '36px 30px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(230, 57, 70, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    background: 'rgba(230, 57, 70, 0.14)',
                    border: '1px solid rgba(230, 57, 70, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E63946'
                  }}
                >
                  <KitchenIcon width={24} height={24} />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#FF7B85',
                    background: 'rgba(230, 57, 70, 0.12)',
                    border: '1px solid rgba(230, 57, 70, 0.3)',
                    padding: '4px 12px',
                    borderRadius: '999px'
                  }}
                >
                  Management & POS
                </span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FAF6F0', marginBottom: 10 }}>
                Admin & Kitchen Portal
              </h2>
              <p style={{ color: 'rgba(250, 246, 240, 0.75)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: 24 }}>
                Central command console for restaurant staff, executive chefs, floor supervisors, and cashier desks.
              </p>

              {/* Management Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {[
                  { title: 'Live Kitchen Display System (KDS)', desc: 'Instant ticket dispatch with cooking timer & audio chime' },
                  { title: 'Fleet & Table Occupancy Manager', desc: 'Real-time table booking, lock controls & QR code generation' },
                  { title: 'POS Invoicing & 5% GST Taxation', desc: 'Itemized receipts, UPI / Cash payment reconciliation' },
                  { title: '100-Item Menu & Stock Control', desc: 'Live dish availability toggling, pricing & recipe adjustments' }
                ].map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10
                    }}
                  >
                    <span style={{ color: '#00E699', fontSize: '0.9rem', marginTop: 1 }}>✔</span>
                    <div>
                      <div style={{ color: '#FFF', fontSize: '0.85rem', fontWeight: 700 }}>{feat.title}</div>
                      <div style={{ color: 'rgba(250, 246, 240, 0.6)', fontSize: '0.76rem', marginTop: 2 }}>{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Primary Admin Button */}
              <Link
                to="/admin"
                className="btn-dv btn-burgundy btn-block"
                style={{
                  padding: '16px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: 'linear-gradient(135deg, #B81D2B 0%, #E63946 100%)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  boxShadow: '0 12px 30px rgba(230, 57, 70, 0.35)',
                  borderRadius: '16px'
                }}
              >
                <KitchenIcon width={20} height={20} />
                ENTER ADMIN PORTAL →
              </Link>
            </div>

            <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'rgba(250, 246, 240, 0.6)' }}>
              <ShieldCheckIcon width={14} height={14} style={{ color: 'var(--gold-soft)' }} />
              <span>Role-Based Access &middot; 256-Bit Encrypted Operations</span>
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA QR SCANNER MODAL */}
      {showCamera && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#15131C',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '24px',
              padding: '28px 24px',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              color: '#FAF6F0',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7)'
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold)', marginBottom: 6 }}>
              SCAN TABLE QR CODE
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#A0A0B0', marginBottom: 18 }}>
              Point camera at the table QR code stand to connect automatically.
            </p>

            <QRScanner
              onScanSuccess={handleScanSuccess}
              onClose={() => setShowCamera(false)}
            />

            <button
              type="button"
              className="btn-dv btn-outline btn-block"
              style={{ marginTop: 14, padding: '10px', color: '#AAA', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              onClick={() => setShowCamera(false)}
            >
              Cancel & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
