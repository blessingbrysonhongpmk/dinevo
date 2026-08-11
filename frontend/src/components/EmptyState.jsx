import React from 'react';

export default function EmptyState({ title = 'No items found', message, actionText, onAction }) {
  return (
    <div className="dv-empty">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--ink)' }}>{title}</h3>
      {message && <p style={{ color: 'var(--ink-soft)', marginTop: 8, fontSize: '0.92rem' }}>{message}</p>}
      {actionText && onAction && (
        <button className="btn-dv btn-burgundy" style={{ marginTop: 20 }} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
