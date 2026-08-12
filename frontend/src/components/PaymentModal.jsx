import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, CheckIcon } from './Icons';

export default function PaymentModal({ order, onPaymentSuccess, onClose }) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'qr', 'card', 'banking'
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });

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
  const noteText = encodeURIComponent(`DINEVO Table ${order?.tableNumber || '01'} Order #${order?.orderNumber || '1001'}`);
  const upiDeepLink = `upi://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${totalAmount}&cu=INR&tn=${noteText}`;
  const gpayLink = `gpay://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${totalAmount}&cu=INR&tn=${noteText}`;
  const phonepeLink = `phonepe://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${totalAmount}&cu=INR&tn=${noteText}`;
  const paytmLink = `paytmmp://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${totalAmount}&cu=INR&tn=${noteText}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=10&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 12, 18, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#181522',
          color: '#FAF6F0',
          borderRadius: '28px',
          padding: '28px 24px',
          boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
          border: '2px solid var(--gold, #F77F00)',
          textAlign: 'center',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* HEADER BADGE */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 230, 153, 0.14)',
            color: '#00E699',
            border: '1px solid rgba(0, 230, 153, 0.3)',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '12px'
          }}
        >
          <ShieldCheckIcon width={16} height={16} /> 256-BIT ENCRYPTED POS GATEWAY
        </div>

        <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', margin: '4px 0 2px', fontWeight: 900 }}>
          Table {order?.tableNumber || '01'} Express Checkout
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#AAA', marginBottom: '16px' }}>
          Order ID: <strong style={{ color: 'var(--gold, #F77F00)' }}>#{order?.orderNumber || 'DINEVO-9481'}</strong>
        </p>

        {/* AMOUNT DUE CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #252033 0%, #1D1828 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            TOTAL AMOUNT DUE
          </div>
          <div style={{ fontFamily: 'var(--font-display, serif)', fontSize: '2.4rem', fontWeight: 900, color: 'var(--gold, #F77F00)', marginTop: '2px' }}>
            ₹{Number(totalAmount).toFixed(2)}
          </div>
        </div>

        {/* PAYMENT METHOD TABS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 18, background: '#110F18', padding: 4, borderRadius: 14 }}>
          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'upi' ? 'var(--gold, #F77F00)' : 'transparent',
              color: activeTab === 'upi' ? '#000' : '#AAA'
            }}
          >
            🚀 One-Tap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'qr' ? 'var(--gold, #F77F00)' : 'transparent',
              color: activeTab === 'qr' ? '#000' : '#AAA'
            }}
          >
            📷 QR Scan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'card' ? 'var(--gold, #F77F00)' : 'transparent',
              color: activeTab === 'card' ? '#000' : '#AAA'
            }}
          >
            💳 Cards
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('banking')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'banking' ? 'var(--gold, #F77F00)' : 'transparent',
              color: activeTab === 'banking' ? '#000' : '#AAA'
            }}
          >
            🏛️ Net Bank
          </button>
        </div>

        {/* TAB 1: ONE-TAP INSTANT UPI APP LAUNCH */}
        {activeTab === 'upi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <a
              href={gpayLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#4285F4',
                color: '#FFF',
                padding: '14px 18px',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow: '0 6px 18px rgba(66,133,244,0.3)'
              }}
            >
              <span>Pay with Google Pay</span>
              <span style={{ fontSize: '1.2rem' }}>➔</span>
            </a>

            <a
              href={phonepeLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#5F259F',
                color: '#FFF',
                padding: '14px 18px',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                boxShadow: '0 6px 18px rgba(95,37,159,0.3)'
              }}
            >
              <span>Pay with PhonePe</span>
              <span style={{ fontSize: '1.2rem' }}>➔</span>
            </a>

            <a
              href={paytmLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#00BAF2',
                color: '#002E6E',
                padding: '14px 18px',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: 900,
                fontSize: '0.92rem',
                boxShadow: '0 6px 18px rgba(0,186,242,0.3)'
              }}
            >
              <span>Pay with Paytm UPI</span>
              <span style={{ fontSize: '1.2rem' }}>➔</span>
            </a>

            <a
              href={upiDeepLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#221F2D',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '12px 18px',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}
            >
              <span>BHIM UPI / Any Other App</span>
              <span style={{ fontSize: '1.1rem' }}>➔</span>
            </a>
          </div>
        )}

        {/* TAB 2: QR CODE SCANNER */}
        {activeTab === 'qr' && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '20px',
                border: '3px solid var(--gold, #F77F00)',
                display: 'inline-block',
                margin: '0 auto 12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src={qrImageUrl}
                alt="Payment UPI QR"
                style={{ width: '200px', height: '200px', display: 'block', borderRadius: '8px' }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#AAA' }}>
              Scan QR code using GPay, PhonePe, Paytm, or Mobile Banking App
            </div>
          </div>
        )}

        {/* TAB 3: CREDIT / DEBIT CARD */}
        {activeTab === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 20, fontSize: '0.82rem' }}>
            <div>
              <label style={{ color: '#FFD700', fontWeight: 700 }}>Cardholder Name</label>
              <input
                className="dv-input"
                placeholder="Name on card"
                style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                value={cardForm.name}
                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ color: '#FFD700', fontWeight: 700 }}>Card Number</label>
              <input
                className="dv-input"
                placeholder="4532 •••• •••• 8912"
                style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                value={cardForm.number}
                onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ color: '#FFD700', fontWeight: 700 }}>Expiry Date</label>
                <input
                  className="dv-input"
                  placeholder="MM/YY"
                  style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                />
              </div>
              <div>
                <label style={{ color: '#FFD700', fontWeight: 700 }}>CVV / CVC</label>
                <input
                  type="password"
                  maxLength={4}
                  className="dv-input"
                  placeholder="•••"
                  style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NET BANKING */}
        {activeTab === 'banking' && (
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            <label style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.82rem' }}>Select Net Banking Bank</label>
            <select
              className="dv-input"
              style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)', marginTop: 6 }}
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              <option value="HDFC Bank">HDFC Bank NetBanking</option>
              <option value="ICICI Bank">ICICI Bank Internet Banking</option>
              <option value="State Bank of India">State Bank of India (SBI)</option>
              <option value="Axis Bank">Axis Bank NetBanking</option>
              <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
            </select>
          </div>
        )}

        {/* UPI VPA INFO & COPY BUTTON */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#221F2D',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <span style={{ color: '#AAA' }}>VPA ID: <strong style={{ color: '#FFF' }}>dinevo@upi</strong></span>
          <button
            type="button"
            onClick={handleCopyUpi}
            style={{
              background: 'none',
              border: 'none',
              color: copied ? '#00E699' : 'var(--gold, #F77F00)',
              fontWeight: 800,
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

        {/* EXPIRATION TIMER */}
        <div style={{ fontSize: '0.82rem', color: '#AAA', marginBottom: '20px' }}>
          Session expires in:{' '}
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: timeLeft < 60 ? '#FF4D4D' : '#FFD700' }}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {error && (
          <p style={{ color: '#FF4D4D', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 700 }}>
            {error}
          </p>
        )}

        {/* CONFIRM PAYMENT BUTTON */}
        <button
          onClick={handleConfirmPayment}
          disabled={verifying || timeLeft <= 0}
          className="btn-dv btn-gold btn-block"
          style={{ padding: '14px', fontSize: '0.98rem', fontWeight: 900, boxShadow: '0 8px 24px rgba(247,127,0,0.3)' }}
        >
          {verifying ? <span className="dv-spinner" /> : '✓ VERIFY & EXECUTE PAYMENT'}
        </button>

        <button
          onClick={onClose}
          disabled={verifying}
          style={{
            background: 'none',
            border: 'none',
            color: '#AAA',
            fontSize: '0.85rem',
            cursor: 'pointer',
            padding: '10px 16px',
            marginTop: '8px',
            textDecoration: 'underline'
          }}
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
}
