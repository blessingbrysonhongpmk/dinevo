import React from 'react';
import UserMobilePanel from './UserMobilePanel';

export default function UserStandalonePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09080C',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          minHeight: '100vh',
          background: '#0D0C10',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.7)',
          borderLeft: '1px solid rgba(255, 215, 0, 0.1)',
          borderRight: '1px solid rgba(255, 215, 0, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <UserMobilePanel embedded={false} />
      </div>
    </div>
  );
}
