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
        padding: '24px 20px 32px',
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

      {/* ============================================================ */}
      {/* TOP-RIGHT CORNER: EXECUTIVE STAFF & KITCHEN CONSOLE */}
      {/* ============================================================ */}
      <div className="dv-staff-corner-pill">
        <Link
          to="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 18px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(30, 20, 26, 0.92) 0%, rgba(20, 15, 20, 0.95) 100%)',
            border: '1px solid rgba(230, 57, 70, 0.45)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(230, 57, 70, 0.15)',
            color: '#FAF6F0',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#E63946';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(230, 57, 70, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'rgba(230, 57, 70, 0.45)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(230, 57, 70, 0.15)';
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B81D2B 0%, #E63946 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 2px 8px rgba(230, 57, 70, 0.4)'
            }}
          >
            <KitchenIcon width={16} height={16} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.04em', color: '#FFF' }}>
                Admin & Kitchen
              </span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00E699',
                  boxShadow: '0 0 8px #00E699'
                }}
              />
            </div>
            <div style={{ fontSize: '0.68rem', color: '#FF7B85', fontWeight: 600 }}>
              Staff Console &middot; KDS &middot; POS
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', marginLeft: 4 }}>→</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* CENTER HERO: SOLE HIGHLIGHTED QR CODE DINING PASS */}
      {/* ============================================================ */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Soft Gold Halo Effect behind the card */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -45%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.18) 0%, rgba(247, 127, 0, 0.08) 40%, transparent 70%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
            zIndex: -1
          }}
        />

        {/* Brand Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 16px',
            borderRadius: '999px',
            background: 'rgba(255, 215, 0, 0.12)',
            border: '1px solid rgba(255, 215, 0, 0.35)',
            color: 'var(--gold-soft)',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 8
          }}
        >
          ★ TABLE {selectedTable} CONTACTLESS PASS ★
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.9rem, 3.6vw, 2.6rem)',
            fontWeight: 800,
            color: '#FAF6F0',
            lineHeight: 1.15,
            margin: '0 auto 6px',
            letterSpacing: '-0.01em'
          }}
        >
          Scan to Order &amp; Dine
        </h1>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'rgba(250, 246, 240, 0.78)',
            maxWidth: '440px',
            margin: '0 auto 16px',
            lineHeight: 1.45
          }}
        >
          Point your smartphone camera at the pass below to browse our 100-dish menu and order directly to your table.
        </p>

        {/* ============================================================ */}
        {/* THE HIGHLIGHTED QR CODE DISPLAY STAND */}
        {/* ============================================================ */}
        <div
          className="dv-qr-stand-glow"
          style={{
            width: '100%',
            maxWidth: '400px',
            background: 'linear-gradient(165deg, rgba(26, 23, 34, 0.96) 0%, rgba(16, 14, 22, 0.98) 100%)',
            border: '1.5px solid rgba(255, 215, 0, 0.4)',
            borderRadius: '26px',
            padding: '20px 20px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Card Top Sub-Header: Table & Live Status */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: '1px solid rgba(255, 215, 0, 0.18)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  background: 'rgba(255, 215, 0, 0.12)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold)'
                }}
              >
                <QrIcon width={15} height={15} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FAF6F0', display: 'block' }}>
                  Dining Table {selectedTable}
                </span>
                <span style={{ fontSize: '0.66rem', color: 'var(--gold-soft)', fontWeight: 600 }}>
                  DINEVO Grand Gastronomy
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 9px',
                borderRadius: '999px',
                background: 'rgba(0, 230, 153, 0.12)',
                border: '1px solid rgba(0, 230, 153, 0.35)',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#00E699'
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00E699',
                  boxShadow: '0 0 6px #00E699'
                }}
              />
              Live &amp; Ready
            </div>
          </div>

          {/* CRISP WHITE QR CODE BOX - HIGH CONTRAST FOR IMMEDIATE PHONE FOCUS */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '16px 16px 12px',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.65)',
              border: '3px solid #FFD700',
              textAlign: 'center',
              width: '240px',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <img
              src={qrImageSrc}
              alt={`Table ${selectedTable} QR Code`}
              style={{
                width: '195px',
                height: '195px',
                display: 'block',
                margin: '0 auto',
                borderRadius: '10px'
              }}
            />
            <div
              style={{
                color: '#14121A',
                fontSize: '0.92rem',
                fontWeight: 900,
                marginTop: 8,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              TABLE {selectedTable} PASS
            </div>
            <div style={{ color: '#555555', fontSize: '0.74rem', fontWeight: 700, marginTop: 2 }}>
              📱 Scan with your phone camera
            </div>
          </div>

          {/* TABLE SELECTOR PILLS */}
          <div style={{ width: '100%', marginTop: 14 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6
              }}
            >
              <span style={{ fontSize: '0.74rem', color: 'rgba(250, 246, 240, 0.7)', fontWeight: 700 }}>
                Select Table to Switch QR:
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--gold-soft)', fontWeight: 700 }}>
                Fleet: 8 Tables
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
              {tableNumbers.map((num) => {
                const isSelected = selectedTable === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedTable(num)}
                    style={{
                      padding: '7px 2px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #FFD700' : '1px solid rgba(255, 215, 0, 0.18)',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.35) 0%, rgba(247, 127, 0, 0.35) 100%)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#FFD700' : 'rgba(250, 246, 240, 0.85)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 0 12px rgba(255, 215, 0, 0.25)' : 'none'
                    }}
                  >
                    Table {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DIRECT OPEN ACTION */}
          <button
            type="button"
            onClick={() => handleValidateTable(`DINEVO-T${selectedTable}`)}
            disabled={loading}
            className="btn-dv btn-gold"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 800,
              marginTop: 14,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 8px 22px rgba(255, 215, 0, 0.22)'
            }}
          >
            {loading ? <span className="dv-spinner" /> : `OPEN TABLE ${selectedTable} ON THIS SCREEN →`}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM PROFESSIONAL UTILITY BAR / CORNER DOCK */}
      {/* ============================================================ */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 12,
          maxWidth: '650px',
          width: '100%',
          padding: '8px 16px',
          borderRadius: '16px',
          background: 'rgba(20, 18, 25, 0.82)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Network Target Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.74rem'
          }}
        >
          <span style={{ color: 'var(--gold-soft)', fontWeight: 700 }}>Scan URL:</span>
          <span
            style={{
              color: 'rgba(250, 246, 240, 0.7)',
              fontFamily: 'monospace',
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={currentQrUrl}
          >
            {currentQrUrl}
          </span>
          {lanIp && lanIp !== 'localhost' && (
            <button
              type="button"
              onClick={() => setNetworkTarget(networkTarget === 'lan' ? 'origin' : 'lan')}
              title="Toggle between Wi-Fi LAN IP and Localhost"
              style={{
                background: networkTarget === 'lan' ? 'rgba(0, 230, 153, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                border: networkTarget === 'lan' ? '1px solid #00E699' : '1px solid rgba(255, 255, 255, 0.2)',
                color: networkTarget === 'lan' ? '#00E699' : '#FFF',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {networkTarget === 'lan' ? '📶 Wi-Fi IP' : '💻 Local'}
            </button>
          )}
        </div>

        <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Webcam Scanner for physical printed paper passes */}
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(250, 246, 240, 0.85)',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250, 246, 240, 0.85)')}
        >
          <QrIcon width={14} height={14} /> Webcam Scanner
        </button>

        <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Link to Full Menu */}
        <Link
          to="/menu"
          style={{
            color: 'var(--gold-soft)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          Explore 100 Dishes →
        </Link>
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
