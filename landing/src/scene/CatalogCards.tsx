import { Float, RoundedBox, Text } from '@react-three/drei';
import { catalogPreview } from '../data/content';

const SLOTS: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
  { pos: [-1.7, 0.4, -0.3], rot: [0.04, 0.36, -0.08] },
  { pos: [-2.0, -0.3, -0.6], rot: [-0.08, 0.42, 0.08] },
  { pos: [-1.3, 1.0, -0.9], rot: [0.08, 0.5, 0.1] },
];

export function CatalogCards({ visible }: { visible: boolean }) {
  return (
    <group visible={visible}>
      {catalogPreview.map((c, i) => (
        <Float key={c.title} speed={1.6} rotationIntensity={0.12} floatIntensity={0.22}>
          <group position={SLOTS[i].pos} rotation={SLOTS[i].rot}>
            <RoundedBox args={[0.82, 1.05, 0.035]} radius={0.035} smoothness={6}>
              <meshStandardMaterial color="#171719" metalness={0.3} roughness={0.42} />
            </RoundedBox>
            <mesh position={[0, 0.19, 0.027]}>
              <planeGeometry args={[0.66, 0.48]} />
              <meshStandardMaterial color={c.color} roughness={0.38} metalness={0.08} />
            </mesh>
            <Text color="#F0EAD6" fontSize={0.052} maxWidth={0.6} anchorX="left" anchorY="middle" position={[-0.31, -0.34, 0.034]}>
              {c.title}
            </Text>
            <Text color="#C9A84C" fontSize={0.044} maxWidth={0.6} anchorX="left" anchorY="middle" position={[-0.31, -0.43, 0.034]}>
              {c.price}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  );
}
