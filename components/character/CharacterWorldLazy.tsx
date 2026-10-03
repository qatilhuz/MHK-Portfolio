"use client";

import dynamic from "next/dynamic";
import { Component, Suspense, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { characterConfig } from "@/data/characterConfig";
import { CharacterFallback } from "./CharacterFallback";

const loadCharacterWorld = () => import("./CharacterWorld").then((mod) => mod.CharacterWorld);

const World = dynamic(loadCharacterWorld, {
  ssr: false,
  loading: () => <CharacterFallback label="Guide loading" />,
});

class CharacterRootBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Character world failed; keeping rescue UI visible.", error);
  }

  render() {
    if (this.state.failed) return <CharacterFallback label="Guide recovered" />;
    return this.props.children;
  }
}

export function CharacterWorldLazy() {
  const path = usePathname();

  useEffect(() => {
    if (path !== "/arcade") void loadCharacterWorld();
  }, [path]);

  if (!characterConfig.enabled || !characterConfig.is3DModelEnabled) return null;
  if (path === "/arcade") return null;

  return (
    <CharacterRootBoundary>
      <Suspense fallback={<CharacterFallback label="Guide loading" />}>
        <World />
      </Suspense>
    </CharacterRootBoundary>
  );
}
