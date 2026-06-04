import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function Particles({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 2.4 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      data[i * 3] = Math.cos(angle) * radius;
      data[i * 3 + 1] = (Math.random() - 0.5) * 6;
      data[i * 3 + 2] = Math.sin(angle) * radius - 1;
    }
    return data;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#C9A84C" size={0.025} sizeAttenuation transparent opacity={0.55} />
    </points>
  );
}
