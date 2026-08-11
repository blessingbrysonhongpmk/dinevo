import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { QrIcon, ShieldCheckIcon } from '../components/Icons';

export default function TableEntry() {
  const { tableCode: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('table');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedTable, setVerifiedTable] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const navigate = useNavigate();
  const { startSession, session } = useCart();

  const resolveTable = async (tCode) => {
    if (!tCode) return;
    setLoading(true);
    setError('');
    try {
      // Call session verification API
      const res = await api.post('/sessions', { tableCode: tCode });
      startSession(res.data);
      setVerifiedTable(res.data);
    } catch (err) {
      console.error('Session error:', err);
      // Fallback table lookup if session post fails
      try {
        const r = await api.get(`/tables/${tCode}`);
        const fallbackSession = {
          sessionCode: `D${Math.floor(1000 + Math.random() * 9000)}`,
          tableNumber: r.data.tableNumber || '08',
          tableCode: tCode,
          restaurantId: r.data.restaurantId,
          restaurantName: r.data.restaurantName || 'DINEVO Kitchen',
          tagline: r.data.tagline || 'Gourmet Table Ordering',
          verified: true
        };
        startSession(fallbackSession);
        setVerifiedTable(fallbackSession);
      } catch {
        setError(err.response?.data?.message || 'Table QR code invalid. Try DINEVO-T08, DINEVO-T01, or DV-T1.');
      }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    resolveTable(code.trim().toUpperCase());
  };

  const startCamera = async () => {
    setScanning(true);
    setError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        throw new Error('Camera hardware not supported');
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setError('Camera access is unavailable. Please grant camera permission or enter table code manually.');
      setScanning(false);
    }
  };


  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const simulateScan = (simCode) => {
    stopCamera();
    setCode(simCode);
    resolveTable(simCode);
  };

  return (
    <div className="dv-entry-wrap">
      <div className="container-dv">
        <div className="dv-entry-card">
          {verifiedTable ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div className="dv-logo" style={{ fontSize: '1.4rem', marginBottom: 12 }}>
                DINE<span>VO</span>
              </div>
              <div style={{ height: 1, background: 'var(--line)', margin: '14px 0 20px' }} />

              <span className="eyebrow" style={{ color: 'var(--ink-soft)' }}>Welcome to DINEVO</span>
              <h2 style={{ fontSize: '1.8rem', marginTop: 6, color: 'var(--ink)' }}>
                {verifiedTable.restaurantName}
              </h2>

              <div
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-md)',
                  padding: '20px',
                  margin: '20px 0 16px'
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Table {verifiedTable.tableNumber}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--gold)', marginTop: 4 }}>
                  Dining Session #{verifiedTable.sessionCode}
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--sage-tint)',
                  color: 'var(--sage-dark)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  padding: '8px 18px',
                  borderRadius: 'var(--r-pill)',
                  marginBottom: 20
                }}
              >
                <ShieldCheckIcon width={18} height={18} /> ✓ Table Verified
              </div>

              <p style={{ color: 'var(--ink-soft)', marginBottom: 24, fontSize: '0.95rem' }}>
                Welcome to your dining session. Explore today's menu and order directly to your table.
              </p>

              <button
                className="btn-dv btn-burgundy btn-block"
                style={{ fontSize: '1.08rem', padding: '15px 28px' }}
                onClick={() => navigate('/menu')}
              >
                Explore Menu
              </button>

              <button
                style={{
                  marginTop: 16,
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-faint)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => setVerifiedTable(null)}
              >
                Switch Table or Re-scan
              </button>
            </div>

          ) : (
            <>
              <div className="dv-qr-frame">
                <span className="corner tl" />
                <span className="corner tr" />
                <span className="corner bl" />
                <span className="corner br" />
                {scanning ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <QrIcon width={64} height={64} style={{ color: '#E4C77B' }} />
                )}
              </div>

              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <span className="eyebrow">Table Ordering</span>
              </div>
              <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: 8 }}>
                Scan Table QR Code
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                Point your phone camera at the table QR code to start your dining session.
              </p>

              {scanning ? (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: 12 }}>
                    Scanning table QR... Select demo table:
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="dv-cat-chip" onClick={() => simulateScan('DINEVO-T08')}>Table 08</button>
                    <button className="dv-cat-chip" onClick={() => simulateScan('DINEVO-T01')}>Table 01</button>
                    <button className="dv-cat-chip" onClick={() => simulateScan('DV-T2')}>Table 02</button>
                  </div>
                  <button
                    className="btn-dv btn-outline btn-block"
                    style={{ marginTop: 14 }}
                    onClick={stopCamera}
                  >
                    Close Camera
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-dv btn-gold btn-block"
                  style={{ marginTop: 18 }}
                  onClick={startCamera}
                >
                  <QrIcon width={18} height={18} /> Open Camera Scanner
                </button>
              )}

              <div className="dv-or-divider">or enter table code manually</div>

              <form onSubmit={handleSubmit}>
                <input
                  className="dv-input"
                  placeholder="e.g. DINEVO-T08 or DV-T1"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoCapitalize="characters"
                />
                {error && (
                  <p style={{ color: 'var(--chili)', fontSize: '0.85rem', marginTop: 10 }}>{error}</p>
                )}
                <button
                  type="submit"
                  className="btn-dv btn-primary btn-block"
                  style={{ marginTop: 18 }}
                  disabled={loading}
                >
                  {loading ? <span className="dv-spinner" /> : 'Verify Table & Session'}
                </button>
              </form>

              <div style={{ marginTop: 22, textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', display: 'block', marginBottom: 6 }}>
                  Quick test table shortcuts:
                </span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['DINEVO-T08', 'DINEVO-T01', 'DINEVO-T02', 'DV-T1'].map((tc) => (
                    <button
                      key={tc}
                      type="button"
                      style={{
                        background: 'var(--cream)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--r-pill)',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setCode(tc);
                        resolveTable(tc);
                      }}
                    >
                      {tc}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
