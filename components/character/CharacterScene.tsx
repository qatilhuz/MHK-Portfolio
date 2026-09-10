"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, MathUtils, Raycaster, Vector2, Vector3, type Group } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { materials } from "@/components/three/materials";
import { characterConfig } from "@/data/characterConfig";
import { hitReactions, sectionClip, type CharacterClip, type CharacterHit } from "@/data/character";
import { guidedSections } from "@/data/guide";
import { useGuide } from "@/lib/guide/context";
import { CharacterHost } from "@/components/guide/CharacterHost";
import { clipForDecision, nextAutonomousDecision } from "@/lib/character/brain";
import { characterWorldLimits, clampViewport, isBottomStageEvent } from "@/lib/character/bounds";
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
  const lastBottomTap = useRef(0);
  const lastScroll = useRef(0);
  const manualUntil = useRef(0);
  const lastDecision = useRef<CharacterDecision>("RETURN_TO_IDLE");
  const pokes = useRef(0);
  const screen = useRef({ x: 0, y: 0 });
  const box = useRef(new Box3());
  const stage = characterWorldLimits();
  const start = viewportToWorld(0.5, stage.stageNy);
  const loco = useRef(createLocomotion(start));
  const [clip, setClip] = useState<CharacterClip>("Idle");
  const clipRef = useRef(clip);
  clipRef.current = clip;
  const { camera } = useThree();
  const projected = useRef(new Vector3());

  const locked = () => FALL_CLIPS.has(clipRef.current) || fallTarget.current > 0.05 || fallPitch.current > 0.05;

  const walkToNx = (nx: number, reason: "walking" | "moving-to-section") => {
    const lim = characterWorldLimits();
    const dest = viewportToWorld(clampViewport(nx).nx, lim.stageNy);
    setDestination(loco.current, dest, reason);
  };

  useEffect(() => {
    if (!guide?.visible) return;
    if (guide.guided) {
      const prefer = guide.index % 2 === 0 ? 0.42 : 0.62;
      if (performance.now() > manualUntil.current) walkToNx(prefer, "moving-to-section");
    }
  }, [guide?.guided, guide?.index, guide?.visible]);

  useEffect(() => {
    if (!guide?.visible) return;
    const onScroll = () => {
      const now = performance.now();
      if (now - lastScroll.current < 1100) return;
      lastScroll.current = now;
      if (now < manualUntil.current || reduced || !characterConfig.movement.autonomousWalking) return;
      if (now < loco.current.busyUntil || locked()) return;
      const zone = pickSafeZone({ preferNx: 0.35 + Math.random() * 0.3, variety: true });
      if (zone) walkToNx(zone.nx, "walking");
      const id = guidedSections.find((s) => {
        const el = document.getElementById(s.target);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.55 && r.bottom > 80;
      })?.id;
      if (id) setClip(sectionClip[id] ?? "Idle");
      loco.current.busyUntil = now + 2800;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [guide?.visible, reduced]);

  useEffect(() => {
    if (!guide?.visible || reduced || !characterConfig.interaction.autonomousBehavior) return;
    const id = window.setInterval(() => {
      const now = performance.now();
      if (now < manualUntil.current || now < loco.current.busyUntil || locked()) return;
      if (guide.guided && (guide.phase === "speaking" || guide.phase === "greeting")) return;
      const decision = nextAutonomousDecision(lastDecision.current);
      lastDecision.current = decision;
      if (decision === "WANDER" && characterConfig.movement.autonomousWalking) {
        const zone = pickSafeZone({ variety: true, currentNx: worldToViewport(loco.current.position.x, loco.current.position.y).nx });
        if (zone) walkToNx(zone.nx, "walking");
        return;
      }
      setClip(clipForDecision(decision, guidedSections[guide.index]?.id));
      loco.current.busyUntil = now + 2000;
      window.setTimeout(() => setClip("Idle"), 1800);
    }, 12000 + Math.random() * 8000);
    return () => window.clearInterval(id);
  }, [guide, reduced]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    lookWeight.current = MathUtils.damp(lookWeight.current, lookWeightTarget.current, 6, delta);
    fallPitch.current = MathUtils.damp(fallPitch.current, fallTarget.current, 4, delta);
    if (pivot.current) pivot.current.rotation.x = fallPitch.current;
    if (!locked()) {
      const dist = stepLocomotion(loco.current, delta, reduced);
      if (dist > 0.1 && clipRef.current !== "Walk" && clipRef.current !== "Turn") {
        setClip(Math.abs(loco.current.targetYaw - loco.current.yaw) > 0.5 ? "Turn" : "Walk");
      }
      if (dist <= 0.08 && (clipRef.current === "Walk" || clipRef.current === "Turn")) {
        setClip("Idle");
      }
      lookWeightTarget.current = clipRef.current === "Walk" || clipRef.current === "Turn" ? 0.4 : 1;
    }
    const lim = characterWorldLimits();
    const vp = clampViewport(worldToViewport(loco.current.position.x, loco.current.position.y).nx);
    const clamped = viewportToWorld(vp.nx, lim.stageNy);
    loco.current.position.x = clamped.x;
    loco.current.position.y = clamped.y;
    loco.current.position.z = 0;
    node.position.set(clamped.x, clamped.y, 0);
    node.rotation.y += (loco.current.yaw + torso.current - node.rotation.y) * Math.min(1, 5 * delta);
    torso.current *= 0.94;
    if (node.parent) {
      box.current.setFromObject(node);
      const min = box.current.min.project(camera);
      const max = box.current.max.project(camera);
      const left = (Math.min(min.x, max.x) * 0.5 + 0.5) * window.innerWidth;
      const right = (Math.max(min.x, max.x) * 0.5 + 0.5) * window.innerWidth;
      if (left < 12) loco.current.position.x += 0.04;
      if (right > window.innerWidth - 12) loco.current.position.x -= 0.04;
    }
    projected.current.set(loco.current.position.x, loco.current.position.y + 0.7, 0).project(camera);
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
      if (value.includes("head") || value.includes("eye") || value.includes("mouth")) return "head";
      if (value.includes("hand") || value.includes("arm")) return "hand";
      if (value.includes("shoulder")) return "shoulder";
      return "body";
    };
    const playFall = () => {
      lookWeightTarget.current = 0;
      loco.current.busyUntil = performance.now() + 6400;
      setClip("Surprise");
      fallTarget.current = 0.08;
      window.setTimeout(() => setClip("Stagger"), 220);
      window.setTimeout(() => {
        setClip("Fall");
        fallTarget.current = 0.22;
      }, 480);
      window.setTimeout(() => {
        fallTarget.current = 0.32;
      }, 900);
      window.setTimeout(() => setClip("Annoyed"), 2000);
      window.setTimeout(() => {
        setClip("Recover");
        fallTarget.current = 0.14;
      }, 3200);
      window.setTimeout(() => {
        setClip("GetUp");
        fallTarget.current = 0.06;
      }, 4300);
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
        torso.current += (look.current.x * 0.22 - torso.current) * 0.08;
      }
      const hit = pick(event);
      document.body.style.cursor = hit ? "pointer" : "";
      const entered = Boolean(hit) && !hovering.current;
      hovering.current = Boolean(hit);
      const ang = Math.atan2(event.clientY - screen.current.y, event.clientX - screen.current.x);
      if (lastAngle.current != null && hit) {
        let d = ang - lastAngle.current;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        orbit.current += d;
        torso.current = Math.max(-0.55, Math.min(0.55, torso.current + d * 0.12));
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
      const now = performance.now();
      const region = hit ? regionFrom(hit.object.name || hit.object.parent?.name || "") : null;
      if (region === "head" && characterConfig.interaction.faceDoubleTap && now - lastHead.current < 450) {
        lastHead.current = 0;
        event.preventDefault();
        event.stopPropagation();
        onLine("Hey! I’m getting up.");
        play("head", "Fall");
        return;
      }
      if (region === "head") lastHead.current = now;
      if (isBottomStageEvent(event.clientY) && now - lastBottomTap.current < 420 && region !== "head") {
        lastBottomTap.current = 0;
        if (!locked()) {
          manualUntil.current = now + 5000;
          walkToNx(event.clientX / window.innerWidth, "walking");
        }
        return;
      }
      if (isBottomStageEvent(event.clientY)) lastBottomTap.current = now;
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      play(region ?? "body");
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
      <hemisphereLight args={[materials.fill, materials.desk, 0.3]} />
      <directionalLight position={[2.2, 3.6, 4]} intensity={1.05} color={materials.light} />
      <pointLight position={[0.2, 0.8, 1.6]} intensity={0.22} color={ACCENT_LIGHT} />
      <group ref={group} scale={mobile ? 0.5 : 0.62}>
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

const ACCENT_LIGHT = "#3b82f6";
