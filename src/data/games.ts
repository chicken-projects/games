import { useState, useEffect } from "react";
import { Game, GamesData, GroupDef, GenreDef } from "./gameTypes";

const EMPTY: GamesData = { mode: "off", groups: [], genres: [], games: [] };

function normalize(raw: unknown): GamesData {
  // Legacy: plain array of games
  if (Array.isArray(raw)) {
    const games = raw as Game[];
    const genreNames = Array.from(new Set(games.map((g) => (typeof g.genre === "string" ? g.genre : undefined)).filter(Boolean))) as string[];
    const genres: GenreDef[] = genreNames.sort().map((n, i) => ({ id: i + 1, name: n, priority: 0 }));
    return { mode: "off", groups: [], genres, games };
  }
  const d = raw as Partial<GamesData>;
  return {
    mode: (d.mode as GamesData["mode"]) || "off",
    groups: (d.groups as GroupDef[]) || [],
    genres: (d.genres as GenreDef[]) || [],
    games: (d.games as Game[]) || [],
  };
}

export function useGamesData() {
  const [data, setData] = useState<GamesData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/games.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((raw) => setData(normalize(raw)))
      .catch(() => setData(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// Back-compat for any component still using useGames()
export function useGames() {
  const { data, loading } = useGamesData();
  return { games: data.games, loading };
}
