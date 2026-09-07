import type { WorkspaceObjectConfig } from "@/types/workspace";

/**
 * Semantic map for the hero workspace.
 * glbPath is reserved; procedural meshes are used until real assets exist.
 */
export const workspaceObjects: WorkspaceObjectConfig[] = [
  {
    id: "monitor",
    label: "Monitor",
    caption: "Projects",
    href: "/projects",
    position: [0, 0.55, -0.15],
    rotation: [0, 0, 0],
    showOnMobile: true,
    glbPath: "/models/monitor.glb",
  },
  {
    id: "laptop",
    label: "Laptop",
    caption: "Skills",
    href: "/#skills",
    position: [-1.15, 0.08, 0.35],
    rotation: [0, 0.35, 0],
    showOnMobile: true,
    glbPath: "/models/laptop.glb",
  },
  {
    id: "phone",
    label: "Phone",
    caption: "Mobile",
    href: "/projects?filter=mobile",
    position: [1.05, 0.05, 0.45],
    rotation: [0, -0.25, 0],
    showOnMobile: false,
    glbPath: "/models/phone.glb",
  },
  {
    id: "arcade",
    label: "Arcade",
    caption: "Dev Arcade",
    href: "/#arcade",
    position: [1.55, 0.15, -0.55],
    rotation: [0, -0.4, 0],
    showOnMobile: false,
    glbPath: "/models/arcade.glb",
  },
  {
    id: "terminal",
    label: "Terminal",
    caption: "CLI",
    href: "/#terminal",
    position: [-0.15, 0.04, 0.7],
    rotation: [0, 0.1, 0],
    showOnMobile: false,
    glbPath: null,
  },
  {
    id: "folder",
    label: "Folder",
    caption: "Resume",
    href: "/#resume",
    position: [0.55, 0.04, 0.55],
    rotation: [0, 0.2, 0],
    showOnMobile: true,
    glbPath: null,
  },
  {
    id: "avatar",
    label: "Avatar",
    caption: "About",
    href: "/#avatar",
    position: [-1.55, 0.35, -0.45],
    rotation: [0, 0.5, 0],
    showOnMobile: false,
    glbPath: null,
  },
];

export const workspaceCamera = {
  desktop: { position: [2.6, 1.7, 3.4] as [number, number, number], fov: 38 },
  tablet: { position: [2.2, 1.8, 3.8] as [number, number, number], fov: 42 },
  mobile: { position: [0.4, 1.6, 4.2] as [number, number, number], fov: 46 },
};
