"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import gsap from "gsap";
import { Color, type Group, type MeshBasicMaterial } from "three";
import type { AvatarEmotion } from "@/lib/assistant/emotion";
import type { AssistantStatus } from "@/types";

/**
 * Procedural "Astro Bot / EVE" assistant head. No GLB, no external textures,
 * no HDR environment - every highlight comes from the rig lights, so the
 * component pulls nothing off the network.
 *
 * The node tree exists to keep GSAP and useFrame off each other's
 * properties. The classic way these avatars end up twitching is two systems
 * writing the same transform on alternate frames:
 *
 *   float   (useFrame) -> whole-head bob, sway and the emotion slump
 *   gaze    (useFrame) -> thinking dart + pulse, local to the eye line
 *   blink   (GSAP)     -> scale.y on a group whose origin IS the eye line
 *   emotion (GSAP)     -> per-eye scale / position.y / rotation.z / colour
 *
 * Every one of those is a different object, so blinking never clobbers an
 * emotion pose and the thinking pulse never fights the float.
 */

const HEAD_RADIUS = 0.32;
/** Slightly wider than tall and a touch shallow - reads cute, not clinical. */
const HEAD_SQUASH: [number, number, number] = [1, 0.93, 0.96];
const VISOR_RADIUS = 0.326;
const EYE_LINE_Y = 0.045;
const EYE_X = 0.108;
/**
 * The eye plane sits clear of the visor's maximum bulge
 * (VISOR_RADIUS * HEAD_SQUASH.z = 0.313), not merely clear of the surface
 * under each eye. A flat glow disc on a curved cap would otherwise sink into
 * the visor near the nose bridge and be depth-rejected there. The camera is
 * head-on and the head sways only +/-0.15 rad, so the small gap is invisible
 * and the LEDs read as projected onto the inside of the glass.
 */
const EYE_Z = 0.345;
const EYE_W = 0.082;
const EYE_H = 0.086;
/**
 * drei's RoundedBox extrudes by `depth - radius * 2`, so the depth must
 * exceed twice the corner radius or the geometry inverts. A generous radius
 * is what makes the LED read as a soft squircle rather than a chip.
 */
const EYE_DEPTH = 0.056;
const EYE_RADIUS = 0.026;

interface EyePose {
  scaleX: number;
  scaleY: number;
  offsetY: number;
  /** Applied as -tilt on the left eye and +tilt on the right. */
  tilt: number;
  /** LED colour for this mood. */
  color: string;
  /** Whole-head vertical offset: angry and sad physically sink. */
  headY: number;
  /** Float speed multiplier - happy bobs noticeably faster. */
  floatSpeed: number;
}

/**
 * Tilt sign convention: looking at the face, a negative rotation.z drops the
 * +x end of an eye. The left eye's inner end is its +x end, so `-tilt` on the
 * left and `+tilt` on the right both drop the *inner* ends - the angry brow,
 * reading as \ /. A negative `tilt` produces the opposite outward droop.
 */
const EYE_POSES: Record<AvatarEmotion, EyePose> = {
  neutral: {
    scaleX: 1.0,
    scaleY: 1.0,
    offsetY: 0,
    tilt: 0,
    color: "#22d3ee",
    headY: 0,
    floatSpeed: 1.15,
  },
  happy: {
    // Squashed into a high, bright ^ ^ arc.
    scaleX: 1.22,
    scaleY: 0.4,
    offsetY: 0.032,
    tilt: 0,
    color: "#4ade80",
    headY: 0.012,
    floatSpeed: 1.95,
  },
  angry: {
    // Hard inward tilt, narrowed, and the whole head drops.
    scaleX: 1.14,
    scaleY: 0.44,
    offsetY: -0.024,
    tilt: 0.4,
    color: "#ff4a28",
    headY: -0.03,
    floatSpeed: 1.5,
  },
  sad: {
    // Outward droop, smaller, sunk low.
    scaleX: 0.88,
    scaleY: 0.72,
    offsetY: -0.042,
    tilt: -0.3,
    color: "#3b6cf6",
    headY: -0.048,
    floatSpeed: 0.7,
  },
};

export function AiFaceAvatar({
  emotion,
  status,
  reducedMotion,
}: {
  emotion: AvatarEmotion;
  status: AssistantStatus;
  reducedMotion: boolean;
}) {
  const floatRef = useRef<Group>(null);
  const gazeRef = useRef<Group>(null);
  const blinkRef = useRef<Group>(null);
  const leftEyeRef = useRef<Group>(null);
  const rightEyeRef = useRef<Group>(null);

  const leftLed = useRef<MeshBasicMaterial>(null);
  const rightLed = useRef<MeshBasicMaterial>(null);
  const leftGlow = useRef<MeshBasicMaterial>(null);
  const rightGlow = useRef<MeshBasicMaterial>(null);
  const antennaLed = useRef<MeshBasicMaterial>(null);
  const rimRef = useRef<MeshBasicMaterial>(null);

  // Read inside useFrame without re-subscribing the loop every change.
  const statusRef = useRef(status);
  statusRef.current = status;
  const poseRef = useRef(EYE_POSES[emotion] ?? EYE_POSES.neutral);
  poseRef.current = EYE_POSES[emotion] ?? EYE_POSES.neutral;
  // Smoothed mood transforms owned by useFrame.
  const slumpRef = useRef(0);
  const leanRef = useRef(0);

  // ---- emotion ------------------------------------------------------------
  useLayoutEffect(() => {
    const pose = EYE_POSES[emotion] ?? EYE_POSES.neutral;
    const duration = reducedMotion ? 0 : 0.45;

    for (const [node, sign] of [
      [leftEyeRef.current, -1],
      [rightEyeRef.current, 1],
    ] as const) {
      if (!node) continue;

      gsap.to(node.scale, {
        x: pose.scaleX,
        y: pose.scaleY,
        duration,
        ease: "back.out(1.6)",
        overwrite: "auto",
      });
      gsap.to(node.position, {
        y: pose.offsetY,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(node.rotation, {
        z: sign * pose.tilt,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
    }

    // Colour is a property of the material, not the node, so it needs its own
    // tween. THREE.Color exposes plain numeric r/g/b, which GSAP can drive.
    const target = new Color(pose.color);
    const materials = [
      leftLed.current,
      rightLed.current,
      leftGlow.current,
      rightGlow.current,
      antennaLed.current,
      rimRef.current,
    ];

    for (const material of materials) {
      if (!material) continue;
      gsap.to(material.color, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: reducedMotion ? 0 : 0.38,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [emotion, reducedMotion]);

  // ---- blinking -----------------------------------------------------------
  useEffect(() => {
    const node = blinkRef.current;
    if (!node) return;
    if (reducedMotion) {
      node.scale.y = 1;
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      // Irregular spacing reads as alive; a fixed interval reads as a machine.
      timer = setTimeout(
        () => {
          const target = blinkRef.current;
          if (target) {
            // Not exactly 0: a zero scale produces a degenerate matrix.
            gsap
              .timeline()
              .to(target.scale, { y: 0.02, duration: 0.06, ease: "power2.in" })
              .to(target.scale, { y: 0.02, duration: 0.1 })
              .to(target.scale, { y: 1, duration: 0.11, ease: "power2.out" });
          }
          scheduleBlink();
        },
        2200 + Math.random() * 3400,
      );
    };

    scheduleBlink();

    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(node.scale);
      node.scale.y = 1;
    };
  }, [reducedMotion]);

  // ---- float, gaze, thinking pulse ---------------------------------------
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const float = floatRef.current;
    const gaze = gazeRef.current;
    const pose = poseRef.current;

    if (float) {
      if (reducedMotion) {
        float.position.y = 0;
        float.rotation.set(0, 0, 0);
      } else {
        // The emotion slump is applied here rather than by GSAP so the float
        // and the mood write position.y from a single owner. Eased toward the
        // target so switching mood sinks the head instead of teleporting it.
        slumpRef.current += (pose.headY - slumpRef.current) * 0.06;
        leanRef.current += (pose.tilt * 0.05 - leanRef.current) * 0.06;

        float.position.y =
          slumpRef.current + Math.sin(time * pose.floatSpeed) * 0.028;
        float.rotation.y = Math.sin(time * 0.55) * 0.15;
        float.rotation.x = Math.cos(time * 0.43) * 0.05;
        // Angry leans in, sad hangs the other way.
        float.rotation.z = leanRef.current;
      }
    }

    if (!gaze) return;

    if (reducedMotion) {
      gaze.position.set(0, 0, 0);
      gaze.scale.setScalar(1);
      return;
    }

    if (statusRef.current === "thinking") {
      // Eyes dart around and pulse while the model is working.
      gaze.position.x = Math.sin(time * 7.5) * 0.021;
      gaze.position.y = Math.cos(time * 5.3) * 0.011;
      gaze.scale.setScalar(1 + Math.sin(time * 9.5) * 0.075);
      return;
    }

    if (statusRef.current === "speaking") {
      gaze.position.x += (0 - gaze.position.x) * 0.16;
      gaze.position.y += (0 - gaze.position.y) * 0.16;
      gaze.scale.setScalar(1 + Math.sin(time * 13) * 0.045);
      return;
    }

    // Idle: ease everything back to centre with a slow wander.
    gaze.position.x += (Math.sin(time * 0.7) * 0.006 - gaze.position.x) * 0.06;
    gaze.position.y += (0 - gaze.position.y) * 0.08;
    gaze.scale.setScalar(gaze.scale.x + (1 - gaze.scale.x) * 0.12);
  });

  return (
    <group ref={floatRef}>
      {/* Shell and visor share one squash group so they stay concentric -
          scaling them separately would make the visor cut through the face. */}
      <group scale={HEAD_SQUASH}>
        {/* Charcoal shell, slightly squat so the proportions read cute rather
            than clinical. High clearcoat over low roughness gives the sleek
            moulded-plastic highlight without an environment map. */}
        <mesh castShadow>
          <sphereGeometry args={[HEAD_RADIUS, 64, 64]} />
          <meshPhysicalMaterial
            color="#24262e"
            metalness={0.6}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.08}
            reflectivity={0.85}
            sheen={0.5}
            sheenColor="#8fb6ff"
          />
        </mesh>

        {/* Black-glass visor: a spherical cap 6mm proud of the shell, so it
            reads as a curved faceplate laid onto the head. Built around the
            +Y pole and rotated to face +Z. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[VISOR_RADIUS, 56, 40, 0, Math.PI * 2, 0, 0.95]} />
          <meshPhysicalMaterial
            color="#05060a"
            metalness={0.1}
            roughness={0.04}
            clearcoat={1}
            clearcoatRoughness={0.02}
            reflectivity={1}
            ior={1.52}
            specularIntensity={1}
          />
        </mesh>
      </group>

      {/* Mood-tinted rim light so the silhouette reads against a dark panel. */}
      <mesh scale={[1.04, 0.967, 0.998]}>
        <sphereGeometry args={[HEAD_RADIUS, 48, 48]} />
        <meshBasicMaterial
          ref={rimRef}
          color="#22d3ee"
          transparent
          opacity={0.07}
          side={1 /* THREE.BackSide */}
          toneMapped={false}
        />
      </mesh>

      {/* Headphone pods - cheap, and they do most of the "cute" work. */}
      <Pod x={-0.315} />
      <Pod x={0.315} />

      {/* Antenna with a mood-matched bead on the tip. */}
      <mesh position={[0, 0.305, 0]}>
        <cylinderGeometry args={[0.006, 0.008, 0.085, 12]} />
        <meshPhysicalMaterial color="#2c2f38" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.358, 0]}>
        <sphereGeometry args={[0.027, 24, 24]} />
        <meshBasicMaterial ref={antennaLed} color="#22d3ee" toneMapped={false} />
      </mesh>

      <group position={[0, EYE_LINE_Y, 0]}>
        <group ref={gazeRef}>
          {/* Blink owns scale.y here, and this group's origin sits exactly on
              the eye line, so the lids close in place instead of sliding. */}
          <group ref={blinkRef}>
            <Eye groupRef={leftEyeRef} ledRef={leftLed} glowRef={leftGlow} x={-EYE_X} />
            <Eye groupRef={rightEyeRef} ledRef={rightLed} glowRef={rightGlow} x={EYE_X} />
          </group>
        </group>
      </group>
    </group>
  );
}

function Pod({ x }: { x: number }) {
  return (
    <mesh position={[x, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.062, 0.035, 8, 20]} />
      <meshPhysicalMaterial
        color="#1b1d24"
        metalness={0.7}
        roughness={0.22}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function Eye({
  groupRef,
  ledRef,
  glowRef,
  x,
}: {
  groupRef: React.RefObject<Group | null>;
  ledRef: React.RefObject<MeshBasicMaterial | null>;
  glowRef: React.RefObject<MeshBasicMaterial | null>;
  x: number;
}) {
  return (
    <group ref={groupRef} position={[x, 0, EYE_Z]}>
      {/* toneMapped={false} keeps the LED at full intensity so it reads as
          emissive rather than as a lit surface. */}
      <RoundedBox args={[EYE_W, EYE_H, EYE_DEPTH]} radius={EYE_RADIUS} smoothness={4}>
        <meshBasicMaterial ref={ledRef} color="#22d3ee" toneMapped={false} />
      </RoundedBox>

      {/* Cheap bloom stand-in: a soft additive disc behind the LED. */}
      <mesh position={[0, 0, -0.005]} scale={2.1}>
        <circleGeometry args={[EYE_W * 0.72, 32]} />
        <meshBasicMaterial
          ref={glowRef}
          color="#22d3ee"
          transparent
          opacity={0.2}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
