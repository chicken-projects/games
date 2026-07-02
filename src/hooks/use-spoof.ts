import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "spoofSettings";

export type OpenBehavior = "new-tab" | "same-tab";

export interface SpoofSettings {
  title: string;
  faviconUrl: string;
  openBehavior: OpenBehavior;
}

const DEFAULTS: SpoofSettings = {
  title: "Home - Classroom",
  faviconUrl: "classroom.google.com",
  openBehavior: "new-tab",
};

/** Resolve a raw favicon input into an actual image URL. */
export function resolveFaviconUrl(input: string): string {
  const v = (input || "").trim();
  if (!v) return `https://www.google.com/s2/favicons?domain=classroom.google.com&sz=64`;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("//")) return "https:" + v;
  // treat as domain — use Google's favicon service (reliable, CORS-friendly)
  const domain = v.replace(/^\/+/, "").replace(/\/.*$/, "");
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export function getSpoofSettings(): SpoofSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title || DEFAULTS.title,
      faviconUrl: parsed.faviconUrl || DEFAULTS.faviconUrl,
      openBehavior: parsed.openBehavior === "same-tab" ? "same-tab" : "new-tab",
    };
  } catch {
    return DEFAULTS;
  }
}

export function getResolvedFavicon(): string {
  return resolveFaviconUrl(getSpoofSettings().faviconUrl);
}

export function useSpoof() {
  const [settings, setSettings] = useState<SpoofSettings>(getSpoofSettings);

  useEffect(() => {
    const handler = () => setSettings(getSpoofSettings());
    window.addEventListener("spoof-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("spoof-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((next: Partial<SpoofSettings>) => {
    const merged: SpoofSettings = { ...getSpoofSettings(), ...next };
    merged.title = merged.title.trim() || DEFAULTS.title;
    merged.faviconUrl = merged.faviconUrl.trim() || DEFAULTS.faviconUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setSettings(merged);
    window.dispatchEvent(new Event("spoof-updated"));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULTS);
    window.dispatchEvent(new Event("spoof-updated"));
  }, []);

  return { settings, update, reset, defaults: DEFAULTS };
}
