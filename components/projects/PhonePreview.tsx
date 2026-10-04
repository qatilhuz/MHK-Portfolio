import Image from "next/image";
import type { Project } from "@/types";
import { MediaPending } from "./MediaPending";

export function PhonePreview({ project }: { project: Project }) {
  const shot = project.screenshots[0];

  return (
    <div className="flex justify-center">
      <div className="w-[min(100%,280px)] rounded-[2rem] border border-border bg-surface p-3 shadow-[var(--shadow)]">
        <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-border" aria-hidden />
        <div className="overflow-hidden rounded-[1.25rem] border border-border bg-surface-secondary">
          {shot ? (
            <Image
              src={shot.src}
              alt={shot.alt}
              width={390}
              height={844}
              className="h-auto w-full"
              loading="lazy"
            />
          ) : (
            <MediaPending
              label="Device preview"
              note="Project media coming soon"
            />
          )}
        </div>
      </div>
    </div>
  );
}
