import { useMemo } from 'react';
import { Scene } from './scene/Scene';
import { ScrollCamera } from './scene/ScrollCamera';
import { VideoHologram } from './scene/VideoHologram';
import { PhoneCore } from './scene/PhoneCore';
import { useSharedVideo } from './scene/useSharedVideo';
import { useScrollProgress } from './useScrollProgress';
import { Overlay } from './sections/Overlay';

export function App() {
  const progress = useScrollProgress();
  const { texture } = useSharedVideo('/video.mp4');

  const lowPower = useMemo(
    () => /Mobi|Android/i.test(navigator.userAgent) || (navigator.hardwareConcurrency ?? 8) <= 4,
    [],
  );

  return (
    <main className="app-shell">
      <div className="scene-fixed">
        <Scene lowPower={lowPower}>
          <ScrollCamera progress={progress} />
          <VideoHologram texture={texture} position={[0, 0.15, 0]} />
          <PhoneCore texture={texture} position={[0, 0, -0.4]} />
        </Scene>
      </div>
      <Overlay />
    </main>
  );
}
