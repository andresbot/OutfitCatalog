import { Float, Text } from '@react-three/drei';
import { archNodes } from '../data/content';

export function ArchNodes({ visible }: { visible: boolean }) {
  const radius = 1.1;
  return (
    <group visible={visible} position={[1.0, 0.1, -0.6]}>
      {archNodes.map((n, i) => {
        const angle = (i / archNodes.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.6;
        return (
          <Float key={n.label} speed={1.2} floatIntensity={0.3}>
            <group position={[x, y, 0]}>
              <mesh>
                <icosahedronGeometry args={[0.12, 0]} />
                <meshStandardMaterial color="#6CA8D9" emissive="#6CA8D9" emissiveIntensity={0.5} metalness={0.4} roughness={0.3} />
              </mesh>
              <Text color="#F0EAD6" fontSize={0.06} anchorX="center" position={[0, -0.2, 0]}>
                {n.label}
              </Text>
            </group>
          </Float>
        );
      })}
      {/* center core */}
      <mesh>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.7} metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}
