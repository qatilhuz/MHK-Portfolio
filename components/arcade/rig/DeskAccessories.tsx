"use client";

import { useMemo } from "react";
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

function classicCeramicMaps() {
  const size = 512;
  const albedo = document.createElement("canvas");
  albedo.width = size;
  albedo.height = size;
  const ctx = albedo.getContext("2d");
  if (!ctx) throw new Error("2d");
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.38, "#f5f0e7");
  grad.addColorStop(0.7, "#fffaf0");
  grad.addColorStop(1, "#ded6c7");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1800; i += 1) {
    const tone = 210 + Math.random() * 38;
    ctx.fillStyle = `rgba(${tone},${tone - 3},${tone - 11},${0.014 + Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const roughness = document.createElement("canvas");
  roughness.width = size;
  roughness.height = size;
  const r = roughness.getContext("2d");
  if (!r) throw new Error("2d");
  r.fillStyle = "#858585";
  r.fillRect(0, 0, size, size);
  for (let i = 0; i < 1500; i += 1) {
    r.fillStyle = `rgba(255,255,255,${Math.random() * 0.055})`;
    r.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }

  const bump = document.createElement("canvas");
  bump.width = size;
  bump.height = size;
  const b = bump.getContext("2d");
  if (!b) throw new Error("2d");
  b.fillStyle = "#808080";
  b.fillRect(0, 0, size, size);
  for (let i = 0; i < 2200; i += 1) {
    const tone = 122 + Math.random() * 18;
    b.fillStyle = `rgba(${tone},${tone},${tone},${0.08 + Math.random() * 0.12})`;
    b.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const albedoTex = new CanvasTexture(albedo);
  albedoTex.colorSpace = SRGBColorSpace;
  albedoTex.wrapS = RepeatWrapping;
  albedoTex.wrapT = RepeatWrapping;
  albedoTex.repeat.set(1.25, 1.25);
  albedoTex.anisotropy = 12;
  albedoTex.needsUpdate = true;

  const roughTex = new CanvasTexture(roughness);
  roughTex.wrapS = RepeatWrapping;
  roughTex.wrapT = RepeatWrapping;
  roughTex.repeat.set(1.25, 1.25);
  roughTex.anisotropy = 12;
  roughTex.needsUpdate = true;

  const bumpTex = new CanvasTexture(bump);
  bumpTex.wrapS = RepeatWrapping;
  bumpTex.wrapT = RepeatWrapping;
  bumpTex.repeat.set(1.45, 1.45);
  bumpTex.anisotropy = 12;
  bumpTex.needsUpdate = true;

  return { albedo: albedoTex, roughness: roughTex, bump: bumpTex };
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

function classicMugBodyGeometry() {
  const pts = [
    new Vector2(0.001, 0.0),
    new Vector2(0.031, 0.0),
    new Vector2(0.038, 0.003),
    new Vector2(0.0415, 0.011),
    new Vector2(0.043, 0.045),
    new Vector2(0.0436, 0.091),
    new Vector2(0.0445, 0.109),
    new Vector2(0.049, 0.116),
    new Vector2(0.0482, 0.123),
    new Vector2(0.041, 0.127),
    new Vector2(0.033, 0.1275),
  ];
  const geo = new LatheGeometry(pts, 192);
  geo.computeVertexNormals();
  return geo;
}

function classicMugInnerGeometry() {
  const pts = [
    new Vector2(0.031, 0.022),
    new Vector2(0.0355, 0.052),
    new Vector2(0.0368, 0.091),
    new Vector2(0.0372, 0.112),
    new Vector2(0.033, 0.122),
  ];
  const geo = new LatheGeometry(pts, 192);
  geo.computeVertexNormals();
  return geo;
}

function classicMugHandleGeometry() {
  const curve = new CatmullRomCurve3(
    [
      new Vector3(0.0415, 0.091, 0.001),
      new Vector3(0.073, 0.092, 0.006),
      new Vector3(0.096, 0.07, 0.006),
      new Vector3(0.096, 0.052, 0.004),
      new Vector3(0.074, 0.031, 0.003),
      new Vector3(0.0415, 0.035, 0.001),
    ],
    false,
    "centripetal",
    0.42,
  );
  const geo = new TubeGeometry(curve, 132, 0.0057, 28, false);
  geo.computeVertexNormals();
  return geo;
}

function mugSteamGeometry(offset: number) {
  const curve = new CatmullRomCurve3([
    new Vector3(offset, 0.121, 0.002),
    new Vector3(offset + 0.009, 0.145, 0.004),
    new Vector3(offset - 0.008, 0.17, 0.001),
    new Vector3(offset + 0.006, 0.195, 0.003),
  ]);
  const geo = new TubeGeometry(curve, 44, 0.001, 10, false);
  geo.computeVertexNormals();
  return geo;
}

function ModernCoffeeMug() {
  const ceramic = useMemo(() => classicCeramicMaps(), []);
  const body = useMemo(() => classicMugBodyGeometry(), []);
  const inner = useMemo(() => classicMugInnerGeometry(), []);
  const handle = useMemo(() => classicMugHandleGeometry(), []);
  const steam = useMemo(() => [-0.014, 0.002, 0.016].map((offset) => mugSteamGeometry(offset)), []);

  return (
    <group position={[0.88, 0.052, 0.32]} rotation={[0, -0.18, 0]} scale={1.08}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          roughnessMap={ceramic.roughness}
          bumpMap={ceramic.bump}
          bumpScale={0.001}
          color="#f7f2e8"
          metalness={0.01}
          roughness={0.24}
          clearcoat={1}
          clearcoatRoughness={0.07}
          ior={1.55}
          envMapIntensity={1.85}
        />
      </mesh>
      <mesh geometry={inner} receiveShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          bumpMap={ceramic.bump}
          bumpScale={0.0006}
          color="#e5ded2"
          metalness={0.01}
          roughness={0.3}
          clearcoat={0.85}
          clearcoatRoughness={0.1}
          side={2}
          envMapIntensity={1.35}
        />
      </mesh>
      <mesh geometry={handle} castShadow receiveShadow>
        <meshPhysicalMaterial
          map={ceramic.albedo}
          roughnessMap={ceramic.roughness}
          bumpMap={ceramic.bump}
          bumpScale={0.0008}
          color="#f7f2e8"
          metalness={0.01}
          roughness={0.23}
          clearcoat={1}
          clearcoatRoughness={0.065}
          ior={1.55}
          envMapIntensity={1.9}
        />
      </mesh>
      {[
        [0.041, 0.088, 0.001, 0.016, 0.012, 0.0095],
        [0.041, 0.038, 0.001, 0.015, 0.011, 0.009],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={`classic-handle-lug-${i}`} position={[x, y, z]} scale={[sx, sy, sz]} castShadow receiveShadow>
          <sphereGeometry args={[1, 36, 24]} />
          <meshPhysicalMaterial
            map={ceramic.albedo}
            roughnessMap={ceramic.roughness}
            bumpMap={ceramic.bump}
            bumpScale={0.0006}
            color="#f7f2e8"
            metalness={0.01}
            roughness={0.23}
            clearcoat={1}
            clearcoatRoughness={0.065}
            envMapIntensity={1.9}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.1225, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.043, 0.0044, 28, 192]} />
        <meshPhysicalMaterial color="#fffaf2" roughness={0.13} metalness={0.01} clearcoat={1} clearcoatRoughness={0.045} ior={1.56} envMapIntensity={2.05} />
      </mesh>
      <mesh position={[0, 0.1172, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0358, 0.0016, 16, 144]} />
        <meshPhysicalMaterial color="#d9d1c2" roughness={0.27} metalness={0.01} clearcoat={0.72} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0, 0.1135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 160]} />
        <meshPhysicalMaterial color="#2a1408" roughness={0.12} metalness={0} clearcoat={1} clearcoatRoughness={0.055} envMapIntensity={1.65} />
      </mesh>
      <mesh position={[-0.011, 0.114, 0.013]} rotation={[-Math.PI / 2, 0, -0.25]} scale={[1.42, 0.42, 1]}>
        <circleGeometry args={[0.0105, 48]} />
        <meshBasicMaterial color="#fff7ed" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.004, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.0315, 0.0039, 18, 128]} />
        <meshPhysicalMaterial color="#eee6d9" roughness={0.25} metalness={0.01} clearcoat={0.9} clearcoatRoughness={0.08} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[-0.021, 0.101, 0.041]} rotation={[0.16, 0.1, -0.1]}>
        <boxGeometry args={[0.034, 0.002, 0.0014]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.38} depthWrite={false} />
      </mesh>
      {steam.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#fffaf0" transparent opacity={0.12 - i * 0.024} depthWrite={false} />
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
