import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrIcon } from './Icons';

export default function QRScanner({ onScanSuccess, onScanError, onClose }) {
  const [cameraState, setCameraState] = useState('initializing'); // 'initializing', 'active', 'denied', 'error', 'unsupported'
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const elementId = 'dinevo-qr-reader';

  const parseTableCode = (decodedText) => {
    if (!decodedText) return '';
    let tableCode = decodedText.trim();
    if (tableCode.includes('/table/')) {
      const parts = tableCode.split('/table/');
      tableCode = parts[parts.length - 1].split('?')[0].split('#')[0];
    } else if (tableCode.includes('table=')) {
      const urlParams = new URLSearchParams(tableCode.split('?')[1]);
      tableCode = urlParams.get('table') || tableCode;
    }
    return tableCode.toUpperCase();
  };

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
          fps: 20,
          qrbox: (w, h) => ({
            width: Math.min(w * 0.9, 320),
            height: Math.min(h * 0.9, 320)
          }),
          aspectRatio: 1.0,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        await html5QrcodeScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            const tableCode = parseTableCode(decodedText);
            if (tableCode && onScanSuccess) {
              if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
                html5QrcodeScanner.stop().then(() => onScanSuccess(tableCode)).catch(() => onScanSuccess(tableCode));
              } else {
                onScanSuccess(tableCode);
              }
            }
          },
          () => {
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
          setErrorMessage('Camera permission was denied. You can still upload a QR photo below!');
        } else {
          setCameraState('error');
          setErrorMessage('Unable to start camera scanner. Use the Upload QR Photo button below!');
        }
        if (onScanError) onScanError(err);
      }
    };

    startScanner();

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

  // Handle Photo / Gallery Image Upload Scan
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage('');

    try {
      let instance = scannerRef.current;
      if (!instance) {
        instance = new Html5Qrcode(elementId);
        scannerRef.current = instance;
      }

      const decodedResult = await instance.scanFileV2(file, false);
      const text = decodedResult?.decodedText || decodedResult;
      const tableCode = parseTableCode(text);

      if (tableCode) {
        if (onScanSuccess) onScanSuccess(tableCode);
      } else {
        alert('Could not detect a valid DINEVO Table QR code in the uploaded photo. Please try a clearer picture.');
      }
    } catch (err) {
      console.error('File scan error:', err);
      alert('Unable to decode QR code from the selected image. Please make sure the photo clearly shows the Table QR code.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dv-scanner-wrap" style={{ textAlign: 'center' }}>
      <div
        id={elementId}
        style={{
          width: '100%',
          maxWidth: '320px',
          margin: '0 auto',
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#1A1721',
          minHeight: '260px',
          position: 'relative',
          border: '2px solid var(--gold, #F77F00)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
        }}
      />

      {cameraState === 'initializing' && (
        <div style={{ marginTop: '14px', color: 'var(--gold, #F77F00)', fontSize: '0.88rem', fontWeight: 600 }}>
          <span className="dv-spinner" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
          Opening camera scanner...
        </div>
      )}

      {cameraState === 'active' && (
        <p style={{ marginTop: '12px', color: '#AAA', fontSize: '0.85rem' }}>
          Point camera at QR code or upload a photo below
        </p>
      )}

      {(cameraState === 'denied' || cameraState === 'error' || cameraState === 'unsupported') && (
        <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(230,57,70,0.12)', borderRadius: '12px', border: '1px solid rgba(230,57,70,0.3)' }}>
          <p style={{ fontSize: '0.82rem', color: '#FFD1D1', margin: 0 }}>
            {errorMessage}
          </p>
        </div>
      )}

      {/* PHOTO / GALLERY UPLOAD BUTTON */}
      <div style={{ marginTop: '16px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          id="qr-file-upload"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="qr-file-upload"
          className="btn-dv btn-gold btn-block"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '12px 18px',
            fontSize: '0.9rem',
            fontWeight: 800
          }}
        >
          {uploading ? (
            <>
              <span className="dv-spinner" style={{ width: 18, height: 18 }} />
              Scanning QR Photo...
            </>
          ) : (
            <>
              📷 Upload QR Photo / Gallery Image
            </>
          )}
        </label>
      </div>

      {onClose && (
        <button
          type="button"
          className="btn-dv btn-outline btn-block"
          style={{ marginTop: '12px' }}
          onClick={onClose}
        >
          Close Scanner
        </button>
      )}
    </div>
  );
}
