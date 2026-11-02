"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import type { Group } from "three";
import type { AvatarEmotion } from "@/lib/assistant/emotion";
import type { AssistantStatus } from "@/types";

/**
 * Procedural Pixar-ish assistant head. No GLB, no external textures.
 *
 * The node tree exists to keep GSAP and useFrame off each other's
 * properties - the classic way these avatars end up twitching is two systems
 * writing the same transform on alternate frames:
 *
 *   float   (useFrame) -> whole-head bob and sway
 *   gaze    (useFrame) -> thinking dart + pulse, local to the eye line
 *   blink   (GSAP)     -> scale.y on a group whose origin IS the eye line
 *   emotion (GSAP)     -> per-eye scale / position.y / rotation.z
 *
 * Every one of those is a different object, so blinking never clobbers an
 * emotion pose and the thinking pulse never fights the float.
 */

const HEAD_RADIUS = 0.32;
const EYE_LINE_Y = 0.055;
const EYE_X = 0.112;
const EYE_Z = 0.287;
const EYE_RADIUS = 0.054;

const EYE_CYAN = "#67e8f9";

interface EyePose {
  scaleX: number;
  scaleY: number;
  offsetY: number;
  /** Applied as -tilt on the left eye and +tilt on the right. */
  tilt: number;
}

/**
 * Tilt sign convention: looking at the face, a negative rotation.z drops the
 * +x end of an eye. The left eye's inner end is its +x end, so `-tilt` on the
 * left and `+tilt` on the right both drop the *inner* ends - the angry brow.
 * A negative `tilt` value therefore produces the opposite, outward droop.
 */
const EYE_POSES: Record<AvatarEmotion, EyePose> = {
  neutral: { scaleX: 1.0, scaleY: 1.0, offsetY: 0, tilt: 0 },
  happy: { scaleX: 1.18, scaleY: 0.46, offsetY: 0.024, tilt: 0 },
  angry: { scaleX: 1.08, scaleY: 0.58, offsetY: -0.008, tilt: 0.42 },
  sad: { scaleX: 0.92, scaleY: 0.8, offsetY: -0.022, tilt: -0.3 },
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

  // Read inside useFrame without re-subscribing the loop every status change.
  const statusRef = useRef(status);
  statusRef.current = status;

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
            gsap
              .timeline()
              .to(target.scale, { y: 0.05, duration: 0.07, ease: "power2.in" })
              .to(target.scale, { y: 1, duration: 0.12, ease: "power2.out" });
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

    if (float) {
      if (reducedMotion) {
        float.position.y = 0;
        float.rotation.set(0, 0, 0);
      } else {
        float.position.y = Math.sin(time * 1.15) * 0.028;
        float.rotation.y = Math.sin(time * 0.55) * 0.15;
        float.rotation.x = Math.cos(time * 0.43) * 0.05;
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
      {/* Glossy shell. Reflections come from the rig lights rather than an
          HDR environment so the component pulls nothing off the network. */}
      <mesh castShadow>
        <sphereGeometry args={[HEAD_RADIUS, 64, 64]} />
        <meshPhysicalMaterial
          color="#eef4ff"
          metalness={0.32}
          roughness={0.14}
          clearcoat={1}
          clearcoatRoughness={0.06}
          reflectivity={0.9}
          sheen={0.4}
          sheenColor="#bae6fd"
        />
      </mesh>

      {/* Faint cyan rim so the silhouette reads against a dark panel. */}
      <mesh scale={1.035}>
        <sphereGeometry args={[HEAD_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color={EYE_CYAN}
          transparent
          opacity={0.06}
          side={1 /* THREE.BackSide */}
          toneMapped={false}
        />
      </mesh>

      <group position={[0, EYE_LINE_Y, 0]}>
        <group ref={gazeRef}>
          {/* Blink owns scale.y here, and this group's origin sits exactly on
              the eye line, so the lids close in place instead of sliding. */}
          <group ref={blinkRef}>
            <Eye groupRef={leftEyeRef} x={-EYE_X} />
            <Eye groupRef={rightEyeRef} x={EYE_X} />
          </group>
        </group>
      </group>
    </group>
  );
}

function Eye({
  groupRef,
  x,
}: {
  groupRef: React.RefObject<Group | null>;
  x: number;
}) {
  return (
    <group ref={groupRef} position={[x, 0, EYE_Z]}>
      {/* toneMapped={false} keeps the cyan at full intensity so it reads as an
          emissive LED rather than a lit surface. */}
      <mesh>
        <circleGeometry args={[EYE_RADIUS, 32]} />
        <meshBasicMaterial color={EYE_CYAN} toneMapped={false} />
      </mesh>
      {/* Cheap bloom stand-in: a soft additive disc behind the LED. */}
      <mesh position={[0, 0, -0.004]} scale={1.9}>
        <circleGeometry args={[EYE_RADIUS, 32]} />
        <meshBasicMaterial
          color={EYE_CYAN}
          transparent
          opacity={0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
