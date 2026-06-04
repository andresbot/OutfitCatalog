import { useMemo } from 'react';
import { Scene } from './scene/Scene';
import { ScrollCamera } from './scene/ScrollCamera';
import { VideoHologram } from './scene/VideoHologram';
import { PhoneCore } from './scene/PhoneCore';
import { CatalogCards } from './scene/CatalogCards';
import { ArchNodes } from './scene/ArchNodes';
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

  const flowVisible = progress > 0.21 && progress < 0.45;   // scenes 03–04
  const archVisible = progress > 0.5 && progress < 0.72;    // scene 05

  return (
    <main className="app-shell">
      <div className="scene-fixed">
        <Scene lowPower={lowPower}>
          <ScrollCamera progress={progress} />
          <VideoHologram texture={texture} position={[0, 0.15, 0]} />
          <PhoneCore texture={texture} position={[0, 0, -0.4]} />
          <CatalogCards visible={flowVisible} />
          <ArchNodes visible={archVisible} />
        </Scene>
      </div>
      <Overlay />
    </main>
  );
}
