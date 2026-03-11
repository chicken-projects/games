import { useState, useEffect } from "react";
import { Game } from "./gameTypes";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/games.json")
      .then((r) => r.json())
      .then((data) => setGames(data as Game[]))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return { games, loading };
}