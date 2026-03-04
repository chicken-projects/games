import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Download, Upload, X, Gamepad2 } from "lucide-react";
import { Game, loadGames, saveGames, exportAllData, importAllData } from "@/lib/gameStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const TOTAL_SLOTS = 200;

const Index = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [editSlot, setEditSlot] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setGames(loadGames()); }, []);
  useEffect(() => { saveGames(games); }, [games]);

  const gameMap = useMemo(() => {
    const map = new Map<number, Game>();
    games.forEach((g) => map.set(g.id, g));
    return map;
  }, [games]);

  const slots = useMemo(() => {
    const arr = Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1);
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter((id) => {
      const g = gameMap.get(id);
      return g && g.name.toLowerCase().includes(q);
    });
  }, [search, gameMap]);

  const openEdit = (id: number) => {
    const g = gameMap.get(id);
    setEditSlot(id);
    setEditName(g?.name || "");
    setEditImage(g?.image || "");
    setEditNotes(g?.notes || "");
  };

  const saveEdit = () => {
    if (editSlot === null) return;
    if (!editName.trim()) {
      setGames((prev) => prev.filter((g) => g.id !== editSlot));
    } else {
      setGames((prev) => {
        const without = prev.filter((g) => g.id !== editSlot);
        return [...without, { id: editSlot, name: editName.trim(), image: editImage.trim() || undefined, notes: editNotes.trim() || undefined }];
      });
    }
    setEditSlot(null);
    toast.success("Saved!");
  };

  const handleExport = () => {
    const blob = new Blob([exportAllData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game-library-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllData(reader.result as string);
        setGames(loadGames());
        toast.success("Data imported! Page will reflect changes.");
      } catch {
        toast.error("Invalid file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Game Library</h1>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" /> Import
            </Button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground mb-4">
          {games.length} / {TOTAL_SLOTS} slots filled
          {search && ` · ${slots.length} results`}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {slots.map((id) => {
            const game = gameMap.get(id);
            return game ? (
              <div key={id} className="game-slot-filled aspect-[3/4]" onClick={() => openEdit(id)}>
                {game.image ? (
                  <img src={game.image} alt={game.name} className="w-full h-3/4 object-cover" />
                ) : (
                  <div className="w-full h-3/4 bg-muted flex items-center justify-center">
                    <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-sm font-medium truncate text-foreground">{game.name}</p>
                </div>
              </div>
            ) : (
              <div key={id} className="game-slot-empty aspect-[3/4]" onClick={() => openEdit(id)}>
                <span className="text-xs text-muted-foreground">#{id}</span>
              </div>
            );
          })}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editSlot !== null} onOpenChange={(o) => !o && setEditSlot(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Slot #{editSlot}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Game name (leave empty to clear)" className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Image URL</label>
              <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." className="bg-secondary border-border mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Notes</label>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Optional notes" className="bg-secondary border-border mt-1" />
            </div>
            <Button onClick={saveEdit} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
