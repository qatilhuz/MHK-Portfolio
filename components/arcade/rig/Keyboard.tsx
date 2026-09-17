"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";

const dummy = new Object3D();
const tint = new Color();

export function Keyboard({ reduced }: { reduced?: boolean }) {
  const mesh = useRef<InstancedMesh>(null);
  const layout = useMemo(() => {
    const keys: [number, number, number, number][] = [];
    const rows = [14, 14, 13, 12, 1];
    rows.forEach((count, row) => {
      const z = 0.055 - row * 0.026;
      if (row === 4) {
        keys.push([0, 0.012, 0.08, 0.034]);
        return;
      }
      const width = 0.4;
      const start = -width / 2 + 0.014;
      for (let col = 0; col < count; col += 1) {
        keys.push([start + col * 0.028, z, 0.022, 0.02]);
        i += 1;
      }
    });
    return keys;
  }, []);

  useFrame((state) => {
    const node = mesh.current;
    if (!node) return;
    layout.forEach((key, index) => {
      dummy.position.set(key[0], 0.012, key[1]);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      node.setMatrixAt(index, dummy.matrix);
      const wave = reduced ? 0.3 : 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.6 + index * 0.28);
      tint.setHSL((0.52 + wave * 0.18) % 1, 0.75, 0.48);
      node.setColorAt(index, tint);
    });
    node.instanceMatrix.needsUpdate = true;
    if (node.instanceColor) node.instanceColor.needsUpdate = true;
  });

  return (
    <group position={[0.18, 0.02, 0.22]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[0.46, 0.016, 0.16]} />
        <meshStandardMaterial color="#121318" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.009, 0.072]}>
        <boxGeometry args={[0.46, 0.004, 0.016]} />
        <meshStandardMaterial color="#0c0d11" roughness={0.6} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, layout.length]} castShadow>
        <boxGeometry args={[0.02, 0.012, 0.018]} />
        <meshStandardMaterial color="#16171c" roughness={0.55} metalness={0.12} />
      </instancedMesh>
      <pointLight position={[0, 0.04, 0]} intensity={0.28} distance={0.5} color="#60a5fa" />
    </group>
  );
}
