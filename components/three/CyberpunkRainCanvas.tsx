"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  type ShaderMaterial,
} from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const TARGET_FRAME_MS = 1000 / 60;
const VERTICAL_SPAN = 2.7;

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
  uniform vec3 uDeepColor;
  uniform vec3 uNearColor;
  uniform vec3 uHeadColor;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vDepth;
  varying float vFocus;
  varying float vGlyph;
  varying float vHead;

  float box(vec2 point, vec2 halfSize) {
    vec2 edge = step(abs(point), halfSize);
    return edge.x * edge.y;
  }

  void main() {
    vec2 point = gl_PointCoord - 0.5;

    float topBar = box(point - vec2(0.0, 0.27), vec2(0.3, 0.055));
    float midBar = box(point, vec2(0.27, 0.05));
    float lowBar = box(point + vec2(0.0, 0.27), vec2(0.3, 0.055));
    float leftStem = box(point + vec2(0.22, 0.0), vec2(0.05, 0.31));
    float rightStem = box(point - vec2(0.22, 0.0), vec2(0.05, 0.31));
    float centerStem = box(point, vec2(0.045, 0.32));

    float glyphA = max(max(topBar, midBar), max(leftStem, rightStem));
    float glyphB = max(max(topBar, lowBar), centerStem);
    float glyphC = max(max(midBar, lowBar), max(leftStem, centerStem));

    float chooseA = 1.0 - step(0.333, vGlyph);
    float chooseB = step(0.333, vGlyph) * (1.0 - step(0.666, vGlyph));
    float chooseC = step(0.666, vGlyph);
    float glyph = glyphA * chooseA + glyphB * chooseB + glyphC * chooseC;

    float radialGlow = exp(-dot(point, point) * mix(8.0, 18.0, vFocus));
    float verticalTrail = exp(-abs(point.x) * 18.0) * (1.0 - smoothstep(-0.1, 0.5, point.y));
    float core = glyph * mix(0.38, 1.0, vFocus);
    float alpha = (core + radialGlow * 0.22 + verticalTrail * 0.08) * vAlpha * uOpacity;

    if (alpha < 0.012) discard;

    vec3 color = mix(uDeepColor, uNearColor, smoothstep(0.08, 0.9, vDepth));
    color = mix(color, uHeadColor, vHead * 0.62);
    color *= 0.72 + vFocus * 0.45;

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
  const columns = reducedMotion ? 54 : 78;
  const glyphsPerColumn = reducedMotion ? 10 : 14;
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
    const spacing = 0.043 + random() * 0.022;

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
      glyph[index] = random();
      size[index] = 7 + random() * 4.5;
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
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uOpacity: { value: 0.78 },
      uDeepColor: { value: new Color("#2563eb") },
      uNearColor: { value: new Color("#5eead4") },
      uHeadColor: { value: new Color("#ecfeff") },
    }),
    [reducedMotion],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

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
  "01A7F10D3E01",
  "10110B9C0101",
  "7F001011D2A0",
  "0110C8E10110",
  "A1D01001F70B",
  "001101E4A110",
  "C90110F010D1",
  "10E7A001101F",
  "F0101D8B1100",
  "01B1100E7A10",
];

function RainFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-35" aria-hidden="true">
      {fallbackStreams.map((stream, index) => (
        <span
          key={stream}
          className="absolute top-[-4rem] font-mono text-[10px] leading-[1.6] tracking-[0.3em] text-cyan-300/55 [text-orientation:upright] [writing-mode:vertical-rl]"
          style={{
            left: `${5 + index * 10}%`,
            filter: `blur(${index % 3 === 0 ? 1 : 0}px)`,
            opacity: 0.35 + (index % 4) * 0.12,
            transform: `translateY(${(index % 5) * 15}vh)`,
          }}
        >
          {stream.repeat(8)}
        </span>
      ))}
    </div>
  );
}

export function CyberpunkRainCanvas() {
  const root = useRef<HTMLDivElement>(null);
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const [intersecting, setIntersecting] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

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
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(8,145,178,0.09),transparent_58%),linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.05)_45%,rgba(2,6,23,0.52))]" />
      {webgl === true ? (
        <Canvas
          dpr={1}
          frameloop="demand"
          camera={{ position: [0, 0, 10], fov: 58, near: 0.1, far: 40 }}
          gl={{
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "high-performance",
          }}
          className="h-full w-full !bg-transparent opacity-80"
          style={{ pointerEvents: "none", background: "transparent" }}
        >
          <DigitalRain running={running} reducedMotion={reducedMotion} />
          <RenderCadence running={running} />
        </Canvas>
      ) : (
        <RainFallback />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(9,9,11,0.38)_78%,rgba(9,9,11,0.72))]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-background/80" />
    </div>
  );
}
