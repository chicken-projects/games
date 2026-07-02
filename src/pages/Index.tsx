import { useState, useMemo, useEffect } from "react";
import { Search, Gamepad2, ExternalLink, Gamepad, Heart, Filter, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGames } from "@/data/games";
import { NOTICE_URL } from "@/data/config";
import { ScrollButtons } from "@/components/ScrollButtons";
import { SettingsMenu } from "@/components/SettingsMenu";
import { openGame } from "@/utils/about-blank";
import { useFavorites } from "@/hooks/use-favorites";
import { getSpoofSettings, resolveFaviconUrl } from "@/hooks/use-spoof";

/** Render a plain-text notice, converting URLs into blue clickable links. */
function renderNotice(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="notice-link">{p}</a>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

const Index = () => {
  const { games, loading } = useGames();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showFavs, setShowFavs] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { toggle, isFavorite, count, favorites } = useFavorites();

  // Apply spoof title & favicon
  useEffect(() => {
    const apply = () => {
      const { title, faviconUrl } = getSpoofSettings();
      document.title = title;
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = resolveFaviconUrl(faviconUrl);
    };
    apply();
    window.addEventListener("spoof-updated", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("spoof-updated", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => { if (g.genre) set.add(g.genre); });
    return Array.from(set).sort();
  }, [games]);

  useEffect(() => {
    fetch(NOTICE_URL, { cache: "no-store" })
      .then((r) => r.ok ? r.text() : "")
      .then((t) => setNotice(t.trim()))
      .catch(() => setNotice(""));
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
  }, [search, showFavs, favorites, selectedGenres, games]);

  // Key that changes when filters change — retriggers bubble/shimmer animation
  const filterKey = `${search}|${showFavs}|${selectedGenres.join(",")}`;
  const filtersActive = search.trim().length > 0 || showFavs || selectedGenres.length > 0;

  const toggleGenre = (genre: string) =>
    setSelectedGenres((prev) => prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]);

  const handleToggleFav = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation(); toggle(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="relative max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Gamepad className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Games</h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowFavs(!showFavs)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${
                showFavs
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavs ? "fill-current" : ""}`} />
              Favorites ({count})
            </button>
            {genres.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${
                      selectedGenres.length > 0
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    {selectedGenres.length > 0 ? `Genres (${selectedGenres.length})` : "Genres"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-1.5" align="start">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        selectedGenres.includes(g) ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selectedGenres.includes(g) && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      {g}
                    </button>
                  ))}
                  {selectedGenres.length > 0 && (
                    <button
                      onClick={() => setSelectedGenres([])}
                      className="w-full px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground text-center mt-1 border-t border-border"
                    >
                      Clear all
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="relative flex-1 max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border rounded-full transition-all focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {notice && (
              <div className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full border border-border truncate max-w-xs">
                {renderNotice(notice)}
              </div>
            )}
            <SettingsMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading games...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 animate-bubble-in">No games match your filters.</div>
        ) : (
          <div key={filterKey} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((game, idx) => {
              const onClick = (e: React.MouseEvent) => {
                if (!game.link) return;
                e.preventDefault();
                openGame(game.link);
              };
              return (
                <div
                  key={game.id}
                  onClick={onClick}
                  className={`game-slot-filled aspect-[3/4] flex flex-col relative group ${
                    filtersActive ? "animate-bubble-in card-sheen" : ""
                  }`}
                  style={filtersActive ? { animationDelay: `${Math.min(idx * 20, 400)}ms` } : undefined}
                >
                  <button
                    onClick={(e) => handleToggleFav(e, game.id)}
                    className="absolute top-1.5 right-1.5 z-[2] p-1 rounded-full bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={isFavorite(game.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${isFavorite(game.id) ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
                  </button>
                  {game.image ? (
                    <img src={game.image} alt={game.name} className="w-full h-3/4 object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-3/4 bg-muted flex items-center justify-center">
                      <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 px-2 py-1.5 flex items-start gap-1 min-h-0">
                    <p className="text-[13px] leading-tight font-medium text-foreground flex-1 line-clamp-2 break-words">
                      {game.name}
                    </p>
                    {game.link && <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <ScrollButtons />
    </div>
  );
};

export default Index;
