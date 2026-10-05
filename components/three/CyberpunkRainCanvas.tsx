"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  LinearFilter,
  type ShaderMaterial,
} from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { visualConfig } from "@/data/visualConfig";
import { motionEngine } from "@/lib/motion/engine";
import { ScrollJourneyObject } from "./ScrollJourneyObject";

const TARGET_FRAME_MS = 1000 / 60;
const VERTICAL_SPAN = 2.7;

function createBinaryGlyphAtlas() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the binary glyph atlas.");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '800 176px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#ffffff";
  context.lineWidth = 3;

  (["0", "1"] as const).forEach((digit, index) => {
    const x = 128 + index * 256;

    context.globalAlpha = 0.86;
    context.shadowColor = "rgba(207, 250, 254, 0.98)";
    context.shadowBlur = 30;
    context.fillText(digit, x, 133);

    context.globalAlpha = 1;
    context.shadowColor = "rgba(103, 232, 249, 0.9)";
    context.shadowBlur = 9;
    context.strokeText(digit, x, 133);
    context.fillText(digit, x, 133);
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform float uMotion;

  attribute float aSpeed;
  attribute float aPhase;
  attribute float aTrail;
  attribute float aGlyph;
  attribute float aSize;
  attribute float aDepth;
  attribute float aDrift;

  varying float vAlpha;
  varying float vDepth;
  varying float vFocus;
  varying float vGlyph;
  varying float vHead;

  void main() {
    const float tanHalfFov = 0.554309;

    float travel = uTime * aSpeed * uMotion;
    float streamY = mod(position.y - travel + aPhase + 1.35, ${VERTICAL_SPAN.toFixed(1)}) - 1.35;
    float depthParallax = mix(0.35, 1.0, aDepth);
    float drift = sin(uTime * (0.14 + aSpeed * 0.12) + position.z * 1.7 + aPhase * 3.0);
    float streamX = position.x + drift * aDrift * depthParallax * uMotion;

    vec4 viewPosition = modelViewMatrix * vec4(0.0, 0.0, position.z, 1.0);
    float viewDepth = max(0.1, -viewPosition.z);

    // Build the streams in view space so every depth layer covers the full tall canvas.
    // Perspective is retained through point size, luminance, focus, and drift parallax.
    viewPosition.x = streamX * viewDepth * tanHalfFov * uAspect;
    viewPosition.y = streamY * viewDepth * tanHalfFov;

    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * mix(0.58, 1.42, aDepth);

    float focusBand = 1.0 - min(1.0, abs(aDepth - 0.62) * 2.15);
    vFocus = mix(0.28, 1.0, focusBand);
    vAlpha = aTrail * mix(0.2, 0.88, aDepth);
    vDepth = aDepth;
    vGlyph = aGlyph;
    vHead = smoothstep(0.82, 1.0, aTrail);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uGlyphAtlas;
  uniform vec3 uDeepColor;
  uniform vec3 uNearColor;
  uniform vec3 uHeadColor;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vDepth;
  varying float vFocus;
  varying float vGlyph;
  varying float vHead;

  void main() {
    float binaryIndex = step(0.5, vGlyph);
    vec2 glyphUv = vec2(
      gl_PointCoord.x * 0.5 + binaryIndex * 0.5,
      1.0 - gl_PointCoord.y
    );
    float glyphAlpha = texture2D(uGlyphAtlas, glyphUv).a;
    float crispCore = smoothstep(0.58, 0.96, glyphAlpha);
    float neonHalo = smoothstep(0.008, 0.58, glyphAlpha) * (1.0 - crispCore * 0.45);
    float signal = crispCore * 1.18 + glyphAlpha * 0.72 + neonHalo * 0.62;
    float alpha = signal * vAlpha * uOpacity;

    if (alpha < 0.008) discard;

    vec3 color = mix(uDeepColor, uNearColor, smoothstep(0.04, 0.86, vDepth));
    color = mix(color, uHeadColor, vHead * 0.84);
    color *= 1.05 + vFocus * 0.72 + vHead * 1.55;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface RainData {
  positions: Float32Array;
  speed: Float32Array;
  phase: Float32Array;
  trail: Float32Array;
  glyph: Float32Array;
  size: Float32Array;
  depth: Float32Array;
  drift: Float32Array;
}

function createRainData(reducedMotion: boolean): RainData {
  const columns = reducedMotion ? 84 : 144;
  const glyphsPerColumn = reducedMotion ? 16 : 22;
  const count = columns * glyphsPerColumn;
  const positions = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  const phase = new Float32Array(count);
  const trail = new Float32Array(count);
  const glyph = new Float32Array(count);
  const size = new Float32Array(count);
  const depth = new Float32Array(count);
  const drift = new Float32Array(count);

  let seed = 0xc7b3f21;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let column = 0; column < columns; column += 1) {
    const columnX = -1.08 + ((column + random() * 0.8) / columns) * 2.16;
    const columnDepth = Math.pow(random(), 0.72);
    const columnZ = -7.5 + columnDepth * 10.5;
    const columnSpeed = 0.11 + random() * 0.22;
    const columnPhase = random() * VERTICAL_SPAN;
    const columnDrift = 0.005 + random() * 0.018;
    const spacing = 0.03 + random() * 0.021;

    for (let row = 0; row < glyphsPerColumn; row += 1) {
      const index = column * glyphsPerColumn + row;
      const positionIndex = index * 3;
      const trailStrength = Math.pow(1 - row / glyphsPerColumn, 1.55);

      positions[positionIndex] = columnX;
      positions[positionIndex + 1] = -row * spacing;
      positions[positionIndex + 2] = columnZ;
      speed[index] = columnSpeed;
      phase[index] = columnPhase;
      trail[index] = 0.12 + trailStrength * 0.88;
      glyph[index] = random() < 0.5 ? 0 : 1;
      size[index] = 13 + random() * 7;
      depth[index] = columnDepth;
      drift[index] = columnDrift;
    }
  }

  return { positions, speed, phase, trail, glyph, size, depth, drift };
}

function createGeometry(data: RainData) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(data.positions, 3));
  geometry.setAttribute("aSpeed", new BufferAttribute(data.speed, 1));
  geometry.setAttribute("aPhase", new BufferAttribute(data.phase, 1));
  geometry.setAttribute("aTrail", new BufferAttribute(data.trail, 1));
  geometry.setAttribute("aGlyph", new BufferAttribute(data.glyph, 1));
  geometry.setAttribute("aSize", new BufferAttribute(data.size, 1));
  geometry.setAttribute("aDepth", new BufferAttribute(data.depth, 1));
  geometry.setAttribute("aDrift", new BufferAttribute(data.drift, 1));
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

function DigitalRain({ running, reducedMotion }: { running: boolean; reducedMotion: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const data = useMemo(() => createRainData(reducedMotion), [reducedMotion]);
  const geometry = useMemo(() => createGeometry(data), [data]);
  const glyphAtlas = useMemo(() => createBinaryGlyphAtlas(), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uOpacity: { value: 0.12 },
      uGlyphAtlas: { value: glyphAtlas },
      uDeepColor: { value: new Color("#2563eb") },
      uNearColor: { value: new Color("#22d3ee") },
      uHeadColor: { value: new Color("#f0fdff") },
    }),
    [glyphAtlas, reducedMotion],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => glyphAtlas.dispose(), [glyphAtlas]);

  useFrame((state, delta) => {
    if (!material.current) return;
    material.current.uniforms.uAspect.value = state.size.width / Math.max(1, state.size.height);
    if (running) {
      material.current.uniforms.uTime.value += Math.min(delta, 1 / 30);
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

const fallbackStreams = [
  "0101101001011010",
  "1011010010110101",
  "0010110100101101",
  "1101001011010010",
  "0110101101101001",
  "1001011010010110",
  "0100110101001101",
  "1011001010110010",
  "0011010110011010",
  "1100101001100101",
  "0110010110100110",
  "1001101001011001",
  "0101011011010101",
  "1010100100101010",
  "0011001011001101",
  "1100110100110010",
];

function RainFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.33]" aria-hidden="true">
      {fallbackStreams.map((stream, index) => (
        <span
          key={stream}
          className="absolute top-[-4rem] font-mono text-[11px] leading-[1.45] tracking-[0.22em] text-cyan-200/80 [text-orientation:upright] [writing-mode:vertical-rl]"
          style={{
            left: `${3 + index * 6.25}%`,
            filter: `blur(${index % 5 === 0 ? 1 : 0}px)`,
            opacity: 0.48 + (index % 4) * 0.13,
            textShadow: "0 0 6px #67e8f9, 0 0 18px rgba(34,211,238,0.85)",
            transform: `translateY(${(index % 5) * 15}vh)`,
          }}
        >
          {stream.repeat(10)}
        </span>
      ))}
    </div>
  );
}

export function CyberpunkRainCanvas() {
  const root = useRef<HTMLDivElement>(null);
  const journeyProgress = useRef(0);
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const [intersecting, setIntersecting] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    if (!visualConfig.enableLegacyScrollObject) return;

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
            journeyProgress.current = playhead.progress;
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
    <div
      ref={root}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [contain:layout_paint_style]"
      data-scroll-journey-canvas
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(8,145,178,0.16),transparent_62%),linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0.02)_45%,rgba(2,6,23,0.38))]" />
      {webgl === true ? (
        <Canvas
          dpr={1}
          frameloop="demand"
          camera={{ position: [0, 0, 10], fov: 58, near: 0.1, far: 40 }}
          gl={{
            alpha: true,
            antialias: false,
            depth: true,
            stencil: false,
            powerPreference: "high-performance",
          }}
          className="h-full w-full !bg-transparent opacity-95"
          style={{ pointerEvents: "none", background: "transparent" }}
        >
          <ambientLight intensity={0.42} />
          <DigitalRain running={running} reducedMotion={reducedMotion} />
          {visualConfig.enableLegacyScrollObject ? (
            <ScrollJourneyObject progress={journeyProgress} reducedMotion={reducedMotion} />
          ) : null}
          <RenderCadence running={running} />
        </Canvas>
      ) : (
        <RainFallback />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(9,9,11,0.26)_80%,rgba(9,9,11,0.58))]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-transparent to-background/65" />
    </div>
  );
}
