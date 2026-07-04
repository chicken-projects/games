import { useState, useMemo, useEffect, useRef, MouseEvent, useCallback } from "react";
import { Search, Gamepad, Heart, Filter, Check, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGamesData } from "@/data/games";
import { NOTICE_URL } from "@/data/config";
import { ScrollButtons } from "@/components/ScrollButtons";
import { SettingsMenu } from "@/components/SettingsMenu";
import { DisguiseButton } from "@/components/DisguiseButton";
import { GameGrid } from "@/components/GameGrid";
import { StarLayer, useStarShimmer } from "@/components/StarShimmer";
import { openGame } from "@/utils/about-blank";
import { useFavorites } from "@/hooks/use-favorites";
import { getSpoofSettings, resolveFaviconUrl } from "@/hooks/use-spoof";

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
  const { data, loading } = useGamesData();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showFavs, setShowFavs] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState("right");
  const { toggle, isFavorite, count, favorites } = useFavorites();
  const { bursts: searchBursts, emit: emitSearch } = useStarShimmer();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const menuOpen = searchOpen || settingsOpen;

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
    if (data.genres.length) return data.genres.slice().sort((a, b) => b.priority - a.priority);
    return [];
  }, [data.genres]);

  useEffect(() => {
    fetch(NOTICE_URL, { cache: "no-store" })
      .then((r) => r.ok ? r.text() : "")
      .then((t) => setNotice(t.trim()))
      .catch(() => setNotice(""));
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 250);
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSearchOpen(false); setSettingsOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const filtered = useMemo(() => {
    let list = data.games;
    if (showFavs) list = list.filter((g) => favorites.includes(g.id));
    if (selectedGenres.length > 0) list = list.filter((g) => typeof g.genre === "number" && selectedGenres.includes(g.genre));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    return list;
  }, [search, showFavs, favorites, selectedGenres, data.games]);

  // If filtering/search active, flatten (ignore group mode)
  const filtersActive = search.trim().length > 0 || showFavs || selectedGenres.length > 0;
  const gridData = filtersActive ? { ...data, mode: "off" as const } : data;

  const toggleGenre = (id: number) =>
    setSelectedGenres((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);

  const handleToggleFav = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation(); toggle(id);
  };

  const openSearch = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSearchOrigin(`${rect.left + rect.width / 2}px`);
    setSettingsOpen(false);
    setSearchOpen(true);
  };
  const openSettings = (e: MouseEvent) => {
    setSearchOpen(false);
    setSettingsOpen(true);
    // origin handled inside SettingsMenu
    void e;
  };

  // Emit stars on panel clicks
  const handleSearchPanelClick = (e: React.MouseEvent) => {
    const rect = searchPanelRef.current?.getBoundingClientRect();
    if (rect) emitSearch(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 h-[62px]">
          {/* Always-visible Games logo */}
          <div className="flex items-center gap-2 shrink-0 z-30">
            <Gamepad className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Games</h1>
          </div>

          {/* Pills (hidden while a menu is open) */}
          <div className={`flex items-center gap-1.5 flex-1 transition-opacity duration-200 ${menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <button
              onClick={() => setShowFavs(!showFavs)}
              className={`header-pill ${showFavs ? "active" : ""}`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavs ? "fill-current" : ""}`} />
              Favorites ({count})
            </button>
            {genres.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`header-pill ${selectedGenres.length > 0 ? "active" : ""}`}>
                    <Filter className="w-3.5 h-3.5" />
                    {selectedGenres.length > 0 ? `Genres (${selectedGenres.length})` : "Genres"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1.5 max-h-80 overflow-auto" align="start">
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        selectedGenres.includes(g.id) ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selectedGenres.includes(g.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      {g.name}
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

            {notice && (
              <div className="header-pill max-w-xs truncate cursor-default hover:scale-100">
                {renderNotice(notice)}
              </div>
            )}

            <div className="flex-1" />

            <button onClick={openSearch} className="header-pill" title="Search">
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <DisguiseButton />
            <SettingsMenu open={false} onOpen={openSettings} onClose={() => setSettingsOpen(false)} />
          </div>

          {/* Expanding menu container — sits to the right of Games logo */}
          {menuOpen && (
            <div className="absolute inset-y-2 left-[130px] right-4 z-30">
              {searchOpen && (
                <div
                  ref={searchPanelRef}
                  onClick={handleSearchPanelClick}
                  className="relative h-full w-full bubble-expand overflow-hidden rounded-full border border-border bg-secondary/95 backdrop-blur-md shadow-xl px-4 flex items-center gap-3"
                  style={{ ["--origin-x" as string]: searchOrigin }}
                >
                  <StarLayer bursts={searchBursts} />
                  <Search className="w-4 h-4 text-primary shrink-0" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search games..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 h-8 bg-transparent border-none rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-xs text-muted-foreground hover:text-foreground px-2">Clear</button>
                  )}
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 rounded-full hover:bg-background/40 transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {settingsOpen && (
                <SettingsMenu open={true} onOpen={() => {}} onClose={() => setSettingsOpen(false)} />
              )}
            </div>
          )}
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Overlay that swallows game clicks while a menu is open */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => { setSearchOpen(false); setSettingsOpen(false); }}
          />
        )}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading games...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No games match your filters.</div>
        ) : (
          <GameGrid
            data={gridData}
            games={filtered}
            onOpen={openGame}
            isFavorite={isFavorite}
            onToggleFav={handleToggleFav}
            gamesDisabled={menuOpen}
          />
        )}
      </main>
      <ScrollButtons />
    </div>
  );
};

export default Index;
