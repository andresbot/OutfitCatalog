import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function VideoHologram({
  texture,
  position = [0, 0.15, 0],
}: {
  texture: THREE.VideoTexture | null;
  position?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
    }
    if (scan.current) {
      // scanline sweeps top→bottom across the hologram panel (height ~1.7)
      scan.current.position.y = ((state.clock.elapsedTime * 0.6) % 1.7) - 0.85;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.28}>
      <group ref={group} position={position} rotation={[0, 0, 0]}>
        {/* hologram video panel (trapezoid via scaled plane) */}
        <mesh>
          <planeGeometry args={[2.8, 1.7]} />
          {texture ? (
            <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={0.92} side={THREE.DoubleSide} />
          ) : (
            <meshBasicMaterial color="#1a1814" transparent opacity={0.6} side={THREE.DoubleSide} />
          )}
        </mesh>
        {/* gold frame */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.92, 1.82]} />
          <meshBasicMaterial color="#C9A84C" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
        {/* moving scanline */}
        <mesh ref={scan} position={[0, 0, 0.02]}>
          <planeGeometry args={[2.8, 0.018]} />
          <meshBasicMaterial color="#6CA8D9" transparent opacity={0.55} />
        </mesh>
        {/* light beam below the hologram */}
        <mesh position={[0, -1.4, -0.2]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.4, 1.6, 4, 1, true]} />
          <meshBasicMaterial color="#6CA8D9" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* emitter base */}
        <mesh position={[0, -1.5, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.42, 48]} />
          <meshBasicMaterial color="#C9A84C" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}
