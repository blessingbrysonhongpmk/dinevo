import React, { useState } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';

export default function ImageWithFallback({ src, alt, className, style, ...props }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc || FALLBACK_IMAGE}
      alt={alt || 'Food image'}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
