import React from 'react';

export default function ErrorMessage({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div
      style={{
        background: 'var(--chili-tint)',
        color: 'var(--chili)',
        border: '1px solid var(--chili)',
        borderRadius: 'var(--r-md)',
        padding: '16px 20px',
        margin: '16px 0',
        textAlign: 'center'
      }}
      role="alert"
    >
      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{message}</p>
      {onRetry && (
        <button
          className="btn-dv btn-outline"
          style={{ marginTop: 12, padding: '6px 16px', fontSize: '0.82rem', borderColor: 'var(--chili)', color: 'var(--chili)' }}
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
