"use client";

import { materials } from "./materials";

export function WorkspaceLights() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[2.4, 4.2, 2.2]}
        intensity={1.05}
        color={materials.light}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight
        position={[-2.5, 1.5, 1]}
        intensity={0.22}
        color={materials.fill}
      />
      <pointLight
        position={[0.2, 1.4, -0.2]}
        intensity={0.45}
        color={materials.accent}
        distance={4}
      />
    </>
  );
}
