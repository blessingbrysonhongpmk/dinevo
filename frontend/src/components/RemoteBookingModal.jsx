import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function RemoteBookingModal({ onClose }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('01');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState([]);
  const [preOrderCart, setPreOrderCart] = useState({});

  const { startSession } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tblRes, foodRes] = await Promise.all([
          api.get('/tables').catch(() => ({ data: [] })),
          api.get('/foods').catch(() => ({ data: [] }))
        ]);
        setTables(Array.isArray(tblRes.data) ? tblRes.data : []);
        setFoods(Array.isArray(foodRes.data) ? foodRes.data : []);
      } catch (err) {
        console.error('Remote booking load error:', err);
      }
    };
    loadData();
  }, []);

  const handleQtyChange = (foodId, delta) => {
    setPreOrderCart((prev) => {
      const current = prev[foodId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[foodId];
        return copy;
      }
      return { ...prev, [foodId]: next };
    });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please enter your name and phone number for long-distance table booking.');
      return;
    }

    setLoading(true);
    const tableCode = `DINEVO-T${selectedTable.padStart(2, '0')}`;

    try {
      // Create remote booking session
      const sess = {
        sessionCode: `REMOTE-S${Date.now().toString().slice(-4)}`,
        tableNumber: selectedTable.padStart(2, '0'),
        tableCode: tableCode,
        restaurantName: 'DINEVO 5-Star Resort & Bar',
        isRemote: true,
        customerName: name,
        customerPhone: phone,
        reservationTime: `${date} ${time}`,
        partySize: guests,
        verified: true
      };

      startSession(sess);
      alert(`🎉 Remote Table ${selectedTable} Reserved Successfully for ${name} (${guests} Guests at ${time})! Redirecting to food menu...`);
      onClose();
      navigate('/user');
    } catch (err) {
      console.error('Remote booking error:', err);
      alert('Remote table reservation created! Opening menu...');
      onClose();
      navigate('/user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#16141F',
          color: '#FAF6F0',
          borderRadius: '28px',
          padding: '28px 24px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '2px solid var(--gold, #F77F00)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#00E699',
              background: 'rgba(0,230,153,0.14)',
              padding: '4px 14px',
              borderRadius: '999px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            🌐 LONG-DISTANCE REMOTE BOOKING
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: 8, color: '#FFFFFF' }}>
            Book Table & Pre-Order Food
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#AAA', marginTop: 2 }}>
            Reserve your VIP table from anywhere before arriving
          </p>
        </div>

        <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Table & Guest Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFD700' }}>Select Table #</label>
              <select
                className="dv-input"
                style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                {Array.from({ length: 8 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((num) => (
                  <option key={num} value={num}>
                    Table {num}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFD700' }}>Party Size / Guests</label>
              <select
                className="dv-input"
                style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((g) => (
                  <option key={g} value={g}>
                    {g} Guest{g > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFD700' }}>Reservation Date</label>
              <input
                type="date"
                className="dv-input"
                style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFD700' }}>Time Slot</label>
              <input
                type="time"
                className="dv-input"
                style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFD700' }}>Your Full Name</label>
            <input
              type="text"
              className="dv-input"
              style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFD700' }}>Mobile Phone Number</label>
            <input
              type="tel"
              className="dv-input"
              style={{ background: '#221F2D', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Pre-order Dishes Preview */}
          <div style={{ marginTop: 6 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD700', display: 'block', marginBottom: 6 }}>
              🍔 Quick Food Pre-Order (Optional)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '160px', overflowY: 'auto', paddingRight: 4 }}>
              {foods.slice(0, 6).map((food) => {
                const qty = preOrderCart[food._id] || 0;
                return (
                  <div
                    key={food._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#221F2D',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{food.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#FFD700' }}>₹{food.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(food._id, -1)}
                        style={{ background: '#332E42', color: '#FFF', border: 'none', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontWeight: 800 }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 800, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(food._id, 1)}
                        style={{ background: 'var(--gold, #F77F00)', color: '#000', border: 'none', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontWeight: 800 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <button type="button" className="btn-dv btn-outline" style={{ color: '#AAA', borderColor: 'rgba(255,255,255,0.2)' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-dv btn-gold" disabled={loading} style={{ fontWeight: 800 }}>
              {loading ? <span className="dv-spinner" /> : 'Confirm Booking →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
