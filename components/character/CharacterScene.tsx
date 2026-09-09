"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Raycaster, Vector2, Vector3, type Group } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { materials } from "@/components/three/materials";
import { characterConfig } from "@/data/characterConfig";
import { hitReactions, sectionClip, type CharacterClip, type CharacterHit } from "@/data/character";
import { guidedSections } from "@/data/guide";
import { useGuide } from "@/lib/guide/context";
import { CharacterHost } from "@/components/guide/CharacterHost";
import { clipForDecision, nextAutonomousDecision } from "@/lib/character/brain";
import { createLocomotion, setDestination, stepLocomotion } from "@/lib/character/movement";
import { pickSafeZone, viewportToWorld, worldToViewport } from "@/lib/character/safeZones";
import type { CharacterDecision } from "@/lib/character/types";

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
  const look = useRef({ x: 0, y: 0 });
  const torso = useRef(0);
  const orbit = useRef(0);
  const lastAngle = useRef<number | null>(null);
  const hoverCool = useRef(0);
  const lastHead = useRef(0);
  const lastDecision = useRef<CharacterDecision>("RETURN_TO_IDLE");
  const pokes = useRef(0);
  const loco = useRef(createLocomotion({ x: 1.7, y: -0.15, z: 0 }));
  const [clip, setClip] = useState<CharacterClip>("Idle");
  const clipRef = useRef(clip);
  clipRef.current = clip;
  const { camera } = useThree();
  const projected = useRef(new Vector3());

  const locked = () => ["Fall", "GetUp", "Recover", "Stagger", "Surprise"].includes(clipRef.current);

  const goSafe = (preferNx: number, preferNy: number, reason: "walking" | "moving-to-section") => {
    if (!characterConfig.movement.freeRoam) return;
    const vp = worldToViewport(loco.current.position.x, loco.current.position.y);
    const zone = pickSafeZone({ preferNx, preferNy, currentNx: vp.nx, currentNy: vp.ny });
    if (!zone) return;
    setDestination(loco.current, viewportToWorld(zone.nx, zone.ny), reason);
  };

  useEffect(() => {
    if (!guide?.visible) return;
    const id = guide.guided ? guidedSections[guide.index]?.id ?? "hero" : undefined;
    if (guide.guided && id) {
      const prefer = id === "hero" ? 0.78 : 0.84;
      goSafe(prefer, 0.5, "moving-to-section");
    }
  }, [guide?.guided, guide?.index, guide?.visible]);

  useEffect(() => {
    if (!guide?.visible) return;
    const onScroll = () => {
      if (guide.guided || reduced || !characterConfig.movement.autonomousWalking) return;
      if (performance.now() < loco.current.busyUntil) return;
      const sections = guidedSections.map((s) => s.target);
      const mid = window.innerHeight * 0.45;
      let best = "hero";
      let bestDist = Infinity;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height * 0.3 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = id;
        }
      }
      goSafe(0.82, 0.52, "moving-to-section");
      setClip(sectionClip[best] ?? "Idle");
      loco.current.busyUntil = performance.now() + 2400;
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
        goSafe(Math.random() > 0.5 ? 0.18 : 0.84, 0.4 + Math.random() * 0.25, "walking");
        return;
      }
      setClip(clipForDecision(decision, guidedSections[guide.index]?.id));
      loco.current.busyUntil = now + 2200;
      window.setTimeout(() => setClip("Idle"), 2000);
    }, 12000 + Math.random() * 8000);
    return () => window.clearInterval(id);
  }, [guide, reduced]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    if (!locked()) {
      const dist = stepLocomotion(loco.current, delta, reduced);
      if (dist > 0.08 && clipRef.current !== "Walk") setClip("Walk");
      if (dist <= 0.08 && clipRef.current === "Walk") {
        const section = guidedSections[guide?.index ?? 0];
        setClip(guide?.guided ? sectionClip[section?.id ?? ""] ?? "Idle" : "Idle");
      }
    }
    node.position.set(loco.current.position.x, loco.current.position.y, loco.current.position.z);
    node.rotation.y += (loco.current.yaw + torso.current - node.rotation.y) * Math.min(1, 6 * delta);
    torso.current *= 0.96;
    projected.current.set(loco.current.position.x, loco.current.position.y + 0.95, loco.current.position.z).project(camera);
    onScreen(
      (projected.current.x * 0.5 + 0.5) * window.innerWidth,
      (-projected.current.y * 0.5 + 0.5) * window.innerHeight,
    );
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
      if (value.includes("head")) return "head";
      if (value.includes("hand") || value.includes("arm")) return "hand";
      if (value.includes("shoulder")) return "shoulder";
      return "body";
    };
    const play = (region: CharacterHit, extra?: CharacterClip) => {
      pokes.current += 1;
      onLine(pokes.current > 6 ? "Easy — I still need to host the site." : hitReactions[region].message);
      const next = extra ?? hitReactions[region].clip;
      setClip(next);
      loco.current.busyUntil = performance.now() + (next === "Fall" ? 4200 : 1700);
      if (next === "Fall") {
        window.setTimeout(() => setClip("Stagger"), 0);
        window.setTimeout(() => setClip("Fall"), 280);
        window.setTimeout(() => setClip("Annoyed"), 1100);
        window.setTimeout(() => setClip("Recover"), 1600);
        window.setTimeout(() => setClip("GetUp"), 2200);
        window.setTimeout(() => setClip("Playful"), 3200);
        window.setTimeout(() => {
          setClip("Idle");
          onLine(null);
        }, 4300);
        return;
      }
      window.setTimeout(() => {
        setClip("Idle");
        onLine(null);
      }, 1500);
    };

    const onMove = (event: PointerEvent) => {
      if (!characterConfig.interaction.pointerFollow) return;
      look.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
      guide?.setLook(look.current.x, look.current.y);
      const hit = pick(event);
      document.body.style.cursor = hit ? "pointer" : "";
      if (!hit) {
        lastAngle.current = null;
        return;
      }
      const cx = (projected.current.x * 0.5 + 0.5) * window.innerWidth;
      const cy = (-projected.current.y * 0.5 + 0.5) * window.innerHeight;
      const ang = Math.atan2(event.clientY - cy, event.clientX - cx);
      if (lastAngle.current != null) {
        let d = ang - lastAngle.current;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        orbit.current += d;
        torso.current += d * 0.18;
        torso.current = Math.max(-0.7, Math.min(0.7, torso.current));
      }
      lastAngle.current = ang;
      if (Math.abs(orbit.current) > 5.2 && performance.now() > loco.current.busyUntil && !locked()) {
        orbit.current = 0;
        setClip("LookAround");
        loco.current.busyUntil = performance.now() + 1800;
        window.setTimeout(() => setClip("Idle"), 1800);
      }
      if (
        characterConfig.interaction.hoverGreeting &&
        performance.now() > hoverCool.current &&
        performance.now() > loco.current.busyUntil &&
        !locked()
      ) {
        hoverCool.current = performance.now() + 8000;
        onLine("Hello!");
        setClip("Wave");
        window.setTimeout(() => {
          setClip("Idle");
          onLine(null);
        }, 1600);
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
        setClip("Surprise");
        window.setTimeout(() => play("head", "Fall"), 240);
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
    <group ref={group} scale={mobile ? 0.78 : 1.08}>
      <ambientLight intensity={0.48} />
      <directionalLight position={[2.2, 4, 3]} intensity={0.95} color={materials.light} />
      <pointLight position={[0.4, 1.2, 1.4]} intensity={0.35} color={materials.accent} />
      <CharacterHost clip={clip} look={look} reducedMotion={reduced} onHit={() => undefined} />
    </group>
  );
}
