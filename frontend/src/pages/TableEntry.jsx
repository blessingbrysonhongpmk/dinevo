import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { QrIcon, ShieldCheckIcon } from '../components/Icons';
import QRScanner from '../components/QRScanner';

export default function TableEntry() {
  const { tableCode: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('table');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [invalidQr, setInvalidQr] = useState(false);
  const [occupiedErr, setOccupiedErr] = useState(false);
  const [verifiedTable, setVerifiedTable] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const navigate = useNavigate();
  const { startSession, session } = useCart();

  useEffect(() => {
    const checkDevice = () => {
      const isLargeScreen = window.innerWidth > 768;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsDesktop(isLargeScreen && !hasTouch);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const resolveTable = async (tCode) => {
    if (!tCode) return;
    setLoading(true);
    setInvalidQr(false);
    setOccupiedErr(false);
    try {
      // First book/attach session via backend
      const bookRes = await api.patch(`/tables/${tCode}/book`);
      if (bookRes.data.success) {
        startSession(bookRes.data.session);
        setVerifiedTable(bookRes.data.session);
        setScanning(false);
        return;
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setOccupiedErr(true);
        setLoading(false);
        return;
      }
    }

    // Try fallback session lookup
    try {
      const res = await api.post('/sessions', { tableCode: tCode });
      startSession(res.data);
      setVerifiedTable(res.data);
      setScanning(false);
    } catch {
      setInvalidQr(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const codeToTry = paramCode || queryCode;
    if (codeToTry) {
      setCode(codeToTry);
      resolveTable(codeToTry.toUpperCase());
    } else if (session?.verified) {
      setVerifiedTable(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCode, queryCode]);

  const handleScanSuccess = (scannedCode) => {
    if (scannedCode) {
      setCode(scannedCode);
      resolveTable(scannedCode);
    }
  };

  return (
    <div className="dv-entry-wrap" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="container-dv" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="dv-entry-card" style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', border: '2px solid #E5DECF', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
          {/* VERIFIED TABLE STATE */}
          {verifiedTable ? (
            <div style={{ textAlign: 'center' }}>
              <div className="dv-logo" style={{ fontSize: '1.8rem', marginBottom: 12 }}>
                DINE<span style={{ color: 'var(--gold, #F77F00)' }}>VO</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(6,214,160,0.14)',
                  color: '#048A65',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  padding: '8px 20px',
                  borderRadius: '999px',
                  marginBottom: 16
                }}
              >
                <ShieldCheckIcon width={18} height={18} /> ✓ TABLE VERIFIED
              </div>

              <h2 style={{ fontSize: '2.4rem', marginTop: 4, color: '#1A1721', fontWeight: 800 }}>
                TABLE {verifiedTable.tableNumber}
              </h2>

              <p style={{ color: '#666666', marginTop: 6, fontSize: '0.95rem' }}>
                Welcome to your table at <strong>{verifiedTable.restaurantName || 'DINEVO Kitchen'}</strong>.
              </p>

              <button
                className="btn-dv btn-burgundy btn-block"
                style={{ fontSize: '1.1rem', padding: '15px 28px', fontWeight: 800, marginTop: 24 }}
                onClick={() => navigate('/user')}
              >
                VIEW MENU
              </button>
            </div>
          ) : occupiedErr ? (
            /* TABLE OCCUPIED STATE */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 10 }}>🔒</div>
              <h2 style={{ fontSize: '1.6rem', color: '#E63946', fontWeight: 800 }}>
                TABLE UNAVAILABLE
              </h2>
              <p style={{ color: '#555555', fontSize: '0.92rem', marginTop: 8, marginBottom: 24 }}>
                This table is currently occupied by another active dining session.
              </p>
              <Link to="/demo" className="btn-dv btn-gold btn-block" style={{ padding: '14px', fontWeight: 800 }}>
                OPEN USER PANEL PROTOTYPE
              </Link>
            </div>
          ) : invalidQr ? (
            /* INVALID QR STATE */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', color: '#E63946', marginBottom: 10 }}>✕</div>
              <h2 style={{ fontSize: '1.6rem', color: '#E63946', fontWeight: 800 }}>
                INVALID TABLE QR
              </h2>
              <p style={{ color: '#555555', fontSize: '0.92rem', marginTop: 8, marginBottom: 24 }}>
                This QR code is not recognized by DINEVO.
              </p>
              <Link to="/demo" className="btn-dv btn-gold btn-block" style={{ padding: '14px', fontWeight: 800 }}>
                OPEN USER PANEL PROTOTYPE
              </Link>
            </div>
          ) : scanning ? (
            /* ACTIVE MOBILE CAMERA SCANNER */
            <div>
              <h2 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: 14 }}>
                SCAN YOUR TABLE QR
              </h2>
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onClose={() => setScanning(false)}
              />
            </div>
          ) : (
            /* DESKTOP / MOBILE NEW LANDING CARD */
            <div style={{ textAlign: 'center' }}>
              <div className="dv-logo" style={{ fontSize: '2.4rem', marginBottom: 2 }}>
                DINE<span style={{ color: 'var(--gold, #F77F00)' }}>VO</span>
              </div>
              <div style={{ fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#666', fontWeight: 700, marginBottom: 20 }}>
                PREMIUM DIGITAL DINING
              </div>

              <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
                Scan your table. Choose your food. Pay securely. We'll serve it to your table.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  className="btn-dv btn-gold btn-block"
                  style={{ padding: '14px', fontSize: '1rem', fontWeight: 800 }}
                  onClick={() => {
                    if (isDesktop) {
                      setShowQrModal(true);
                    } else {
                      setScanning(true);
                    }
                  }}
                >
                  <QrIcon width={18} height={18} /> SCAN TABLE QR
                </button>

                <Link
                  to="/demo"
                  className="btn-dv btn-outline btn-block"
                  style={{ padding: '14px', fontSize: '1rem', fontWeight: 800 }}
                >
                  OPEN USER PANEL (DEMO)
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP QR SCAN EXPLANATION MODAL */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', textAlign: 'center', color: '#1A1721', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📱</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 10 }}>SCAN TABLE QR CODE</h3>
            <p style={{ fontSize: '0.92rem', color: '#555555', lineHeight: 1.5, marginBottom: 24 }}>
              Use your phone camera to scan the physical QR code placed on your restaurant table.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/demo" className="btn-dv btn-gold btn-block" onClick={() => setShowQrModal(false)}>
                Open User Panel Prototype
              </Link>
              <button className="btn-dv btn-outline btn-block" onClick={() => setShowQrModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
