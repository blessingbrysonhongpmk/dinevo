import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, CheckIcon } from './Icons';
import ReceiptModal from './ReceiptModal';

export default function PaymentModal({ order, initialMethod = 'UPI', onPaymentSuccess, onClose }) {
  const mapMethodToTab = (m) => {
    if (m === 'CARD') return 'card';
    if (m === 'NET_BANKING') return 'banking';
    if (m === 'CASH') return 'cash';
    if (m === 'QR') return 'qr';
    return 'upi';
  };

  const [activeTab, setActiveTab] = useState(mapMethodToTab(initialMethod)); // 'upi', 'qr', 'card', 'banking', 'cash'
  const [tipAmount, setTipAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [completedReceipt, setCompletedReceipt] = useState(null);

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

  const totalBaseAmount = Number(order?.total || order?.totalAmount || 0);
  const finalGrandTotal = Math.round((totalBaseAmount + Number(tipAmount || 0)) * 100) / 100;

  const noteText = encodeURIComponent(`DINEVO Table ${order?.tableNumber || '01'} Order #${order?.orderNumber || '1001'}`);
  const upiDeepLink = `upi://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${finalGrandTotal}&cu=INR&tn=${noteText}`;
  const gpayLink = `gpay://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${finalGrandTotal}&cu=INR&tn=${noteText}`;
  const phonepeLink = `phonepe://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${finalGrandTotal}&cu=INR&tn=${noteText}`;
  const paytmLink = `paytmmp://pay?pa=dinevo@upi&pn=DINEVO%20Resort&am=${finalGrandTotal}&cu=INR&tn=${noteText}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=10&data=${encodeURIComponent(upiDeepLink)}`;

  const detectCardType = (num) => {
    const clean = num.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'VISA 💳';
    if (/^5[1-5]/.test(clean)) return 'MASTERCARD 💳';
    if (/^6[0-9]/.test(clean)) return 'RUPAY 💳';
    if (/^3[47]/.test(clean)) return 'AMEX 💳';
    return 'CREDIT / DEBIT CARD 💳';
  };

  const handleConfirmPayment = async (overrideMethod) => {
    setVerifying(true);
    setError('');
    const chosenMethod = overrideMethod || (activeTab === 'card' ? 'CARD' : activeTab === 'banking' ? 'NET_BANKING' : activeTab === 'cash' ? 'CASH' : 'UPI');

    try {
      const resData = await onPaymentSuccess(chosenMethod, {
        tipAmount,
        bankName: selectedBank,
        cardDetails: cardForm
      });
      if (resData?.receipt) {
        setCompletedReceipt(resData.receipt);
      }
    } catch (err) {
      setError(err.message || 'Payment verification failed. Please try again.');
      setVerifying(false);
    }
  };

  const handleRazorpaySdkCheckout = () => {
    setVerifying(true);
    // Simulate Razorpay SDK modal trigger
    setTimeout(() => {
      handleConfirmPayment('RAZORPAY');
    }, 1200);
  };

  if (completedReceipt) {
    return <ReceiptModal receipt={completedReceipt} onClose={onClose} />;
  }

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
        backgroundColor: 'rgba(12, 10, 18, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(170deg, #1C182A 0%, #120F1D 100%)',
          color: '#FAF6F0',
          borderRadius: '28px',
          padding: '28px 24px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255, 215, 0, 0.35)',
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
          <ShieldCheckIcon width={16} height={16} /> 256-BIT POS ENCRYPTED GATEWAY
        </div>

        <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', margin: '4px 0 2px', fontWeight: 900 }}>
          Table {order?.tableNumber || '01'} Express Checkout
        </h2>
        <p style={{ fontSize: '0.84rem', color: '#AAA', marginBottom: '16px' }}>
          Order ID: <strong style={{ color: 'var(--gold, #FFD700)' }}>#{order?.orderNumber || 'DINEVO-9481'}</strong>
        </p>

        {/* AMOUNT DUE CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #272138 0%, #1E192D 100%)',
            border: '1px solid rgba(255,215,0,0.25)',
            borderRadius: '20px',
            padding: '16px',
            marginBottom: '18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            TOTAL AMOUNT PAYABLE
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold, #FFD700)', marginTop: '2px', fontFamily: 'monospace' }}>
            ₹{finalGrandTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
            Subtotal: ₹{totalBaseAmount.toFixed(2)} {tipAmount > 0 && `+ Tip: ₹${tipAmount}`}
          </div>
        </div>

        {/* STAFF COURTESY TIP SELECTOR */}
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 16, marginBottom: 18, textAlign: 'left', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.76rem', color: '#FFD700', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>💖 Add Staff Tip (Optional)</span>
            {tipAmount > 0 && <span style={{ color: '#00E699' }}>Added ₹{tipAmount}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[0, 30, 50, 100].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTipAmount(amount)}
                style={{
                  padding: '6px',
                  borderRadius: 10,
                  border: tipAmount === amount ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.15)',
                  background: tipAmount === amount ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                  color: tipAmount === amount ? '#FFD700' : '#FFF',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {amount === 0 ? 'No Tip' : `₹${amount}`}
              </button>
            ))}
          </div>
        </div>

        {/* PAYMENT METHOD TABS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 18, background: '#110E1A', padding: 4, borderRadius: 14 }}>
          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            style={{
              padding: '8px 2px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'upi' ? 'var(--gold, #FFD700)' : 'transparent',
              color: activeTab === 'upi' ? '#000' : '#AAA'
            }}
          >
            🚀 Apps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            style={{
              padding: '8px 2px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'qr' ? 'var(--gold, #FFD700)' : 'transparent',
              color: activeTab === 'qr' ? '#000' : '#AAA'
            }}
          >
            📷 QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            style={{
              padding: '8px 2px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'card' ? 'var(--gold, #FFD700)' : 'transparent',
              color: activeTab === 'card' ? '#000' : '#AAA'
            }}
          >
            💳 Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('banking')}
            style={{
              padding: '8px 2px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'banking' ? 'var(--gold, #FFD700)' : 'transparent',
              color: activeTab === 'banking' ? '#000' : '#AAA'
            }}
          >
            🏛️ Banks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cash')}
            style={{
              padding: '8px 2px',
              borderRadius: 10,
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'cash' ? 'var(--gold, #FFD700)' : 'transparent',
              color: activeTab === 'cash' ? '#000' : '#AAA'
            }}
          >
            💵 Cash
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
                boxShadow: '0 6px 18px rgba(66,133,244,0.35)'
              }}
            >
              <span>Pay with Google Pay (GPay)</span>
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
                boxShadow: '0 6px 18px rgba(95,37,159,0.35)'
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
                boxShadow: '0 6px 18px rgba(0,186,242,0.35)'
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
              <span>BHIM UPI / Any Mobile Bank App</span>
              <span style={{ fontSize: '1.1rem' }}>➔</span>
            </a>
          </div>
        )}

        {/* TAB 2: DYNAMIC QR CODE */}
        {activeTab === 'qr' && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '20px',
                border: '3px solid var(--gold, #FFD700)',
                display: 'inline-block',
                margin: '0 auto 12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
              }}
            >
              <img
                src={qrImageUrl}
                alt="Payment UPI QR"
                style={{ width: '200px', height: '200px', display: 'block', borderRadius: '8px' }}
              />
            </div>
            <div style={{ fontSize: '0.82rem', color: '#AAA' }}>
              Scan QR code using GPay, PhonePe, Paytm, or Mobile Banking App
            </div>
          </div>
        )}

        {/* TAB 3: CREDIT / DEBIT CARD */}
        {activeTab === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 20, fontSize: '0.82rem' }}>
            <div style={{ color: '#FFD700', fontSize: '0.78rem', fontWeight: 800 }}>
              {detectCardType(cardForm.number)}
            </div>
            <div>
              <label style={{ color: '#AAA', fontWeight: 700 }}>Cardholder Name</label>
              <input
                className="dv-input"
                placeholder="Name on card"
                style={{ background: '#13111A', color: '#FFF', borderColor: 'rgba(255,255,255,0.18)' }}
                value={cardForm.name}
                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ color: '#AAA', fontWeight: 700 }}>Card Number</label>
              <input
                className="dv-input"
                placeholder="4532 •••• •••• 8912"
                style={{ background: '#13111A', color: '#FFF', borderColor: 'rgba(255,255,255,0.18)' }}
                value={cardForm.number}
                onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ color: '#AAA', fontWeight: 700 }}>Expiry Date</label>
                <input
                  className="dv-input"
                  placeholder="MM/YY"
                  style={{ background: '#13111A', color: '#FFF', borderColor: 'rgba(255,255,255,0.18)' }}
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                />
              </div>
              <div>
                <label style={{ color: '#AAA', fontWeight: 700 }}>CVV / CVC</label>
                <input
                  type="password"
                  maxLength={4}
                  className="dv-input"
                  placeholder="•••"
                  style={{ background: '#13111A', color: '#FFF', borderColor: 'rgba(255,255,255,0.18)' }}
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
            <label style={{ color: '#FFD700', fontWeight: 700, fontSize: '0.82rem' }}>Select Net Banking Partner</label>
            <select
              className="dv-input"
              style={{ background: '#13111A', color: '#FFF', borderColor: 'rgba(255,255,255,0.18)', marginTop: 6 }}
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              <option value="HDFC Bank">HDFC Bank NetBanking</option>
              <option value="ICICI Bank">ICICI Bank Internet Banking</option>
              <option value="State Bank of India">State Bank of India (SBI)</option>
              <option value="Axis Bank">Axis Bank NetBanking</option>
              <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
              <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
            </select>
          </div>
        )}

        {/* TAB 5: CASH AT COUNTER */}
        {activeTab === 'cash' && (
          <div style={{ background: '#181524', padding: '16px', borderRadius: '16px', marginBottom: 20, border: '1px solid rgba(255,215,0,0.3)', textAlign: 'left' }}>
            <div style={{ color: '#FFD700', fontWeight: 800, fontSize: '0.92rem', marginBottom: 6 }}>
              💵 Cash Payment at Table / Counter
            </div>
            <div style={{ color: '#AAA', fontSize: '0.82rem', lineHeight: 1.4 }}>
              Your order will be transmitted directly to the kitchen. You can pay cash to the waiter upon serving or at the cashier desk.
            </div>
          </div>
        )}

        {/* VPA COPY */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.04)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <span style={{ color: '#AAA' }}>Merchant VPA: <strong style={{ color: '#FFF' }}>dinevo@upi</strong></span>
          <button
            type="button"
            onClick={handleCopyUpi}
            style={{
              background: 'none',
              border: 'none',
              color: copied ? '#00E699' : 'var(--gold, #FFD700)',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <><CheckIcon width={14} height={14} /> Copied</> : 'Copy VPA'}
          </button>
        </div>

        {/* EXPIRATION TIMER */}
        <div style={{ fontSize: '0.82rem', color: '#AAA', marginBottom: '16px' }}>
          Session expires in:{' '}
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: timeLeft < 60 ? '#FF4D4D' : '#FFD700' }}>
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
          onClick={() => handleConfirmPayment()}
          disabled={verifying || timeLeft <= 0}
          className="btn-dv btn-gold btn-block"
          style={{ padding: '14px', fontSize: '0.98rem', fontWeight: 900, boxShadow: '0 8px 24px rgba(255,215,0,0.3)', marginBottom: 8 }}
        >
          {verifying ? <span className="dv-spinner" /> : `✓ CONFIRM & EXECUTE ₹${finalGrandTotal.toFixed(2)} PAYMENT`}
        </button>

        <button
          type="button"
          onClick={handleRazorpaySdkCheckout}
          disabled={verifying}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #072654 0%, #0C4B8E 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '12px',
            borderRadius: '16px',
            fontSize: '0.86rem',
            fontWeight: 800,
            cursor: 'pointer',
            marginBottom: 10,
            boxShadow: '0 4px 14px rgba(12,75,142,0.3)'
          }}
        >
          💳 LAUNCH RAZORPAY OFFICIAL CHECKOUT SDK
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
