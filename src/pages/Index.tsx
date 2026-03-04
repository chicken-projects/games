import { useState, useMemo } from "react";
import { Search, Gamepad2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { games } from "@/data/games";
import type { Game } from "@/data/gameTypes";

const TOTAL_SLOTS = 200;

const Index = () => {
  const [search, setSearch] = useState("");

  const gameMap = useMemo(() => {
    const map = new Map<number, Game>();
    games.forEach((g) => map.set(g.id, g));
    return map;
  }, []);

  const slots = useMemo(() => {
    const arr = Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1);
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter((id) => {
      const g = gameMap.get(id);
      return g && g.name.toLowerCase().includes(q);
    });
  }, [search, gameMap]);

  return (
    <div className="min-h-screen bg-background">
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
          <p className="text-sm text-muted-foreground shrink-0">
            {games.length} / {TOTAL_SLOTS} filled
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {slots.map((id) => {
            const game = gameMap.get(id);
            if (game) {
              const Wrapper = game.link ? "a" : "div";
              const wrapperProps = game.link
                ? { href: game.link, target: "_blank" as const, rel: "noopener noreferrer" }
                : {};
              return (
                <Wrapper key={id} className="game-slot-filled aspect-[3/4] flex flex-col" {...wrapperProps}>
                  {game.image ? (
                    <img src={game.image} alt={game.name} className="w-full h-3/4 object-cover" />
                  ) : (
                    <div className="w-full h-3/4 bg-muted flex items-center justify-center">
                      <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-2 flex items-center gap-1">
                    <p className="text-sm font-medium truncate text-foreground flex-1">{game.name}</p>
                    {game.link && <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />}
                  </div>
                </Wrapper>
              );
            }
            return (
              <div key={id} className="game-slot-empty aspect-[3/4]">
                <span className="text-xs text-muted-foreground">#{id}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Index;
