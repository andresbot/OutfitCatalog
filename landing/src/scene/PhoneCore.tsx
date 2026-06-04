import { RoundedBox, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function PhoneCore({
  texture,
  position = [0, 0, 0],
}: {
  texture: THREE.VideoTexture | null;
  position?: [number, number, number];
}) {
  const icon = useTexture('/atelier-icon.png');
  const fallbackScreen = useTexture('/app-open.png');
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.18;
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    }
  });

  return (
    <group ref={group} position={position} rotation={[-0.06, -0.18, 0]}>
      <RoundedBox args={[1.16, 2.34, 0.14]} radius={0.12} smoothness={12}>
        <meshStandardMaterial color="#111113" metalness={0.55} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[0.98, 2.06]} />
        <meshBasicMaterial map={texture ?? fallbackScreen} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.82, 0.09]}>
        <planeGeometry args={[0.22, 0.22]} />
        <meshBasicMaterial map={icon} toneMapped={false} transparent />
      </mesh>
      <Text color="#F0EAD6" fontSize={0.085} anchorX="center" anchorY="middle" position={[0, 0.56, 0.09]}>
        ATELIER
      </Text>
    </group>
  );
}
