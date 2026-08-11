import React, { useState, useEffect } from 'react';
import PhoneFrame from '../components/PhoneFrame';
import UserMobilePanel from './UserMobilePanel';

export default function UserStandalonePage() {
  const [isDesktop, setIsDesktop] = useState(false);

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
      <div style={{ minHeight: '100vh', background: '#09080C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
        <div style={{ color: '#FFD700', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 16 }}>
          DINEVO — CUSTOMER MOBILE INTERFACE
        </div>
        <PhoneFrame>
          <UserMobilePanel embedded />
        </PhoneFrame>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0C10' }}>
      <UserMobilePanel embedded={false} />
    </div>
  );
}
