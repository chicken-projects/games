import { useState, useMemo, useEffect } from "react";
import { Search, Gamepad2, ExternalLink, Gamepad, Heart, Filter, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { games } from "@/data/games";
import type { Game } from "@/data/gameTypes";
import { NOTICE_URL } from "@/data/config";
import { DataPortability } from "@/components/DataPortability";
import { useFavorites } from "@/hooks/use-favorites";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showFavs, setShowFavs] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { favorites, toggle, isFavorite, count, max } = useFavorites();

  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => { if (g.genre) set.add(g.genre); });
    return Array.from(set).sort();
  }, []);

  useEffect(() => {
    fetch(NOTICE_URL).
    then((r) => r.ok ? r.text() : "").
    then((t) => setNotice(t.trim())).
    catch(() => setNotice(""));
  }, []);

  const filtered = useMemo(() => {
    let list = games;
    if (showFavs) list = list.filter((g) => favorites.includes(g.id));
    if (selectedGenres.length > 0) list = list.filter((g) => g.genre && selectedGenres.includes(g.genre));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    return list;
  }, [search, showFavs, favorites, selectedGenres]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleToggleFav = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFavorite(id) && count >= max) {
      toast({ title: "Favorites full", description: `You can only favorite up to ${max} games.`, variant: "destructive" });
      return;
    }
    toggle(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Gamepad className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Games</h1>
          </div>
          <button
            onClick={() => setShowFavs(!showFavs)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
              showFavs
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavs ? "fill-current" : ""}`} />
            Favorites ({count}/{max})
          </button>
          {genres.length > 0 && (
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="h-auto px-3 py-1.5 w-auto shrink-0 rounded-full bg-secondary border-border text-xs font-medium">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="relative flex-1 max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border rounded-full" />
          </div>
          <DataPortability />
          {notice &&
          <div className="shrink-0 max-w-xs px-3 py-1.5 bg-secondary text-foreground text-sm rounded-full border border-border truncate">
              {notice}
            </div>
          }
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((game) => {
            const Wrapper = game.link ? "a" : "div";
            const wrapperProps = game.link ?
            { href: game.link, target: "_blank" as const, rel: "noopener noreferrer" } :
            {};
            return (
              <Wrapper key={game.id} className="game-slot-filled aspect-[3/4] flex flex-col relative group" {...wrapperProps}>
                <button
                  onClick={(e) => handleToggleFav(e, game.id)}
                  className="absolute top-1.5 right-1.5 z-[2] p-1 rounded-full bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={isFavorite(game.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-4 h-4 transition-colors ${isFavorite(game.id) ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
                </button>
                {game.image ?
                <img src={game.image} alt={game.name} className="w-full h-3/4 object-cover" /> :
                <div className="w-full h-3/4 bg-muted flex items-center justify-center">
                    <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                }
                <div className="p-2 flex items-center gap-1">
                  <p className="text-sm font-medium truncate text-foreground flex-1">{game.name}</p>
                  {game.link && <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />}
                </div>
              </Wrapper>);
          })}
        </div>
      </main>
    </div>);

};

export default Index;
