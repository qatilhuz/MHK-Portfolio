import { existsSync, readdirSync } from "fs";
import path from "path";
import type { Project, ProjectMedia } from "@/types";
import { RESUME_PUBLIC_PATH } from "./assets-public";

export { RESUME_PUBLIC_PATH };

const IMAGE_EXT = new Set([".webp", ".png", ".jpg", ".jpeg"]);
const THUMB_NAMES = ["thumbnail.webp", "thumbnail.png", "thumbnail.jpg", "thumbnail.jpeg"];
const VIDEO_NAMES = ["video.mp4", "video.webm"];
const POSTER_NAMES = ["poster.webp", "poster.png", "poster.jpg", "videoPoster.jpg"];

function publicPath(...segments: string[]) {
  return path.join(process.cwd(), "public", ...segments);
}

export function resumePdfExists(): boolean {
  return existsSync(publicPath("resume", "huzaifa-resume.pdf"));
}

function firstFile(dir: string, names: string[]): string | undefined {
  for (const name of names) {
    if (existsSync(path.join(dir, name))) return name;
  }
  return undefined;
}

function listImages(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .sort();
}

export function hydrateProject(project: Project): Project {
  const folder = project.mediaFolder;
  const root = publicPath("projects", folder);
  if (!existsSync(root)) {
    return { ...project, mediaStatus: "coming-soon" };
  }

  const thumb = firstFile(root, THUMB_NAMES);
  const video = firstFile(root, VIDEO_NAMES);
  const poster = firstFile(root, POSTER_NAMES);
  const shots = listImages(path.join(root, "screenshots"));

  const screenshots: ProjectMedia[] = shots.map((name, index) => ({
    src: `/projects/${folder}/screenshots/${name}`,
    alt: `${project.title} screenshot ${index + 1}`,
  }));

  const thumbnail = thumb ? `/projects/${folder}/${thumb}` : project.thumbnail;
  const videoSrc = video ? `/projects/${folder}/${video}` : undefined;
  const videoPoster = poster ? `/projects/${folder}/${poster}` : undefined;
  const hasMedia = Boolean(thumbnail || videoSrc || screenshots.length);

  return {
    ...project,
    thumbnail: thumbnail || "",
    screenshots: screenshots.length ? screenshots : project.screenshots,
    video: videoSrc,
    videoPoster,
    mediaStatus: hasMedia ? "available" : "coming-soon",
  };
}

export function hydrateProjects(projects: Project[]): Project[] {
  return projects.map(hydrateProject);
}
