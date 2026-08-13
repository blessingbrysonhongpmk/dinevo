import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrIcon } from './Icons';

export default function QRScanner({ onScanSuccess, onScanError, onClose }) {
  const [cameraState, setCameraState] = useState('initializing'); // 'initializing', 'active', 'denied', 'error', 'unsupported'
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

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

  const applyCameraZoom = async (newZoom) => {
    try {
      if (!scannerRef.current) return;
      const track = scannerRef.current.getRunningTrack();
      if (track && track.applyConstraints) {
        await track.applyConstraints({
          advanced: [{ zoom: newZoom }]
        });
        setZoomLevel(newZoom);
      }
    } catch (e) {
      console.warn('Zoom constraint error:', e);
    }
  };

  const toggleTorch = async () => {
    try {
      if (!scannerRef.current) return;
      const track = scannerRef.current.getRunningTrack();
      if (track && track.applyConstraints) {
        const nextTorch = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setTorchOn(nextTorch);
      }
    } catch (e) {
      console.warn('Torch constraint error:', e);
    }
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

        // Enterprise HD Camera Video Constraints for Long-Distance Sharpness
        const cameraConstraints = {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          focusMode: { ideal: 'continuous' }
        };

        const config = {
          fps: 25,
          qrbox: (w, h) => ({
            width: Math.min(w * 0.9, 340),
            height: Math.min(h * 0.9, 340)
          }),
          aspectRatio: 1.0,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        await html5QrcodeScanner.start(
          cameraConstraints,
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
            // Frame pass
          }
        );

        if (isMounted) {
          setCameraState('active');

          // Check Hardware Controls (Zoom & Torch)
          try {
            const track = html5QrcodeScanner.getRunningTrack();
            if (track && track.getCapabilities) {
              const caps = track.getCapabilities();
              if (caps.zoom) {
                setSupportsZoom(true);
                setMaxZoom(caps.zoom.max || 4);
              }
              if (caps.torch) {
                setSupportsTorch(true);
              }
            }
          } catch (e) {
            // Hardware caps optional
          }
        }
      } catch (err) {
        console.warn('QR Scanner Error:', err);
        if (!isMounted) return;

        const strErr = String(err).toLowerCase();
        if (strErr.includes('notallowederror') || strErr.includes('permission denied')) {
          setCameraState('denied');
          setErrorMessage('Camera permission denied. Use the Upload QR Photo button below!');
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

  // Multi-pass Canvas Enhancer for Distant / Small QR Photos
  const processImageCanvasPass = async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Scale up 2x for sharp distant QR feature extraction
        canvas.width = Math.min(img.width * 1.5, 2000);
        canvas.height = Math.min(img.height * 1.5, 2000);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // High contrast binarization enhancement
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const val = avg > 120 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const enhancedFile = new File([blob], 'enhanced_qr.png', { type: 'image/png' });
            resolve(enhancedFile);
          } else {
            resolve(file);
          }
        });
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle Photo / Gallery Image Upload Scan with Dual-Pass Engine
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

      // Pass 1: Raw Image Scan
      let text = '';
      try {
        const decodedResult = await instance.scanFileV2(file, false);
        text = decodedResult?.decodedText || decodedResult;
      } catch (p1Err) {
        // Pass 2: Enhanced Contrast Upsample Canvas Pass for Distant / Small QR
        const enhancedFile = await processImageCanvasPass(file);
        const decodedResult = await instance.scanFileV2(enhancedFile, false);
        text = decodedResult?.decodedText || decodedResult;
      }

      const tableCode = parseTableCode(text);

      if (tableCode) {
        if (onScanSuccess) onScanSuccess(tableCode);
      } else {
        alert('Could not detect a valid DINEVO Table QR code in the uploaded photo. Please try taking a closer photo or using the camera zoom.');
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
          maxWidth: '340px',
          margin: '0 auto',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#0D0C10',
          minHeight: '280px',
          position: 'relative',
          border: '3px solid var(--gold, #F77F00)',
          boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
        }}
      />

      {cameraState === 'initializing' && (
        <div style={{ marginTop: '14px', color: 'var(--gold, #F77F00)', fontSize: '0.88rem', fontWeight: 700 }}>
          <span className="dv-spinner" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
          Initializing 1080p HD Distance Scanner...
        </div>
      )}

      {cameraState === 'active' && (
        <div>
          <p style={{ marginTop: '10px', color: '#BBB', fontSize: '0.85rem' }}>
            Point camera at QR code or use Zoom for long distance
          </p>

          {/* ZOOM & TORCH CONTROLS FOR LONG DISTANCE SCANNING */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => applyCameraZoom(1)}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: zoomLevel === 1 ? 'var(--gold, #F77F00)' : 'rgba(255,255,255,0.1)',
                color: zoomLevel === 1 ? '#000' : '#FFF',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              🔍 1x Normal
            </button>
            <button
              onClick={() => applyCameraZoom(2)}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: zoomLevel === 2 ? 'var(--gold, #F77F00)' : 'rgba(255,255,255,0.1)',
                color: zoomLevel === 2 ? '#000' : '#FFF',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              🔍 2x Distance
            </button>
            <button
              onClick={() => applyCameraZoom(3)}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: zoomLevel === 3 ? 'var(--gold, #F77F00)' : 'rgba(255,255,255,0.1)',
                color: zoomLevel === 3 ? '#000' : '#FFF',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              🔍 3x Far
            </button>

            {supportsTorch && (
              <button
                onClick={toggleTorch}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  background: torchOn ? '#FFD700' : 'rgba(255,255,255,0.15)',
                  color: torchOn ? '#000' : '#FFF',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {torchOn ? '💡 Flash ON' : '🔦 Flash'}
              </button>
            )}
          </div>
        </div>
      )}

      {(cameraState === 'denied' || cameraState === 'error' || cameraState === 'unsupported') && (
        <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(230,57,70,0.12)', borderRadius: '14px', border: '1px solid rgba(230,57,70,0.3)' }}>
          <p style={{ fontSize: '0.84rem', color: '#FFD1D1', margin: 0, fontWeight: 600 }}>
            {errorMessage}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#AAA', marginTop: 4 }}>
            💡 Tip: Mobile browsers block camera on unencrypted HTTP URLs. Upload a QR photo or select your table below!
          </p>
        </div>
      )}

      {/* PHOTO / GALLERY UPLOAD BUTTON */}
      <div style={{ marginTop: '14px' }}>
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
            fontWeight: 800,
            boxShadow: '0 6px 18px rgba(247,127,0,0.3)'
          }}
        >
          {uploading ? (
            <>
              <span className="dv-spinner" style={{ width: 18, height: 18 }} />
              Processing HD Dual-Pass Image...
            </>
          ) : (
            <>
              📷 Upload QR Photo from Gallery
            </>
          )}
        </label>
      </div>

      {/* QUICK TABLE PICKER (FOR MOBILE / HTTP CAMERA FALLBACK) */}
      <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px dashed rgba(255,255,255,0.15)', textAlign: 'left' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          ⚡ Or Select Dining Table Directly:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {['01', '02', '03', '04', '05', '06', '07', '08'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                const code = `DINEVO-T${num}`;
                if (onScanSuccess) onScanSuccess(code);
              }}
              style={{
                padding: '8px 4px',
                borderRadius: '10px',
                border: '1px solid rgba(255,215,0,0.3)',
                background: 'rgba(255,215,0,0.12)',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              T-{num}
            </button>
          ))}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          className="btn-dv btn-outline btn-block"
          style={{ marginTop: '14px', borderColor: 'rgba(255,255,255,0.2)', color: '#AAA' }}
          onClick={onClose}
        >
          Close Scanner
        </button>
      )}
    </div>
  );
}
