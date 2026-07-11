import { useState, useEffect, useRef, MouseEvent } from "react";
import { Settings, X, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSpoof, resolveFaviconUrl } from "@/hooks/use-spoof";
import { toast } from "@/hooks/use-toast";
import { StarLayer, useStarShimmer } from "@/components/StarShimmer";

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

interface Props {
  open: boolean;
  onOpen: (e: MouseEvent) => void;
  onClose: () => void;
}

export const SettingsMenu = ({ open, onOpen, onClose }: Props) => {
  const { settings, update, defaults } = useSpoof();
  const [title, setTitle] = useState(settings.title);
  const [favicon, setFavicon] = useState(settings.faviconUrl);
  const { bursts, emit } = useStarShimmer();
  const panelRef = useRef<HTMLDivElement>(null);
  const [originX, setOriginX] = useState<string>("right");

  useEffect(() => { setTitle(settings.title); setFavicon(settings.faviconUrl); }, [settings.title, settings.faviconUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

  const handleClick = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOriginX(`${rect.left + rect.width / 2}px`);
    onOpen(e);
  };

  const handlePanelClick = (e: React.MouseEvent) => {
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) emit(e.clientX - rect.left, e.clientY - rect.top);
  };

  if (!open) {
    return (
      <button
        onClick={handleClick}
        className="header-pill"
        title="Settings"
      >
        <Settings className="w-3.5 h-3.5" />
        Settings
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      onClick={handlePanelClick}
      className="relative h-full w-full bubble-expand overflow-hidden rounded-full border border-border bg-secondary/95 backdrop-blur-md shadow-xl px-4 flex items-center gap-2"
      style={{ ["--origin-x" as string]: originX }}
    >
      <StarLayer bursts={bursts} />
      <Settings className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <Label className="sr-only">Tab title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveSpoof}
            aria-label="Tab title" placeholder="Tab title" className="h-8 text-xs rounded-full min-w-0" />
        </div>
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <Label className="sr-only">Favicon domain</Label>
          <div className="relative min-w-0 flex-1">
            <Input value={favicon} onChange={(e) => setFavicon(e.target.value)} onBlur={saveSpoof}
              aria-label="Favicon domain" placeholder="Favicon domain" className="h-8 text-xs rounded-full pr-8 min-w-0" />
            <img src={resolveFaviconUrl(favicon || defaults.faviconUrl)} alt="" className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm" />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-background/40 rounded-full p-1 border border-border shrink-0" aria-label="Open games behavior">
          <span className="pl-2 pr-1 text-[10px] font-medium text-muted-foreground">Open games</span>
          <button
            onClick={() => update({ openBehavior: "new-tab" })}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${settings.openBehavior === "new-tab" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >New window</button>
          <button
            onClick={() => update({ openBehavior: "same-tab" })}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${settings.openBehavior === "same-tab" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >Current tab</button>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={handleExport} className="header-pill" title="Export data">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <button onClick={handleImport} className="header-pill" title="Import data">
          <Upload className="w-3.5 h-3.5" /> Import
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-background/40 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close settings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
