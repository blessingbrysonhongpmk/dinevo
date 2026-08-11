import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import UserMobilePanel from './UserMobilePanel';

export default function UserStandalonePage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();

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

  if (isDesktop) {
    return (
      <div style={{ minHeight: '100vh', background: '#09080C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', boxSizing: 'border-box' }}>
        {/* DESKTOP HEADER BAR OUTSIDE PHONE FRAME */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '440px', marginBottom: 14 }}>
          <div style={{ color: '#FFD700', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
            DINEVO — MOBILE PREVIEW
          </div>

          <button
            onClick={() => navigate('/admin')}
            style={{
              background: 'linear-gradient(135deg, #E63946 0%, #B81D2B 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(230, 57, 70, 0.4)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            ⚙️ Go to Admin Panel →
          </button>
        </div>

        {/* PHONE SCREEN FRAME */}
        <PhoneFrame>
          <UserMobilePanel embedded />
        </PhoneFrame>

        {/* DESKTOP FOOTER QUICK ACTIONS OUTSIDE PHONE FRAME */}
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FAF6F0',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚙️ Admin Panel
          </button>

          <button
            onClick={() => navigate('/demo')}
            style={{
              background: 'rgba(247, 127, 0, 0.14)',
              border: '1px solid rgba(247, 127, 0, 0.3)',
              color: '#FFD700',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📱 Prototype Split View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0C10' }}>
      <UserMobilePanel embedded={false} />
    </div>
  );
}
