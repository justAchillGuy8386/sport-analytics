'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.08
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const getTransformClasses = () => {
    if (isRevealed) {
      return 'opacity-100 translate-y-0 translate-x-0';
    }
    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-7';
      case 'down':
        return 'opacity-0 -translate-y-7';
      case 'left':
        return 'opacity-0 translate-x-7';
      case 'right':
        return 'opacity-0 -translate-x-7';
      case 'none':
        return 'opacity-0';
      default:
        return 'opacity-0 translate-y-7';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: '650ms'
      }}
      className={`transition-all cubic-bezier(0.16, 1, 0.3, 1) will-change-[opacity,transform] ${getTransformClasses()} ${className}`}
    >
      {children}
    </div>
  );
};
