export type GameSize = "landscape" | "portrait" | "square";

export interface Game {
  id: number;
  name: string;
  image?: string;
  link?: string;
  notes?: string;
  /** genre id (new schema) or legacy string name */
  genre?: number | string;
  /** group id, required when mode === "groups" */
  group?: number;
  /** optional visual size */
  size?: GameSize;
}

export interface GroupDef {
  id: number;
  name: string;
  priority: number;
}

export interface GenreDef {
  id: number;
  name: string;
  priority: number;
}

export type GridMode = "groups" | "genres" | "off";

export interface GamesData {
  mode: GridMode;
  groups: GroupDef[];
  genres: GenreDef[];
  games: Game[];
}
