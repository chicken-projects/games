export interface Game {
  id: number;
  name: string;
  image?: string;
  notes?: string;
}

const STORAGE_KEY = "game-library-data";

export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGames(games: Game[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function exportAllData(): string {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) data[key] = localStorage.getItem(key) || "";
  }
  // Include cookies
  data["__cookies__"] = document.cookie;
  return JSON.stringify(data, null, 2);
}

export function importAllData(json: string) {
  const data = JSON.parse(json);
  // Restore localStorage
  for (const [key, value] of Object.entries(data)) {
    if (key === "__cookies__") continue;
    localStorage.setItem(key, value as string);
  }
  // Restore cookies
  if (data["__cookies__"]) {
    const cookies = (data["__cookies__"] as string).split("; ");
    cookies.forEach((c) => {
      if (c.trim()) document.cookie = c;
    });
  }
}
