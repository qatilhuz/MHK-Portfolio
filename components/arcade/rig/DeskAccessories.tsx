"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
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

function premiumCeramicMaps() {
  const size = 512;
  const albedo = document.createElement("canvas");
  albedo.width = size;
  albedo.height = size;
  const a = albedo.getContext("2d");
  if (!a) throw new Error("2d");
  const grad = a.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#111722");
  grad.addColorStop(0.42, "#202838");
  grad.addColorStop(1, "#0b0f17");
  a.fillStyle = grad;
  a.fillRect(0, 0, size, size);
  for (let i = 0; i < 2200; i += 1) {
    const alpha = 0.018 + Math.random() * 0.032;
    const tone = 150 + Math.random() * 70;
    a.fillStyle = `rgba(${tone},${tone + 6},${tone + 18},${alpha})`;
    a.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }
  a.strokeStyle = "rgba(255,255,255,0.045)";
  for (let y = 18; y < size; y += 36) {
    a.beginPath();
    a.moveTo(0, y);
    a.bezierCurveTo(size * 0.25, y - 5, size * 0.65, y + 6, size, y - 2);
    a.stroke();
  }

  const roughness = document.createElement("canvas");
  roughness.width = size;
  roughness.height = size;
  const r = roughness.getContext("2d");
  if (!r) throw new Error("2d");
  r.fillStyle = "#777";
  r.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i += 1) {
    r.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
    r.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }

  const albedoTex = new CanvasTexture(albedo);
  albedoTex.colorSpace = SRGBColorSpace;
  albedoTex.anisotropy = 8;
  albedoTex.needsUpdate = true;
  const roughTex = new CanvasTexture(roughness);
  roughTex.anisotropy = 8;
  roughTex.needsUpdate = true;
  return { albedo: albedoTex, roughness: roughTex };
}

function mugEmblemTexture() {
  const node = document.createElement("canvas");
  node.width = 512;
  node.height = 256;
  const ctx = node.getContext("2d");
  if (!ctx) throw new Error("2d");
  ctx.clearRect(0, 0, 512, 256);
  const g = ctx.createLinearGradient(60, 0, 452, 0);
  g.addColorStop(0, "rgba(34,211,238,0.92)");
  g.addColorStop(0.5, "rgba(216,180,254,0.96)");
  g.addColorStop(1, "rgba(192,132,252,0.92)");
  ctx.fillStyle = "rgba(8,12,20,0.58)";
  roundRect(ctx, 74, 58, 364, 128, 34);
  ctx.fill();
  ctx.lineWidth = 9;
  ctx.strokeStyle = g;
  roundRect(ctx, 74, 58, 364, 128, 34);
  ctx.stroke();
  ctx.fillStyle = "rgba(248,250,252,0.95)";
  ctx.font = "bold 54px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ARCADE", 256, 123);
  ctx.strokeStyle = "rgba(34,211,238,0.55)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(124, 92);
  ctx.lineTo(154, 92);
  ctx.moveTo(358, 155);
  ctx.lineTo(388, 155);
  ctx.stroke();
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function mugBodyGeometry() {
  const pts = [
    new Vector2(0.018, 0.0),
    new Vector2(0.031, 0.0025),
    new Vector2(0.038, 0.012),
    new Vector2(0.043, 0.04),
    new Vector2(0.0435, 0.071),
    new Vector2(0.041, 0.091),
    new Vector2(0.047, 0.101),
    new Vector2(0.046, 0.108),
    new Vector2(0.038, 0.112),
  ];
  const g = new LatheGeometry(pts, 144);
  g.computeVertexNormals();
  return g;
}

function mugInnerWallGeometry() {
  const pts = [
    new Vector2(0.0345, 0.018),
    new Vector2(0.0385, 0.052),
    new Vector2(0.0375, 0.094),
    new Vector2(0.033, 0.102),
  ];
  const g = new LatheGeometry(pts, 144);
  g.computeVertexNormals();
  return g;
}

function mugHandleGeometry() {
  const curve = new CatmullRomCurve3([
    new Vector3(0.038, 0.082, 0),
    new Vector3(0.078, 0.078, 0.003),
    new Vector3(0.093, 0.052, 0.002),
    new Vector3(0.08, 0.025, 0.001),
    new Vector3(0.039, 0.022, 0),
  ]);
  return new TubeGeometry(curve, 72, 0.0054, 22, false);
}

function mugSteamGeometry(offset: number) {
  const curve = new CatmullRomCurve3([
    new Vector3(offset, 0.109, 0.002),
    new Vector3(offset + 0.012, 0.132, 0.004),
    new Vector3(offset - 0.01, 0.158, 0.001),
    new Vector3(offset + 0.007, 0.184, 0.003),
  ]);
  return new TubeGeometry(curve, 44, 0.0011, 10, false);
}

function ModernCoffeeMug() {
  const body = useMemo(() => mugBodyGeometry(), []);
  const inner = useMemo(() => mugInnerWallGeometry(), []);
  const handle = useMemo(() => mugHandleGeometry(), []);
  const steam = useMemo(() => [-0.012, 0.004, 0.017].map((offset) => mugSteamGeometry(offset)), []);
  const ceramic = useMemo(() => premiumCeramicMaps(), []);
  const emblem = useMemo(() => mugEmblemTexture(), []);

  return (
    <group position={[0.88, 0.053, 0.32]} rotation={[0, -0.18, 0]} scale={1.04}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          roughnessMap={ceramic.roughness}
          color="#242c3a"
          roughness={0.32}
          metalness={0.03}
          clearcoat={0.9}
          clearcoatRoughness={0.16}
          envMapIntensity={1.55}
        />
      </mesh>
      <mesh geometry={inner}>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          color="#151a24"
          roughness={0.36}
          metalness={0.02}
          clearcoat={0.72}
          clearcoatRoughness={0.18}
          side={2}
        />
      </mesh>
      <mesh geometry={handle} castShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          roughnessMap={ceramic.roughness}
          color="#202735"
          roughness={0.3}
          metalness={0.03}
          clearcoat={0.88}
          clearcoatRoughness={0.15}
          envMapIntensity={1.55}
        />
      </mesh>
      <mesh position={[0, 0.111, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.043, 0.0044, 24, 144]} />
        <meshPhysicalMaterial color="#384050" roughness={0.18} metalness={0.04} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.8} />
      </mesh>
      <mesh position={[0, 0.115, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.044, 0.00085, 8, 144]} />
        <meshBasicMaterial color="#fff7ed" transparent opacity={0.58} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.103, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0365, 112]} />
        <meshPhysicalMaterial color="#2a140c" roughness={0.19} metalness={0} clearcoat={0.9} clearcoatRoughness={0.12} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, 0.003, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.031, 0.0042, 16, 96]} />
        <meshPhysicalMaterial color="#10151f" roughness={0.38} metalness={0.08} clearcoat={0.62} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0.059, 0.0436]}>
        <planeGeometry args={[0.072, 0.036]} />
        <meshPhysicalMaterial map={emblem} transparent opacity={0.94} roughness={0.18} metalness={0.04} clearcoat={0.86} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[-0.025, 0.096, 0.041]} rotation={[0.22, 0.12, -0.08]}>
        <boxGeometry args={[0.035, 0.002, 0.0016]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      {steam.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.14 - i * 0.025} depthWrite={false} />
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
      <group position={[-1.26, 0.05, 0.015]} rotation={[0, -0.13, 0]} scale={1.22}>
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

      <mesh position={[-0.94, 0.058, 0.16]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.235, 64]} />
        <meshBasicMaterial color="#ffdca8" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh position={[-0.93, 0.059, 0.16]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.45, 0.62, 1]}>
        <circleGeometry args={[0.18, 64]} />
        <meshBasicMaterial color="#fff1c7" transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <spotLight
        position={[-0.93, 0.36, 0.08]}
        angle={0.44}
        penumbra={0.86}
        intensity={1.9}
        distance={1.25}
        color="#ffdca8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00016}
      />
      <pointLight position={[-0.98, 0.16, 0.12]} intensity={0.34} distance={0.42} color="#ffedc2" />

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
