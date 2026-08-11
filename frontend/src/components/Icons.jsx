import React from 'react';

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const CartIcon = (p) => (
  <svg viewBox="0 0 24 24" width={20} height={20} {...base} {...p}>
    <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <path d="M2.5 3h2l2.3 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const QrIcon = (p) => (
  <svg viewBox="0 0 24 24" width={24} height={24} {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14h1v1h-1zM14 20h1v1h-1zM17 17h1v1h-1zM20 20h1v1h-1z" fill="currentColor" stroke="none" />
  </svg>
);

export const ArrowLeft = (p) => (
  <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" width={14} height={14} {...base} {...p}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const StarIcon = (p) => (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" stroke="none" {...p}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6l-5.9 3 1.3-6.6-4.9-4.6 6.6-.8z" />
  </svg>
);

export const FlameIcon = (p) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" stroke="none" {...p}>
    <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.42 4.03-9 8-13 1 2 2.5 4 4 5 2.5 1.5 4.5 4 4.5 7.5 0 4.42-3.53 8.5-7.5 8.5z" />
  </svg>
);

export const ShieldCheckIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const CreditCardIcon = (p) => (
  <svg viewBox="0 0 24 24" width={20} height={20} {...base} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

export const KitchenIcon = (p) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...p}>
    <path d="M6 13.8V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9.8M3 21h18M5 14h14v7H5z" />
  </svg>
);

export const EmptyCartIcon = (p) => (
  <svg viewBox="0 0 24 24" width={32} height={32} {...base} {...p}>
    <path d="M2.5 3h2l2.3 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

