"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";

const dummy = new Object3D();
const tint = new Color();

export function Keyboard({ reduced }: { reduced?: boolean }) {
  const mesh = useRef<InstancedMesh>(null);
  const layout = useMemo(() => {
    const keys: [number, number][] = [];
    const rows = [15, 14, 13, 12];
    rows.forEach((count, row) => {
      const z = 0.058 - row * 0.024;
      const start = -0.2 + (15 - count) * 0.013;
      for (let col = 0; col < count; col += 1) {
        keys.push([start + col * 0.027, z]);
      }
    });
    keys.push([0, -0.048]);
    return keys;
  }, []);

  useFrame((state) => {
    const node = mesh.current;
    if (!node) return;
    const t = state.clock.elapsedTime;
    layout.forEach((key, index) => {
      const isSpace = index === layout.length - 1;
      dummy.position.set(key[0], 0.011, key[1]);
      dummy.scale.set(isSpace ? 4.2 : 1, 1, isSpace ? 1.15 : 1);
      dummy.updateMatrix();
      node.setMatrixAt(index, dummy.matrix);
      const wave = reduced ? 0.45 : 0.5 + 0.5 * Math.sin(t * 1.8 + key[0] * 14 + key[1] * 10);
      tint.setHSL((0.72 + wave * 0.22) % 1, 0.85, 0.52);
      node.setColorAt(index, tint);
    });
    node.instanceMatrix.needsUpdate = true;
    if (node.instanceColor) node.instanceColor.needsUpdate = true;
  });

  return (
    <group position={[0.02, 0.042, 0.28]} rotation={[0.04, 0, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[0.46, 0.018, 0.16]} />
        <meshStandardMaterial color="#0e0f14" metalness={0.4} roughness={0.48} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, layout.length]} castShadow>
        <boxGeometry args={[0.022, 0.01, 0.02]} />
        <meshStandardMaterial color="#14151a" roughness={0.5} metalness={0.15} />
      </instancedMesh>
      <pointLight position={[0, 0.03, 0]} intensity={0.4} distance={0.55} color="#c084fc" />
    </group>
  );
}
