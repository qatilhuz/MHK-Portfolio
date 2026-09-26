"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import {
  CanvasTexture,
  EquirectangularReflectionMapping,
  PMREMGenerator,
  SRGBColorSpace,
} from "three";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { buildArcadePortalTimeline } from "@/lib/arcade/portal";
import { DESK_SIZE, SPEAKER_LEFT, SPEAKER_RIGHT } from "@/lib/arcade/layout";
import { Keyboard } from "./Keyboard";
import { Monitor } from "./Monitor";
import { Mouse, MousePad } from "./Mouse";
import { PcCase } from "./PcCase";
import { DeskAccessories } from "./DeskAccessories";
import { HeadsetStand } from "./HeadsetStand";
import { Speaker } from "./Speakers";
import { woodAlbedo, wallAlbedo } from "./textures";

function CameraRig({
  mode,
  onArrived,
}: {
  mode: "idle" | "enter" | "exit";
  onArrived: () => void;
}) {
  const { camera } = useThree();
  const look = useRef({ x: 0.08, y: 0.28, z: 0.02 });
  const done = useRef(false);
  const arrived = useRef(onArrived);
  arrived.current = onArrived;

  useEffect(() => {
    done.current = false;
    const reduced = prefersReducedMotion();
    const tl = buildArcadePortalTimeline(camera, look.current);

    if (mode === "idle") {
      tl.progress(0);
      return () => tl.kill();
    }

    if (reduced) {
      if (mode === "enter") tl.progress(1);
      else tl.progress(0);
      arrived.current();
      return () => tl.kill();
    }

    const finish = () => {
      if (!done.current) {
        done.current = true;
        arrived.current();
      }
    };

    if (mode === "enter") {
      tl.eventCallback("onComplete", finish);
      tl.play(0);
    } else {
      tl.progress(1);
      tl.eventCallback("onReverseComplete", finish);
      tl.reverse();
    }

    return () => {
      tl.kill();
    };
  }, [camera, mode]);

  useFrame(() => {
    camera.lookAt(look.current.x, look.current.y, look.current.z);
  });

  return null;
}

/**
 * Procedural studio environment (no network HDRI): equirect canvas with a
 * large top softbox, cool side fill, and dark floor → PMREM. Gives every
 * metal and pane of glass something real to reflect.
 */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // sky / floor split
    const sky = ctx.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, "#2b2d38");
    sky.addColorStop(1, "#4e5160");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1024, 256);
    const floor = ctx.createLinearGradient(0, 256, 0, 512);
    floor.addColorStop(0, "#2a2723");
    floor.addColorStop(1, "#131318");
    ctx.fillStyle = floor;
    ctx.fillRect(0, 256, 1024, 256);
    // key softbox (top-front)
    let g = ctx.createRadialGradient(560, 70, 10, 560, 70, 300);
    g.addColorStop(0, "rgba(240,246,255,1)");
    g.addColorStop(0.35, "rgba(210,222,246,0.75)");
    g.addColorStop(1, "rgba(210,222,246,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 300);
    // cool side fill (camera-left)
    g = ctx.createRadialGradient(180, 150, 10, 180, 150, 240);
    g.addColorStop(0, "rgba(188,196,216,0.7)");
    g.addColorStop(1, "rgba(188,196,216,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 400);
    // faint magenta practical behind (screen glow bounce)
    g = ctx.createRadialGradient(880, 210, 10, 880, 210, 200);
    g.addColorStop(0, "rgba(226,130,220,0.35)");
    g.addColorStop(1, "rgba(226,130,220,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 420);

    const tex = new CanvasTexture(canvas);
    tex.mapping = EquirectangularReflectionMapping;
    tex.colorSpace = SRGBColorSpace;
    const pmrem = new PMREMGenerator(gl);
    const rt = pmrem.fromEquirectangular(tex);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.72;
    tex.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = null;
      rt.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Room() {
  const wood = useMemo(() => woodAlbedo(), []);
  const wall = useMemo(() => wallAlbedo(), []);
  return (
    <>
      {/* premium studio backdrop — mid-dark slate so graphite gear silhouettes pop */}
      <mesh position={[0, 0.85, -1.15]} receiveShadow>
        <planeGeometry args={[6, 3.2]} />
        <meshStandardMaterial map={wall} color="#ffffff" roughness={0.92} metalness={0.02} />
      </mesh>
      <RoundedBox args={DESK_SIZE} radius={0.012} smoothness={4} position={[0, 0.025, 0.1]} castShadow receiveShadow>
        <meshStandardMaterial map={wood} roughness={0.68} metalness={0.05} />
      </RoundedBox>
      {[
        [-0.9, -0.12, 0.5],
        [0.9, -0.12, 0.5],
        [-0.9, -0.12, -0.28],
        [0.9, -0.12, -0.28],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.22, 0.05]} />
          <meshStandardMaterial color="#5c4630" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, -0.01, 0.1]}>
        <boxGeometry args={[1.98, 0.02, 0.96]} />
        <meshStandardMaterial color="#8a6d45" roughness={0.8} />
      </mesh>
    </>
  );
}

export function ArcadeScene({
  mode,
  onArrived,
}: {
  mode: "idle" | "enter" | "exit";
  onArrived: () => void;
}) {
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 34, near: 0.05, far: 16, position: [0.12, 1.05, 1.72] }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.16;
      }}
    >
      <color attach="background" args={["#31364a"]} />
      <StudioEnvironment />
      {/* cool-sky / warm-bounce hemisphere for depth */}
      <hemisphereLight args={["#ccd1de", "#4a4034", 0.5]} />
      {/* shadow-casting key with tuned frustum for crisp contact */}
      <directionalLight
        position={[0.5, 2.6, 1.25]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00012}
        shadow-normalBias={0.018}
        shadow-camera-left={-1.8}
        shadow-camera-right={1.8}
        shadow-camera-top={2.2}
        shadow-camera-bottom={-0.6}
        shadow-camera-near={0.5}
        shadow-camera-far={8}
      />
      {/* soft cool fill from the left — separates dark flanks from the wall */}
      <directionalLight position={[-2, 1.2, 1.6]} intensity={0.3} color="#b8bed0" />
      <ambientLight intensity={0.16} />
      <Room />
      <PcCase reduced={reduced} />
      <Monitor reduced={reduced} />
      <Speaker position={SPEAKER_LEFT} />
      <Speaker position={SPEAKER_RIGHT} />
      <Keyboard reduced={reduced} />
      <MousePad />
      <Mouse reduced={reduced} />
      <DeskAccessories />
      <HeadsetStand reduced={reduced} />
      <ContactShadows position={[0, 0.052, 0.1]} opacity={0.38} scale={2.4} blur={2.4} far={1.2} />
      <CameraRig mode={mode} onArrived={onArrived} />
    </Canvas>
  );
}
