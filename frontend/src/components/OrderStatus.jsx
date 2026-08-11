import React from 'react';

export default function OrderStatus({ status }) {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'received':
      case 'paid':
        return { bg: 'var(--gold-tint)', color: '#C45E00', border: 'var(--gold)' };
      case 'confirmed':
        return { bg: 'var(--sage-tint)', color: 'var(--sage-dark)', border: 'var(--sage)' };
      case 'preparing':
        return { bg: 'var(--burgundy-tint)', color: 'var(--burgundy)', border: 'var(--burgundy)' };
      case 'ready':
        return { bg: 'var(--gold-tint)', color: '#C45E00', border: 'var(--gold)' };
      case 'served':
      case 'completed':
        return { bg: 'var(--sage-tint)', color: 'var(--sage-dark)', border: 'var(--sage)' };
      default:
        return { bg: 'var(--cream-2)', color: 'var(--ink-soft)', border: 'var(--line)' };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      className="tag"
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      ● {status}
    </span>
  );
}
