import { useEffect, useRef, useState } from 'react';

interface HeroAnimationOptions {
  startRatio: number;
  endRatio: number;
  easing: number;
}

interface HeroAnimationState {
  frames: ImageBitmap[];
  target: number;
  current: number;
  lastDrawn: number;
  rafId: number;
  ready: boolean;
  visible: boolean;
  sectionTop: number;
  scrollTrack: number;
}

function getHeroFrameConfig() {
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  return {
    frames: mobile ? 24 : 48,
    width: mobile ? 640 : 960,
    height: mobile ? 360 : 540,
  };
}

function clampFrame(value: number, frameCount: number) {
  return Math.round(Math.max(0, Math.min(frameCount - 1, value)));
}

function getScrollTarget(scrollY: number, sectionTop: number, scrollTrack: number, frameCount: number) {
  const scrolledIn = Math.max(0, scrollY - sectionTop);
  const progress = Math.min(1, scrolledIn / scrollTrack);
  return progress * (frameCount - 1);
}

function waitForIdle() {
  return new Promise<void>((resolve) => {
    const requestIdle = window.requestIdleCallback;
    if (requestIdle) {
      requestIdle(() => resolve(), { timeout: 120 });
      return;
    }
    window.setTimeout(resolve, 16);
  });
}

function closeFrames(frames: ImageBitmap[]) {
  frames.forEach((frame) => frame.close());
}

export function useHeroAnimation({ startRatio, endRatio, easing }: HeroAnimationOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [posterVisible, setPosterVisible] = useState(true);
  const [autoScrollReady, setAutoScrollReady] = useState(false);

  const animation = useRef<HeroAnimationState>({
    frames: [],
    target: 0,
    current: 0,
    lastDrawn: -1,
    rafId: 0,
    ready: false,
    visible: true,
    sectionTop: 0,
    scrollTrack: 1,
  });

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!video || !canvas || !section || typeof createImageBitmap === 'undefined') return;

    const state = animation.current;
    const config = getHeroFrameConfig();
    let aborted = false;

    state.target = 0;
    state.current = 0;
    state.lastDrawn = -1;
    state.ready = false;
    setPosterVisible(true);
    setAutoScrollReady(false);

    canvas.width = config.width;
    canvas.height = config.height;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const measure = () => {
      state.sectionTop = section.getBoundingClientRect().top + window.scrollY;
      state.scrollTrack = Math.max(1, section.offsetHeight - window.innerHeight);
      state.target = getScrollTarget(window.scrollY, state.sectionTop, state.scrollTrack, config.frames);
    };

    const drawFrame = (value: number) => {
      const target = clampFrame(value, config.frames);
      let bitmap = state.frames[target];

      if (!bitmap) {
        for (let index = target - 1; index >= 0; index--) {
          if (state.frames[index]) {
            bitmap = state.frames[index];
            break;
          }
        }
      }

      if (!bitmap) {
        for (let index = target + 1; index < config.frames; index++) {
          if (state.frames[index]) {
            bitmap = state.frames[index];
            break;
          }
        }
      }

      if (bitmap) context.drawImage(bitmap, 0, 0, config.width, config.height);
    };

    const tick = () => {
      if (state.ready && state.visible) {
        const delta = state.target - state.current;
        state.current = Math.abs(delta) < 0.025 ? state.target : state.current + delta * easing;

        const frameIndex = clampFrame(state.current, config.frames);
        if (frameIndex !== state.lastDrawn) {
          state.lastDrawn = frameIndex;
          drawFrame(frameIndex);
        }
      }

      state.rafId = requestAnimationFrame(tick);
    };

    const seekTo = (time: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          video.removeEventListener('seeked', onSeeked);
          reject(new Error(`seek timeout at ${time.toFixed(3)}s`));
        }, 5000);

        const onSeeked = () => {
          window.clearTimeout(timer);
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };

        video.addEventListener('seeked', onSeeked);
        video.currentTime = time;
      });

    const captureFrame = async (canvasSource: HTMLCanvasElement, time: number) => {
      await seekTo(time);
      if (aborted) return null;

      const frameContext = canvasSource.getContext('2d', { alpha: false });
      if (!frameContext) return null;

      frameContext.drawImage(video, 0, 0, config.width, config.height);
      return createImageBitmap(canvasSource);
    };

    const extractFrames = async () => {
      const duration = video.duration;
      if (!duration || !Number.isFinite(duration)) return;

      const startTime = duration * startRatio;
      const endTime = duration * endRatio;
      const usableDuration = Math.max(0.1, endTime - startTime);
      const buffer = document.createElement('canvas');
      buffer.width = config.width;
      buffer.height = config.height;

      const frames: ImageBitmap[] = new Array(config.frames);
      closeFrames(state.frames);
      state.frames = frames;

      const firstFrame = await captureFrame(buffer, startTime);
      if (!firstFrame || aborted) return;

      frames[0] = firstFrame;
      context.drawImage(firstFrame, 0, 0, config.width, config.height);
      state.ready = true;
      state.lastDrawn = -1;
      setPosterVisible(false);

      for (let index = 1; index < config.frames - 1; index++) {
        await waitForIdle();
        if (aborted) return;

        const time = startTime + (index / (config.frames - 1)) * usableDuration;
        const frame = await captureFrame(buffer, time);
        if (!frame || aborted) return;
        frames[index] = frame;
      }

      await waitForIdle();
      if (aborted) return;

      const finalFrame = await captureFrame(buffer, endTime);
      if (!finalFrame || aborted) return;

      frames[config.frames - 1] = finalFrame;
      setAutoScrollReady(true);
    };

    const onScroll = () => {
      state.target = getScrollTarget(window.scrollY, state.sectionTop, state.scrollTrack, config.frames);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        state.visible = entry.isIntersecting;
        if (!entry.isIntersecting && state.ready) {
          state.target = config.frames - 1;
          state.current = config.frames - 1;
          state.lastDrawn = config.frames - 1;
          drawFrame(config.frames - 1);
        }
      },
      { threshold: 0 },
    );

    const onCanPlay = () => {
      video.pause();
      measure();
      extractFrames().catch((error) => {
        if (!aborted) console.error('[hero] frame extraction failed:', error);
      });
    };

    measure();
    observer.observe(section);
    state.rafId = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    if (video.readyState >= 2) onCanPlay();
    else video.addEventListener('canplay', onCanPlay, { once: true });

    return () => {
      aborted = true;
      cancelAnimationFrame(state.rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      video.removeEventListener('canplay', onCanPlay);
      observer.disconnect();
      closeFrames(state.frames);
      state.frames = [];
      state.ready = false;
      setAutoScrollReady(false);
    };
  }, [easing, endRatio, startRatio]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const content = contentRef.current;
    if (!content) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const scrollY = window.scrollY;
      content.style.transform = `translateY(${scrollY * 0.3}px)`;
      content.style.opacity = String(Math.max(0, 1 - scrollY / 600));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return {
    autoScrollReady,
    canvasRef,
    contentRef,
    posterVisible,
    sectionRef,
    videoRef,
  };
}
