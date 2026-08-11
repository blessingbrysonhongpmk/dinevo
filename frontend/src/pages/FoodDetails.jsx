import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ClockIcon, StarIcon, FlameIcon, ShieldCheckIcon } from '../components/Icons';
import Toast from '../components/Toast';

export default function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, session } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [notes, setNotes] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get(`/foods/${id}`)
      .then((res) => {
        setItem(res.data);
        const defaultSpice =
          res.data.spiceLevel === 0 ? 'Mild' : res.data.spiceLevel === 1 ? 'Mild' : res.data.spiceLevel === 2 ? 'Medium' : res.data.spiceLevel === 3 ? 'Hot' : 'Extra Hot';
        setSpiceLevel(defaultSpice);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.name === addOn.name);
      if (exists) return prev.filter((a) => a.name !== addOn.name);
      return [...prev, addOn];
    });
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + Number(a.price || 0), 0);
    return (Number(item.price) + addOnsTotal) * qty;
  };

  const handleAdd = () => {
    if (!item) return;
    addItem(item, qty, {
      spiceLevel,
      selectedAddOns,
      notes
    });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate(session ? '/menu' : '/cart');
    }, 900);
  };

  if (loading) {
    return (
      <div className="dv-loading-screen">
        <span className="dv-spinner" /> Loading dish details...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="dv-empty">
        <h2>Dish not found</h2>
        <p style={{ marginTop: 8 }}>We couldn't load details for this food item.</p>
        <Link to={session ? '/menu' : '/table'} className="btn-dv btn-primary" style={{ marginTop: 20 }}>
          Back to Menu
        </Link>
      </div>
    );
  }

  const isSignature = item.isSignature || item.category.toLowerCase() === 'signature';

  return (
    <div className="container-dv">
      <div className="dv-details-grid">
        <div className="dv-details-img">
          <img src={item.image} alt={item.name} />
        </div>

        <div>
          <button
            onClick={() => navigate(-1)}
            className="dv-back-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft /> Back to menu
          </button>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className={`tag ${item.veg ? 'tag-veg' : 'tag-nonveg'}`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              {item.veg ? 'Veg' : 'Non-Veg'}
            </span>
            {isSignature && (
              <span className="tag tag-signature">
                <StarIcon /> Signature Dish
              </span>
            )}
            {item.isPopular && !isSignature && (
              <span className="tag tag-popular">
                <StarIcon /> Popular
              </span>
            )}
            <span className="tag" style={{ background: 'var(--cream-2)', color: 'var(--ink-soft)' }}>
              {item.category}
            </span>
          </div>

          <h1 className="dv-details-title">{item.name}</h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 14,
              color: 'var(--ink-soft)',
              fontSize: '0.92rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: 'var(--ink)' }}>
              <StarIcon style={{ color: 'var(--gold)' }} /> {item.rating || 4.8}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <ClockIcon /> 12-18 mins
            </span>
            <span className="dv-price" style={{ fontSize: '1.2rem', marginLeft: 'auto' }}>
              <small>₹</small>{item.price}
            </span>
          </div>

          <p className="dv-details-desc">{item.description}</p>

          {/* Ingredients & Allergens */}
          {(item.ingredients?.length > 0 || item.allergens?.length > 0) && (
            <div
              style={{
                marginTop: 20,
                background: 'var(--cream)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md)',
                padding: '14px 16px'
              }}
            >
              {item.ingredients?.length > 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: 6 }}>
                  <strong>Ingredients:</strong> {item.ingredients.join(', ')}
                </p>
              )}
              {item.allergens?.length > 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--burgundy)', fontWeight: 500 }}>
                  <strong>Allergen Notice:</strong> Contains {item.allergens.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Spice Level Customization */}
          <div style={{ marginTop: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.9rem', marginBottom: 10 }}>
              <FlameIcon width={16} height={16} style={{ color: 'var(--burgundy)' }} /> Spice Level Preference
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Mild', 'Medium', 'Hot', 'Extra Hot'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--line)',
                    background: spiceLevel === lvl ? 'var(--espresso)' : 'var(--surface)',
                    color: spiceLevel === lvl ? 'var(--cream)' : 'var(--ink)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setSpiceLevel(lvl)}
                >
                  {lvl === 'Extra Hot' ? '🔥 Extra Hot' : lvl === 'Hot' ? '🌶️ Hot' : lvl === 'Medium' ? '● Medium' : '○ Mild'}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          {item.addOns && item.addOns.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: 10 }}>
                Optional Add-ons
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {item.addOns.map((addOn) => {
                  const isChecked = selectedAddOns.some((a) => a.name === addOn.name);
                  return (
                    <label
                      key={addOn.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--line)',
                        background: isChecked ? 'var(--gold-tint)' : 'var(--surface)',
                        cursor: 'pointer',
                        fontSize: '0.88rem'
                      }}
                      onClick={() => toggleAddOn(addOn)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" checked={isChecked} onChange={() => {}} />
                        {addOn.name}
                      </span>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        +₹{addOn.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div style={{ marginTop: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>
              Special Kitchen Instructions
            </label>
            <textarea
              className="dv-note-box"
              placeholder="e.g. Dressing on the side, crisp sourdough, no cutlery needed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Sticky CTA */}
          <div className="dv-sticky-cta">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div className="dv-qty-stepper">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  &minus;
                </button>
                <span className="count">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button
                className="btn-dv btn-burgundy"
                style={
                  item.available === false || item.isAvailable === false
                    ? { flex: 1, minWidth: 220, padding: '14px 24px', fontSize: '1.02rem', background: 'var(--ink-faint)', cursor: 'not-allowed' }
                    : { flex: 1, minWidth: 220, padding: '14px 24px', fontSize: '1.02rem' }
                }
                onClick={handleAdd}
                disabled={item.available === false || item.isAvailable === false}
              >
                {item.available === false || item.isAvailable === false
                  ? 'Currently Unavailable'
                  : `Add to Order · ₹${calculateTotalPrice()}`}
              </button>
            </div>
          </div>

        </div>
      </div>
      <Toast message={`${qty} × ${item.name} added to cart`} show={showToast} />
    </div>
  );
}
