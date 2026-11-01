"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D, type Group, type MeshBasicMaterial } from "three";
import { arcadeBreath, arcadeRgbAt } from "@/lib/arcade/rgb";
import { StaticInstances, type InstanceSpec } from "./StaticInstances";

const bladeDummy = new Object3D();

/**
 * Fan axis is +Y (cylinder default). Blades live in XZ and spin around Y
 * so they stay inside the ring after any parent orientation.
 */
export function CoolingFan({
  radius = 0.046,
  speed = 8,
  reduced,
  rgb = "#22d3ee",
  phase = 0,
  depth = 0.018,
}: {
  radius?: number;
  speed?: number;
  reduced?: boolean;
  rgb?: string;
  phase?: number;
  depth?: number;
}) {
  const spin = useRef<Group>(null);
  const ring = useRef<MeshBasicMaterial>(null);
  const hub = useRef<MeshBasicMaterial>(null);
  const bladeMesh = useRef<InstancedMesh>(null);
  const bladeMat = useRef<MeshBasicMaterial>(null);
  const color = useMemo(() => new Color(rgb), [rgb]);
  const bladeColor = useMemo(() => new Color(), []);
  const blades = 7;

  useFrame((state, delta) => {
    if (!reduced && spin.current) spin.current.rotation.y += delta * speed;
    if (reduced) return;

    const t = state.clock.elapsedTime;
    arcadeRgbAt(t * 0.055, color, phase);
    const pulse = arcadeBreath(t * 0.82, phase, 0.82, 1.12);

    for (const mat of [ring.current, hub.current]) {
      if (!mat) continue;
      mat.color.copy(color).multiplyScalar(pulse);
    }

    const node = bladeMesh.current;
    if (node) {
      for (let index = 0; index < blades; index += 1) {
        arcadeRgbAt(t * 0.08, bladeColor, phase + index / blades);
        bladeColor.multiplyScalar(0.98 + 0.28 * Math.sin(t * 1.45 + index * 0.72 + phase * Math.PI * 2));
        node.setColorAt(index, bladeColor);
      }
      if (node.instanceColor) node.instanceColor.needsUpdate = true;
    }
    if (bladeMat.current) bladeMat.current.opacity = 0.82 + 0.08 * Math.sin(t * 1.1);
  });

  const inner = radius * 0.9;
  const hubR = radius * 0.2;
  const bladeLen = inner - hubR - radius * 0.04;
  const housing = radius + 0.007;

  const screws = useMemo<InstanceSpec[]>(
    () =>
      [0, 1, 2, 3].map((i) => ({
        position: [
          Math.cos((i * Math.PI) / 2) * housing * 0.82,
          0,
          -Math.sin((i * Math.PI) / 2) * housing * 0.82,
        ] as [number, number, number],
        rotation: [0, (i * Math.PI) / 2, 0] as [number, number, number],
      })),
    [housing],
  );

  // Blade matrices never change inside the spinning group: Ry(a) . T(x) . Rx(0.45)
  // composes to a single YXZ euler, so they are written once instead of per frame.
  useLayoutEffect(() => {
    const node = bladeMesh.current;
    if (!node) return;
    const offset = hubR + bladeLen * 0.5;
    for (let i = 0; i < blades; i += 1) {
      const a = (i / blades) * Math.PI * 2;
      bladeDummy.position.set(Math.cos(a) * offset, 0, -Math.sin(a) * offset);
      bladeDummy.rotation.set(0.45, a, 0, "YXZ");
      bladeDummy.scale.setScalar(1);
      bladeDummy.updateMatrix();
      node.setMatrixAt(i, bladeDummy.matrix);
    }
    node.instanceMatrix.needsUpdate = true;
    node.computeBoundingSphere();
  }, [bladeLen, hubR]);

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[housing, housing, depth, 36, 1, true]} />
        <meshStandardMaterial color="#3a3d46" metalness={0.38} roughness={0.48} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius, radius, depth * 0.92, 32, 1, true]} />
        <meshStandardMaterial color="#2c2f38" metalness={0.32} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, (depth / 2) * s * 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius * 0.98, 0.0024, 8, 32]} />
          <meshStandardMaterial color="#4b5060" metalness={0.55} roughness={0.32} />
        </mesh>
      ))}
      <StaticInstances specs={screws}>
        <boxGeometry args={[0.0055, depth * 0.65, 0.007]} />
        <meshStandardMaterial color="#4a4e58" metalness={0.45} roughness={0.4} />
      </StaticInstances>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -depth * 0.12, 0]}>
        <torusGeometry args={[radius * 0.78, 0.0028, 10, 36]} />
        <meshBasicMaterial ref={ring} color={rgb} toneMapped={false} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[hubR, hubR * 1.05, depth * 0.85, 20]} />
        <meshStandardMaterial color="#2a2d35" metalness={0.5} roughness={0.34} />
      </mesh>
      <mesh position={[0, depth * 0.32, 0]}>
        <cylinderGeometry args={[hubR * 0.55, hubR * 0.55, 0.0024, 16]} />
        <meshBasicMaterial ref={hub} color={rgb} toneMapped={false} />
      </mesh>
      <group ref={spin}>
        <instancedMesh ref={bladeMesh} args={[undefined, undefined, blades]}>
          <boxGeometry args={[bladeLen, 0.0014, radius * 0.16]} />
          <meshBasicMaterial ref={bladeMat} transparent opacity={0.86} toneMapped={false} />
        </instancedMesh>
      </group>
    </group>
  );
}
