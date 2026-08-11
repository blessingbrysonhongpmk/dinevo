import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="dv-loading-screen" role="status" aria-live="polite">
      <span className="dv-spinner" />
      <span>{message}</span>
    </div>
  );
}
