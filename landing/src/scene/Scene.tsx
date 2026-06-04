import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import type { ReactNode } from 'react';
import { Particles } from './Particles';
import { DataRings } from './DataRings';

export function Scene({ children, lowPower = false }: { children?: ReactNode; lowPower?: boolean }) {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.1, 5], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      >
        <color attach="background" args={['#0C0C0E']} />
        <fog attach="fog" args={['#0C0C0E', 4, 13]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 3, 3]} intensity={1.2} color="#F0EAD6" />
        <pointLight position={[-2.4, 1.6, 2]} color="#C9A84C" intensity={3.4} distance={9} />
        <pointLight position={[2.4, -1.4, 2.4]} color="#52A882" intensity={1.4} distance={6} />
        <Particles count={lowPower ? 120 : 220} />
        <DataRings />
        {children}
        {!lowPower && (
          <EffectComposer>
            <Bloom intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur />
            <Vignette eskil={false} offset={0.2} darkness={0.85} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
