import React, { useNavigate } from 'react';
import PhoneFrame from '../components/PhoneFrame';
import UserMobilePanel from './UserMobilePanel';
import AdminPanel from './AdminPanel';

export default function DemoPrototype() {
  const navigate = useNavigate();
  return (
    <div className="dv-demo-wrap">
      {/* LEFT: Admin Desktop */}
      <div className="dv-demo-admin">
        <AdminPanel embedded />
      </div>

      {/* RIGHT: User Mobile Preview with Feature Callouts */}
      <div className="dv-demo-mobile">
        <div className="dv-demo-mobile-label">Customer Mobile Preview</div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
// Add admin navigation button (visible on desktop only)
          <button
            className="admin-nav-btn"
            onClick={() => navigate('/admin')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#E63946',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'none', // will be overridden by CSS media query
            }}
          >
            Admin Panel
          </button>
          {/* Diagram Callouts (as in model image) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '180px' }}>
            <div
              style={{
                background: 'rgba(230,57,70,0.12)',
                border: '1px solid rgba(230,57,70,0.3)',
                color: '#E63946',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                lineHeight: 1.4
              }}
            >
              🔒 Another user cannot book Table 01
            </div>

            <div
              style={{
                background: 'rgba(6,214,160,0.12)',
                border: '1px solid rgba(6,214,160,0.3)',
                color: '#048A65',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                lineHeight: 1.4
              }}
            >
              ✓ Only available tables can be selected
            </div>

            <div
              style={{
                background: 'rgba(100,100,255,0.12)',
                border: '1px solid rgba(100,100,255,0.3)',
                color: '#5454D4',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                lineHeight: 1.4
              }}
            >
              ⚡ Real-time sync with admin panel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
