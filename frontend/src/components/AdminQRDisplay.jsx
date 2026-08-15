import React, { useState, useRef } from 'react';
import { getQrTargetUrl } from '../utils/qrUrl';

export default function AdminQRDisplay({ table, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customHost, setCustomHost] = useState('');
  const containerRef = useRef(null);

  if (!table) return null;

  const tableCode = table.code || `DINEVO-T${table.tableNumber}`;
  const tableNum = table.tableNumber || '01';
  const tableStatus = table.status || 'AVAILABLE';

  // Ultra High-Res HD 600x600 QR code URL with 20px quiet zone & High Error Correction (ecc=H)
  const targetUrl = getQrTargetUrl(tableCode, customHost);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&margin=20&data=${encodeURIComponent(targetUrl)}`;

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `DINEVO-Table-${tableNum}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download QR image', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isFullscreen) {
    return (
      <div
        className="dv-fullscreen-qr-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#111111'
        }}
      >
        <button
          onClick={handleFullscreen}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: '#111111',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
          }}
        >
          ✕ Exit Full Screen
        </button>

        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontFamily: 'var(--font-display, serif)', fontSize: '2.8rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--espresso, #111)' }}>
            DINE<span style={{ color: 'var(--gold, #F77F00)' }}>VO</span>
          </div>
          <div style={{ fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666666', marginTop: 4, fontWeight: 700 }}>
            DIGITAL TABLE ORDERING
          </div>

          <div style={{ margin: '30px 0 10px', fontSize: '3rem', fontWeight: 800, color: '#111111' }}>
            TABLE {tableNum}
          </div>
          <p style={{ fontSize: '1.1rem', color: '#555555', marginBottom: 24 }}>
            Scan with your mobile camera to view menu & order
          </p>

          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', display: 'inline-block', border: '3px solid #111111', boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}>
            <img src={qrUrl} alt={`Table ${tableNum} QR`} style={{ width: '320px', height: '320px', display: 'block' }} />
          </div>

          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--burgundy, #E63946)', marginTop: 20, letterSpacing: '0.1em' }}>
            {tableCode}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '20px'
      }}
    >
      <div
        ref={containerRef}
        className="dv-admin-qr-modal"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '32px 28px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '4px solid var(--espresso, #1A1721)',
          position: 'relative'
        }}
      >
        {/* Brand Header */}
        <div style={{ fontFamily: 'var(--font-display, serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--espresso, #1A1721)' }}>
          DINE<span style={{ color: 'var(--gold, #F77F00)' }}>VO</span>
        </div>
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-soft, #666)', marginTop: 2, fontWeight: 700 }}>
          OFFICIAL TABLE QR CODE
        </div>

        {/* Card Content */}
        <div style={{ margin: '20px 0', padding: '20px 16px', background: 'var(--cream, #FAF6F0)', borderRadius: '20px', border: '1px solid var(--line, #E5DECF)' }}>
          <div style={{ fontSize: '0.75rem', color: tableStatus.toUpperCase() === 'AVAILABLE' ? 'var(--sage-dark, #048A65)' : 'var(--burgundy, #E63946)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.08em' }}>
            ● Table Status: {tableStatus}
          </div>
          
          <h2 style={{ fontSize: '2.4rem', margin: '0 0 2px', color: 'var(--ink, #1A1721)', fontWeight: 800 }}>
            TABLE {tableNum}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft, #555555)', marginBottom: 16 }}>
            Scan this QR code using your mobile phone camera
          </p>

          {/* High Contrast Sharp QR Frame */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '2px solid var(--espresso, #1A1721)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <img
              src={qrUrl}
              alt={`Table ${tableNum} QR`}
              style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto' }}
            />
          </div>

          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--burgundy, #E63946)', marginTop: 14, letterSpacing: '0.08em' }}>
            {tableCode}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#444', marginTop: 8, wordBreak: 'break-all', fontFamily: 'monospace', background: '#FFF', padding: '8px 12px', borderRadius: '10px', border: '1px solid #DDD', textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: '#111', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔗 QR Target URL (Encoded):</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(targetUrl);
                  alert(`Copied URL: ${targetUrl}`);
                }}
                style={{ background: 'var(--gold, #F77F00)', color: '#FFF', border: 'none', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Copy URL
              </button>
            </div>
            <div style={{ color: 'var(--burgundy, #E63946)', fontWeight: 700 }}>{targetUrl}</div>
          </div>

          {/* PUBLIC PRODUCTION DOMAIN & LOCAL LAN CONFIGURATOR */}
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(217,119,6,0.06)', borderRadius: '14px', border: '1px solid rgba(217,119,6,0.25)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--ink)', fontWeight: 800 }}>
                🌐 Long-Distance Public Domain (WhatsApp & Worldwide):
              </label>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: targetUrl.startsWith('https://') ? 'var(--sage-tint)' : 'var(--gold-tint)', color: targetUrl.startsWith('https://') ? 'var(--sage-dark)' : 'var(--gold)' }}>
                {targetUrl.startsWith('https://') ? '● PUBLIC PROD' : '● LOCAL DEV'}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => {
                  const url = 'https://dinevo.vercel.app';
                  setCustomHost(url);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('dinevo_public_domain', url);
                  }
                }}
                style={{ flex: 1, padding: '6px 8px', background: 'var(--espresso)', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🌐 Enforce Long-Distance Vercel Domain
              </button>
              <button
                type="button"
                onClick={() => {
                  const lanIp = sessionStorage.getItem('dinevo_lan_ip') || 'localhost';
                  const url = `https://${lanIp}:3000`;
                  setCustomHost(url);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('dinevo_public_domain', url);
                  }
                }}
                style={{ padding: '6px 8px', background: 'var(--cream-2)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                📱 Local Wi-Fi
              </button>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="https://dinevo.vercel.app"
                value={customHost}
                onChange={(e) => {
                  setCustomHost(e.target.value);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('dinevo_public_domain', e.target.value);
                  }
                }}
                style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.8rem', fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={() => {
                  setCustomHost('');
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('dinevo_public_domain');
                  }
                }}
                style={{ padding: '7px 12px', background: '#333', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#666', marginTop: 6, lineHeight: 1.4 }}>
              Set to your public domain (e.g. <code>https://dinevo.vercel.app</code>) so QR code photos sent via WhatsApp work from anywhere on earth!
            </div>
          </div>
        </div>




        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <button
            className="btn-dv btn-gold"
            style={{ fontSize: '0.85rem', padding: '10px 14px' }}
            onClick={handleFullscreen}
          >
            ⛶ Open Full Screen
          </button>
          <button
            className="btn-dv btn-burgundy"
            style={{ fontSize: '0.85rem', padding: '10px 14px' }}
            onClick={handleDownload}
          >
            ⬇ Download QR
          </button>
          <button
            className="btn-dv btn-primary"
            style={{ fontSize: '0.85rem', padding: '10px 14px' }}
            onClick={handlePrint}
          >
            🖨 Print QR
          </button>
          <button
            className="btn-dv btn-outline"
            style={{ fontSize: '0.85rem', padding: '10px 14px' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
