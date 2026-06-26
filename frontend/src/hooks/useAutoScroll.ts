import { useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  /** Pixels por frame. 0.5–1.5 é suave; não exceder 2.0. Default: 0.8 */
  speed?: number;
  /** Pausa ao detectar scroll manual / toque / teclado e retoma após 3s. Default: true */
  pauseOnInteraction?: boolean;
  /** Para o auto-scroll permanentemente quando scrollY >= stopAt. */
  stopAt?: number;
  /** Espera (ms) antes de iniciar — permite que a página carregue. Default: 1500 */
  delay?: number;
}

export function useAutoScroll({
  speed = 0.8,
  pauseOnInteraction = true,
  stopAt,
  delay = 1500,
}: UseAutoScrollOptions = {}) {
  const rafId      = useRef<number | null>(null);
  const timeoutId  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPaused   = useRef(false);
  const started    = useRef(false);

  useEffect(() => {
    // Respeita preferência de acessibilidade: sem animação se usuário pediu
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

    window.addEventListener('wheel',      handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('keydown',    handleInteraction);

    const animate = () => {
      // Para permanentemente ao atingir o limite (ex: fim da seção hero)
      if (stopAt !== undefined && window.scrollY >= stopAt) return;

      if (!isPaused.current) {
        window.scrollBy(0, speed);
      }
      rafId.current = requestAnimationFrame(animate);
    };

    // Delay inicial: aguarda renderização e extração de frames do vídeo
    timeoutId.current = setTimeout(() => {
      if (!started.current) {
        started.current = true;
        rafId.current = requestAnimationFrame(animate);
      }
    }, delay);

    return () => {
      if (rafId.current)     cancelAnimationFrame(rafId.current);
      if (timeoutId.current) clearTimeout(timeoutId.current);
      window.removeEventListener('wheel',      handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown',    handleInteraction);
    };
  }, [speed, pauseOnInteraction, stopAt, delay]);
}
