import React, { useEffect, useRef, useState } from 'react';

interface CoverImageProps {
  src: string | null;
  file?: File | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback: React.ReactNode;
}

const CoverImage: React.FC<CoverImageProps> = ({
  src,
  file = null,
  alt,
  className,
  style,
  fallback,
}) => {
  const retryUrlRef = useRef<string | null>(null);
  const [displaySrc, setDisplaySrc] = useState<string | null>(src);
  const [hasLoadError, setHasLoadError] = useState(false);

  const releaseRetryUrl = () => {
    if (!retryUrlRef.current) return;
    URL.revokeObjectURL(retryUrlRef.current);
    retryUrlRef.current = null;
  };

  useEffect(() => {
    releaseRetryUrl();
    setDisplaySrc(src);
    setHasLoadError(false);
  }, [src, file]);

  useEffect(() => () => {
    releaseRetryUrl();
  }, []);

  const handleError = () => {
    if (!src || !file || retryUrlRef.current) {
      setHasLoadError(true);
      return;
    }

    const recoveredUrl = URL.createObjectURL(file);
    retryUrlRef.current = recoveredUrl;
    setDisplaySrc(recoveredUrl);
    setHasLoadError(false);
  };

  if (!displaySrc || hasLoadError) {
    return <>{fallback}</>;
  }

  return (
    <img
      key={displaySrc}
      src={displaySrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  );
};

export default CoverImage;
