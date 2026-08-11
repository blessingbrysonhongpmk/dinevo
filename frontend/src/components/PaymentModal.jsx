import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, CheckIcon } from './Icons';

export default function PaymentModal({ order, onPaymentSuccess, onClose }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('dinevo@upi');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setVerifying(true);
    setError('');
    try {
      await onPaymentSuccess();
    } catch (err) {
      setError(err.message || 'Payment verification failed. Please try again.');
      setVerifying(false);
    }
  };

  const totalAmount = order?.total || order?.totalAmount || 0;
  const upiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=10&data=upi://pay?pa=dinevo@upi%26pn=DINEVO%20Restaurant%26am=${totalAmount}%26cu=INR`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 12, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeInSlideUp 0.3s ease'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--surface, #FFFFFF)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--line, #EBE4D8)',
          textAlign: 'center',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(247,127,0,0.12)',
            color: 'var(--gold, #F77F00)',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}
        >
          <ShieldCheckIcon width={16} height={16} /> SECURE PAYMENT
        </div>

        <h2 style={{ fontSize: '1.4rem', color: 'var(--ink, #1C1921)', margin: '4px 0 2px' }}>
          Table {order?.tableNumber || '08'} Payment
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft, #635C6B)', marginBottom: '16px' }}>
          Order #{order?.orderNumber || 'D4821'}
        </p>

        {/* Total Amount Badge */}
        <div
          style={{
            background: 'var(--cream, #FAF6F0)',
            border: '1px solid var(--line, #EBE4D8)',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft, #635C6B)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Amount Due
          </div>
          <div style={{ fontFamily: 'var(--font-display, serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--burgundy, #E63946)', marginTop: '2px' }}>
            ₹{Number(totalAmount).toFixed(2)}
          </div>
        </div>

        {/* QR Code Container */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '16px',
            border: '2px dashed rgba(247,127,0,0.3)',
            display: 'inline-block',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
          }}
        >
          <img
            src={upiUrl}
            alt="Payment UPI QR"
            style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '8px', fontWeight: 600 }}>
            Scan with any UPI app (GPay, PhonePe, Paytm)
          </div>
        </div>

        {/* UPI ID Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--cream, #FAF6F0)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}
        >
          <span style={{ color: 'var(--ink-soft)' }}>UPI ID: <strong>dinevo@upi</strong></span>
          <button
            onClick={handleCopyUpi}
            style={{
              background: 'none',
              border: 'none',
              color: copied ? 'var(--sage, #06D6A0)' : 'var(--gold, #F77F00)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <><CheckIcon width={14} height={14} /> Copied</> : 'Copy'}
          </button>
        </div>

        {/* Timer */}
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '20px' }}>
          Payment QR expires in:{' '}
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: timeLeft < 60 ? 'var(--chili, #E63946)' : 'var(--ink, #1C1921)' }}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {error && (
          <p style={{ color: 'var(--chili, #E63946)', fontSize: '0.82rem', marginBottom: '14px' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <button
          onClick={handleConfirmPayment}
          disabled={verifying || timeLeft <= 0}
          className="btn-dv btn-burgundy btn-block"
          style={{ padding: '14px', fontSize: '1rem', marginBottom: '10px' }}
        >
          {verifying ? <span className="dv-spinner" /> : '✓ I HAVE PAID'}
        </button>

        <button
          onClick={onClose}
          disabled={verifying}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-soft)',
            fontSize: '0.88rem',
            cursor: 'pointer',
            padding: '8px 16px',
            textDecoration: 'underline'
          }}
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
}
