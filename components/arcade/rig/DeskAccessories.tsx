"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import {
  CanvasTexture,
  CatmullRomCurve3,
  LatheGeometry,
  RepeatWrapping,
  TubeGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import { metalAlbedo } from "./textures";

function brassAlbedo() {
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
  return tex;
}

function paperAlbedo() {
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
  return tex;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function smartMugCeramicMaps() {
  const size = 768;
  const albedo = document.createElement("canvas");
  albedo.width = size;
  albedo.height = size;
  const ctx = albedo.getContext("2d");
  if (!ctx) throw new Error("2d");
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#fffaf0");
  grad.addColorStop(0.34, "#e8e1d2");
  grad.addColorStop(0.68, "#f9f5eb");
  grad.addColorStop(1, "#c9c1b2");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 3400; i += 1) {
    const tone = 190 + Math.random() * 52;
    ctx.fillStyle = `rgba(${tone},${tone - 4},${tone - 14},${0.018 + Math.random() * 0.038})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1.2, 1.2);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let y = 22; y < size; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.28, y - 5, size * 0.68, y + 5, size, y - 2);
    ctx.stroke();
  }

  const roughness = document.createElement("canvas");
  roughness.width = size;
  roughness.height = size;
  const rough = roughness.getContext("2d");
  if (!rough) throw new Error("2d");
  rough.fillStyle = "#9a9a9a";
  rough.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i += 1) {
    rough.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.065})`;
    rough.fillRect(Math.random() * size, Math.random() * size, 1.8, 1.8);
  }
  rough.fillStyle = "rgba(30,30,30,0.08)";
  for (let y = 0; y < size; y += 57) rough.fillRect(0, y, size, 1);

  const bump = document.createElement("canvas");
  bump.width = size;
  bump.height = size;
  const bumpCtx = bump.getContext("2d");
  if (!bumpCtx) throw new Error("2d");
  bumpCtx.fillStyle = "#808080";
  bumpCtx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5200; i += 1) {
    const tone = 118 + Math.random() * 30;
    bumpCtx.fillStyle = `rgba(${tone},${tone},${tone},${0.1 + Math.random() * 0.16})`;
    bumpCtx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const albedoTex = new CanvasTexture(albedo);
  albedoTex.colorSpace = SRGBColorSpace;
  albedoTex.wrapS = RepeatWrapping;
  albedoTex.wrapT = RepeatWrapping;
  albedoTex.repeat.set(1.3, 1.3);
  albedoTex.anisotropy = 12;
  albedoTex.needsUpdate = true;

  const roughTex = new CanvasTexture(roughness);
  roughTex.wrapS = RepeatWrapping;
  roughTex.wrapT = RepeatWrapping;
  roughTex.repeat.set(1.3, 1.3);
  roughTex.anisotropy = 12;
  roughTex.needsUpdate = true;

  const bumpTex = new CanvasTexture(bump);
  bumpTex.wrapS = RepeatWrapping;
  bumpTex.wrapT = RepeatWrapping;
  bumpTex.repeat.set(1.5, 1.5);
  bumpTex.anisotropy = 12;
  bumpTex.needsUpdate = true;

  return { albedo: albedoTex, roughness: roughTex, bump: bumpTex };
}

function smartMugPanelTexture() {
  const node = document.createElement("canvas");
  node.width = 512;
  node.height = 192;
  const ctx = node.getContext("2d");
  if (!ctx) throw new Error("2d");
  ctx.clearRect(0, 0, 512, 192);
  const g = ctx.createLinearGradient(0, 0, 512, 192);
  g.addColorStop(0, "rgba(7,10,17,0.98)");
  g.addColorStop(0.55, "rgba(20,27,39,0.98)");
  g.addColorStop(1, "rgba(4,7,12,0.98)");
  ctx.fillStyle = g;
  drawRoundedRect(ctx, 54, 36, 404, 120, 42);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 6;
  drawRoundedRect(ctx, 54, 36, 404, 120, 42);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,248,238,0.95)";
  ctx.font = "bold 42px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MHK", 254, 89);
  ctx.fillStyle = "rgba(34,211,238,0.92)";
  ctx.beginPath();
  ctx.arc(394, 93, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(192,132,252,0.82)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(132, 128);
  ctx.lineTo(318, 128);
  ctx.stroke();
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 12;
  tex.needsUpdate = true;
  return tex;
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

function smartMugBodyGeometry() {
  const pts = [
    new Vector2(0.001, 0.0),
    new Vector2(0.033, 0.0),
    new Vector2(0.043, 0.004),
    new Vector2(0.0475, 0.018),
    new Vector2(0.0505, 0.058),
    new Vector2(0.0488, 0.096),
    new Vector2(0.0455, 0.114),
    new Vector2(0.0525, 0.122),
    new Vector2(0.056, 0.131),
    new Vector2(0.0505, 0.139),
    new Vector2(0.0365, 0.1415),
  ];
  const geo = new LatheGeometry(pts, 256);
  geo.computeVertexNormals();
  return geo;
}

function smartMugInnerGeometry() {
  const pts = [
    new Vector2(0.031, 0.024),
    new Vector2(0.0365, 0.056),
    new Vector2(0.0384, 0.095),
    new Vector2(0.036, 0.122),
    new Vector2(0.0305, 0.136),
  ];
  const geo = new LatheGeometry(pts, 256);
  geo.computeVertexNormals();
  return geo;
}

function smartMugHandleGeometry() {
  const curve = new CatmullRomCurve3(
    [
      new Vector3(0.047, 0.096, 0.002),
      new Vector3(0.078, 0.102, 0.012),
      new Vector3(0.112, 0.078, 0.012),
      new Vector3(0.118, 0.056, 0.007),
      new Vector3(0.101, 0.028, 0.004),
      new Vector3(0.048, 0.034, 0.001),
    ],
    false,
    "centripetal",
    0.44,
  );
  const geo = new TubeGeometry(curve, 160, 0.0063, 34, false);
  geo.computeVertexNormals();
  return geo;
}

function smartMugSteamGeometry(offset: number, phase: number) {
  const curve = new CatmullRomCurve3([
    new Vector3(offset, 0.132, 0.004),
    new Vector3(offset + 0.011, 0.158, 0.006 + phase),
    new Vector3(offset - 0.009, 0.188, 0.001),
    new Vector3(offset + 0.006, 0.218, 0.006 - phase),
  ]);
  const geo = new TubeGeometry(curve, 56, 0.001, 12, false);
  geo.computeVertexNormals();
  return geo;
}

function ModernCoffeeMug() {
  const ceramic = useMemo(() => smartMugCeramicMaps(), []);
  const panel = useMemo(() => smartMugPanelTexture(), []);
  const body = useMemo(() => smartMugBodyGeometry(), []);
  const inner = useMemo(() => smartMugInnerGeometry(), []);
  const handle = useMemo(() => smartMugHandleGeometry(), []);
  const steam = useMemo(
    () => [
      smartMugSteamGeometry(-0.016, 0.002),
      smartMugSteamGeometry(0.002, -0.001),
      smartMugSteamGeometry(0.018, 0.003),
    ],
    [],
  );

  return (
    <group position={[0.88, 0.052, 0.32]} rotation={[0, -0.18, 0]} scale={1.08}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          roughnessMap={ceramic.roughness}
          bumpMap={ceramic.bump}
          bumpScale={0.00135}
          color="#f2ecdf"
          metalness={0.015}
          roughness={0.31}
          clearcoat={1}
          clearcoatRoughness={0.085}
          ior={1.56}
          envMapIntensity={1.95}
        />
      </mesh>
      <mesh geometry={inner} receiveShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          bumpMap={ceramic.bump}
          bumpScale={0.0008}
          color="#d8d0c1"
          metalness={0.01}
          roughness={0.36}
          clearcoat={0.72}
          clearcoatRoughness={0.14}
          side={2}
          envMapIntensity={1.3}
        />
      </mesh>
      <mesh geometry={handle} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          roughnessMap={ceramic.roughness}
          bumpMap={ceramic.bump}
          bumpScale={0.001}
          color="#f4eee2"
          metalness={0.015}
          roughness={0.29}
          clearcoat={1}
          clearcoatRoughness={0.075}
          ior={1.56}
          envMapIntensity={2}
        />
      </mesh>
      {[
        [0.047, 0.094, 0.0025, 0.0185, 0.014, 0.012],
        [0.047, 0.036, 0.0012, 0.017, 0.013, 0.0105],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={`smart-handle-lug-${i}`} position={[x, y, z]} scale={[sx, sy, sz]} castShadow receiveShadow>
          <sphereGeometry args={[1, 44, 28]} />
          <meshPhysicalMaterial
            map={ceramic.albedo}
            roughnessMap={ceramic.roughness}
            bumpMap={ceramic.bump}
            bumpScale={0.0008}
            color="#f2eadc"
            metalness={0.015}
            roughness={0.28}
            clearcoat={1}
            clearcoatRoughness={0.075}
            envMapIntensity={2}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.1315, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0475, 0.0048, 34, 256]} />
        <meshPhysicalMaterial color="#fff8eb" roughness={0.16} metalness={0.01} clearcoat={1} clearcoatRoughness={0.045} ior={1.58} envMapIntensity={2.15} />
      </mesh>
      <mesh position={[0, 0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0372, 0.002, 20, 192]} />
        <meshPhysicalMaterial color="#d3cab9" roughness={0.3} metalness={0.01} clearcoat={0.65} clearcoatRoughness={0.13} />
      </mesh>
      <mesh position={[0, 0.1226, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0362, 192]} />
        <meshPhysicalMaterial color="#2a1408" roughness={0.1} metalness={0} clearcoat={1} clearcoatRoughness={0.045} envMapIntensity={1.8} />
      </mesh>
      <mesh position={[0, 0.1234, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.029, 0.0007, 10, 160]} />
        <meshBasicMaterial color="#d6a56b" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[-0.012, 0.124, 0.014]} rotation={[-Math.PI / 2, 0, -0.3]} scale={[1.55, 0.42, 1]}>
        <circleGeometry args={[0.0115, 56]} />
        <meshBasicMaterial color="#fff7ed" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.004, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.0345, 0.0046, 24, 176]} />
        <meshPhysicalMaterial color="#202632" roughness={0.24} metalness={0.68} clearcoat={0.68} clearcoatRoughness={0.11} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[0, 0.0125, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.044, 0.0012, 12, 176]} />
        <meshStandardMaterial color="#c7bdab" metalness={0.26} roughness={0.2} />
      </mesh>
      <RoundedBox args={[0.061, 0.028, 0.006]} radius={0.011} smoothness={6} position={[0, 0.067, 0.0512]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#090d14" roughness={0.18} metalness={0.3} clearcoat={1} clearcoatRoughness={0.055} envMapIntensity={1.8} />
      </RoundedBox>
      <mesh position={[0, 0.067, 0.055]}>
        <planeGeometry args={[0.056, 0.021]} />
        <meshPhysicalMaterial map={panel} transparent opacity={0.96} roughness={0.11} metalness={0.04} clearcoat={1} clearcoatRoughness={0.045} envMapIntensity={1.9} />
      </mesh>
      <mesh position={[-0.022, 0.105, 0.046]} rotation={[0.18, 0.12, -0.12]}>
        <boxGeometry args={[0.038, 0.0021, 0.0014]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.48} depthWrite={false} />
      </mesh>
      <mesh position={[0.019, 0.018, 0.043]} rotation={[0.1, 0, 0.08]}>
        <boxGeometry args={[0.026, 0.0015, 0.0012]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {steam.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#fffaf0" transparent opacity={0.13 - i * 0.024} depthWrite={false} />
        </mesh>
      ))}
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
export function DeskAccessories() {
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

      <mesh position={[0.72, 0.053, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.038, 24]} />
        <meshStandardMaterial color="#2a2d35" roughness={0.75} />
      </mesh>

      <ModernCoffeeMug />
    </group>
  );
}
