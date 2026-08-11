import React from 'react';
import QuantitySelector from './QuantitySelector';
import ImageWithFallback from './ImageWithFallback';
import { FlameIcon } from './Icons';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="dv-cart-item">
      {item.image && <ImageWithFallback src={item.image} alt={item.name} />}
      <div className="info">
        <div className="row1">
          <div>
            <strong style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{item.name}</strong>

            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', fontSize: '0.78rem' }}>
              {item.spiceLevel && (
                <span style={{ background: 'var(--cream-2)', padding: '2px 8px', borderRadius: 'var(--r-pill)', color: 'var(--ink-soft)' }}>
                  <FlameIcon width={10} height={10} style={{ color: 'var(--burgundy)' }} /> Spice: {item.spiceLevel}
                </span>
              )}
              {item.selectedAddOns?.map((a) => (
                <span key={a.name} style={{ background: 'var(--gold-tint)', color: '#C45E00', padding: '2px 8px', borderRadius: 'var(--r-pill)', fontWeight: 600 }}>
                  +{a.name} (₹{a.price})
                </span>
              ))}
            </div>

            {item.notes && (
              <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: 6, fontWeight: 500 }}>
                Note: {item.notes}
              </p>
            )}
          </div>
          <span className="dv-price">
            <small>₹</small>{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.itemKey, 1)}
            onDecrease={() => onUpdateQuantity(item.itemKey, -1)}
          />
          <button className="remove-link" onClick={() => onRemove(item.itemKey)}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
