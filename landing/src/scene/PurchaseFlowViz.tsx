import { Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { purchaseStates } from '../data/content';

const STATE_POSITIONS: [number, number, number][] = [
  [-2.2,  0.0, 0],
  [-1.1,  0.5, 0],
  [ 0.0,  0.0, 0],
  [ 1.1,  0.5, 0],
  [ 0.0, -0.8, 0],
];

function AnimatedLine({
  from, to, color, phase,
}: { from: [number, number, number]; to: [number, number, number]; color: string; phase: number }) {
  const lineRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    if (lineRef.current) {
      const t = (Math.sin(state.clock.elapsedTime * 1.2 + phase) + 1) / 2;
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = 0.15 + t * 0.55;
    }
  });

  const geo = useMemo(() => {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [from, to]);

  const mat = useMemo(() => {
    return new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
  }, [color]);

  return (
    <primitive
      ref={lineRef}
      object={new THREE.Line(geo, mat)}
    />
  );
}

function StateNode({
  position, label, color, index, activeRef,
}: {
  position: [number, number, number];
  label: string;
  color: string;
  index: number;
  activeRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const isActive = index === activeRef.current;
      const pulse = isActive
        ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.12
        : 1;
      meshRef.current.scale.setScalar(pulse);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isActive ? 0.8 : 0.25;
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = isActive ? 1.0 : 0.7;
    }
  });

  return (
    <Float speed={1.0} floatIntensity={0.15} rotationIntensity={0.05}>
      <group position={position}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.13, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
        <Text
          color="#9b9080"
          fontSize={0.065}
          anchorX="center"
          anchorY="top"
          position={[0, -0.22, 0]}
          maxWidth={0.8}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

export function PurchaseFlowViz({ visible }: { visible: boolean; progress: number }) {
  const activeRef = useRef(0);

  useFrame((state) => {
    activeRef.current = Math.floor((state.clock.elapsedTime * 0.4) % 4);
  });

  const CONNECTIONS: Array<[number, number, string]> = [
    [0, 1, '#6CA8D9'],
    [1, 2, '#C9A84C'],
    [2, 3, '#52A882'],
    [2, 4, '#E05252'],
  ];

  return (
    <group visible={visible} position={[0, 0.1, 0]}>
      {CONNECTIONS.map(([from, to, color], i) => (
        <AnimatedLine
          key={i}
          from={STATE_POSITIONS[from as number]}
          to={STATE_POSITIONS[to as number]}
          color={color}
          phase={i * 1.2}
        />
      ))}
      {purchaseStates.map((s, i) => (
        <StateNode
          key={s.id}
          position={STATE_POSITIONS[i]}
          label={s.label}
          color={s.color}
          index={i}
          activeRef={activeRef}
        />
      ))}
    </group>
  );
}
