// components/LazyImage.js
import React, { useEffect, useRef } from 'react';
import { Image } from '@nextui-org/react';

const LazyImage = ({ src, alt, ...props }) => {
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            img.setAttribute('src', src);
            img.removeAttribute('data-src');
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return <Image ref={imgRef} data-src={src} alt={alt} {...props} />;
};

export default LazyImage;
