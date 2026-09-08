"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Raycaster, Vector2, Vector3, type Group } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { materials } from "@/components/three/materials";
import {
  hitReactions,
  sectionClip,
  type CharacterClip,
  type CharacterHit,
} from "@/data/character";
import { anchorForSection, viewportToWorld } from "@/data/characterWorld";
import { guidedSections } from "@/data/guide";
import { useGuide } from "@/lib/guide/context";
import { CharacterHost } from "@/components/guide/CharacterHost";

const AUTONOMOUS: CharacterClip[] = ["LookAround", "Wave", "Think"];

export function CharacterScene({
  onScreen,
  onLine,
}: {
  onScreen: (x: number, y: number) => void;
  onLine: (text: string | null) => void;
}) {
  const guide = useGuide();
  const reduced = useReducedMotion();
  const group = useRef<Group>(null);
  const pos = useRef({ x: 1.55, y: -0.2 });
  const target = useRef({ x: 1.55, y: -0.2 });
  const look = useRef({ x: 0, y: 0 });
  const [clip, setClip] = useState<CharacterClip>("Idle");
  const moving = useRef(false);
  const busyUntil = useRef(0);
  const pokes = useRef(0);
  const lastHead = useRef(0);
  const lastAutoKind = useRef("");
  const orbit = useRef(0);
  const { camera } = useThree();
  const projected = useRef(new Vector3());

  useEffect(() => {
    if (!guide?.visible) return;
    const id = guide.guided ? guidedSections[guide.index]?.id ?? "hero" : "hero";
    const anchor = anchorForSection(id);
    target.current = viewportToWorld(
      window.innerWidth < 768 ? Math.min(anchor.x, 0.88) : anchor.x,
      anchor.y,
    );
  }, [guide?.guided, guide?.index, guide?.visible]);

  useEffect(() => {
    if (!guide?.visible || reduced) return;
    const id = window.setInterval(() => {
      const now = performance.now();
      if (now < busyUntil.current) return;
      if (guide.guided && (guide.phase === "speaking" || guide.phase === "greeting")) return;
      const choice = AUTONOMOUS[Math.floor(Math.random() * AUTONOMOUS.length)];
      if (choice === lastAutoKind.current) return;
      lastAutoKind.current = choice;
      if (Math.random() > 0.55) {
        target.current = viewportToWorld(0.74 + Math.random() * 0.12, 0.44 + Math.random() * 0.16);
        return;
      }
      setClip(choice);
      busyUntil.current = now + 2200;
      window.setTimeout(() => setClip("Idle"), 2000);
    }, 14000);
    return () => window.clearInterval(id);
  }, [guide, reduced]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const dx = target.current.x - pos.current.x;
    const dy = target.current.y - pos.current.y;
    const dist = Math.hypot(dx, dy);
    const speed = reduced ? 2.8 : 1.55;
    const locked = clip === "Fall" || clip === "GetUp";
    if (dist > 0.05 && performance.now() > busyUntil.current && !locked) {
      moving.current = true;
      const step = Math.min(speed * delta, dist);
      pos.current.x += (dx / dist) * step;
      pos.current.y += (dy / dist) * step;
      if (clip !== "Walk") setClip("Walk");
      node.rotation.y += ((dx > 0 ? -0.35 : 0.35) - node.rotation.y) * 0.08;
    } else if (moving.current && dist <= 0.05) {
      moving.current = false;
      if (clip === "Walk") {
        const section = guidedSections[guide?.index ?? 0];
        setClip(guide?.guided ? sectionClip[section?.id ?? ""] ?? "Idle" : "Idle");
      }
    }
    node.position.set(pos.current.x, pos.current.y, 0);
    projected.current.set(pos.current.x, pos.current.y + 0.95, 0).project(camera);
    onScreen(
      (projected.current.x * 0.5 + 0.5) * window.innerWidth,
      (-projected.current.y * 0.5 + 0.5) * window.innerHeight,
    );
  });

  useEffect(() => {
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const pick = (event: PointerEvent) => {
      ndc.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      if (!group.current) return null;
      return raycaster.intersectObject(group.current, true)[0] ?? null;
    };

    const regionFrom = (name: string): CharacterHit => {
      const value = name.toLowerCase();
      if (value.includes("head")) return "head";
      if (value.includes("hand") || value.includes("arm")) return "hand";
      return "body";
    };

    const play = (region: CharacterHit, extra?: CharacterClip) => {
      pokes.current += 1;
      const line =
        pokes.current > 5 ? "Easy — I still need to host the site." : hitReactions[region].message;
      onLine(line);
      const next = extra ?? hitReactions[region].clip;
      setClip(next);
      busyUntil.current = performance.now() + (next === "Fall" ? 3000 : 1700);
      if (next === "Fall") {
        window.setTimeout(() => setClip("GetUp"), 900);
        window.setTimeout(() => {
          setClip("Idle");
          onLine(null);
        }, 2100);
        return;
      }
      window.setTimeout(() => {
        setClip("Idle");
        onLine(null);
      }, 1500);
    };

    const onMove = (event: PointerEvent) => {
      look.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
      guide?.setLook(look.current.x, look.current.y);
      const hit = pick(event);
      document.body.style.cursor = hit ? "pointer" : "";
      if (hit) {
        orbit.current += 0.04;
        if (orbit.current > 6.2 && performance.now() > busyUntil.current) {
          orbit.current = 0;
          setClip("LookAround");
          busyUntil.current = performance.now() + 1800;
          window.setTimeout(() => setClip("Idle"), 1800);
        }
      }
    };

    const onClick = (event: PointerEvent) => {
      const hit = pick(event);
      if (!hit) return;
      event.preventDefault();
      event.stopPropagation();
      const region = regionFrom(hit.object.name || hit.object.parent?.name || "");
      const now = performance.now();
      if (region === "head" && now - lastHead.current < 450) {
        lastHead.current = 0;
        onLine("Hey! I’m getting up.");
        setClip("Surprise");
        window.setTimeout(() => play("head", "Fall"), 260);
        return;
      }
      if (region === "head") lastHead.current = now;
      play(region);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
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

  return (
    <group
      ref={group}
      scale={typeof window !== "undefined" && window.innerWidth < 768 ? 0.82 : 1.12}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 3]} intensity={0.9} color={materials.light} />
      <CharacterHost clip={clip} look={look} reducedMotion={reduced} onHit={() => undefined} />
    </group>
  );
}
