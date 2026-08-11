import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrIcon } from './Icons';

export default function QRScanner({ onScanSuccess, onScanError, onClose }) {
  const [cameraState, setCameraState] = useState('initializing'); // 'initializing', 'active', 'denied', 'error', 'unsupported'
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef(null);
  const elementId = 'dinevo-qr-reader';

  useEffect(() => {
    let html5QrcodeScanner = null;
    let isMounted = true;

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) {
            setCameraState('unsupported');
            setErrorMessage('Camera access is not supported by your browser.');
          }
          return;
        }

        html5QrcodeScanner = new Html5Qrcode(elementId);
        scannerRef.current = html5QrcodeScanner;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0
        };

        await html5QrcodeScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            // Parse table code from decoded text
            // e.g. "http://domain.com/table/DINEVO-T01" -> "DINEVO-T01"
            let tableCode = decodedText.trim();
            if (tableCode.includes('/table/')) {
              const parts = tableCode.split('/table/');
              tableCode = parts[parts.length - 1].split('?')[0].split('#')[0];
            } else if (tableCode.includes('table=')) {
              const urlParams = new URLSearchParams(tableCode.split('?')[1]);
              tableCode = urlParams.get('table') || tableCode;
            }

            // Stop scanner and notify parent
            if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
              html5QrcodeScanner
                .stop()
                .then(() => {
                  if (onScanSuccess) onScanSuccess(tableCode.toUpperCase());
                })
                .catch(() => {
                  if (onScanSuccess) onScanSuccess(tableCode.toUpperCase());
                });
            } else if (onScanSuccess) {
              onScanSuccess(tableCode.toUpperCase());
            }
          },
          (errorMessage) => {
            // Ignore frame scan failures
          }
        );

        if (isMounted) {
          setCameraState('active');
        }
      } catch (err) {
        console.warn('QR Scanner Error:', err);
        if (!isMounted) return;

        const strErr = String(err).toLowerCase();
        if (strErr.includes('notallowederror') || strErr.includes('permission denied')) {
          setCameraState('denied');
          setErrorMessage('Camera permission was denied. Please allow camera access to scan your table QR code.');
        } else {
          setCameraState('error');
          setErrorMessage('Unable to start camera scanner. Please make sure no other app is using your camera.');
        }
        if (onScanError) onScanError(err);
      }
    };

    startScanner();

    // Mandatory cleanup on unmount
    return () => {
      isMounted = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch((e) => console.warn('Scanner stop error:', e));
          }
          scannerRef.current.clear();
        } catch (e) {
          console.warn('Scanner cleanup error:', e);
        }
      }
    };
  }, []);

  return (
    <div className="dv-scanner-wrap" style={{ textAlign: 'center' }}>
      <div
        id={elementId}
        style={{
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#1A1721',
          minHeight: '260px',
          position: 'relative'
        }}
      />

      {cameraState === 'initializing' && (
        <div style={{ marginTop: '14px', color: 'var(--gold, #F77F00)', fontSize: '0.88rem', fontWeight: 600 }}>
          <span className="dv-spinner" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
          Requesting camera access...
        </div>
      )}

      {cameraState === 'active' && (
        <p style={{ marginTop: '14px', color: 'var(--ink-soft, #666)', fontSize: '0.85rem' }}>
          Point your mobile camera at the Table QR code
        </p>
      )}

      {(cameraState === 'denied' || cameraState === 'error' || cameraState === 'unsupported') && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--chili-tint, rgba(230,57,70,0.1))', borderRadius: '12px', border: '1px solid rgba(230,57,70,0.3)' }}>
          <div style={{ fontWeight: 700, color: 'var(--chili, #E63946)', fontSize: '0.92rem', marginBottom: '6px' }}>
            CAMERA ACCESS NEEDED
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink, #333)', margin: 0 }}>
            {errorMessage}
          </p>
        </div>
      )}

      {onClose && (
        <button
          type="button"
          className="btn-dv btn-outline btn-block"
          style={{ marginTop: '16px' }}
          onClick={onClose}
        >
          Close Scanner
        </button>
      )}
    </div>
  );
}
