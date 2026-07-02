import { useEffect, useRef, type DependencyList } from 'react';

export function useStagger(deps: DependencyList = []) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>('.stagger-item'));
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '120px 0px -24px 0px', threshold: 0.01 }
    );

    items.forEach((item, i) => {
      item.classList.remove('in-view');
      item.style.transitionDelay = `${Math.min(i * 28, 168)}ms`;
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      items.forEach((item) => {
        item.style.transitionDelay = '';
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
