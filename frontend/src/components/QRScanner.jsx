import React from 'react';
import { QrIcon } from './Icons';

export default function QRScanner({ scanning, videoRef, onStartScan, onStopScan, onSimulateScan }) {
  return (
    <div>
      <div className="dv-qr-frame">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        {scanning ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <QrIcon width={64} height={64} style={{ color: '#FCBF49' }} />
        )}
      </div>

      {scanning ? (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--gold)', marginBottom: 12, fontWeight: 600 }}>
            Scanning table QR... Select demo table:
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="dv-cat-chip" onClick={() => onSimulateScan('DINEVO-T08')}>Table 08</button>
            <button className="dv-cat-chip" onClick={() => onSimulateScan('DINEVO-T01')}>Table 01</button>
            <button className="dv-cat-chip" onClick={() => onSimulateScan('DV-T2')}>Table 02</button>
          </div>
          <button
            type="button"
            className="btn-dv btn-outline btn-block"
            style={{ marginTop: 14 }}
            onClick={onStopScan}
          >
            Close Camera
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-dv btn-gold btn-block"
          style={{ marginTop: 18 }}
          onClick={onStartScan}
        >
          <QrIcon width={18} height={18} /> Open Camera Scanner
        </button>
      )}
    </div>
  );
}
