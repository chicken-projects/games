import { useState, useCallback } from "react";

const STORAGE_KEY = "spoofSettings";

export interface SpoofSettings {
  title: string;
  faviconUrl: string;
}

const DEFAULTS: SpoofSettings = {
  title: "Google Classroom",
  faviconUrl: "https://classroom.google.com/favicon.ico",
};

export function getSpoofSettings(): SpoofSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title || DEFAULTS.title,
      faviconUrl: parsed.faviconUrl || DEFAULTS.faviconUrl,
    };
  } catch {
    return DEFAULTS;
  }
}

export function useSpoof() {
  const [settings, setSettings] = useState<SpoofSettings>(getSpoofSettings);

  const update = useCallback((newSettings: SpoofSettings) => {
    const resolved: SpoofSettings = {
      title: newSettings.title.trim() || DEFAULTS.title,
      faviconUrl: resolveFavicon(newSettings.faviconUrl.trim()) || DEFAULTS.faviconUrl,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
    setSettings(resolved);
    window.dispatchEvent(new Event("spoof-updated"));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULTS);
  }, []);

  return { settings, update, reset, defaults: DEFAULTS };
}

function resolveFavicon(input: string): string {
  if (!input) return "";
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  // Treat as domain, e.g. "google.com" → "https://google.com/favicon.ico"
  const domain = input.replace(/\/+$/, "");
  return `https://${domain}/favicon.ico`;
}
