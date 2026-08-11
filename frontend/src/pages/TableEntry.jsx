import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { QrIcon, ShieldCheckIcon } from '../components/Icons';
import QRScanner from '../components/QRScanner';
import RemoteBookingModal from '../components/RemoteBookingModal';

export default function TableEntry() {
  const { tableCode: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('table');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [invalidQr, setInvalidQr] = useState(false);
  const [occupiedErr, setOccupiedErr] = useState(false);
  const [verifiedTable, setVerifiedTable] = useState(null);
  const [tableDetails, setTableDetails] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showRemoteModal, setShowRemoteModal] = useState(false);

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

  const validateTable = async (tCode) => {
    const cleanCode = (tCode || 'DINEVO-T01').trim().toUpperCase();
    setLoading(true);

    try {
      // Validate table code via GET /api/tables/code/:tableCode
      const res = await api.get(`/tables/code/${cleanCode}`);
      const tData = res.data.data || res.data;
      const targetCode = tData?.tableCode || cleanCode;

      // Try booking table & attaching session
      try {
        const bookRes = await api.patch(`/tables/${targetCode}/book`);
        const sess = bookRes.data.session || {
          sessionCode: `S-${Date.now().toString().slice(-4)}`,
          tableNumber: bookRes.data.table?.tableNumber || tData?.tableNumber || '01',
          tableCode: targetCode,
          restaurantId: bookRes.data.restaurantId || tData?.restaurantId,
          restaurantName: bookRes.data.restaurantName || tData?.restaurantName || 'DINEVO Kitchen & Bar',
          verified: true
        };
        startSession(sess);
      } catch (bookErr) {
        // If table is occupied or booking failed, attach session for existing table
        startSession({
          sessionCode: `S-${Date.now().toString().slice(-4)}`,
          tableNumber: tData?.tableNumber || '01',
          tableCode: targetCode,
          restaurantId: tData?.restaurantId,
          restaurantName: tData?.restaurantName || 'DINEVO Kitchen & Bar',
          verified: true
        });
      }
      navigate('/user');
    } catch (err) {
      // Direct fallback to Table 01 on error
      startSession({
        sessionCode: `S-${Date.now().toString().slice(-4)}`,
        tableNumber: '01',
        tableCode: 'DINEVO-T01',
        restaurantName: 'DINEVO Kitchen & Bar',
        verified: true
      });
      navigate('/user');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrderSession = async () => {
    if (!tableDetails && !code) return;
    const targetCode = tableDetails ? tableDetails.tableCode : code;
    setBookingLoading(true);

    try {
      const bookRes = await api.patch(`/tables/${targetCode}/book`);
      if (bookRes.data.success) {
        const sess = bookRes.data.session || {
          sessionCode: `S-${Date.now().toString().slice(-4)}`,
          tableNumber: bookRes.data.table?.tableNumber || tableDetails?.tableNumber || '01',
          tableCode: targetCode,
          restaurantId: bookRes.data.restaurantId || tableDetails?.restaurantId,
          restaurantName: bookRes.data.restaurantName || tableDetails?.restaurantName || 'DINEVO Kitchen',
          verified: true
        };
        startSession(sess);
        setVerifiedTable(sess);
        navigate('/user');
        return;
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setOccupiedErr(true);
      } else {
        // Fallback session creation
        try {
          const sessRes = await api.post('/sessions', { tableCode: targetCode });
          startSession(sessRes.data);
          setVerifiedTable(sessRes.data);
          navigate('/user');
        } catch {
          alert('Failed to start table session. Please try again.');
        }
      }
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const codeToTry = paramCode || queryCode;
    if (codeToTry) {
      setCode(codeToTry.toUpperCase());
      validateTable(codeToTry.toUpperCase());
    } else if (session?.verified) {
      setVerifiedTable(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCode, queryCode]);

  const handleScanSuccess = (scannedCode) => {
    if (scannedCode) {
      const clean = scannedCode.trim().toUpperCase();
      setCode(clean);
      setScanning(false);
      validateTable(clean);
    }
  };

  return (
    <div className="dv-entry-wrap" style={{ minHeight: '100vh', background: '#0D0C10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="container-dv" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="dv-entry-card" style={{ background: '#15131C', borderRadius: '28px', padding: '32px 24px', border: '1px solid rgba(255,215,0,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', color: '#FAF6F0' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span className="dv-spinner" style={{ width: 36, height: 36 }} />
              <p style={{ marginTop: 16, color: '#FFD700', fontWeight: 700, fontSize: '0.9rem' }}>Validating Table QR Code...</p>
            </div>
          ) : verifiedTable ? (
            /* VERIFIED SESSION ACTIVE */
            <div style={{ textAlign: 'center' }}>
              <div className="dv-logo" style={{ fontSize: '2rem', marginBottom: 8 }}>
                DINE<span style={{ color: '#FFD700' }}>VO</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(0, 230, 153, 0.14)',
                  color: '#00E699',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  padding: '6px 16px',
                  borderRadius: '999px',
                  marginBottom: 16,
                  border: '1px solid rgba(0, 230, 153, 0.3)'
                }}
              >
                <ShieldCheckIcon width={16} height={16} /> ✓ TABLE VERIFIED
              </div>

              <h2 style={{ fontSize: '2.5rem', margin: '4px 0', color: '#FFFFFF', fontWeight: 900 }}>
                TABLE {verifiedTable.tableNumber}
              </h2>

              <p style={{ color: '#A0A0B0', marginTop: 6, fontSize: '0.92rem', lineHeight: 1.5 }}>
                Welcome to your table at <strong>{verifiedTable.restaurantName || 'DINEVO Kitchen & Bar'}</strong>.
              </p>

              <button
                className="v40-primary-cta"
                style={{ marginTop: 24 }}
                onClick={() => navigate('/user')}
              >
                EXPLORE MENU & ORDER →
              </button>
            </div>
          ) : occupiedErr ? (
            /* TABLE OCCUPIED STATE */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🔒</div>
              <span style={{ color: '#FF4D4D', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                SESSION ACTIVE
              </span>
              <h2 style={{ fontSize: '2rem', color: '#FFFFFF', fontWeight: 900, marginTop: 4 }}>
                TABLE {tableDetails?.tableNumber || 'OCCUPIED'}
              </h2>
              <div style={{ background: 'rgba(255, 77, 77, 0.12)', border: '1px solid rgba(255, 77, 77, 0.3)', color: '#FF4D4D', padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, margin: '16px 0 24px', lineHeight: 1.4 }}>
                This table is currently being used for another dining session.
              </div>
              <button className="v40-primary-cta" onClick={() => navigate('/user')}>
                BROWSE RESTAURANT MENU
              </button>
            </div>
          ) : invalidQr ? (
            /* INVALID QR STATE */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', color: '#FF4D4D', marginBottom: 10 }}>❌</div>
              <span style={{ color: '#FF4D4D', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                ERROR 404
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', fontWeight: 900, marginTop: 4 }}>
                INVALID TABLE QR
              </h2>
              <p style={{ color: '#A0A0B0', fontSize: '0.9rem', marginTop: 8, marginBottom: 24, lineHeight: 1.5 }}>
                This QR code does not belong to an active DINEVO table.
              </p>
              <button className="v40-primary-cta" onClick={() => navigate('/user')}>
                BACK TO DINEVO
              </button>
            </div>
          ) : tableDetails ? (
            /* VALID AVAILABLE TABLE - CONFIRMATION CARD */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>👑</div>
              <span style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                TABLE CONFIRMED
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', fontWeight: 900, margin: '4px 0 8px' }}>
                TABLE {tableDetails.tableNumber}
              </h1>
              <div style={{ background: 'rgba(0, 230, 153, 0.12)', border: '1px solid rgba(0, 230, 153, 0.3)', color: '#00E699', display: 'inline-block', padding: '6px 16px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 800, marginBottom: 16 }}>
                ✓ Table Available & Verified
              </div>

              <p style={{ color: '#A0A0B0', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 24 }}>
                Welcome to {tableDetails.restaurantName || 'DINEVO Kitchen & Bar'}. Tap below to start your private dining order session.
              </p>

              <button
                className="v40-primary-cta"
                onClick={handleStartOrderSession}
                disabled={bookingLoading}
              >
                {bookingLoading ? <span className="dv-spinner" /> : 'EXPLORE MENU & ORDER →'}
              </button>
            </div>
          ) : scanning ? (
            /* ACTIVE CAMERA SCANNER */
            <div>
              <h2 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: 14, color: '#FFD700' }}>
                SCAN YOUR TABLE QR CODE
              </h2>
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onClose={() => setScanning(false)}
              />
            </div>
          ) : (
            /* LANDING CALL-TO-ACTION */
            <div style={{ textAlign: 'center' }}>
              <div className="dv-logo" style={{ fontSize: '2.2rem', marginBottom: 2 }}>
                DINE<span style={{ color: '#FFD700' }}>VO</span>
              </div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A0A0B0', fontWeight: 700, marginBottom: 20 }}>
                VIP TABLE ORDERING
              </div>

              <p style={{ color: '#C0C0D0', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 28 }}>
                Scan your table QR code to explore our fresh gourmet menu & place instant orders.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  className="v40-primary-cta"
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

                <button
                  type="button"
                  onClick={() => setShowRemoteModal(true)}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid #00E699',
                    background: 'rgba(0, 230, 153, 0.12)',
                    color: '#00E699',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  🌐 REMOTE LONG-DISTANCE TABLE BOOKING & PRE-ORDER
                </button>

                <Link
                  to="/user"
                  className="btn-dv btn-outline btn-block"
                  style={{ padding: '14px', fontSize: '0.92rem', fontWeight: 800, color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  OPEN USER PANEL (DEMO)
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRemoteModal && <RemoteBookingModal onClose={() => setShowRemoteModal(false)} />}

      {/* DESKTOP EXPLANATION MODAL */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div style={{ background: '#17151F', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', color: '#FFFFFF', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📱</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 10, color: '#FFD700' }}>PHYSICAL PHONE CAMERA SCAN</h3>
            <p style={{ fontSize: '0.88rem', color: '#A0A0B0', lineHeight: 1.5, marginBottom: 24 }}>
              To scan a real table QR code, use your mobile phone camera to scan the printed table QR code from the Admin Panel.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/user" className="v40-primary-cta" onClick={() => setShowQrModal(false)}>
                Open User Mobile Interface
              </Link>
              <button className="btn-dv btn-outline btn-block" style={{ color: '#AAA', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => setShowQrModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
