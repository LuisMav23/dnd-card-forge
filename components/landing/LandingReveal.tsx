'use client';

import { useEffect, useRef, useState } from 'react';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

type LandingRevealProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Fades children in when scrolled into view. Respects prefers-reduced-motion.
 */
export default function LandingReveal({ children, className }: LandingRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={`landing-reveal${visible ? ' landing-visible' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}
