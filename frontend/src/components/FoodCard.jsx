import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { StarIcon, CheckIcon, FlameIcon } from './Icons';

export default function FoodCard({ item }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(item, 1, {
      spiceLevel: item.spiceLevel === 0 ? 'Mild' : item.spiceLevel === 1 ? 'Mild' : item.spiceLevel === 2 ? 'Medium' : item.spiceLevel === 3 ? 'Hot' : 'Extra Hot',
      selectedAddOns: [],
      notes: ''
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const isSignature = item.isSignature || item.category.toLowerCase() === 'signature';
  const isSpicy = item.isSpicy || item.spiceLevel > 1;

  const isAvailable = item.available !== false && item.isAvailable !== false;

  return (
    <div
      className="dv-food-card"
      style={!isAvailable ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
      onClick={() => isAvailable && navigate(`/food/${item._id}`)}
    >
      <div className="img-wrap">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600';
          }}
        />
        <div className="tags-row">
          {!isAvailable ? (
            <span className="tag" style={{ background: '#333', color: '#fff' }}>
              Currently Unavailable
            </span>
          ) : (
            <>
              <span className={`tag ${item.veg ? 'tag-veg' : 'tag-nonveg'}`}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                {item.veg ? 'Veg' : 'Non-Veg'}
              </span>
              {isSignature && (
                <span className="tag tag-signature">
                  <StarIcon /> Signature
                </span>
              )}
              {item.isPopular && !isSignature && (
                <span className="tag tag-popular">
                  <StarIcon /> Popular
                </span>
              )}
              {isSpicy && (
                <span className="tag" style={{ background: '#FBECEB', color: 'var(--burgundy)' }}>
                  <FlameIcon width={12} height={12} /> Spicy
                </span>
              )}
            </>
          )}
        </div>
      </div>
      <div className="body">
        <div className="top-row">
          <h3>{item.name}</h3>
        </div>
        <p className="desc">{item.description}</p>
        <div className="perforation" />
        <div className="bottom-row">
          <div>
            <span className="dv-price">
              <small>₹</small>{item.price}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <StarIcon style={{ color: 'var(--gold)' }} /> {item.rating || 4.8}
            </span>
          </div>
          <button
            className="dv-add-btn"
            style={!isAvailable ? { background: 'var(--ink-faint)', cursor: 'not-allowed' } : added ? { background: 'var(--sage)', color: '#fff' } : {}}
            onClick={(e) => isAvailable && handleAdd(e)}
            disabled={!isAvailable}
            aria-label={`Add ${item.name} to cart`}
          >
            {!isAvailable ? '✕' : added ? <CheckIcon /> : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

