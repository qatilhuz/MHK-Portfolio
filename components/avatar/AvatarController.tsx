"use client";

import type { AssistantStatus } from "@/types";
import { AvatarModel } from "./AvatarModel";

export function AvatarController({
  status,
  reducedMotion,
}: {
  status: AssistantStatus;
  reducedMotion: boolean;
}) {
  return <AvatarModel status={status} reducedMotion={reducedMotion} />;
}
