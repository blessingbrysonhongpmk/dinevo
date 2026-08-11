import React from 'react';
import { CheckIcon } from './Icons';

export default function SuccessMessage({ title = 'Success!', message }) {
  return (
    <div
      style={{
        background: 'var(--sage-tint)',
        color: 'var(--sage)',
        border: '1px solid var(--sage)',
        borderRadius: 'var(--r-md)',
        padding: '16px 20px',
        margin: '16px 0',
        textAlign: 'center'
      }}
      role="status"
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '1.05rem' }}>
        <span style={{ background: 'var(--sage)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon />
        </span>
        {title}
      </div>
      {message && <p style={{ fontSize: '0.9rem', marginTop: 6 }}>{message}</p>}
    </div>
  );
}
