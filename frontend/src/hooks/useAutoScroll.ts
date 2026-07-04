import { useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  delay?: number;
  enabled?: boolean;
  pauseOnInteraction?: boolean;
  speed?: number;
  stopAt?: number;
}

export function useAutoScroll({
  delay = 1500,
  enabled = true,
  pauseOnInteraction = true,
  speed = 0.8,
  stopAt,
}: UseAutoScrollOptions = {}) {
  const rafId = useRef<number | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPaused = useRef(false);
  const lastFrameAt = useRef(0);

  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scheduleResume = () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(() => {
        isPaused.current = false;
      }, 3000);
    };

    const handleInteraction = () => {
      if (!pauseOnInteraction) return;
      isPaused.current = true;
      scheduleResume();
    };

    const animate = (now: number) => {
      if (stopAt !== undefined && window.scrollY >= stopAt) return;

      const previous = lastFrameAt.current || now;
      const elapsed = Math.min(48, now - previous);
      lastFrameAt.current = now;

      if (!isPaused.current) {
        window.scrollBy(0, speed * (elapsed / 16.67));
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('wheel', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction);

    timeoutId.current = setTimeout(() => {
      lastFrameAt.current = 0;
      rafId.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (timeoutId.current) clearTimeout(timeoutId.current);
      window.removeEventListener('wheel', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [delay, enabled, pauseOnInteraction, speed, stopAt]);
}
