import { useState, useCallback } from "react";

const STORAGE_KEY = "favoriteGameIds";
const MAX_FAVORITES = 15;

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(loadFavorites);

  const toggle = useCallback((id: number) => {
    setFavorites((prev) => {
      let next: number[];
      if (prev.includes(id)) {
        next = prev.filter((f) => f !== id);
      } else {
        if (prev.length >= MAX_FAVORITES) return prev;
        next = [...prev, id];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite, count: favorites.length, max: MAX_FAVORITES };
}
