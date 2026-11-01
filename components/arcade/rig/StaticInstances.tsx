"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Color, InstancedMesh, Object3D } from "three";

export type InstanceSpec = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  color?: string | Color;
};

const dummy = new Object3D();
const tint = new Color();

/**
 * One draw call for a batch of identical, non-moving copies of a geometry.
 *
 * Matrices and per-instance colours are written a single time on mount. drei's
 * <Instances> recomposes every matrix on every frame, which is pure waste for
 * scenery that never moves (wall tiles, screws, terminal rows), so the rig uses
 * a raw InstancedMesh instead — same pattern the keyboard already uses.
 *
 * Per-instance colour multiplies the material colour, so give the material a
 * white base when you drive hues through `spec.color`.
 */
export function StaticInstances({
  specs,
  children,
  castShadow = false,
  receiveShadow = false,
}: {
  specs: InstanceSpec[];
  children: ReactNode;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const count = useMemo(() => Math.max(specs.length, 1), [specs]);

  useLayoutEffect(() => {
    const node = mesh.current;
    if (!node) return;

    specs.forEach((spec, index) => {
      const [px, py, pz] = spec.position ?? [0, 0, 0];
      const [rx, ry, rz] = spec.rotation ?? [0, 0, 0];
      dummy.position.set(px, py, pz);
      dummy.rotation.set(rx, ry, rz);
      if (typeof spec.scale === "number") dummy.scale.setScalar(spec.scale);
      else if (spec.scale) dummy.scale.set(spec.scale[0], spec.scale[1], spec.scale[2]);
      else dummy.scale.setScalar(1);
      dummy.updateMatrix();
      node.setMatrixAt(index, dummy.matrix);

      if (spec.color !== undefined) {
        node.setColorAt(index, spec.color instanceof Color ? spec.color : tint.set(spec.color));
      }
    });

    node.count = specs.length;
    node.instanceMatrix.needsUpdate = true;
    if (node.instanceColor) node.instanceColor.needsUpdate = true;
    node.computeBoundingSphere();
  }, [specs]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      {children}
    </instancedMesh>
  );
}
