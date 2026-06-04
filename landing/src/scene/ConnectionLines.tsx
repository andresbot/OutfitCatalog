import { useMemo } from 'react';
import * as THREE from 'three';
import { archNodes } from '../data/content';

export function ConnectionLines({ visible }: { visible: boolean }) {
  const lines = useMemo(() => {
    const radius = 1.1;
    const count = archNodes.length;
    const objects: THREE.Line[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.6;
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, 0)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: '#6CA8D9',
        transparent: true,
        opacity: 0.28,
      });
      objects.push(new THREE.Line(geo, mat));
    }
    return objects;
  }, []);

  return (
    <group visible={visible} position={[1.0, 0.1, -0.6]}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}
