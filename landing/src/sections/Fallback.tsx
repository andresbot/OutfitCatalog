import { Overlay } from './Overlay';

export function Fallback() {
  return (
    <main className="app-shell">
      <div className="scene-fixed" aria-hidden="true" style={{
        background: 'radial-gradient(circle at 50% 35%, #1a1814, #0c0c0e 70%)',
      }}>
        <img src="/video-poster.png" alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.25,
        }} />
      </div>
      <Overlay />
    </main>
  );
}
