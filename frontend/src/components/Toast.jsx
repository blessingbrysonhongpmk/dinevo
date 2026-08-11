import React from 'react';
import { CheckIcon } from './Icons';

export default function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div className="dv-toast" role="status">
      <CheckIcon />
      {message}
    </div>
  );
}
