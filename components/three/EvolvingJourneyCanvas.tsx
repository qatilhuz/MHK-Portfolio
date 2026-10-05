"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Group,
  MathUtils,
  Vector3,
  type LineBasicMaterial,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
} from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { motionEngine } from "@/lib/motion/engine";

const TARGET_FRAME_MS = 1000 / 60;
const PETAL_COUNT = 8;
const NODE_COUNT = 12;
const DETAIL_RING_COUNT = 5;
const CORE_FRAGMENT_COUNT = 16;

interface EvolvingArtifactProps {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
}

function createNetworkGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(NODE_COUNT * 2 * 3), 3));
  return geometry;
}

function RenderCadence({ running }: { running: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    if (!running) return;

    let animationFrame = 0;
    let previousFrame = performance.now();
    const scheduleFrame = (now: number) => {
      const elapsed = now - previousFrame;
      if (elapsed >= TARGET_FRAME_MS) {
        previousFrame = now - (elapsed % TARGET_FRAME_MS);
        invalidate();
      }
      animationFrame = requestAnimationFrame(scheduleFrame);
    };

    animationFrame = requestAnimationFrame(scheduleFrame);
    return () => cancelAnimationFrame(animationFrame);
  }, [invalidate, running]);

  return null;
}

function EvolvingArtifact({ progress, reducedMotion }: EvolvingArtifactProps) {
  const carrier = useRef<Group>(null);
  const artifact = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const coreMaterial = useRef<MeshStandardMaterial>(null);
  const petals = useRef<Array<Mesh | null>>([]);
  const petalMaterials = useRef<Array<MeshStandardMaterial | null>>([]);
  const rings = useRef<Array<Mesh | null>>([]);
  const ringMaterials = useRef<Array<MeshBasicMaterial | null>>([]);
  const detailRings = useRef<Array<Mesh | null>>([]);
  const detailRingMaterials = useRef<Array<MeshBasicMaterial | null>>([]);
  const coreFragments = useRef<Array<Mesh | null>>([]);
  const fragmentMaterials = useRef<Array<MeshStandardMaterial | null>>([]);
  const nodes = useRef<Array<Group | null>>([]);
  const nodeMaterials = useRef<Array<MeshBasicMaterial | null>>([]);
  const networkMaterial = useRef<LineBasicMaterial>(null);
  const smoothedProgress = useRef(0);
  const initialized = useRef(false);

  const point = useMemo(() => new Vector3(), []);
  const tangent = useMemo(() => new Vector3(), []);
  const tempColor = useMemo(() => new Color(), []);
  const introColor = useMemo(() => new Color("#0891b2"), []);
  const aboutColor = useMemo(() => new Color("#38bdf8"), []);
  const skillsColor = useMemo(() => new Color("#8b5cf6"), []);

  const path = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(0.27, 0.405, 0.82),
          new Vector3(0.31, 0.285, 0.35),
          new Vector3(0.08, 0.16, 0.62),
          new Vector3(-0.045, 0.025, 0.88),
          new Vector3(0.1, -0.13, 0.28),
          new Vector3(0.28, -0.405, 0.7),
        ],
        false,
        "catmullrom",
        0.64,
      ),
    [],
  );

  const nodeDirections = useMemo(
    () =>
      Array.from({ length: NODE_COUNT }, (_, index) => {
        const y = 1 - (index / (NODE_COUNT - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const angle = index * Math.PI * (3 - Math.sqrt(5));
        return new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius).normalize();
      }),
    [],
  );

  const fragmentDirections = useMemo(
    () =>
      Array.from({ length: CORE_FRAGMENT_COUNT }, (_, index) => {
        const y = 1 - (((index * 7) % CORE_FRAGMENT_COUNT) / (CORE_FRAGMENT_COUNT - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const angle = index * Math.PI * (3 - Math.sqrt(5)) + (index % 4) * 0.28;
        return new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius).normalize();
      }),
    [],
  );

  const networkGeometry = useMemo(() => createNetworkGeometry(), []);
  useEffect(() => () => networkGeometry.dispose(), [networkGeometry]);

  useFrame((state, delta) => {
    const carrierNode = carrier.current;
    const artifactNode = artifact.current;
    if (!carrierNode || !artifactNode) return;

    const scrollProgress = MathUtils.clamp(progress.current, 0, 1);
    smoothedProgress.current = initialized.current
      ? MathUtils.damp(smoothedProgress.current, scrollProgress, reducedMotion ? 22 : 14, Math.min(delta, 1 / 30))
      : scrollProgress;

    const journey = smoothedProgress.current;
    const aboutReveal = MathUtils.smoothstep(journey, 0.24, 0.5);
    const skillsReveal = MathUtils.smoothstep(journey, 0.58, 0.86);
    const idleTime = reducedMotion ? 0 : state.clock.elapsedTime;

    path.getPointAt(scrollProgress, point);
    path.getTangentAt(scrollProgress, tangent).normalize();
    const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 0]);
    const targetX = point.x * viewport.width;
    const targetY = 0;
    const bank = -tangent.x * 0.42;

    if (initialized.current) {
      carrierNode.position.x = MathUtils.damp(carrierNode.position.x, targetX, 13, delta);
      carrierNode.position.y = targetY;
      carrierNode.position.z = MathUtils.damp(carrierNode.position.z, point.z, 12, delta);
      carrierNode.rotation.z = MathUtils.damp(carrierNode.rotation.z, bank, 10, delta);
    } else {
      carrierNode.position.set(targetX, targetY, point.z);
      carrierNode.rotation.z = bank;
    }

    const responsiveScale = MathUtils.clamp(viewport.width / 9.4, 0.36, 0.7);
    const sectionScale = 0.94 + aboutReveal * 0.08 + skillsReveal * 0.1;
    const nextScale = responsiveScale * sectionScale;
    const scale = initialized.current
      ? MathUtils.damp(carrierNode.scale.x, nextScale, 7, delta)
      : nextScale;
    carrierNode.scale.setScalar(scale);

    artifactNode.rotation.x = idleTime * 0.12 + journey * Math.PI * 1.2;
    artifactNode.rotation.y = idleTime * 0.18 + journey * Math.PI * 2.4;

    const pulse = reducedMotion ? 1 : 1 + Math.sin(idleTime * 2.4) * 0.035;
    const coreScale = pulse * (1 + aboutReveal * 0.16 - skillsReveal * 0.34);
    core.current?.scale.setScalar(coreScale);

    if (coreMaterial.current) {
      tempColor.copy(introColor).lerp(aboutColor, aboutReveal).lerp(skillsColor, skillsReveal * 0.88);
      coreMaterial.current.emissive.copy(tempColor);
      coreMaterial.current.emissiveIntensity = 3.8 + aboutReveal * 1.8 + skillsReveal * 2.6;
      coreMaterial.current.roughness = 0.24 - aboutReveal * 0.08;
    }
    petals.current.forEach((petal, index) => {
      if (!petal) return;
      const angle = (index / PETAL_COUNT) * Math.PI * 2;
      const alternating = index % 2 === 0 ? 1 : -1;
      const radius = 0.39 + aboutReveal * 0.31 + skillsReveal * (0.46 + (index % 3) * 0.045);
      petal.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.sin(angle * 2 + index) * (0.04 + aboutReveal * 0.15 + skillsReveal * 0.22),
      );
      petal.rotation.set(
        alternating * (0.22 + aboutReveal * 0.72 + skillsReveal * 0.34),
        skillsReveal * angle * 0.4,
        angle - Math.PI / 2 + alternating * aboutReveal * 0.5,
      );
      petal.scale.set(
        0.32 + aboutReveal * 0.08 - skillsReveal * 0.1,
        0.92 - aboutReveal * 0.12 - skillsReveal * 0.26,
        0.3 + skillsReveal * 0.18,
      );
      const material = petalMaterials.current[index];
      if (material) {
        material.opacity = 0.5 - skillsReveal * 0.12;
        material.emissiveIntensity = 1.9 + aboutReveal * 1.35 + skillsReveal * 2;
      }
    });

    rings.current.forEach((ring, index) => {
      if (!ring) return;
      const direction = index % 2 === 0 ? 1 : -1;
      ring.rotation.x = direction * (idleTime * (0.22 + index * 0.04) + journey * Math.PI * (1 + index * 0.3));
      ring.rotation.y = direction * journey * Math.PI * (1.6 + index * 0.25);
      ring.rotation.z = index * Math.PI * 0.27 + idleTime * 0.08;
      const ringScale = 0.76 + index * 0.14 + aboutReveal * 0.24 + skillsReveal * (0.42 + index * 0.08);
      ring.scale.setScalar(ringScale);
      const material = ringMaterials.current[index];
      if (material) material.opacity = 0.24 + aboutReveal * 0.24 + skillsReveal * 0.28;
    });

    detailRings.current.forEach((ring, index) => {
      if (!ring) return;
      const spin = index % 2 === 0 ? 1 : -1;
      ring.rotation.x = index * 0.58 + spin * (idleTime * (0.34 + index * 0.035) + journey * Math.PI * 0.7);
      ring.rotation.y = index * 0.36 - spin * (idleTime * 0.18 + journey * Math.PI * (0.85 + index * 0.08));
      ring.rotation.z = idleTime * 0.12 + index * 0.72 + journey * Math.PI * 0.42;
      ring.scale.setScalar(0.92 + aboutReveal * 0.18 + skillsReveal * (0.22 + index * 0.035));
      const material = detailRingMaterials.current[index];
      if (material) material.opacity = 0.26 + aboutReveal * 0.22 + skillsReveal * 0.2;
    });

    coreFragments.current.forEach((fragment, index) => {
      if (!fragment) return;
      const direction = fragmentDirections[index];
      const orbit = idleTime * (0.28 + (index % 5) * 0.024) + journey * Math.PI * (0.45 + index * 0.018);
      const cos = Math.cos(orbit);
      const sin = Math.sin(orbit);
      const radius = 0.22 + (index % 4) * 0.028 + aboutReveal * 0.095 + skillsReveal * (0.17 + (index % 3) * 0.025);
      const x = (direction.x * cos - direction.z * sin) * radius;
      const z = (direction.x * sin + direction.z * cos) * radius;
      const y = direction.y * radius * (0.82 + aboutReveal * 0.16);
      fragment.position.set(x, y, z);
      fragment.rotation.set(idleTime * 0.38 + index * 0.31, journey * 5 + index, -orbit * 0.72);
      fragment.scale.setScalar(0.72 + aboutReveal * 0.18 + skillsReveal * 0.22);
      const material = fragmentMaterials.current[index];
      if (material) {
        material.opacity = 0.44 + aboutReveal * 0.2 + skillsReveal * 0.2;
        material.emissiveIntensity = 1.8 + aboutReveal * 1.4 + skillsReveal * 2.2;
      }
    });

    const networkPositions = networkGeometry.getAttribute("position") as BufferAttribute;
    nodes.current.forEach((node, index) => {
      if (!node) return;
      const direction = nodeDirections[index];
      const skillVariance = (index % 4) * 0.065;
      const radius = 0.47 + aboutReveal * 0.22 + skillsReveal * (0.62 + skillVariance);
      const orbit = idleTime * (0.16 + (index % 3) * 0.025) * (index % 2 === 0 ? 1 : -1);
      const cos = Math.cos(orbit);
      const sin = Math.sin(orbit);
      const x = (direction.x * cos - direction.z * sin) * radius;
      const z = (direction.x * sin + direction.z * cos) * radius;
      const y = direction.y * radius;
      node.position.set(x, y, z);
      node.scale.setScalar(0.34 + aboutReveal * 0.22 + skillsReveal * (0.58 + (index % 3) * 0.08));
      node.rotation.set(journey * 4 + index, journey * 6 - index * 0.3, orbit);

      const material = nodeMaterials.current[index];
      if (material) material.opacity = 0.12 + aboutReveal * 0.34 + skillsReveal * 0.48;

      networkPositions.setXYZ(index * 2, 0, 0, 0);
      networkPositions.setXYZ(index * 2 + 1, x, y, z);
    });
    networkPositions.needsUpdate = true;
    if (networkMaterial.current) {
      networkMaterial.current.opacity = 0.025 + aboutReveal * 0.07 + skillsReveal * 0.28;
    }

    initialized.current = true;
  });

  return (
    <group ref={carrier}>
      <pointLight color="#22d3ee" intensity={8} distance={5} decay={2} />
      <pointLight position={[0, 0, -1]} color="#8b5cf6" intensity={5} distance={4} decay={2} />

      <group ref={artifact}>
        <mesh ref={core}>
          <dodecahedronGeometry args={[0.39, 2]} />
          <meshStandardMaterial
            ref={coreMaterial}
            color="#020817"
            emissive="#0891b2"
            emissiveIntensity={3.8}
            metalness={0.94}
            roughness={0.24}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={0.58}>
          <icosahedronGeometry args={[0.39, 1]} />
          <meshBasicMaterial
            color="#ecfeff"
            transparent
            opacity={0.94}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.06}>
          <icosahedronGeometry args={[0.39, 2]} />
          <meshBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.28}
            wireframe
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={2.65} visible={false}>
          <sphereGeometry args={[0.39, 24, 24]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {Array.from({ length: DETAIL_RING_COUNT }, (_, index) => (
          <mesh
            key={`detail-ring-${index}`}
            ref={(node) => {
              detailRings.current[index] = node;
            }}
            rotation={[index * 0.42, index * 0.66, index * 0.24]}
          >
            <torusGeometry args={[0.3 + index * 0.075, 0.004 + (index % 2) * 0.002, 6, 96]} />
            <meshBasicMaterial
              ref={(material) => {
                detailRingMaterials.current[index] = material;
              }}
              color={index % 3 === 0 ? "#a5f3fc" : index % 2 === 0 ? "#38bdf8" : "#818cf8"}
              transparent
              opacity={0.26}
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}

        {fragmentDirections.map((_, index) => (
          <mesh
            key={`core-fragment-${index}`}
            ref={(node) => {
              coreFragments.current[index] = node;
            }}
          >
            <octahedronGeometry args={[0.048 + (index % 4) * 0.006, 0]} />
            <meshStandardMaterial
              ref={(material) => {
                fragmentMaterials.current[index] = material;
              }}
              color={index % 3 === 0 ? "#cffafe" : index % 2 === 0 ? "#0f172a" : "#172554"}
              emissive={index % 3 === 0 ? "#22d3ee" : index % 2 === 0 ? "#38bdf8" : "#8b5cf6"}
              emissiveIntensity={1.8}
              metalness={0.86}
              roughness={0.18}
              transparent
              opacity={0.44}
              toneMapped={false}
            />
          </mesh>
        ))}

        {Array.from({ length: PETAL_COUNT }, (_, index) => (
          <mesh
            key={`petal-${index}`}
            ref={(node) => {
              petals.current[index] = node;
            }}
          >
            <octahedronGeometry args={[0.34, 0]} />
            <meshStandardMaterial
              ref={(material) => {
                petalMaterials.current[index] = material;
              }}
              color={index % 2 === 0 ? "#061d2b" : "#09172e"}
              emissive={index % 2 === 0 ? "#0e7490" : "#2563eb"}
              emissiveIntensity={1.9}
              metalness={0.9}
              roughness={0.16}
              transparent
              opacity={0.5}
              toneMapped={false}
            />
          </mesh>
        ))}

        {[0, 1, 2].map((index) => (
          <mesh
            key={`ring-${index}`}
            ref={(node) => {
              rings.current[index] = node;
            }}
            rotation={[index * 0.72, index * 0.48, index * 0.36]}
          >
            <torusGeometry args={[0.68 + index * 0.13, 0.012 + index * 0.003, 8, 96]} />
            <meshBasicMaterial
              ref={(material) => {
                ringMaterials.current[index] = material;
              }}
              color={index === 2 ? "#8b5cf6" : index === 1 ? "#60a5fa" : "#22d3ee"}
              transparent
              opacity={0.32}
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}

        {nodeDirections.map((_, index) => (
          <group
            key={`node-${index}`}
            ref={(node) => {
              nodes.current[index] = node;
            }}
          >
            <mesh>
              <octahedronGeometry args={[0.095 + (index % 3) * 0.012, 0]} />
              <meshBasicMaterial
                ref={(material) => {
                  nodeMaterials.current[index] = material;
                }}
                color={index % 3 === 0 ? "#c4b5fd" : index % 2 === 0 ? "#67e8f9" : "#60a5fa"}
                transparent
                opacity={0.12}
                depthWrite={false}
                blending={AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        <lineSegments geometry={networkGeometry}>
          <lineBasicMaterial
            ref={networkMaterial}
            color="#67e8f9"
            transparent
            opacity={0.025}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </lineSegments>
      </group>
    </group>
  );
}

export function EvolvingJourneyCanvas() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const [intersecting, setIntersecting] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const gsap = motionEngine();
    const playhead = { progress: 0 };
    const context = gsap.context(() => {
      gsap.to(playhead, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: () => {
            progress.current = playhead.progress;
          },
        },
      });
    }, element);

    return () => context.revert();
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin: "160px 0px", threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const running = webgl === true && intersecting && pageVisible && !reducedMotion;

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-[1]" data-evolving-journey-canvas aria-hidden="true">
      <div className="pointer-events-none absolute inset-0 -z-10" data-evolving-journey-background-layer>
        <div className="sticky top-0 h-screen w-full overflow-hidden [contain:layout_paint_style]">
          {webgl === true ? (
            <Canvas
              dpr={1}
              frameloop="demand"
              camera={{ position: [0, 0, 10], fov: 58, near: 0.1, far: 40 }}
              gl={{
                alpha: true,
                antialias: true,
                depth: true,
                stencil: false,
                powerPreference: "high-performance",
              }}
              className="h-full w-full !bg-transparent"
              style={{ pointerEvents: "none", background: "transparent" }}
            >
              <ambientLight intensity={0.38} />
              <EvolvingArtifact progress={progress} reducedMotion={reducedMotion} />
              <RenderCadence running={running} />
            </Canvas>
          ) : (
            <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(165,243,252,0.16),rgba(34,211,238,0.04)_42%,transparent_72%)]" />
          )}
        </div>
      </div>
    </div>
  );
}
