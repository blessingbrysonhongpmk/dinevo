import React from 'react';

export default function TableEntryForm({ code, onChangeCode, onSubmit, loading, error, onSelectDemo }) {
  return (
    <form onSubmit={onSubmit}>
      <input
        className="dv-input"
        placeholder="e.g. DINEVO-T08 or DV-T1"
        value={code}
        onChange={(e) => onChangeCode(e.target.value)}
        autoCapitalize="characters"
      />
      {error && (
        <p style={{ color: 'var(--chili)', fontSize: '0.85rem', marginTop: 10, fontWeight: 600 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn-dv btn-burgundy btn-block"
        style={{ marginTop: 18, padding: '14px 20px', fontSize: '1.02rem' }}
        disabled={loading}
      >
        {loading ? <span className="dv-spinner" /> : 'Verify Table & Join Session'}
      </button>

      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', display: 'block', marginBottom: 8, fontWeight: 600 }}>
          Quick demo table shortcuts:
        </span>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['DINEVO-T08', 'DINEVO-T01', 'DINEVO-T02', 'DV-T1'].map((tc) => (
            <button
              key={tc}
              type="button"
              style={{
                background: 'var(--cream)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-pill)',
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onClick={() => onSelectDemo(tc)}
            >
              {tc}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
