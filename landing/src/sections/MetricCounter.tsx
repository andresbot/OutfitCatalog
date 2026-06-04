import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function MetricCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!/^\d+$/.test(value)) { el.textContent = value; return undefined; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = value; return undefined; }
    const state = { n: 0 };
    const tween = gsap.to(state, {
      n: Number(value), duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = String(Math.round(state.n)); },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [value]);

  return (
    <div className="metric">
      <strong className="metric-value" ref={ref}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
