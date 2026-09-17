import { GameWorld } from "@/components/arcade/GameWorld";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Dev Arcade",
  description:
    "Full-screen Dev Arcade: browser games for interaction, state, and timing. Portfolio exercises, not commercial products.",
  path: "/arcade",
});

export default function ArcadePage() {
  return <GameWorld />;
}
