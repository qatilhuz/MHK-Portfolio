"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, MathUtils, Raycaster, Vector2, Vector3, type Group, type Mesh, type Object3D } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { materials } from "@/components/three/materials";
import { characterConfig } from "@/data/characterConfig";
import {
  EMOTE_DIALOGUE,
  RANDOM_IDLE_THOUGHTS,
  hitReactions,
  randomCharacterLine,
  sectionClip,
  type CharacterClip,
  type CharacterHit,
} from "@/data/character";
import { guidedSections } from "@/data/guide";
import { useGuide } from "@/lib/guide/context";
import { CharacterHost } from "@/components/guide/CharacterHost";
import type { CharacterExpression } from "@/components/character/ArmoredRig";
import { clipForDecision, nextAutonomousDecision } from "@/lib/character/brain";
import { isBottomStageEvent } from "@/lib/character/bounds";
import { emoteById } from "@/data/emotes";
import { subscribeEmote } from "@/lib/character/emoteBus";
import { pointerLook } from "@/lib/character/lookAt";
import { FACE_USER_YAW } from "@/lib/character/forward";
import { ARRIVAL_DISTANCE, createLocomotion, RUN_CYCLE, RUN_STRIDE, setDestination, stepLocomotion, WALK_CYCLE, WALK_STRIDE } from "@/lib/character/movement";
import { pickSafeZone, viewportToWorld, worldToViewport } from "@/lib/character/safeZones";
import type { CharacterDecision } from "@/lib/character/types";

const FALL_CLIPS = new Set(["Fall", "GetUp", "Recover", "Stagger", "Surprise", "Annoyed"]);
const EMOTE_LOCK = new Set(["Backflip", "Jump", "Dance", "Sit", "Bow", "Celebrate", "Sleep", "Wake"]);
const SLEEP_AFTER_MS = 20000;
const IGNORE_HOST_HIT = () => undefined;

function isVisibleSolidArmor(object: Object3D, root: Group) {
  const mesh = object as Mesh;
  if (!mesh.isMesh || mesh.userData.characterHitSurface !== true) return false;

  let ancestor: Object3D | null = mesh;
  while (ancestor) {
    if (!ancestor.visible) return false;
    if (ancestor === root) break;
    ancestor = ancestor.parent;
  }
  if (ancestor !== root) return false;

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.some(
    (material) => material.visible && !material.transparent && material.opacity >= 0.99 && material.depthWrite,
  );
}

export function CharacterScene({
  onScreen,
  onLine,
}: {
  onScreen: (x: number, y: number) => void;
  onLine: (text: string | null) => void;
}) {
  const guide = useGuide();
  const guideDialogueBusy = useRef(false);
  guideDialogueBusy.current = Boolean(guide?.guided);
  const reduced = useReducedMotion() && characterConfig.accessibility.reducedMotionRespect;
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1024 : window.innerWidth,
  );
  const mobile = viewportWidth < 768;
  const characterScale = mobile ? (viewportWidth < 480 ? 0.86 : 0.94) : 1.39;
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
  const reportedScreen = useRef({ x: 0, y: 0 });
  const box = useRef(new Box3());
  const soleY = useRef<number | null>(null);
  const halfChar = useRef<number | null>(null);
  const maxX = useRef(3.2);
  const loco = useRef(createLocomotion(viewportToWorld(0.5)));
  const [clip, setClip] = useState<CharacterClip>("Idle");
  const [expression, setExpression] = useState<CharacterExpression>("default");
  const expressionReset = useRef<number | null>(null);
  const dialogueStartTimer = useRef<number | null>(null);
  const dialogueClearTimer = useRef<number | null>(null);
  const dialogueToken = useRef(0);
  const clipRef = useRef(clip);
  clipRef.current = clip;
  const { camera, gl } = useThree();
  const projected = useRef(new Vector3());
  const projectedMin = useRef(new Vector3());
  const projectedMax = useRef(new Vector3());

  const emoteUntil = useRef(0);
  const emoteCool = useRef(0);
  const pendingEmote = useRef<string | null>(null);
  const lastActivity = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const asleep = useRef(false);
  const waking = useRef(false);
  const inspectYaw = useRef(0);
  const inspectTarget = useRef(0);
  const inspecting = useRef(false);
  const inspectResetAt = useRef(0);
  const inspectPointer = useRef<{ id: number; x: number; y: number; onChar: boolean } | null>(null);
  const inspectDragged = useRef(false);
  const locked = () =>
    asleep.current ||
    waking.current ||
    FALL_CLIPS.has(clipRef.current) ||
    EMOTE_LOCK.has(clipRef.current) ||
    fallTarget.current > 0.05 ||
    fallPitch.current > 0.05 ||
    performance.now() < emoteUntil.current;

  const noteActivity = () => {
    if (asleep.current || waking.current) return;
    lastActivity.current = performance.now();
  };

  const beginSleep = () => {
    if (asleep.current || waking.current || reduced) return;
    asleep.current = true;
    lookWeightTarget.current = 0;
    loco.current.target = { ...loco.current.position };
    loco.current.velocity = { x: 0, y: 0, z: 0 };
    loco.current.state = "idle";
    loco.current.busyUntil = Number.POSITIVE_INFINITY;
    setClip("Sleep");
  };

  const beginWake = () => {
    if (!asleep.current || waking.current) return;
    asleep.current = false;
    waking.current = true;
    lookWeightTarget.current = 0.35;
    setClip("Wake");
    loco.current.busyUntil = performance.now() + 2000;
    hoverCool.current = performance.now() + 9000;
    window.setTimeout(() => {
      waking.current = false;
      lastActivity.current = performance.now();
      lookWeightTarget.current = 1;
      setClip("Idle");
      loco.current.busyUntil = performance.now() + 400;
    }, 1900);
  };

  const walkToNx = (nx: number, reason: "walking" | "moving-to-section") => {
    if (asleep.current || waking.current) return;
    const n = Math.min(0.97, Math.max(0.03, nx));
    const boundary = Math.max(0.35, maxX.current);
    const requestedX = (n - 0.5) * 2 * boundary;
    const x = MathUtils.clamp(requestedX, -boundary, boundary);
    const span = Math.max(0.001, boundary * 2);
    const currentNx = loco.current.position.x / span + 0.5;
    const distPx = Math.abs(n - currentNx) * window.innerWidth;
    const run = !reduced && distPx > window.innerWidth * 0.45;
    loco.current.gait = run ? "run" : "walk";
    loco.current.speed = run ? RUN_STRIDE / RUN_CYCLE : WALK_STRIDE / WALK_CYCLE;
    setDestination(loco.current, { x, y: 0, z: 0 }, reason);
  };

  const cancelTransientDialogue = useCallback(
    (clearLine = false) => {
      dialogueToken.current += 1;
      if (dialogueStartTimer.current != null) {
        window.clearTimeout(dialogueStartTimer.current);
        dialogueStartTimer.current = null;
      }
      if (dialogueClearTimer.current != null) {
        window.clearTimeout(dialogueClearTimer.current);
        dialogueClearTimer.current = null;
      }
      if (clearLine) onLine(null);
    },
    [onLine],
  );

  const scheduleTransientDialogue = useCallback(
    (text: string | null, delayMs: number, visibleMs: number) => {
      if (!text) return;
      dialogueToken.current += 1;
      const token = dialogueToken.current;
      if (dialogueStartTimer.current != null) window.clearTimeout(dialogueStartTimer.current);
      if (dialogueClearTimer.current != null) window.clearTimeout(dialogueClearTimer.current);
      dialogueStartTimer.current = window.setTimeout(() => {
        dialogueStartTimer.current = null;
        if (dialogueToken.current !== token || guideDialogueBusy.current || asleep.current || waking.current) return;
        onLine(text);
      }, delayMs);
      dialogueClearTimer.current = window.setTimeout(() => {
        dialogueClearTimer.current = null;
        if (dialogueToken.current !== token) return;
        dialogueToken.current += 1;
        onLine(null);
      }, delayMs + visibleMs);
    },
    [onLine],
  );

  const playEmote = (id: string) => {
    if (asleep.current || waking.current) return;
    const def = emoteById(id);
    if (!def) return;
    const now = performance.now();
    if (now < emoteCool.current) return;
    const dist = Math.abs(loco.current.target.x - loco.current.position.x);
    if ((locked() && now < emoteUntil.current) || (dist > 0.14 && clipRef.current === "Walk")) {
      pendingEmote.current = id;
      return;
    }
    if (def.fullBody && Math.abs(loco.current.position.x) > maxX.current * 0.82) {
      pendingEmote.current = id;
      walkToNx(0.5, "walking");
      return;
    }
    const next = reduced ? def.reducedClip : def.clip;
    const duration = reduced ? Math.min(def.durationMs, 900) : def.durationMs;
    lookWeightTarget.current = def.fullBody ? 0 : 0.35;
    setClip(next);

    const dialogue = randomCharacterLine(EMOTE_DIALOGUE[def.clip] ?? []);
    const dialogueDelay = reduced ? 420 : 480 + Math.random() * 240;
    const dialogueVisibleMs = Math.max(1600, Math.min(3200, duration - dialogueDelay + 900));
    scheduleTransientDialogue(dialogue, dialogueDelay, dialogueVisibleMs);

    emoteUntil.current = now + duration;
    emoteCool.current = now + def.cooldownMs;
    loco.current.busyUntil = emoteUntil.current;
    loco.current.target = { ...loco.current.position };
    window.setTimeout(() => {
      if (performance.now() >= emoteUntil.current - 50) {
        setClip("Idle");
        lookWeightTarget.current = 1;
      }
    }, duration + 50);
  };

  useEffect(() => {
    const syncViewport = () => {
      const width = window.innerWidth;
      setViewportWidth((current) => (Math.abs(current - width) > 1 ? width : current));
    };
    syncViewport();
    window.addEventListener("resize", syncViewport, { passive: true });
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    soleY.current = null;
    halfChar.current = null;
  }, [characterScale]);

  useEffect(() => subscribeEmote((id) => playEmote(id)), []);

  useEffect(
    () => () => {
      if (expressionReset.current != null) window.clearTimeout(expressionReset.current);
      cancelTransientDialogue(false);
    },
    [cancelTransientDialogue],
  );

  useEffect(() => {
    if (guide?.guided) cancelTransientDialogue(true);
  }, [cancelTransientDialogue, guide?.guided]);

  useEffect(() => {
    const bump = () => noteActivity();
    window.addEventListener("pointermove", bump, { passive: true });
    window.addEventListener("pointerdown", bump, { passive: true });
    window.addEventListener("scroll", bump, { passive: true });
    window.addEventListener("keydown", bump);
    window.addEventListener("touchstart", bump, { passive: true });
    return () => {
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("scroll", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("touchstart", bump);
    };
  }, []);

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
      if (!guide.guided && Math.random() < 0.2) {
        const thought = randomCharacterLine(RANDOM_IDLE_THOUGHTS);
        lastDecision.current = "RETURN_TO_IDLE";
        lastActivity.current = now;
        setClip("Idle");
        loco.current.busyUntil = now + 3500;
        scheduleTransientDialogue(thought, 120, 3200);
        return;
      }
      const decision = nextAutonomousDecision(lastDecision.current);
      lastDecision.current = decision;
      if (decision === "WANDER" && characterConfig.movement.autonomousWalking) {
        const zone = pickSafeZone({ variety: true, currentNx: worldToViewport(loco.current.position.x).nx });
        if (zone) walkToNx(zone.nx, "walking");
        return;
      }
      setClip(clipForDecision(decision, guidedSections[guide.index]?.id));
      loco.current.busyUntil = now + 2000;
      window.setTimeout(() => setClip("Idle"), 1800);
    }, 12000 + Math.random() * 8000);
    return () => window.clearInterval(id);
  }, [guide, reduced, scheduleTransientDialogue]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    lookWeight.current = MathUtils.damp(lookWeight.current, lookWeightTarget.current, 6, delta);
    fallPitch.current = MathUtils.damp(fallPitch.current, fallTarget.current, 4, delta);
    if (pivot.current) pivot.current.rotation.x = fallPitch.current;
    const now = performance.now();
    const moving = Math.abs(loco.current.target.x - loco.current.position.x) > 0.12;
    const tourBusy = Boolean(guide?.guided && (guide.phase === "speaking" || guide.phase === "greeting"));
    if (
      !asleep.current &&
      !waking.current &&
      !reduced &&
      clipRef.current === "Idle" &&
      !moving &&
      !tourBusy &&
      !locked() &&
      now - lastActivity.current >= SLEEP_AFTER_MS
    ) {
      beginSleep();
    }
    if (!locked() && !inspecting.current) {
      const dist = stepLocomotion(loco.current, delta, reduced);
      const yawErr = Math.abs(
        Math.atan2(Math.sin(loco.current.targetYaw - loco.current.yaw), Math.cos(loco.current.targetYaw - loco.current.yaw)),
      );
      if (dist > 0.12) {
        const next =
          yawErr > 0.55 || loco.current.state === "turning"
            ? "Turn"
            : loco.current.gait === "run"
              ? "Run"
              : "Walk";
        if (clipRef.current !== next) setClip(next);
      } else if (dist <= ARRIVAL_DISTANCE && (clipRef.current === "Walk" || clipRef.current === "Run" || clipRef.current === "Turn")) {
        loco.current.targetYaw = FACE_USER_YAW;
        loco.current.yaw = FACE_USER_YAW;
        loco.current.velocity = { x: 0, y: 0, z: 0 };
        loco.current.state = "idle";
        torso.current = 0;
        inspectYaw.current = 0;
        inspectTarget.current = 0;
        inspectResetAt.current = 0;
        node.rotation.set(0, FACE_USER_YAW, 0);
        setClip("Idle");
      }
      lookWeightTarget.current =
        clipRef.current === "Walk" || clipRef.current === "Run" || clipRef.current === "Turn"
          ? 0.4
          : clipRef.current === "Wave"
            ? 0.28
            : EMOTE_LOCK.has(clipRef.current)
              ? 0
              : 1;
      if (pendingEmote.current && dist <= 0.12) {
        const queued = pendingEmote.current;
        pendingEmote.current = null;
        playEmote(queued);
      }
    }
    loco.current.position.y = 0;
    loco.current.position.z = 0;
    if (soleY.current === null) {
      node.position.set(0, 0, 0);
      node.updateWorldMatrix(true, true);
      box.current.setFromObject(node);
      soleY.current = box.current.min.y;
      halfChar.current = Math.max(0.25, (box.current.max.x - box.current.min.x) / 2);
    }
    node.position.set(loco.current.position.x, -soleY.current, 0);
    
    // Restored original camera positioning and lookAt for accurate stage framing
    camera.position.set(0, 1.52, 5.6);
    camera.lookAt(0, 1.52, 0);

    if (!inspecting.current && inspectResetAt.current > 0 && now >= inspectResetAt.current) {
      inspectTarget.current = 0;
      inspectResetAt.current = 0;
    }
    inspectYaw.current = MathUtils.damp(inspectYaw.current, inspectTarget.current, inspecting.current ? 18 : 4.2, delta);
    const faceYaw = loco.current.yaw + torso.current + inspectYaw.current;
    node.rotation.y += (faceYaw - node.rotation.y) * Math.min(1, 8 * delta);
    torso.current *= 0.94;
    const rect = gl.domElement.getBoundingClientRect();
    const aspect = rect.width / Math.max(1, rect.height);
    const halfView = Math.tan((30 * Math.PI) / 360) * 5.6 * aspect;
    const edgePaddingWorld = mobile ? Math.max(0.15, halfView * 0.08) : Math.max(0.08, halfView * 0.025);
    maxX.current = Math.max(mobile ? 0.4 : 0.8, halfView - (halfChar.current ?? 0.45) - edgePaddingWorld);
    loco.current.position.x = MathUtils.clamp(loco.current.position.x, -maxX.current, maxX.current);
    loco.current.target.x = MathUtils.clamp(loco.current.target.x, -maxX.current, maxX.current);
    node.position.x = loco.current.position.x;
    node.updateWorldMatrix(true, true);
    box.current.setFromObject(node);
    const min = projectedMin.current.copy(box.current.min).project(camera);
    const maxp = projectedMax.current.copy(box.current.max).project(camera);
    const left = (Math.min(min.x, maxp.x) * 0.5 + 0.5) * rect.width + rect.left;
    const right = (Math.max(min.x, maxp.x) * 0.5 + 0.5) * rect.width + rect.left;
    const edgePaddingPx = mobile ? 18 : 6;
    const worldPerPixel = (halfView * 2) / Math.max(1, rect.width);
    if (left < rect.left + edgePaddingPx) {
      const correction = (rect.left + edgePaddingPx - left) * worldPerPixel + 0.02;
      loco.current.position.x = Math.min(maxX.current, loco.current.position.x + correction);
      loco.current.target.x = Math.max(loco.current.target.x, loco.current.position.x);
      node.position.x = loco.current.position.x;
    } else if (right > rect.right - edgePaddingPx) {
      const correction = (right - (rect.right - edgePaddingPx)) * worldPerPixel + 0.02;
      loco.current.position.x = Math.max(-maxX.current, loco.current.position.x - correction);
      loco.current.target.x = Math.min(loco.current.target.x, loco.current.position.x);
      node.position.x = loco.current.position.x;
    }
    projected.current.set(loco.current.position.x, 0.55, 0).project(camera);
    screen.current.x = (projected.current.x * 0.5 + 0.5) * rect.width + rect.left;
    screen.current.y = (-projected.current.y * 0.5 + 0.5) * rect.height + rect.top;
    if (
      Math.abs(reportedScreen.current.x - screen.current.x) +
        Math.abs(reportedScreen.current.y - screen.current.y) >
      2
    ) {
      reportedScreen.current.x = screen.current.x;
      reportedScreen.current.y = screen.current.y;
      onScreen(screen.current.x, screen.current.y);
    }
  });

  useEffect(() => {
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const pick = (event: PointerEvent) => {
      const root = group.current;
      if (!root) return null;

      const rect = gl.domElement.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return null;
      }
      ndc.set(
        ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
        -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObject(root, true).find((intersection) => isVisibleSolidArmor(intersection.object, root)) ?? null;
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
      if (asleep.current || waking.current) return;
      if (locked() && extra !== "Fall") return;
      pokes.current += 1;
      cancelTransientDialogue(false);
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

    const onPointerDown = (event: PointerEvent) => {
      const hit = pick(event);
      inspectPointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, onChar: Boolean(hit) };
      inspectDragged.current = false;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (inspectPointer.current?.id !== event.pointerId) return;
      if (inspecting.current) {
        inspecting.current = false;
        inspectTarget.current = inspectYaw.current;
        inspectResetAt.current = performance.now() + 3000;
        loco.current.busyUntil = Math.max(loco.current.busyUntil, performance.now() + 3000);
      }
      inspectPointer.current = null;
    };

    const onMove = (event: PointerEvent) => {
      const down = inspectPointer.current;
      if (down && down.id === event.pointerId && down.onChar) {
        const dx = event.clientX - down.x;
        const dy = event.clientY - down.y;
        if (!inspecting.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.15) {
          inspecting.current = true;
          inspectDragged.current = true;
          inspectResetAt.current = 0;
          loco.current.target = { ...loco.current.position };
        }
        if (inspecting.current) {
          inspectYaw.current += dx * 0.012;
          inspectTarget.current = inspectYaw.current;
          down.x = event.clientX;
          down.y = event.clientY;
        }
      }
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
      if (entered && asleep.current) {
        beginWake();
        lastAngle.current = hit ? Math.atan2(event.clientY - screen.current.y, event.clientX - screen.current.x) : null;
        return;
      }
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
        cancelTransientDialogue(false);
        onLine("Hello!");
        setClip("Wave");
        window.setTimeout(() => {
          setClip("Idle");
          onLine(null);
        }, 1700);
      }
    };

    const onClick = (event: PointerEvent) => {
      if (inspectDragged.current) {
        inspectDragged.current = false;
        return;
      }
      const hit = pick(event);
      const now = performance.now();
      const region = hit ? regionFrom(hit.object.name || hit.object.parent?.name || "") : null;
      if (region === "head" && characterConfig.interaction.faceDoubleTap && now - lastHead.current < 450) {
        lastHead.current = 0;
        event.preventDefault();
        event.stopPropagation();
        noteActivity();
        if (expressionReset.current != null) window.clearTimeout(expressionReset.current);
        setExpression("angry");
        setClip("Annoyed");
        cancelTransientDialogue(false);
        onLine("Double-clicking my face? Not cool.");
        loco.current.busyUntil = Math.max(loco.current.busyUntil, now + 1300);
        window.setTimeout(() => setClip("Idle"), 1200);
        expressionReset.current = window.setTimeout(() => {
          setExpression("default");
          expressionReset.current = null;
          onLine(null);
        }, 3600);
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

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
    };
  }, [camera, cancelTransientDialogue, gl, guide, onLine]);

  return (
    <group>
      <ambientLight intensity={0.42} />
      <hemisphereLight args={[materials.fill, materials.desk, 0.3]} />
      <directionalLight position={[2.2, 3.6, 4]} intensity={1.05} color={materials.light} />
      <pointLight position={[0.2, 0.8, 1.6]} intensity={0.22} color={ACCENT_LIGHT} />
      <group ref={group} scale={characterScale}>
        <group ref={pivot} position={[0, -0.95, 0]}>
          <group position={[0, 0.95, 0]}>
            <CharacterHost
              clip={clip}
              expression={expression}
              look={look}
              lookWeight={lookWeight}
              reducedMotion={reduced}
              onHit={IGNORE_HOST_HIT}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

const ACCENT_LIGHT = "#3b82f6";
