import React from 'react';
import { CheckIcon } from './Icons';

const STEPS = [
  { key: 'received', title: 'Order Received', desc: 'Order submitted to kitchen.' },
  { key: 'confirmed', title: 'Order Confirmed', desc: 'Restaurant confirmed your order.' },
  { key: 'preparing', title: 'Preparing', desc: 'Chefs are preparing your dishes fresh.' },
  { key: 'ready', title: 'Ready to Serve', desc: 'Plated and ready at counter.' },
  { key: 'served', title: 'Served at Table', desc: 'Served at your table. Enjoy your meal!' }
];

export default function OrderTimeline({ currentStatus }) {
  const getIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 0;
    if (s === 'received') return 0;
    if (s === 'confirmed') return 1;
    if (s === 'preparing') return 2;
    if (s === 'ready') return 3;
    if (s === 'served' || s === 'completed') return 4;
    return 0;
  };

  const currentIndex = getIndex(currentStatus);

  return (
    <div className="dv-stepper" style={{ marginTop: 24 }}>
      {STEPS.map((step, idx) => {
        const done = idx <= currentIndex;
        const active = idx === currentIndex;
        return (
          <div className={`step ${done ? 'done' : ''} ${active ? 'active' : ''}`} key={step.key}>
            <div className="rail">
              <div className="dot">
                {done ? (
                  <CheckIcon />
                ) : (
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                    {idx + 1}
                  </span>
                )}
              </div>
              {idx < STEPS.length - 1 && <div className="connector" />}
            </div>
            <div className="content">
              <h4 style={{ color: active ? 'var(--gold)' : done ? 'var(--sage-dark)' : 'var(--ink)' }}>
                {done ? '✓ ' : ''}{step.title}
              </h4>
              <p>{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
