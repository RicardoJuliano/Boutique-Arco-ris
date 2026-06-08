import { useState } from 'react';

interface Props {
  src?: string | null;
  alt: string;
  fallbackLetter: string;
  className?: string;
}

export default function ProductImage({ src, alt, fallbackLetter, className = '' }: Props) {
  const [imgError, setImgError]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!src || imgError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-surface2 ${className}`}>
        <span className="font-display text-5xl font-light text-gold/20">{fallbackLetter}</span>
      </div>
    );
  }

  return (
    <>
      {!imgLoaded && <div className="absolute inset-0 skeleton" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
        className={`w-full h-full object-cover img-reveal ${imgLoaded ? 'loaded' : ''} ${className}`}
      />
    </>
  );
}
