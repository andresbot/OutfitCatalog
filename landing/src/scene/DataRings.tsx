import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function Ring({ radius, speed, color, opacity = 0.5 }: { radius: number; speed: number; color: string; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed;
      ref.current.rotation.x += delta * speed * 0.18;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.9, 0.15, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 160]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

export function DataRings() {
  return (
    <group>
      <Ring radius={1.95} speed={0.34} color="#C9A84C" opacity={0.55} />
      <Ring radius={2.35} speed={-0.22} color="#52A882" opacity={0.4} />
      <Ring radius={2.78} speed={0.15} color="#6CA8D9" opacity={0.35} />
    </group>
  );
}
