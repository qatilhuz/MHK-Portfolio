"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import gsap from "gsap";
import {
  Color,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Group,
  type Mesh,
} from "three";
import type { AvatarEmotion } from "@/lib/assistant/emotion";
import type { AssistantStatus } from "@/types";

/**
 * Procedural "Astro Bot / EVE" assistant head. No GLB, no external textures,
 * no HDR environment - every highlight comes from the rig lights, so the
 * component pulls nothing off the network.
 *
 * Ownership of every animated property is deliberately exclusive, because the
 * way these avatars glitch is two systems writing one transform on alternate
 * frames:
 *
 *   useFrame -> head float and slump, gaze, ALL emotion transforms, colours
 *   GSAP     -> blink only, on its own node
 *
 * Emotion used to be tweened by GSAP. It is now damped toward a target inside
 * useFrame instead, so switching mood mid-transition simply moves the target:
 * there is no tween to kill, nothing to overwrite, and no pose can be left
 * half-applied. Blink is the one genuinely discrete event, and it owns scale.y
 * on a group that nothing else touches.
 */

const HEAD_RADIUS = 0.32;
/** Slightly wider than tall and a touch shallow - reads cute, not clinical. */
const HEAD_SQUASH: [number, number, number] = [1, 0.93, 0.96];
const VISOR_RADIUS = 0.326;
const EYE_LINE_Y = 0.058;
const EYE_X = 0.108;
/**
 * The eye and mouth planes sit clear of the visor's maximum bulge
 * (VISOR_RADIUS * HEAD_SQUASH.z = 0.313), not merely clear of the surface
 * directly beneath them. A flat glow disc on a curved cap would otherwise
 * sink into the visor near the nose bridge and be depth-rejected. The camera
 * is head-on and the head sways only +/-0.15 rad, so the resulting gap is
 * about two pixels and the LEDs read as projected onto the inside of the
 * glass.
 */
const EYE_Z = 0.345;
const MOUTH_Y = -0.088;
const MOUTH_Z = 0.332;
const EYE_W = 0.082;
const EYE_H = 0.086;
/**
 * drei's RoundedBox extrudes by `depth - radius * 2`, so the depth must
 * exceed twice the corner radius or the geometry inverts. A generous radius
 * is what makes the LED read as a soft squircle rather than a chip.
 */
const EYE_DEPTH = 0.056;
const EYE_RADIUS = 0.026;

/** Mouth is a row of LED dots, morphed between a curve and a ring. */
const MOUTH_DOTS = 9;
const MOUTH_HALF_W = 0.072;
const MOUTH_CURVE_AMP = 0.03;
const MOUTH_RING_R = 0.042;
const MOUTH_DOT_R = 0.0105;

interface MouthPose {
  /** Parabola coefficient: positive smiles, negative frowns, 0 is flat. */
  curve: number;
  /** Horizontal spread, and ring radius when round. */
  width: number;
  /** 0 = line of dots, 1 = closed ring (the surprised "o"). */
  round: number;
  /** Lateral shift - the thinking mouth slides off-centre. */
  shiftX: number;
  /** Dot thickness. */
  thick: number;
}

interface EmotionPose {
  scaleX: number;
  scaleY: number;
  offsetY: number;
  /** Applied as -tilt on the left eye and +tilt on the right. */
  tilt: number;
  /** Extra scale.y on the LEFT eye only: squint for thinking, wink for cheeky. */
  leftSquint: number;
  /** Size of the bright inner core of each eye. */
  core: number;
  color: string;
  /** Whole-head vertical offset: angry and sad physically sink. */
  headY: number;
  /** Float speed multiplier - happy bobs noticeably faster. */
  floatSpeed: number;
  mouth: MouthPose;
}

/**
 * Tilt sign convention: looking at the face, a negative rotation.z drops the
 * +x end of an eye. The left eye's inner end is its +x end, so `-tilt` on the
 * left and `+tilt` on the right both drop the *inner* ends - the angry brow,
 * reading as \ /. A negative `tilt` produces the opposite outward droop, / \.
 */
const POSES: Record<AvatarEmotion, EmotionPose> = {
  neutral: {
    scaleX: 1,
    scaleY: 1,
    offsetY: 0,
    tilt: 0,
    leftSquint: 1,
    core: 1,
    color: "#22d3ee",
    headY: 0,
    floatSpeed: 1.15,
    mouth: { curve: 0, width: 1, round: 0, shiftX: 0, thick: 1 },
  },
  happy: {
    // Squashed into a high, bright ^ ^ arc over a wide smile.
    scaleX: 1.22,
    scaleY: 0.5,
    offsetY: 0.032,
    tilt: 0,
    leftSquint: 1,
    core: 0.55,
    color: "#4ade80",
    headY: 0.012,
    floatSpeed: 1.95,
    mouth: { curve: 1, width: 1.05, round: 0, shiftX: 0, thick: 1 },
  },
  angry: {
    // Hard inward tilt, narrowed, head dropped, mouth turned down.
    scaleX: 1.14,
    scaleY: 0.44,
    offsetY: -0.024,
    tilt: 0.4,
    leftSquint: 1,
    core: 0.5,
    color: "#ff4a28",
    headY: -0.03,
    floatSpeed: 1.5,
    mouth: { curve: -0.85, width: 0.86, round: 0, shiftX: 0, thick: 1.15 },
  },
  sad: {
    // Outward droop, smaller, lowest of all, a softer frown.
    scaleX: 0.88,
    scaleY: 0.72,
    offsetY: -0.042,
    tilt: -0.3,
    leftSquint: 1,
    core: 0.8,
    color: "#3b6cf6",
    headY: -0.048,
    floatSpeed: 0.7,
    mouth: { curve: -0.6, width: 0.78, round: 0, shiftX: 0, thick: 0.9 },
  },
  surprised: {
    // Big round eyes and a small "o".
    scaleX: 1.3,
    scaleY: 1.5,
    offsetY: 0.012,
    tilt: 0,
    leftSquint: 1,
    core: 1.35,
    color: "#7dd3fc",
    headY: 0.022,
    floatSpeed: 1.3,
    mouth: { curve: 0, width: 0.95, round: 1, shiftX: 0, thick: 1.15 },
  },
  thinking: {
    // One eye squints, the mouth slides to one side, amber tint.
    scaleX: 1,
    scaleY: 0.95,
    offsetY: 0.006,
    tilt: 0.08,
    leftSquint: 0.42,
    core: 0.9,
    color: "#fbbf24",
    headY: -0.006,
    floatSpeed: 0.85,
    mouth: { curve: 0.18, width: 0.6, round: 0, shiftX: 0.038, thick: 0.95 },
  },
  cheeky: {
    // A wink and a lopsided smirk.
    scaleX: 1.1,
    scaleY: 0.85,
    offsetY: 0.016,
    tilt: 0.05,
    leftSquint: 0.12,
    core: 0.7,
    color: "#f472b6",
    headY: 0.006,
    floatSpeed: 1.6,
    mouth: { curve: 0.7, width: 0.76, round: 0, shiftX: 0.032, thick: 1 },
  },
};

/**
 * Frame-rate independent lerp. Plain lerp with a fixed alpha moves faster on
 * a 144Hz display than on a 60Hz one; folding delta through an exponential
 * makes the approach take the same wall-clock time everywhere.
 */
function approach(current: number, target: number, lambda: number, dt: number) {
  return MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

const POSE_LAMBDA = 9;

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
  const leftCoreRef = useRef<Group>(null);
  const rightCoreRef = useRef<Group>(null);
  const mouthRef = useRef<Group>(null);
  const dotRefs = useRef<(Mesh | null)[]>([]);

  // Read inside useFrame without re-subscribing the loop on every change.
  const statusRef = useRef(status);
  statusRef.current = status;
  const poseRef = useRef(POSES[emotion] ?? POSES.neutral);
  poseRef.current = POSES[emotion] ?? POSES.neutral;

  // Smoothed state owned exclusively by useFrame.
  const slump = useRef(0);
  const lean = useRef(0);
  const mouth = useRef({ curve: 0, width: 1, round: 0, shiftX: 0, thick: 1 });

  /**
   * Shared materials, so a colour change is one lerp rather than one per
   * mesh. Standard material with a strong emissive gives the sci-fi glow the
   * brief asks for while still responding to the rig lights.
   */
  const mats = useMemo(() => {
    const base = POSES.neutral.color;
    return {
      led: new MeshStandardMaterial({
        color: "#04070a",
        emissive: new Color(base),
        emissiveIntensity: 2.6,
        roughness: 0.25,
        metalness: 0,
        toneMapped: false,
      }),
      core: new MeshStandardMaterial({
        color: "#ffffff",
        emissive: new Color("#ffffff"),
        emissiveIntensity: 1.5,
        roughness: 0.2,
        metalness: 0,
        toneMapped: false,
      }),
      mouth: new MeshStandardMaterial({
        color: "#04070a",
        emissive: new Color(base),
        emissiveIntensity: 2.4,
        roughness: 0.25,
        metalness: 0,
        toneMapped: false,
      }),
      glow: new MeshBasicMaterial({
        color: new Color(base),
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        toneMapped: false,
      }),
      antenna: new MeshStandardMaterial({
        color: "#04070a",
        emissive: new Color(base),
        emissiveIntensity: 2.2,
        roughness: 0.3,
        metalness: 0,
        toneMapped: false,
      }),
      rim: new MeshBasicMaterial({
        color: new Color(base),
        transparent: true,
        opacity: 0.07,
        side: 1 /* THREE.BackSide */,
        toneMapped: false,
      }),
    };
  }, []);

  useEffect(() => {
    const owned = Object.values(mats);
    return () => owned.forEach((material) => material.dispose());
  }, [mats]);

  /** Reused so the per-frame colour lerp allocates nothing. */
  const targetColor = useMemo(() => new Color(), []);

  // ---- blinking: the one discrete event, on its own node ------------------
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

  // ---- everything else -----------------------------------------------------
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    // Clamp so returning to a backgrounded tab does not jump the whole pose.
    const dt = Math.min(delta, 0.1);
    const pose = poseRef.current;
    const lambda = reducedMotion ? 1e6 : POSE_LAMBDA;

    // -- head float and mood slump (single owner of position.y) -------------
    const float = floatRef.current;
    if (float) {
      if (reducedMotion) {
        float.position.y = pose.headY;
        float.rotation.set(0, 0, 0);
      } else {
        slump.current = approach(slump.current, pose.headY, 4, dt);
        lean.current = approach(lean.current, pose.tilt * 0.05, 4, dt);
        float.position.y =
          slump.current + Math.sin(time * pose.floatSpeed) * 0.028;
        float.rotation.y = Math.sin(time * 0.55) * 0.15;
        float.rotation.x = Math.cos(time * 0.43) * 0.05;
        float.rotation.z = lean.current;
      }
    }

    // -- eyes ---------------------------------------------------------------
    for (const [node, coreNode, sign, squint] of [
      [leftEyeRef.current, leftCoreRef.current, -1, pose.leftSquint],
      [rightEyeRef.current, rightCoreRef.current, 1, 1],
    ] as const) {
      if (!node) continue;
      node.scale.x = approach(node.scale.x, pose.scaleX, lambda, dt);
      node.scale.y = approach(node.scale.y, pose.scaleY * squint, lambda, dt);
      node.position.y = approach(node.position.y, pose.offsetY, lambda, dt);
      node.rotation.z = approach(node.rotation.z, sign * pose.tilt, lambda, dt);
      if (coreNode) {
        const s = approach(coreNode.scale.x, pose.core, lambda, dt);
        coreNode.scale.setScalar(s);
      }
    }

    // -- mouth --------------------------------------------------------------
    const m = mouth.current;
    m.curve = approach(m.curve, pose.mouth.curve, lambda, dt);
    m.width = approach(m.width, pose.mouth.width, lambda, dt);
    m.round = approach(m.round, pose.mouth.round, lambda, dt);
    m.shiftX = approach(m.shiftX, pose.mouth.shiftX, lambda, dt);
    m.thick = approach(m.thick, pose.mouth.thick, lambda, dt);

    for (let i = 0; i < MOUTH_DOTS; i += 1) {
      const dot = dotRefs.current[i];
      if (!dot) continue;

      const u = (i / (MOUTH_DOTS - 1)) * 2 - 1; // -1 .. 1
      // Line form. The -1/3 is the mean of u^2 over the span, so changing the
      // curve bends the mouth about its centre instead of sliding it up.
      const lineX = MOUTH_HALF_W * m.width * u;
      const lineY = MOUTH_CURVE_AMP * m.curve * (u * u - 1 / 3);

      // Ring form, for the surprised "o".
      const phi = (i / MOUTH_DOTS) * Math.PI * 2;
      const ringX = MOUTH_RING_R * m.width * Math.sin(phi);
      const ringY = MOUTH_RING_R * m.width * Math.cos(phi);

      dot.position.x = MathUtils.lerp(lineX, ringX, m.round) + m.shiftX;
      dot.position.y = MathUtils.lerp(lineY, ringY, m.round);
      dot.scale.setScalar(m.thick);
    }

    // -- colour -------------------------------------------------------------
    targetColor.set(pose.color);
    const colourAlpha = reducedMotion ? 1 : 1 - Math.exp(-POSE_LAMBDA * dt);
    mats.led.emissive.lerp(targetColor, colourAlpha);
    mats.mouth.emissive.lerp(targetColor, colourAlpha);
    mats.antenna.emissive.lerp(targetColor, colourAlpha);
    mats.glow.color.lerp(targetColor, colourAlpha);
    mats.rim.color.lerp(targetColor, colourAlpha);

    // -- gaze ---------------------------------------------------------------
    const gaze = gazeRef.current;
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
      gaze.position.x = approach(gaze.position.x, 0, 10, dt);
      gaze.position.y = approach(gaze.position.y, 0, 10, dt);
      gaze.scale.setScalar(1 + Math.sin(time * 13) * 0.045);
      return;
    }

    // Idle: ease everything back to centre with a slow wander.
    gaze.position.x = approach(gaze.position.x, Math.sin(time * 0.7) * 0.006, 4, dt);
    gaze.position.y = approach(gaze.position.y, 0, 5, dt);
    gaze.scale.setScalar(approach(gaze.scale.x, 1, 7, dt));
  });

  return (
    <group ref={floatRef}>
      {/* Shell and visor share one squash group so they stay concentric -
          scaling them separately would make the visor cut through the face. */}
      <group scale={HEAD_SQUASH}>
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

        {/* Black-glass visor: a spherical cap a few mm proud of the shell, so
            it reads as a curved faceplate laid onto the head. Built around
            the +Y pole and rotated to face +Z. */}
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
      <mesh scale={[1.04, 0.967, 0.998]} material={mats.rim}>
        <sphereGeometry args={[HEAD_RADIUS, 48, 48]} />
      </mesh>

      {/* Headphone pods - cheap, and they do most of the "cute" work. */}
      <Pod x={-0.315} />
      <Pod x={0.315} />

      {/* Antenna with a mood-matched bead on the tip. */}
      <mesh position={[0, 0.305, 0]}>
        <cylinderGeometry args={[0.006, 0.008, 0.085, 12]} />
        <meshPhysicalMaterial color="#2c2f38" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.358, 0]} material={mats.antenna}>
        <sphereGeometry args={[0.027, 24, 24]} />
      </mesh>

      <group position={[0, EYE_LINE_Y, 0]}>
        <group ref={gazeRef}>
          {/* Blink owns scale.y here, and this group's origin sits exactly on
              the eye line, so the lids close in place instead of sliding. */}
          <group ref={blinkRef}>
            <Eye groupRef={leftEyeRef} coreRef={leftCoreRef} x={-EYE_X} mats={mats} />
            <Eye groupRef={rightEyeRef} coreRef={rightCoreRef} x={EYE_X} mats={mats} />
          </group>
        </group>
      </group>

      {/* Mouth: a row of LED dots driven entirely by transforms, so morphing
          between a smile, a frown and an "o" allocates no geometry. */}
      <group ref={mouthRef} position={[0, MOUTH_Y, MOUTH_Z]}>
        {Array.from({ length: MOUTH_DOTS }, (_, i) => (
          <mesh
            key={i}
            ref={(node) => {
              dotRefs.current[i] = node;
            }}
            material={mats.mouth}
          >
            <sphereGeometry args={[MOUTH_DOT_R, 14, 14]} />
          </mesh>
        ))}
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
  coreRef,
  x,
  mats,
}: {
  groupRef: React.RefObject<Group | null>;
  coreRef: React.RefObject<Group | null>;
  x: number;
  mats: {
    led: MeshStandardMaterial;
    core: MeshStandardMaterial;
    glow: MeshBasicMaterial;
  };
}) {
  return (
    <group ref={groupRef} position={[x, 0, EYE_Z]}>
      <RoundedBox
        args={[EYE_W, EYE_H, EYE_DEPTH]}
        radius={EYE_RADIUS}
        smoothness={4}
        material={mats.led}
      />

      {/* Bright inner core, so the eye has structure instead of reading as a
          flat lozenge. Scales with the mood. */}
      <group ref={coreRef} position={[0, 0, EYE_DEPTH / 2 - 0.004]}>
        <mesh material={mats.core}>
          <circleGeometry args={[EYE_W * 0.22, 20]} />
        </mesh>
      </group>

      {/* Cheap bloom stand-in: a soft additive disc behind the LED. */}
      <mesh position={[0, 0, -0.005]} scale={2.1} material={mats.glow}>
        <circleGeometry args={[EYE_W * 0.72, 32]} />
      </mesh>
    </group>
  );
}
