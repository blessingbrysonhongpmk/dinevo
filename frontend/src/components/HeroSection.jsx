import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrIcon } from './Icons';

export default function HeroSection({ session }) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [customHost, setCustomHost] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Default host to current origin or stored URL
    const savedHost = localStorage.getItem('dinevo_public_url');
    if (savedHost) {
      setCustomHost(savedHost);
    } else {
      setCustomHost(window.location.origin);
    }
  }, []);

  const handleHostChange = (e) => {
    const val = e.target.value;
    setCustomHost(val);
    localStorage.setItem('dinevo_public_url', val);
  };

  const handleScanClick = () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 768;
    if (isTouch && isSmall) {
      navigate('/table');
    } else {
      setShowQrModal(true);
    }
  };

  const activeHost = (customHost || window.location.origin).replace(/\/$/, '');
  const sampleQrUrl = `${activeHost}/table/DINEVO-T01`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(sampleQrUrl)}`;

  return (
    <section className="dv-hero" style={{ padding: '60px 0 40px' }}>
      <div className="container-dv" style={{ maxWidth: '1100px' }}>
        <div
          className="card-dv"
          style={{
            background: 'linear-gradient(135deg, #1A1721 0%, #2A2433 100%)',
            color: '#FAF6F0',
            borderRadius: '28px',
            padding: '40px 30px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '2px solid rgba(247,127,0,0.25)',
            backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(247,127,0,0.15), transparent 70%), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Dark Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,23,33,0.85)', backdropFilter: 'blur(3px)', zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="dv-logo" style={{ fontSize: '3.2rem', marginBottom: 4 }}>
              DINE<span style={{ color: 'var(--gold, #F77F00)' }}>VO</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(250,246,240,0.8)', fontWeight: 700, marginBottom: 16 }}>
              PREMIUM DIGITAL DINING
            </h2>

            <p style={{ fontSize: '1.15rem', color: 'rgba(250,246,240,0.9)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              Scan the QR code below on your phone camera to open Table 01 ordering session directly!
            </p>

            {/* LIVE SCANNABLE TABLE QR CODE ON FRONT PAGE */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: '0 15px 45px rgba(0,0,0,0.5)',
                border: '3px solid var(--gold, #F77F00)',
                marginBottom: '20px',
                maxWidth: '280px',
                width: '100%'
              }}
            >
              <img
                src={qrImageSrc}
                alt="Table 01 QR Code"
                style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto', borderRadius: '12px' }}
              />
              <div style={{ color: '#1A1721', fontSize: '0.9rem', fontWeight: 900, marginTop: 12, letterSpacing: '0.05em' }}>
                TABLE 01 QR CODE
              </div>
              <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>
                Scan with your phone camera
              </div>

              {/* Host URL configurator for local IP / Vercel deployment */}
              <div style={{ marginTop: 8, textAlign: 'left' }}>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#444', textTransform: 'uppercase' }}>QR Target Host (Vercel / IP)</label>
                <input
                  className="dv-input"
                  style={{ padding: '6px 10px', fontSize: '0.75rem', marginTop: 2, background: '#F5F2EC', borderColor: '#DDD', color: '#111' }}
                  value={customHost}
                  onChange={handleHostChange}
                  placeholder="https://dinevo.vercel.app"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <button
                className="btn-dv btn-gold"
                style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 800 }}
                onClick={handleScanClick}
              >
                <QrIcon width={20} height={20} /> SCAN TABLE QR
              </button>

              <Link
                to="/demo"
                className="btn-dv btn-outline"
                style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 800, color: '#FAF6F0', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}
              >
                OPEN USER PANEL (DEMO)
              </Link>
            </div>

            {/* Bottom 4-step process bar */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '0.85rem', color: 'rgba(250,246,240,0.8)' }}>
              <span>📱 Scan Table QR</span>
              <span>➔</span>
              <span>🍲 Choose Food</span>
              <span>➔</span>
              <span>💳 Pay Securely</span>
              <span>➔</span>
              <span>👑 We Serve You</span>
            </div>
          </div>
        </div>
      </div>

      {/* SCAN EXPLANATION MODAL (ON DESKTOP) */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '100%', textAlign: 'center', color: '#1A1721', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📱</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 10 }}>SCAN TABLE 01 QR CODE</h3>
            <p style={{ fontSize: '0.92rem', color: '#555555', lineHeight: 1.5, marginBottom: 16 }}>
              Use your phone camera to scan the Table 01 QR code displayed on the front page to launch your mobile session directly.
            </p>
            <div style={{ background: '#FAF6F0', padding: 12, borderRadius: 12, border: '1px solid #E5DECF', marginBottom: 20 }}>
              <img src={qrImageSrc} alt="Table 01 QR" style={{ width: '160px', height: '160px', margin: '0 auto', display: 'block' }} />
            </div>
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
    </section>
  );
}
