import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import QRScanner from '../components/QRScanner';
import { QrIcon, KitchenIcon, ShieldCheckIcon } from '../components/Icons';

export default function Home() {
  const { session, startSession } = useCart();
  const navigate = useNavigate();

  const [selectedTable, setSelectedTable] = useState('01');
  const [lanIp, setLanIp] = useState(() => sessionStorage.getItem('dinevo_lan_ip') || '10.162.218.218');
  const [networkTarget, setNetworkTarget] = useState('lan'); // 'lan', 'origin', 'hosted'
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Available dining tables fleet
  const tableNumbers = ['01', '02', '03', '04', '05', '06', '07', '08'];

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        if (res.data?.lanIp) {
          setLanIp(res.data.lanIp);
          sessionStorage.setItem('dinevo_lan_ip', res.data.lanIp);
        }
      })
      .catch(() => {});
  }, []);

  // Compute the URL encoded in the live QR code
  const getQrTargetUrl = (tableNum, targetMode = networkTarget) => {
    const code = `DINEVO-T${String(tableNum).padStart(2, '0')}`;
    const port = window.location.port || '3000';
    const proto = window.location.protocol;

    if (targetMode === 'hosted') {
      return `https://blessingbrysonhongpmk.github.io/dinevo/#/table/${code}`;
    }

    if (targetMode === 'lan' && lanIp && lanIp !== 'localhost' && lanIp !== '127.0.0.1') {
      return `${proto}//${lanIp}:${port}/table/${code}`;
    }

    // Default to origin (e.g. https://localhost:3000 or production domain)
    return `${window.location.origin}/table/${code}`;
  };

  const currentQrUrl = getQrTargetUrl(selectedTable);
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=10&data=${encodeURIComponent(currentQrUrl)}`;

  const handleValidateTable = async (codeToValidate) => {
    const clean = (codeToValidate || `DINEVO-T${selectedTable}`).trim().toUpperCase();
    setLoading(true);

    try {
      const res = await api.get(`/tables/code/${clean}`);
      const tData = res.data.data || res.data;
      const targetCode = tData?.tableCode || clean;

      try {
        const bookRes = await api.patch(`/tables/${targetCode}/book`);
        const sess = bookRes.data.session || {
          sessionCode: `S-${Date.now().toString().slice(-4)}`,
          tableNumber: bookRes.data.table?.tableNumber || tData?.tableNumber || selectedTable,
          tableCode: targetCode,
          restaurantId: bookRes.data.restaurantId || tData?.restaurantId,
          restaurantName: bookRes.data.restaurantName || tData?.restaurantName || 'DINEVO Grand Dining House',
          verified: true
        };
        startSession(sess);
      } catch {
        startSession({
          sessionCode: `S-${Date.now().toString().slice(-4)}`,
          tableNumber: tData?.tableNumber || clean.replace(/[^0-9]/g, '') || selectedTable,
          tableCode: targetCode,
          restaurantId: tData?.restaurantId,
          restaurantName: tData?.restaurantName || 'DINEVO Grand Dining House',
          verified: true
        });
      }
      navigate('/user');
    } catch {
      // Fallback in-memory session start
      const fallbackNum = clean.replace(/[^0-9]/g, '') || selectedTable;
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
        padding: '40px 20px 60px',
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

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1100px' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
              marginBottom: 14
            }}
          >
            ★ DINEVO GRAND DINING & OPERATIONS ★
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              color: '#FAF6F0',
              lineHeight: 1.18,
              margin: '0 auto 12px',
              maxWidth: '820px',
              letterSpacing: '-0.01em'
            }}
          >
            Scan to Order & Kitchen Operations
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
              color: 'rgba(250, 246, 240, 0.82)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Scan the live table QR code below with your mobile phone camera to start dining, or enter the executive admin portal.
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
          {/* ============================================================ */}
          {/* PORTAL 1: LIVE SCANNABLE TABLE QR CODE (FOR MOBILE CAMERA) */}
          {/* ============================================================ */}
          <div
            style={{
              background: 'linear-gradient(160deg, rgba(26, 23, 34, 0.96) 0%, rgba(18, 16, 24, 0.96) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.28)',
              borderRadius: '28px',
              padding: '32px 26px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 215, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div>
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      background: 'rgba(255, 215, 0, 0.12)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)'
                    }}
                  >
                    <QrIcon width={22} height={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FAF6F0', margin: 0 }}>
                      Table QR Scanner
                    </h2>
                    <span style={{ fontSize: '0.74rem', color: 'var(--gold-soft)', fontWeight: 600 }}>
                      Live Scannable Mobile Code
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-soft)',
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    padding: '4px 12px',
                    borderRadius: '999px'
                  }}
                >
                  Table {selectedTable}
                </span>
              </div>

              {/* LIVE SCANNABLE QR CODE DISPLAY CARD */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '22px',
                  padding: '18px',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
                  border: '3px solid var(--gold)',
                  textAlign: 'center',
                  maxWidth: '260px',
                  margin: '0 auto 18px',
                  position: 'relative'
                }}
              >
                <img
                  src={qrImageSrc}
                  alt={`Table ${selectedTable} QR Code`}
                  style={{
                    width: '210px',
                    height: '210px',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '10px'
                  }}
                />
                <div style={{ color: '#16141D', fontSize: '0.92rem', fontWeight: 900, marginTop: 10, letterSpacing: '0.06em' }}>
                  TABLE {selectedTable} DINING PASS
                </div>
                <div style={{ color: '#666666', fontSize: '0.74rem', fontWeight: 700, marginTop: 2 }}>
                  📱 Scan with your phone camera
                </div>
              </div>

              {/* Table Selector Pills */}
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <span style={{ fontSize: '0.76rem', color: 'rgba(250, 246, 240, 0.7)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                  Tap to switch table QR code:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                  {tableNumbers.map((num) => {
                    const isSelected = selectedTable === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedTable(num)}
                        style={{
                          padding: '8px 2px',
                          borderRadius: '10px',
                          border: isSelected ? '1px solid #FFD700' : '1px solid rgba(255, 215, 0, 0.2)',
                          background: isSelected ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(247, 127, 0, 0.3) 100%)' : 'rgba(255, 215, 0, 0.06)',
                          color: isSelected ? '#FFD700' : '#FAF6F0',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Table {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Network Scan Target Indicator / Selector */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  fontSize: '0.74rem'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--gold-soft)', fontWeight: 700 }}>Target: </span>
                  <span style={{ color: 'rgba(250, 246, 240, 0.75)', fontFamily: 'monospace' }}>
                    {currentQrUrl}
                  </span>
                </div>
                {lanIp && lanIp !== 'localhost' && (
                  <button
                    type="button"
                    onClick={() => setNetworkTarget(networkTarget === 'lan' ? 'origin' : 'lan')}
                    title="Toggle between Wi-Fi LAN IP and Localhost"
                    style={{
                      background: networkTarget === 'lan' ? 'rgba(0, 230, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: networkTarget === 'lan' ? '1px solid #00E699' : '1px solid rgba(255, 255, 255, 0.2)',
                      color: networkTarget === 'lan' ? '#00E699' : '#FFF',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {networkTarget === 'lan' ? '📶 Wi-Fi IP' : '💻 Local'}
                  </button>
                )}
              </div>

              {/* Action Buttons: Open on this PC or Use Webcam */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleValidateTable(`DINEVO-T${selectedTable}`)}
                  disabled={loading}
                  className="btn-dv btn-gold"
                  style={{
                    flex: '1 1 160px',
                    padding: '13px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? <span className="dv-spinner" /> : `OPEN TABLE ${selectedTable} →`}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="btn-dv btn-outline"
                  style={{
                    padding: '13px 18px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#FAF6F0',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                >
                  <QrIcon width={16} height={16} /> Webcam Scanner
                </button>
              </div>
            </div>

            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: 'rgba(250, 246, 240, 0.6)' }}>
                100 Handcrafted Gourmet Dishes
              </span>
              <Link to="/menu" style={{ color: 'var(--gold-soft)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 700 }}>
                Explore Full Menu →
              </Link>
            </div>
          </div>

          {/* ============================================================ */}
          {/* PORTAL 2: ADMIN & KITCHEN OPERATIONS */}
          {/* ============================================================ */}
          <div
            style={{
              background: 'linear-gradient(160deg, rgba(26, 21, 28, 0.96) 0%, rgba(18, 14, 20, 0.96) 100%)',
              border: '1px solid rgba(230, 57, 70, 0.32)',
              borderRadius: '28px',
              padding: '32px 26px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(230, 57, 70, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      background: 'rgba(230, 57, 70, 0.14)',
                      border: '1px solid rgba(230, 57, 70, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#E63946'
                    }}
                  >
                    <KitchenIcon width={22} height={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FAF6F0', margin: 0 }}>
                      Admin & Kitchen
                    </h2>
                    <span style={{ fontSize: '0.74rem', color: '#FF7B85', fontWeight: 600 }}>
                      Central Operations Console
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#FF7B85',
                    background: 'rgba(230, 57, 70, 0.12)',
                    border: '1px solid rgba(230, 57, 70, 0.3)',
                    padding: '4px 12px',
                    borderRadius: '999px'
                  }}
                >
                  Staff Portal
                </span>
              </div>

              <p style={{ color: 'rgba(250, 246, 240, 0.75)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: 24 }}>
                Central command console for restaurant staff, executive chefs, floor supervisors, and cashier desks.
              </p>

              {/* Management Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {[
                  { title: 'Live Kitchen Display System (KDS)', desc: 'Instant ticket dispatch with cooking timer & audio chime alerts' },
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

            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'rgba(250, 246, 240, 0.6)' }}>
              <ShieldCheckIcon width={14} height={14} style={{ color: 'var(--gold-soft)' }} />
              <span>Role-Based Access &middot; 256-Bit Encrypted Operations</span>
            </div>
          </div>
        </div>
      </div>

      {/* WEBCAM CAMERA QR SCANNER MODAL */}
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
              SCAN PHYSICAL TABLE QR
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#A0A0B0', marginBottom: 18 }}>
              Point your camera at a printed table QR stand to connect automatically.
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
