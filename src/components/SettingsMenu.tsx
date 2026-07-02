import { useState, useEffect, useRef } from "react";
import { Settings, X, Download, Upload, ExternalLink, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSpoof, resolveFaviconUrl } from "@/hooks/use-spoof";
import { openCurrentPageInBlank } from "@/utils/about-blank";
import { toast } from "@/hooks/use-toast";

async function gatherData() {
  const result: Record<string, unknown> = {
    cookies: document.cookie,
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage },
    indexedDB: {},
  };
  if (indexedDB.databases) {
    const dbs = await indexedDB.databases();
    for (const info of dbs) {
      if (!info.name) continue;
      const dbData: Record<string, unknown[]> = {};
      await new Promise<void>((resolve) => {
        const req = indexedDB.open(info.name!, info.version);
        req.onerror = () => resolve();
        req.onsuccess = () => {
          const db = req.result;
          const names = Array.from(db.objectStoreNames);
          if (!names.length) return resolve();
          const tx = db.transaction(names, "readonly");
          let done = 0;
          for (const n of names) {
            const g = tx.objectStore(n).getAll();
            g.onsuccess = () => { dbData[n] = g.result; if (++done === names.length) resolve(); };
            g.onerror = () => { if (++done === names.length) resolve(); };
          }
        };
      });
      (result.indexedDB as Record<string, unknown>)[info.name] = dbData;
    }
  }
  return result;
}

async function restoreData(data: Record<string, unknown>) {
  if (typeof data.cookies === "string" && data.cookies) {
    data.cookies.split(";").forEach((c) => { document.cookie = c.trim(); });
  }
  if (data.localStorage && typeof data.localStorage === "object") {
    Object.entries(data.localStorage as Record<string, string>).forEach(([k, v]) => localStorage.setItem(k, v));
  }
  if (data.sessionStorage && typeof data.sessionStorage === "object") {
    Object.entries(data.sessionStorage as Record<string, string>).forEach(([k, v]) => sessionStorage.setItem(k, v));
  }
}

export const SettingsMenu = () => {
  const [open, setOpen] = useState(false);
  const { settings, update, reset, defaults } = useSpoof();
  const [title, setTitle] = useState(settings.title);
  const [favicon, setFavicon] = useState(settings.faviconUrl);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTitle(settings.title); setFavicon(settings.faviconUrl); }, [settings.title, settings.faviconUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => window.addEventListener("mousedown", onClick), 0);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClick); };
  }, [open]);

  const saveSpoof = () => {
    update({ title, faviconUrl: favicon });
    toast({ title: "Disguise updated" });
  };

  const handleExport = async () => {
    try {
      const data = await gatherData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete" });
    } catch { toast({ title: "Export failed", variant: "destructive" }); }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      try {
        await restoreData(JSON.parse(await f.text()));
        toast({ title: "Import complete", description: "Reload for full effect." });
      } catch { toast({ title: "Import failed", variant: "destructive" }); }
    };
    input.click();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all bg-secondary text-secondary-foreground border-border hover:border-primary/50 hover:scale-105"
        title="Settings"
      >
        <Settings className="w-3.5 h-3.5" />
        Settings
      </button>

      {/* Sideways-expanding panel — sits inside header, does not cover Games logo */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 right-4 h-[calc(100%-1.25rem)] max-w-[calc(100%-9rem)] z-30 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          ref={panelRef}
          className={`h-full origin-right transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "w-[440px] max-w-full opacity-100 scale-x-100" : "w-0 opacity-0 scale-x-0"
          }`}
        >
          <div className="settings-shimmer h-full w-full rounded-full border border-border bg-secondary/95 backdrop-blur-md shadow-xl overflow-hidden">
            <div className={`h-full w-[440px] max-w-full px-5 py-3 flex items-center gap-4 transition-opacity duration-300 ${open ? "opacity-100 delay-200" : "opacity-0"}`}>
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 min-w-0">
                <div className="col-span-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Settings</p>
                  <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="s-title" className="text-[10px] text-muted-foreground">Tab title</Label>
                  <Input id="s-title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveSpoof}
                    placeholder={defaults.title} className="h-7 text-xs rounded-full" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-fav" className="text-[10px] text-muted-foreground">Favicon domain</Label>
                  <div className="relative">
                    <Input id="s-fav" value={favicon} onChange={(e) => setFavicon(e.target.value)} onBlur={saveSpoof}
                      placeholder={defaults.faviconUrl} className="h-7 text-xs rounded-full pr-8" />
                    <img src={resolveFaviconUrl(favicon || defaults.faviconUrl)} alt="" className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm" />
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between bg-background/40 rounded-full px-3 py-1.5">
                  <div>
                    <p className="text-xs font-medium text-foreground">Open behavior</p>
                    <p className="text-[10px] text-muted-foreground">{settings.openBehavior === "new-tab" ? "New tab" : "Existing window"}</p>
                  </div>
                  <Switch
                    checked={settings.openBehavior === "same-tab"}
                    onCheckedChange={(v) => update({ openBehavior: v ? "same-tab" : "new-tab" })}
                  />
                </div>

                <div className="col-span-2 flex items-center gap-1.5">
                  <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background/40 hover:border-primary/50 transition-all">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                  <button onClick={handleImport} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background/40 hover:border-primary/50 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Import
                  </button>
                  <button onClick={() => openCurrentPageInBlank()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background/40 hover:border-primary/50 transition-all" title="Cloak in about:blank">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 p-1.5 rounded-full hover:bg-background/40 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
