import React from 'react';

export default function QuantitySelector({ quantity, onIncrease, onDecrease, min = 1 }) {
  return (
    <div className="dv-qty-stepper">
      <button onClick={onDecrease} disabled={quantity <= min} aria-label="Decrease quantity">
        &minus;
      </button>
      <span className="count">{quantity}</span>
      <button onClick={onIncrease} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
