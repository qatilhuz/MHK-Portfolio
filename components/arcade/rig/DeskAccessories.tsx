"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CanvasTexture,
  CatmullRomCurve3,
  LatheGeometry,
  RepeatWrapping,
  TubeGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Group,
  type MeshBasicMaterial,
} from "three";
import { metalAlbedo } from "./textures";

let cachedBrassAlbedo: CanvasTexture | null = null;
let cachedPaperAlbedo: CanvasTexture | null = null;
let cachedPremiumMugMaps: ReturnType<typeof buildPremiumMugSurfaceMaps> | null = null;

function brassAlbedo() {
  if (cachedBrassAlbedo) return cachedBrassAlbedo;

  const node = document.createElement("canvas");
  node.width = 256;
  node.height = 256;
  const ctx = node.getContext("2d");
  if (!ctx) throw new Error("2d");
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "#8a6a32");
  g.addColorStop(0.45, "#e0c078");
  g.addColorStop(1, "#7a5c2a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i += 1) {
    ctx.fillStyle = `rgba(255,230,180,${0.04 + Math.random() * 0.05})`;
    ctx.fillRect(0, i * 3.2, 256, 1);
  }
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cachedBrassAlbedo = tex;
  return tex;
}

function paperAlbedo() {
  if (cachedPaperAlbedo) return cachedPaperAlbedo;
  const node = document.createElement("canvas");
  node.width = 512;
  node.height = 512;
  const ctx = node.getContext("2d");
  if (!ctx) throw new Error("2d");
  ctx.fillStyle = "#efe6d4";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(90, 140, 190, 0.28)";
  ctx.lineWidth = 1.2;
  for (let y = 48; y < 500; y += 22) {
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(492, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(196, 70, 70, 0.45)";
  ctx.beginPath();
  ctx.moveTo(56, 20);
  ctx.lineTo(56, 500);
  ctx.stroke();
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cachedPaperAlbedo = tex;
  return tex;
}

function buildPremiumMugSurfaceMaps() {
  const size = 512;

  const exterior = document.createElement("canvas");
  exterior.width = size;
  exterior.height = size;
  const e = exterior.getContext("2d");
  if (!e) throw new Error("2d");
  const bodyGradient = e.createLinearGradient(0, 0, size, size);
  bodyGradient.addColorStop(0, "#3a3d45");
  bodyGradient.addColorStop(0.36, "#252831");
  bodyGradient.addColorStop(0.72, "#181b22");
  bodyGradient.addColorStop(1, "#11141a");
  e.fillStyle = bodyGradient;
  e.fillRect(0, 0, size, size);
  for (let i = 0; i < 2400; i += 1) {
    const tone = 42 + Math.random() * 42;
    e.fillStyle = `rgba(${tone},${tone + 2},${tone + 8},${0.012 + Math.random() * 0.035})`;
    e.fillRect(Math.random() * size, Math.random() * size, 1.25, 1.25);
  }
  e.strokeStyle = "rgba(255,255,255,0.035)";
  e.lineWidth = 1;
  for (let y = 28; y < size; y += 42) {
    e.beginPath();
    e.moveTo(0, y + Math.sin(y) * 2);
    e.bezierCurveTo(size * 0.25, y - 2, size * 0.66, y + 3, size, y);
    e.stroke();
  }

  const interior = document.createElement("canvas");
  interior.width = size;
  interior.height = size;
  const i = interior.getContext("2d");
  if (!i) throw new Error("2d");
  const innerGradient = i.createRadialGradient(size * 0.44, size * 0.32, 20, size * 0.5, size * 0.52, size * 0.72);
  innerGradient.addColorStop(0, "#fff9ed");
  innerGradient.addColorStop(0.56, "#eee4d4");
  innerGradient.addColorStop(1, "#d7ccbc");
  i.fillStyle = innerGradient;
  i.fillRect(0, 0, size, size);
  for (let n = 0; n < 1100; n += 1) {
    const tone = 210 + Math.random() * 34;
    i.fillStyle = `rgba(${tone},${tone - 5},${tone - 16},${0.012 + Math.random() * 0.022})`;
    i.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const roughness = document.createElement("canvas");
  roughness.width = size;
  roughness.height = size;
  const r = roughness.getContext("2d");
  if (!r) throw new Error("2d");
  r.fillStyle = "#9a9a9a";
  r.fillRect(0, 0, size, size);
  for (let n = 0; n < 1900; n += 1) {
    const v = 120 + Math.random() * 68;
    r.fillStyle = `rgba(${v},${v},${v},${0.035 + Math.random() * 0.08})`;
    r.fillRect(Math.random() * size, Math.random() * size, 1.35, 1.35);
  }

  const bump = document.createElement("canvas");
  bump.width = size;
  bump.height = size;
  const b = bump.getContext("2d");
  if (!b) throw new Error("2d");
  b.fillStyle = "#808080";
  b.fillRect(0, 0, size, size);
  for (let n = 0; n < 2600; n += 1) {
    const v = 118 + Math.random() * 25;
    b.fillStyle = `rgba(${v},${v},${v},${0.055 + Math.random() * 0.12})`;
    b.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const exteriorTex = new CanvasTexture(exterior);
  exteriorTex.colorSpace = SRGBColorSpace;
  exteriorTex.wrapS = RepeatWrapping;
  exteriorTex.wrapT = RepeatWrapping;
  exteriorTex.repeat.set(1.18, 1.1);
  exteriorTex.anisotropy = 12;
  exteriorTex.needsUpdate = true;

  const interiorTex = new CanvasTexture(interior);
  interiorTex.colorSpace = SRGBColorSpace;
  interiorTex.wrapS = RepeatWrapping;
  interiorTex.wrapT = RepeatWrapping;
  interiorTex.repeat.set(1.05, 1.05);
  interiorTex.anisotropy = 12;
  interiorTex.needsUpdate = true;

  const roughTex = new CanvasTexture(roughness);
  roughTex.wrapS = RepeatWrapping;
  roughTex.wrapT = RepeatWrapping;
  roughTex.repeat.set(1.35, 1.35);
  roughTex.anisotropy = 12;
  roughTex.needsUpdate = true;

  const bumpTex = new CanvasTexture(bump);
  bumpTex.wrapS = RepeatWrapping;
  bumpTex.wrapT = RepeatWrapping;
  bumpTex.repeat.set(1.55, 1.55);
  bumpTex.anisotropy = 12;
  bumpTex.needsUpdate = true;

  return { exterior: exteriorTex, interior: interiorTex, roughness: roughTex, bump: bumpTex };
}

function premiumMugSurfaceMaps() {
  cachedPremiumMugMaps ??= buildPremiumMugSurfaceMaps();
  return cachedPremiumMugMaps;
}

const MATTE = { color: "#1c1e24", metalness: 0.28, roughness: 0.55, envMapIntensity: 0.85 };
const BRASS = { color: "#d4b36a", metalness: 0.86, roughness: 0.26, envMapIntensity: 1.2 };

function domeGeometry() {
  const pts = [
    new Vector2(0.007, 0),
    new Vector2(0.01, 0.01),
    new Vector2(0.016, 0.022),
    new Vector2(0.032, 0.04),
    new Vector2(0.046, 0.056),
    new Vector2(0.052, 0.07),
    new Vector2(0.05, 0.082),
    new Vector2(0.046, 0.088),
  ];
  const g = new LatheGeometry(pts, 64);
  g.computeVertexNormals();
  return g;
}

function linerGeometry() {
  const pts = [
    new Vector2(0.014, 0.02),
    new Vector2(0.03, 0.04),
    new Vector2(0.044, 0.056),
    new Vector2(0.048, 0.07),
    new Vector2(0.046, 0.08),
  ];
  const g = new LatheGeometry(pts, 56);
  g.computeVertexNormals();
  return g;
}

function premiumMugOuterShellGeometry() {
  // One continuous lathe profile: flat contact foot, soft taper, proud belly, and rolled lip.
  const pts = [
    new Vector2(0.001, 0.004),
    new Vector2(0.028, 0.004),
    new Vector2(0.0335, 0.0062),
    new Vector2(0.0376, 0.014),
    new Vector2(0.0406, 0.041),
    new Vector2(0.0432, 0.083),
    new Vector2(0.0464, 0.117),
    new Vector2(0.0502, 0.128),
    new Vector2(0.0491, 0.136),
    new Vector2(0.045, 0.141),
    new Vector2(0.0374, 0.142),
  ];
  const geo = new LatheGeometry(pts, 224);
  geo.computeVertexNormals();
  return geo;
}

function premiumMugInnerWallGeometry() {
  const pts = [
    new Vector2(0.0368, 0.134),
    new Vector2(0.0354, 0.104),
    new Vector2(0.033, 0.056),
    new Vector2(0.0292, 0.020),
    new Vector2(0.022, 0.012),
  ];
  const geo = new LatheGeometry(pts, 192);
  geo.computeVertexNormals();
  return geo;
}

function premiumMugHandleGeometry() {
  // Ergonomic C-handle: top and bottom tangent directly into the mug wall, with room for fingers.
  const curve = new CatmullRomCurve3(
    [
      new Vector3(0.044, 0.104, 0.001),
      new Vector3(0.067, 0.111, 0.004),
      new Vector3(0.091, 0.096, 0.006),
      new Vector3(0.101, 0.073, 0.006),
      new Vector3(0.094, 0.050, 0.005),
      new Vector3(0.069, 0.035, 0.003),
      new Vector3(0.044, 0.043, 0.001),
    ],
    false,
    "centripetal",
    0.36,
  );
  const geo = new TubeGeometry(curve, 150, 0.0064, 30, false);
  geo.computeVertexNormals();
  return geo;
}

function ContinuousCoffeeSmoke({ reduced = false }: { reduced?: boolean }) {
  const puffRefs = useRef<Array<Group | null>>([]);
  const matRefs = useRef<Array<MeshBasicMaterial | null>>([]);
  const puffs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        phase: i / 10,
        x: -0.016 + ((i * 7) % 9) * 0.004,
        z: -0.004 + ((i * 5) % 7) * 0.003,
        drift: i % 2 === 0 ? 1 : -1,
        size: 0.62 + ((i * 3) % 5) * 0.12,
      })),
    [],
  );

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    puffs.forEach((puff, index) => {
      const cycle = (t * 0.18 + puff.phase) % 1;
      const easeIn = Math.min(cycle * 5.5, 1);
      const fadeOut = 1 - cycle;
      const y = 0.139 + cycle * 0.14;
      const sway = Math.sin(t * 0.92 + index * 1.7) * 0.012 * cycle;
      const side = Math.cos(t * 0.62 + index * 0.9) * 0.006 * cycle;
      const scale = (0.44 + cycle * 1.38) * puff.size;
      const puffNode = puffRefs.current[index];
      if (puffNode) {
        puffNode.position.set(puff.x + sway * puff.drift, y, puff.z + side);
        puffNode.scale.set(scale * 0.72, scale, scale * 0.72);
        puffNode.rotation.z = Math.sin(t * 0.44 + index) * 0.32;
      }
      const mat = matRefs.current[index];
      if (mat) {
        mat.opacity = 0.02 + 0.18 * easeIn * fadeOut;
      }
    });
  });

  return (
    <group>
      {puffs.map((puff, index) => (
        <group
          key={`coffee-smoke-${index}`}
          ref={(node) => {
            puffRefs.current[index] = node;
          }}
          position={[puff.x, 0.139 + puff.phase * 0.14, puff.z]}
          scale={0.42 + puff.phase * 0.9}
        >
          <mesh>
            <circleGeometry args={[0.017, 28]} />
            <meshBasicMaterial
              ref={(material) => {
                matRefs.current[index] = material;
              }}
              color="#7b8490"
              transparent
              opacity={0.11}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PremiumDeskMug({ reduced = false }: { reduced?: boolean }) {
  const maps = useMemo(() => premiumMugSurfaceMaps(), []);
  const shell = useMemo(() => premiumMugOuterShellGeometry(), []);
  const innerWall = useMemo(() => premiumMugInnerWallGeometry(), []);
  const handle = useMemo(() => premiumMugHandleGeometry(), []);
  return (
    <group position={[0.88, 0.05, 0.44]} rotation={[0, -0.22, 0]} scale={1.1}>
      <mesh position={[0, 0.0022, 0]} receiveShadow>
        <cylinderGeometry args={[0.059, 0.059, 0.0044, 96]} />
        <meshStandardMaterial color="#111318" roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh geometry={shell} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={maps.exterior}
          roughnessMap={maps.roughness}
          bumpMap={maps.bump}
          bumpScale={0.0012}
          color="#2a2d35"
          metalness={0.02}
          roughness={0.54}
          clearcoat={0.42}
          clearcoatRoughness={0.34}
          ior={1.52}
          envMapIntensity={1.28}
        />
      </mesh>
      <mesh geometry={innerWall} receiveShadow>
        <meshPhysicalMaterial
          map={maps.interior}
          bumpMap={maps.bump}
          bumpScale={0.00055}
          color="#f0e5d6"
          metalness={0.01}
          roughness={0.26}
          clearcoat={0.82}
          clearcoatRoughness={0.12}
          ior={1.54}
          side={2}
          envMapIntensity={1.55}
        />
      </mesh>
      <mesh geometry={handle} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={maps.exterior}
          roughnessMap={maps.roughness}
          bumpMap={maps.bump}
          bumpScale={0.0009}
          color="#2a2d35"
          metalness={0.02}
          roughness={0.5}
          clearcoat={0.45}
          clearcoatRoughness={0.31}
          ior={1.52}
          envMapIntensity={1.32}
        />
      </mesh>
      {[
        [0.043, 0.104, 0.001, 0.020, 0.014, 0.011],
        [0.043, 0.043, 0.001, 0.019, 0.0135, 0.0105],
      ].map(([x, y, z, sx, sy, sz], idx) => (
        <mesh key={`premium-mug-lug-${idx}`} position={[x, y, z]} scale={[sx, sy, sz]} castShadow receiveShadow>
          <sphereGeometry args={[1, 42, 28]} />
          <meshPhysicalMaterial
            map={maps.exterior}
            roughnessMap={maps.roughness}
            bumpMap={maps.bump}
            bumpScale={0.0007}
            color="#2b2e36"
            metalness={0.02}
            roughness={0.48}
            clearcoat={0.42}
            clearcoatRoughness={0.32}
            envMapIntensity={1.32}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.1374, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.0428, 0.0046, 30, 192]} />
        <meshPhysicalMaterial color="#30333b" roughness={0.42} metalness={0.02} clearcoat={0.5} clearcoatRoughness={0.26} envMapIntensity={1.45} />
      </mesh>
      <mesh position={[0, 0.1332, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0355, 160]} />
        <meshPhysicalMaterial color="#2b1308" roughness={0.18} metalness={0} clearcoat={0.95} clearcoatRoughness={0.08} envMapIntensity={1.75} />
      </mesh>
      <mesh position={[0, 0.134, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.021, 0.00055, 8, 112]} />
        <meshBasicMaterial color="#8a5528" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh position={[-0.012, 0.1344, 0.012]} rotation={[-Math.PI / 2, 0, -0.28]} scale={[1.6, 0.48, 1]}>
        <circleGeometry args={[0.009, 48]} />
        <meshBasicMaterial color="#fff3df" transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.0032, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.031, 0.0032, 18, 144]} />
        <meshPhysicalMaterial color="#1d2027" roughness={0.52} metalness={0.02} clearcoat={0.32} clearcoatRoughness={0.35} envMapIntensity={1.1} />
      </mesh>
      <mesh position={[0, 0.0014, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <torusGeometry args={[0.0315, 0.0012, 10, 128]} />
        <meshStandardMaterial color="#07080b" roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[-0.026, 0.102, 0.039]} rotation={[0.12, 0.16, -0.08]}>
        <boxGeometry args={[0.039, 0.0017, 0.0012]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.24} depthWrite={false} />
      </mesh>
      <ContinuousCoffeeSmoke reduced={reduced} />
    </group>
  );
}

function PivotPin({ y }: { y: number }) {
  return (
    <>
      <mesh position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.0045, 0.0045, 0.032, 12]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      {[-0.016, 0.016].map((x) => (
        <mesh key={x} position={[x, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} />
          <meshStandardMaterial color="#b08d4a" metalness={0.9} roughness={0.22} />
        </mesh>
      ))}
    </>
  );
}

function TwinRods({ length, radius = 0.0048 }: { length: number; radius?: number }) {
  const y = length / 2;
  return (
    <>
      {[-0.011, 0.011].map((x) => (
        <mesh key={x} position={[x, y, 0]} castShadow>
          <cylinderGeometry args={[radius, radius, length, 20]} />
          <meshStandardMaterial {...MATTE} />
        </mesh>
      ))}
      <mesh position={[0, 0.006, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.024, 12]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, length - 0.006, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.024, 12]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
    </>
  );
}

/**
 * Twin-rod lamp. Shade is parented to the lamp root (not the boom) so
 * rotation.x = π aims the opening at world −Y (the desk), not the user.
 */
export function DeskAccessories({ reduced = false }: { reduced?: boolean }) {
  const dome = useMemo(() => domeGeometry(), []);
  const liner = useMemo(() => linerGeometry(), []);
  const brassMap = useMemo(() => brassAlbedo(), []);
  const graphite = useMemo(() => metalAlbedo(), []);
  const paper = useMemo(() => paperAlbedo(), []);

  return (
    <group>
      <group position={[-1.26, 0.05, 0.205]} rotation={[0, -0.13, 0]} scale={1.22}>
        <mesh position={[0, 0.007, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.058, 0.014, 40]} />
          <meshStandardMaterial {...MATTE} />
        </mesh>
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.018, 0.02, 0.01, 20]} />
          <meshStandardMaterial {...BRASS} map={brassMap} />
        </mesh>

        <group position={[0, 0.02, 0]}>
          <TwinRods length={0.16} />
          <mesh position={[0, 0.162, 0]}>
            <sphereGeometry args={[0.013, 20, 16]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
          <PivotPin y={0.162} />

          <group position={[0, 0.162, 0]} rotation={[0.12, 0, -1.05]}>
            <TwinRods length={0.14} radius={0.0044} />
            <mesh position={[0, 0.142, 0]}>
              <sphereGeometry args={[0.012, 18, 14]} />
              <meshStandardMaterial {...BRASS} />
            </mesh>
            <PivotPin y={0.142} />
          </group>
        </group>

        <group position={[0.123, 0.252, 0.008]} rotation={[Math.PI, 0, -0.68]}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.006, 0.007, 0.02, 18]} />
            <meshStandardMaterial {...BRASS} map={brassMap} />
          </mesh>
          <mesh geometry={dome} position={[0, 0.022, 0]} castShadow>
            <meshStandardMaterial {...MATTE} map={graphite} />
          </mesh>
          <mesh geometry={liner} position={[0, 0.022, 0]}>
            <meshStandardMaterial
              color="#e8dcc0"
              emissive="#f3e7c9"
              emissiveIntensity={0.55}
              roughness={0.45}
              metalness={0.08}
              side={2}
            />
          </mesh>
          <mesh position={[0, 0.054, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.028, 32]} />
            <meshStandardMaterial
              color="#fff1c7"
              emissive="#ffd79a"
              emissiveIntensity={1.4}
              transparent
              opacity={0.78}
              roughness={0.18}
            />
          </mesh>
          <spotLight
            position={[0, 0.06, 0]}
            angle={0.38}
            penumbra={0.9}
            intensity={2.15}
            distance={1.65}
            color="#ffdca8"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.00018}
          />
        </group>
      </group>

      <mesh position={[-0.94, 0.058, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.235, 64]} />
        <meshBasicMaterial color="#ffdca8" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh position={[-0.93, 0.059, 0.35]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.45, 0.62, 1]}>
        <circleGeometry args={[0.18, 64]} />
        <meshBasicMaterial color="#fff1c7" transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <spotLight
        position={[-0.93, 0.36, 0.27]}
        angle={0.44}
        penumbra={0.86}
        intensity={1.9}
        distance={1.25}
        color="#ffdca8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00016}
      />
      <pointLight position={[-0.98, 0.16, 0.31]} intensity={0.34} distance={0.42} color="#ffedc2" />

      <group position={[-0.56, 0.05, 0.36]} rotation={[0, 0.12, 0]}>
        <mesh position={[0, 0.004, 0]} castShadow>
          <boxGeometry args={[0.11, 0.008, 0.14]} />
          <meshStandardMaterial color="#d8c9a8" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.0084, 0.002]} rotation={[-Math.PI / 2, 0, 0.03]} castShadow>
          <planeGeometry args={[0.104, 0.132]} />
          <meshStandardMaterial map={paper} roughness={0.78} />
        </mesh>
        <mesh position={[0, 0.009, -0.058]}>
          <boxGeometry args={[0.11, 0.003, 0.018]} />
          <meshStandardMaterial color="#7a3030" roughness={0.62} />
        </mesh>
      </group>

      <group position={[-0.48, 0.057, 0.38]} rotation={[0, 0.42, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.1, 6]} />
          <meshStandardMaterial color="#c9a227" roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.052, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.012, 6]} />
          <meshStandardMaterial color="#1a1c20" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <coneGeometry args={[0.004, 0.014, 8]} />
          <meshStandardMaterial color="#e8dcc8" roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.066, 0]}>
          <coneGeometry args={[0.0016, 0.006, 6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.052, 0]}>
          <cylinderGeometry args={[0.0042, 0.0042, 0.012, 12]} />
          <meshStandardMaterial color="#c0c6ce" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.01, 12]} />
          <meshStandardMaterial color="#d48a8a" roughness={0.7} />
        </mesh>
      </group>

      <PremiumDeskMug reduced={reduced} />
    </group>
  );
}
