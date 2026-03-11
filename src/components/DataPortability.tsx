import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

async function gatherData() {
  const result: Record<string, unknown> = {};

  result.cookies = document.cookie;
  result.localStorage = { ...localStorage };
  result.sessionStorage = { ...sessionStorage };
  result.indexedDB = {};

  if (indexedDB.databases) {
    const dbs = await indexedDB.databases();
    for (const dbInfo of dbs) {
      if (!dbInfo.name) continue;
      const dbData: Record<string, unknown[]> = {};
      await new Promise<void>((resolve) => {
        const req = indexedDB.open(dbInfo.name!, dbInfo.version);
        req.onerror = () => resolve();
        req.onsuccess = () => {
          const db = req.result;
          const names = Array.from(db.objectStoreNames);
          if (!names.length) { resolve(); return; }
          const tx = db.transaction(names, "readonly");
          let done = 0;
          for (const name of names) {
            const getAll = tx.objectStore(name).getAll();
            getAll.onsuccess = () => { dbData[name] = getAll.result; done++; if (done === names.length) resolve(); };
            getAll.onerror = () => { done++; if (done === names.length) resolve(); };
          }
        };
      });
      (result.indexedDB as Record<string, unknown>)[dbInfo.name] = dbData;
    }
  }

  return result;
}

async function restoreData(data: Record<string, unknown>) {
  // Cookies
  if (typeof data.cookies === "string" && data.cookies) {
    data.cookies.split(";").forEach((c) => { document.cookie = c.trim(); });
  }

  // localStorage
  if (data.localStorage && typeof data.localStorage === "object") {
    Object.entries(data.localStorage as Record<string, string>).forEach(([k, v]) => localStorage.setItem(k, v));
  }

  // sessionStorage
  if (data.sessionStorage && typeof data.sessionStorage === "object") {
    Object.entries(data.sessionStorage as Record<string, string>).forEach(([k, v]) => sessionStorage.setItem(k, v));
  }

  // indexedDB
  if (data.indexedDB && typeof data.indexedDB === "object") {
    for (const [dbName, stores] of Object.entries(data.indexedDB as Record<string, Record<string, unknown[]>>)) {
      await new Promise<void>((resolve) => {
        const req = indexedDB.open(dbName);
        req.onupgradeneeded = () => {
          const db = req.result;
          for (const storeName of Object.keys(stores)) {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { autoIncrement: true });
            }
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          const existing = Array.from(db.objectStoreNames);
          const toRestore = Object.keys(stores).filter((s) => existing.includes(s));
          if (!toRestore.length) { resolve(); return; }
          const tx = db.transaction(toRestore, "readwrite");
          let done = 0;
          for (const storeName of toRestore) {
            const store = tx.objectStore(storeName);
            store.clear();
            for (const item of stores[storeName]) {
              store.put(item);
            }
            done++;
            if (done === toRestore.length) resolve();
          }
          tx.oncomplete = () => resolve();
        };
        req.onerror = () => resolve();
      });
    }
  }
}

export function DataPortability() {
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
      toast({ title: "Export complete", description: "Your data has been downloaded." });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await restoreData(data);
        toast({ title: "Import complete", description: "Data restored. Reload for full effect." });
      } catch {
        toast({ title: "Import failed", description: "Invalid file.", variant: "destructive" });
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-secondary text-secondary-foreground hover:border-primary/50 transition-colors">
        <Download className="w-3.5 h-3.5" /> Export
      </button>
      <button onClick={handleImport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-secondary text-secondary-foreground hover:border-primary/50 transition-colors">
        <Upload className="w-3.5 h-3.5" /> Import
      </button>
    </div>
  );
}
