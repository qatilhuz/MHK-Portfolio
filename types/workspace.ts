export type WorkspaceObjectId =
  | "monitor"
  | "laptop"
  | "phone"
  | "arcade"
  | "terminal"
  | "folder"
  | "avatar";

export type WorkspaceBreakpoint = "mobile" | "tablet" | "desktop";

export interface WorkspaceObjectConfig {
  id: WorkspaceObjectId;
  label: string;
  caption: string;
  href: string;
  position: [number, number, number];
  rotation: [number, number, number];
  showOnMobile: boolean;
  glbPath: string | null;
}
