"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  Group,
  MathUtils,
  Vector3,
  type Mesh,
} from "three";

interface ScrollJourneyObjectProps {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
}

const echoOffsets = [0.018, 0.036, 0.054, 0.072, 0.09];

export function ScrollJourneyObject({ progress, reducedMotion }: ScrollJourneyObjectProps) {
  const carrier = useRef<Group>(null);
  const core = useRef<Group>(null);
  const outerRing = useRef<Mesh>(null);
  const innerRing = useRef<Mesh>(null);
  const echoes = useRef<Array<Group | null>>([]);
  const smoothedProgress = useRef(0);
  const pathPoint = useMemo(() => new Vector3(), []);
  const pathTangent = useMemo(() => new Vector3(), []);
  const echoPoint = useMemo(() => new Vector3(), []);
  const cyan = useMemo(() => new Color("#22d3ee"), []);

  const flightPath = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(0.02, 0.41, 0.25),
          new Vector3(0.31, 0.3, 0.82),
          new Vector3(0.2, 0.18, -0.42),
          new Vector3(-0.34, 0.045, 0.7),
          new Vector3(0.3, -0.09, -0.32),
          new Vector3(-0.26, -0.24, 0.5),
          new Vector3(0.28, -0.405, 0.72),
        ],
        false,
        "catmullrom",
        0.62,
      ),
    [],
  );

  useFrame((state, delta) => {
    const object = carrier.current;
    if (!object) return;

    const targetProgress = reducedMotion ? 0.82 : MathUtils.clamp(progress.current, 0, 1);
    smoothedProgress.current = MathUtils.damp(
      smoothedProgress.current,
      targetProgress,
      reducedMotion ? 20 : 6.5,
      Math.min(delta, 1 / 30),
    );

    const journey = smoothedProgress.current;
    flightPath.getPointAt(journey, pathPoint);
    flightPath.getTangentAt(journey, pathTangent).normalize();

    const viewport = state.viewport.getCurrentViewport(state.camera, [0, 0, 0]);
    const targetX = pathPoint.x * viewport.width;
    const targetY = pathPoint.y * viewport.height;

    object.position.x = MathUtils.damp(object.position.x, targetX, 9, delta);
    object.position.y = MathUtils.damp(object.position.y, targetY, 9, delta);
    object.position.z = MathUtils.damp(object.position.z, pathPoint.z, 8, delta);

    const bank = -pathTangent.x * 0.95;
    object.rotation.x = MathUtils.damp(object.rotation.x, pathTangent.y * 0.34, 7, delta);
    object.rotation.y = MathUtils.damp(object.rotation.y, journey * Math.PI * 3.5, 5, delta);
    object.rotation.z = MathUtils.damp(object.rotation.z, bank, 7, delta);

    const responsiveScale = MathUtils.clamp(viewport.width / 7.2, 0.58, 1.12);
    const landingPulse = MathUtils.smoothstep(journey, 0.8, 1) * 0.18;
    const targetScale = responsiveScale * (0.88 + Math.sin(journey * Math.PI) * 0.13 + landingPulse);
    const nextScale = MathUtils.damp(object.scale.x, targetScale, 7, delta);
    object.scale.setScalar(nextScale);

    if (core.current) {
      core.current.rotation.x = journey * Math.PI * 4.5 + state.clock.elapsedTime * 0.16;
      core.current.rotation.y = journey * Math.PI * 7 - state.clock.elapsedTime * 0.11;
    }
    if (outerRing.current) {
      outerRing.current.rotation.x = state.clock.elapsedTime * 0.42 + journey * Math.PI * 2;
      outerRing.current.rotation.z = state.clock.elapsedTime * -0.3 + journey * Math.PI * 3;
    }
    if (innerRing.current) {
      innerRing.current.rotation.y = state.clock.elapsedTime * -0.5 - journey * Math.PI * 2.5;
      innerRing.current.rotation.z = state.clock.elapsedTime * 0.24;
    }

    echoes.current.forEach((echo, index) => {
      if (!echo) return;
      const echoProgress = MathUtils.clamp(journey - echoOffsets[index], 0, 1);
      flightPath.getPointAt(echoProgress, echoPoint);
      echo.position.set(
        echoPoint.x * viewport.width,
        echoPoint.y * viewport.height,
        echoPoint.z - 0.12 - index * 0.025,
      );
      const echoScale = responsiveScale * (0.34 - index * 0.045);
      echo.scale.setScalar(Math.max(0.1, echoScale));
      echo.rotation.set(journey * 3 + index, journey * 5 - index * 0.4, journey * 2);
    });
  });

  return (
    <>
      {echoOffsets.map((_, index) => (
        <group
          key={index}
          ref={(node) => {
            echoes.current[index] = node;
          }}
        >
          <mesh>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial
              color={cyan}
              transparent
              opacity={0.13 - index * 0.018}
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <group ref={carrier}>
        <pointLight color="#22d3ee" intensity={5.5} distance={4.5} decay={2} />

        <group ref={core}>
          <mesh>
            <icosahedronGeometry args={[0.31, 2]} />
            <meshStandardMaterial
              color="#031525"
              emissive="#0891b2"
              emissiveIntensity={4.2}
              metalness={0.88}
              roughness={0.18}
              toneMapped={false}
            />
          </mesh>
          <mesh scale={1.12}>
            <icosahedronGeometry args={[0.31, 1]} />
            <meshBasicMaterial
              color="#a5f3fc"
              transparent
              opacity={0.72}
              wireframe
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          <mesh scale={0.56}>
            <octahedronGeometry args={[0.31, 0]} />
            <meshBasicMaterial color="#ecfeff" toneMapped={false} />
          </mesh>
        </group>

        <mesh ref={outerRing} rotation={[Math.PI / 3, 0, Math.PI / 5]}>
          <torusGeometry args={[0.48, 0.018, 8, 80]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.82}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={innerRing} rotation={[0, Math.PI / 2.4, Math.PI / 3]}>
          <torusGeometry args={[0.4, 0.012, 8, 72]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.68}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {[0, 1, 2, 3].map((index) => {
          const angle = (index / 4) * Math.PI * 2;
          return (
            <group key={index} rotation={[0, 0, angle]}>
              <mesh position={[0.61, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                <octahedronGeometry args={[0.075, 0]} />
                <meshBasicMaterial
                  color={index % 2 === 0 ? "#67e8f9" : "#60a5fa"}
                  transparent
                  opacity={0.92}
                  blending={AdditiveBlending}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}

        <mesh scale={1.8}>
          <sphereGeometry args={[0.36, 20, 20]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.055}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}
