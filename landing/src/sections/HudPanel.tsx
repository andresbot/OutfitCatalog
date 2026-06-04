import type { ReactNode, CSSProperties } from 'react';

export function HudPanel({
  children, accent = '#C9A84C', className = '',
}: { children: ReactNode; accent?: string; className?: string }) {
  return (
    <div className={`hud-panel ${className}`} style={{ '--accent': accent } as CSSProperties}>
      <span className="hud-corner tl" /><span className="hud-corner tr" />
      <span className="hud-corner bl" /><span className="hud-corner br" />
      {children}
    </div>
  );
}
