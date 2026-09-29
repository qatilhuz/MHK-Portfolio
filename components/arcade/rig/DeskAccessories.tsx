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
    new Vector2(0.025, 0.0),
    new Vector2(0.034, 0.004),
    new Vector2(0.039, 0.017),
    new Vector2(0.043, 0.052),
    new Vector2(0.041, 0.085),
    new Vector2(0.045, 0.096),
    new Vector2(0.041, 0.104),
  ];
  const g = new LatheGeometry(pts, 88);
  g.computeVertexNormals();
  return g;
}

function mugHandleGeometry() {
  const curve = new CatmullRomCurve3([
    new Vector3(0.038, 0.078, 0),
    new Vector3(0.071, 0.071, 0.002),
    new Vector3(0.083, 0.052, 0.002),
    new Vector3(0.078, 0.032, 0.001),
    new Vector3(0.04, 0.025, 0),
  ]);
  return new TubeGeometry(curve, 44, 0.0048, 16, false);
}

function mugSteamGeometry(offset: number) {
  const curve = new CatmullRomCurve3([
    new Vector3(offset, 0.105, 0.002),
    new Vector3(offset + 0.012, 0.128, 0.004),
    new Vector3(offset - 0.009, 0.151, 0.001),
    new Vector3(offset + 0.006, 0.176, 0.003),
  ]);
  return new TubeGeometry(curve, 28, 0.0012, 8, false);
}

function ModernCoffeeMug() {
  const body = useMemo(() => mugBodyGeometry(), []);
  const handle = useMemo(() => mugHandleGeometry(), []);
  const steam = useMemo(() => [-0.012, 0.004, 0.017].map((offset) => mugSteamGeometry(offset)), []);

  return (
    <group position={[0.88, 0.053, 0.32]} rotation={[0, -0.18, 0]} scale={1.03}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#20242f"
          roughness={0.48}
          metalness={0.02}
          clearcoat={0.42}
          clearcoatRoughness={0.38}
          envMapIntensity={1.15}
        />
      </mesh>
      <mesh geometry={handle} castShadow>
        <meshPhysicalMaterial
          color="#1c202a"
          roughness={0.44}
          metalness={0.02}
          clearcoat={0.45}
          clearcoatRoughness={0.36}
          envMapIntensity={1.15}
        />
      </mesh>
      <mesh position={[0, 0.104, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.043, 0.0038, 16, 88]} />
        <meshPhysicalMaterial color="#2b303c" roughness={0.34} metalness={0.02} clearcoat={0.56} clearcoatRoughness={0.28} />
      </mesh>
      <mesh position={[0, 0.101, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.0365, 72]} />
        <meshPhysicalMaterial color="#2a140c" roughness={0.24} metalness={0} clearcoat={0.72} clearcoatRoughness={0.18} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.031, 0.0034, 12, 64]} />
        <meshStandardMaterial color="#11151d" roughness={0.62} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.058, 0.0425]}>
        <boxGeometry args={[0.06, 0.026, 0.002]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.24} roughness={0.5} metalness={0.08} />
      </mesh>
      <Text position={[0, 0.058, 0.045]} fontSize={0.015} letterSpacing={0.08} anchorX="center" anchorY="middle" color="#e9d5ff">
        ARCADE
      </Text>
      {steam.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.12 - i * 0.02} depthWrite={false} />
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
