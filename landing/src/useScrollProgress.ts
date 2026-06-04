import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Returns a live 0→1 progress of the whole page and wires Lenis to ScrollTrigger.
 * Disables smooth scroll under prefers-reduced-motion.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: !reduced });
    lenisRef.current = lenis;

    // ScrollTrigger.update expects no arguments; cast to satisfy Lenis ScrollCallback type
    lenis.on('scroll', () => ScrollTrigger.update());
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setProgress(self.progress),
    });

    return () => {
      st.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return progress;
}
