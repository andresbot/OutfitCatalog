import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// position + lookAt target per scene (0..7), normalized to progress bands.
const WAYPOINTS: Array<{ pos: [number, number, number]; look: [number, number, number] }> = [
  { pos: [0, 0.1, 5.0], look: [0, 0.15, 0] },      // 01 hero hologram
  { pos: [0.2, 0, 3.4], look: [0, 0, 0] },          // 02 phone
  { pos: [-1.4, 0.3, 4.2], look: [-0.4, 0.2, 0] },  // 03 client flow cards
  { pos: [0, 0.6, 4.6], look: [0, 0.4, -0.6] },     // 04 roles
  { pos: [1.2, 0.2, 4.4], look: [0.3, 0, -0.8] },   // 05 arch nodes
  { pos: [0, -0.2, 4.0], look: [0, -0.2, 0] },      // 06 kpis
  { pos: [-0.8, 0, 4.6], look: [-0.2, 0, -0.4] },   // 07 qa
  { pos: [0, 0.1, 5.4], look: [0, 0.1, 0] },        // 08 demo + authors
];

export function ScrollCamera({ progress, count = WAYPOINTS.length }: { progress: number; count?: number }) {
  const camera = useThree((s) => s.camera);
  const target = useRef(new THREE.Vector3(0, 0.15, 0));

  useFrame(() => {
    const span = count - 1;
    const scaled = Math.min(Math.max(progress, 0), 1) * span;
    const i = Math.min(Math.floor(scaled), span - 1);
    const t = scaled - i;
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1] ?? a;

    const ease = t * t * (3 - 2 * t); // smoothstep
    const px = THREE.MathUtils.lerp(a.pos[0], b.pos[0], ease);
    const py = THREE.MathUtils.lerp(a.pos[1], b.pos[1], ease);
    const pz = THREE.MathUtils.lerp(a.pos[2], b.pos[2], ease);
    camera.position.lerp(new THREE.Vector3(px, py, pz), 0.08);

    const lx = THREE.MathUtils.lerp(a.look[0], b.look[0], ease);
    const ly = THREE.MathUtils.lerp(a.look[1], b.look[1], ease);
    const lz = THREE.MathUtils.lerp(a.look[2], b.look[2], ease);
    target.current.lerp(new THREE.Vector3(lx, ly, lz), 0.08);
    camera.lookAt(target.current);
  });

  return null;
}
