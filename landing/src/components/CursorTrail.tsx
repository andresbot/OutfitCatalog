import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 12;

export function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const dots: HTMLDivElement[] = [];
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const dot = document.createElement('div');
      dot.className = 'trail-dot';
      dot.style.opacity = String(1 - i / TRAIL_LENGTH);
      dot.style.width = `${4 - i * 0.2}px`;
      dot.style.height = `${4 - i * 0.2}px`;
      container.appendChild(dot);
      dots.push(dot);
    }

    const positions: { x: number; y: number }[] = Array(TRAIL_LENGTH).fill({ x: -100, y: -100 });
    let mouseX = -100, mouseY = -100;

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMove);

    let rafId: number;
    const animate = () => {
      positions[0] = { x: mouseX, y: mouseY };
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        positions[i] = {
          x: positions[i].x + (positions[i - 1].x - positions[i].x) * 0.35,
          y: positions[i].y + (positions[i - 1].y - positions[i].y) * 0.35,
        };
      }
      dots.forEach((dot, i) => {
        dot.style.left = `${positions[i].x}px`;
        dot.style.top = `${positions[i].y}px`;
      });
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      dots.forEach((d) => d.remove());
    };
  }, []);

  return <div ref={containerRef} className="cursor-trail" />;
}
