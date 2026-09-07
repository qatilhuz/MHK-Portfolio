export type ArcadeGameId = "rps" | "snake" | "memory" | "reaction";

export interface ArcadeGameMeta {
  id: ArcadeGameId;
  title: string;
  summary: string;
}
