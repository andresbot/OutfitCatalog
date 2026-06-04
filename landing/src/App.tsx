import { Scene } from './scene/Scene';
import { VideoHologram } from './scene/VideoHologram';
import { useSharedVideo } from './scene/useSharedVideo';

export function App() {
  const { texture } = useSharedVideo('/video.mp4');
  return (
    <main className="app-shell">
      <Scene>
        <VideoHologram texture={texture} />
      </Scene>
    </main>
  );
}
