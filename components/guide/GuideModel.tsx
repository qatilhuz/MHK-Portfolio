"use client";

import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { GUIDE_MODEL_PATH } from "@/data/guide";
import type { GuidePose } from "@/lib/guide/types";
import { GuideHumanoid } from "./GuideHumanoid";

function LoadedGuide({ path }: { path: string }) {
  const gltf = useGLTF(path);
  return <primitive object={gltf.scene} position={[0, -0.9, 0]} scale={1.1} />;
}

export function GuideModel({
  pose,
  reducedMotion,
}: {
  pose: GuidePose;
  reducedMotion: boolean;
}) {
  const [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(GUIDE_MODEL_PATH, { method: "HEAD" })
      .then((response) => {
        if (live && response.ok) setHasFile(true);
      })
      .catch(() => {
        if (live) setHasFile(false);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!hasFile) {
    return <GuideHumanoid pose={pose} reducedMotion={reducedMotion} />;
  }

  return (
    <Suspense fallback={<GuideHumanoid pose={pose} reducedMotion={reducedMotion} />}>
      <LoadedGuide path={GUIDE_MODEL_PATH} />
    </Suspense>
  );
}
