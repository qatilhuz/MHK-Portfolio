"use client";

export function WorkspaceLights() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[2.4, 4.2, 2.2]}
        intensity={1.05}
        color="#f4f4f5"
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
        color="#93c5fd"
      />
      <pointLight
        position={[0.2, 1.4, -0.2]}
        intensity={0.45}
        color="#3b82f6"
        distance={4}
      />
    </>
  );
}
