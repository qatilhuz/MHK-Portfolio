"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Raycaster, Vector2, Vector3, type Group } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { materials } from "@/components/three/materials";
import { characterConfig } from "@/data/characterConfig";
import { hitReactions, sectionClip, type CharacterClip, type CharacterHit } from "@/data/character";
import { guidedSections } from "@/data/guide";
import { useGuide } from "@/lib/guide/context";
import { CharacterHost } from "@/components/guide/CharacterHost";
import { clipForDecision, nextAutonomousDecision } from "@/lib/character/brain";
import { pointerLook } from "@/lib/character/lookAt";
import { createLocomotion, setDestination, stepLocomotion } from "@/lib/character/movement";
import { pickSafeZone, viewportToWorld, worldToViewport } from "@/lib/character/safeZones";
import type { CharacterDecision } from "@/lib/character/types";

const FALL_CLIPS = new Set(["Fall", "GetUp", "Recover", "Stagger", "Surprise", "Annoyed"]);

export function CharacterScene({
  onScreen,
  onLine,
}: {
  onScreen: (x: number, y: number) => void;
  onLine: (text: string | null) => void;
}) {
  const guide = useGuide();
  const reduced = useReducedMotion() && characterConfig.accessibility.reducedMotionRespect;
  const group = useRef<Group>(null);
  const pivot = useRef<Group>(null);
  const look = useRef({ x: 0, y: 0 });
  const lookWeight = useRef(1);
  const lookWeightTarget = useRef(1);
  const fallPitch = useRef(0);
  const fallTarget = useRef(0);
  const torso = useRef(0);
  const orbit = useRef(0);
  const lastAngle = useRef<number | null>(null);
  const hoverCool = useRef(0);
  const hovering = useRef(false);
  const lastHead = useRef(0);
  const lastScroll = useRef(0);
  const lastDecision = useRef<CharacterDecision>("RETURN_TO_IDLE");
  const pokes = useRef(0);
  const screen = useRef({ x: 0, y: 0 });
  const loco = useRef(createLocomotion({ x: 1.55, y: -0.12, z: 0 }));
  const [clip, setClip] = useState<CharacterClip>("Idle");
  const clipRef = useRef(clip);
  clipRef.current = clip;
  const { camera } = useThree();
  const projected = useRef(new Vector3());

  const locked = () => FALL_CLIPS.has(clipRef.current) || fallTarget.current > 0.05 || fallPitch.current > 0.05;

  const goSafe = (
    preferNx: number,
    preferNy: number,
    reason: "walking" | "moving-to-section",
    variety = true,
  ) => {
    if (!characterConfig.movement.freeRoam) return;
    const vp = worldToViewport(loco.current.position.x, loco.current.position.y);
    const zone = pickSafeZone({
      preferNx,
      preferNy,
      currentNx: vp.nx,
      currentNy: vp.ny,
      variety,
    });
    if (!zone) return;
    setDestination(loco.current, viewportToWorld(zone.nx, zone.ny), reason);
  };

  useEffect(() => {
    if (!guide?.visible) return;
    const id = guide.guided ? guidedSections[guide.index]?.id ?? "hero" : undefined;
    if (guide.guided && id) {
      const el = document.getElementById(guidedSections[guide.index]?.target ?? id);
      const r = el?.getBoundingClientRect();
      const preferNx = r && r.left > window.innerWidth * 0.42 ? 0.16 : 0.84;
      const preferNy = r ? Math.min(0.72, Math.max(0.28, (r.top + r.height * 0.45) / window.innerHeight)) : 0.5;
      goSafe(preferNx, preferNy, "moving-to-section", false);
    }
  }, [guide?.guided, guide?.index, guide?.visible]);

  useEffect(() => {
    if (!guide?.visible) return;
    const onScroll = () => {
      const now = performance.now();
      if (now - lastScroll.current < 900) return;
      lastScroll.current = now;
      if (guide.guided || reduced || !characterConfig.movement.autonomousWalking) return;
      if (now < loco.current.busyUntil || locked()) return;
      const mid = window.innerHeight * 0.42;
      let bestId = "hero";
      let bestEl: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const section of guidedSections) {
        const el = document.getElementById(section.target);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height * 0.35 - mid);
        if (d < bestDist) {
          bestDist = d;
          bestId = section.id;
          bestEl = el;
        }
      }
      const r = bestEl?.getBoundingClientRect();
      const preferNx = r && r.left > window.innerWidth * 0.4 ? 0.14 : 0.86;
      const preferNy = r
        ? Math.min(0.74, Math.max(0.26, (r.top + r.height * 0.5) / window.innerHeight))
        : 0.52;
      goSafe(preferNx, preferNy, "moving-to-section", true);
      setClip(sectionClip[bestId] ?? "Idle");
      loco.current.busyUntil = now + 2600;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [guide?.guided, guide?.visible, reduced]);

  useEffect(() => {
    if (!guide?.visible || reduced || !characterConfig.interaction.autonomousBehavior) return;
    const id = window.setInterval(() => {
      const now = performance.now();
      if (now < loco.current.busyUntil || locked()) return;
      if (guide.guided && (guide.phase === "speaking" || guide.phase === "greeting")) return;
      const decision = nextAutonomousDecision(lastDecision.current);
      lastDecision.current = decision;
      if (decision === "WANDER" && characterConfig.movement.autonomousWalking) {
        goSafe(Math.random(), 0.28 + Math.random() * 0.44, "walking", true);
        return;
      }
      setClip(clipForDecision(decision, guidedSections[guide.index]?.id));
      loco.current.busyUntil = now + 2200;
      window.setTimeout(() => setClip("Idle"), 2000);
    }, 11000 + Math.random() * 9000);
    return () => window.clearInterval(id);
  }, [guide, reduced]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    lookWeight.current = MathUtils.damp(lookWeight.current, lookWeightTarget.current, 6, delta);
    fallPitch.current = MathUtils.damp(fallPitch.current, fallTarget.current, fallTarget.current > fallPitch.current ? 4.2 : 3.2, delta);
    if (pivot.current) pivot.current.rotation.x = fallPitch.current;
    if (!locked()) {
      const dist = stepLocomotion(loco.current, delta, reduced);
      if (dist > 0.1 && clipRef.current !== "Walk" && clipRef.current !== "Turn") {
        setClip(Math.abs(loco.current.targetYaw - loco.current.yaw) > 0.55 ? "Turn" : "Walk");
      }
      if (dist <= 0.08 && (clipRef.current === "Walk" || clipRef.current === "Turn")) {
        const section = guidedSections[guide?.index ?? 0];
        setClip(guide?.guided ? sectionClip[section?.id ?? ""] ?? "Idle" : "Idle");
      }
    }
    node.position.set(loco.current.position.x, loco.current.position.y, loco.current.position.z);
    node.rotation.y += (loco.current.yaw + torso.current - node.rotation.y) * Math.min(1, 5.2 * delta);
    torso.current *= 0.94;
    projected.current
      .set(loco.current.position.x, loco.current.position.y + 0.95, loco.current.position.z)
      .project(camera);
    screen.current = {
      x: (projected.current.x * 0.5 + 0.5) * window.innerWidth,
      y: (-projected.current.y * 0.5 + 0.5) * window.innerHeight,
    };
    onScreen(screen.current.x, screen.current.y);
  });

  useEffect(() => {
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const pick = (event: PointerEvent) => {
      ndc.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (!group.current) return null;
      return raycaster.intersectObject(group.current, true)[0] ?? null;
    };
    const regionFrom = (name: string): CharacterHit => {
      const value = name.toLowerCase();
      if (value.includes("head") || value.includes("eye")) return "head";
      if (value.includes("hand") || value.includes("arm")) return "hand";
      if (value.includes("shoulder")) return "shoulder";
      return "body";
    };
    const playFall = () => {
      lookWeightTarget.current = 0;
      loco.current.busyUntil = performance.now() + 6400;
      setClip("Surprise");
      fallTarget.current = 0.18;
      window.setTimeout(() => setClip("Stagger"), 220);
      window.setTimeout(() => {
        setClip("Fall");
        fallTarget.current = 0.55;
      }, 480);
      window.setTimeout(() => {
        fallTarget.current = 1.05;
      }, 820);
      window.setTimeout(() => {
        fallTarget.current = 1.42;
      }, 1180);
      window.setTimeout(() => setClip("Annoyed"), 2000);
      window.setTimeout(() => {
        setClip("Recover");
        fallTarget.current = 0.95;
      }, 3200);
      window.setTimeout(() => {
        setClip("GetUp");
        fallTarget.current = 0.45;
      }, 4100);
      window.setTimeout(() => {
        fallTarget.current = 0.12;
      }, 5000);
      window.setTimeout(() => {
        fallTarget.current = 0;
        setClip("Playful");
      }, 5600);
      window.setTimeout(() => {
        lookWeightTarget.current = 1;
        setClip("Idle");
        onLine(null);
      }, 6800);
    };
    const play = (region: CharacterHit, extra?: CharacterClip) => {
      if (locked() && extra !== "Fall") return;
      pokes.current += 1;
      onLine(pokes.current > 6 ? "Easy — I still need to host the site." : hitReactions[region].message);
      const next = extra ?? hitReactions[region].clip;
      if (next === "Fall") {
        playFall();
        return;
      }
      setClip(next);
      loco.current.busyUntil = performance.now() + 1700;
      window.setTimeout(() => {
        setClip("Idle");
        onLine(null);
      }, 1500);
    };

    const onMove = (event: PointerEvent) => {
      if (!characterConfig.interaction.pointerFollow) return;
      look.current = pointerLook(event.clientX, event.clientY, screen.current.x, screen.current.y);
      guide?.setLook(look.current.x, look.current.y);
      if (Math.abs(look.current.x) > 0.62 && lookWeight.current > 0.4) {
        torso.current += (look.current.x * 0.28 - torso.current) * 0.08;
      }
      const hit = pick(event);
      document.body.style.cursor = hit ? "pointer" : "";
      const entered = Boolean(hit) && !hovering.current;
      hovering.current = Boolean(hit);
      const cx = screen.current.x;
      const cy = screen.current.y;
      const ang = Math.atan2(event.clientY - cy, event.clientX - cx);
      if (lastAngle.current != null && hit) {
        let d = ang - lastAngle.current;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        orbit.current += d;
        torso.current = Math.max(-0.7, Math.min(0.7, torso.current + d * 0.14));
      }
      lastAngle.current = hit ? ang : null;
      if (Math.abs(orbit.current) > 5 && performance.now() > loco.current.busyUntil && !locked()) {
        orbit.current = 0;
        setClip("LookAround");
        loco.current.busyUntil = performance.now() + 1800;
        window.setTimeout(() => setClip("Idle"), 1800);
      }
      if (
        entered &&
        characterConfig.interaction.hoverGreeting &&
        performance.now() > hoverCool.current &&
        performance.now() > loco.current.busyUntil &&
        !locked()
      ) {
        hoverCool.current = performance.now() + 9000;
        onLine("Hello!");
        setClip("Wave");
        window.setTimeout(() => {
          setClip("Idle");
          onLine(null);
        }, 1700);
      }
    };

    const onClick = (event: PointerEvent) => {
      const hit = pick(event);
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      const region = regionFrom(hit.object.name || hit.object.parent?.name || "");
      const now = performance.now();
      if (region === "head" && characterConfig.interaction.faceDoubleTap && now - lastHead.current < 450) {
        lastHead.current = 0;
        onLine("Hey! I’m getting up.");
        play("head", "Fall");
        return;
      }
      if (region === "head") lastHead.current = now;
      play(region);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
      play("hand");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
    };
  }, [camera, guide, onLine]);

  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <group>
      <ambientLight intensity={0.42} />
      <hemisphereLight args={[materials.fill, materials.desk, 0.32]} />
      <directionalLight position={[2.4, 4.2, 3.2]} intensity={1.05} color={materials.light} />
      <pointLight position={[0.3, 1.3, 1.5]} intensity={0.22} color={materials.accent} />
      <group ref={group} scale={mobile ? 0.76 : 1.1}>
        <group ref={pivot} position={[0, -0.95, 0]}>
          <group position={[0, 0.95, 0]}>
            <CharacterHost
              clip={clip}
              look={look}
              lookWeight={lookWeight}
              reducedMotion={reduced}
              onHit={() => undefined}
            />
          </group>
        </group>
      </group>
    </group>
  );
}
