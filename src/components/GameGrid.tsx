import { Gamepad2, ExternalLink, Heart } from "lucide-react";
import { Game, GamesData, GroupDef, GenreDef } from "@/data/gameTypes";

interface Section {
  id: number;
  name: string;
  games: Game[];
}

function sizeClass(game: Game, index: number, sectionId = 0) {
  const seed = (game.id * 7 + index * 3 + sectionId) % 12;
  const size = game.size;

  if (size === "square") return seed % 3 === 0 ? "size-hero" : "size-square";
  if (size === "landscape") return seed % 4 === 0 ? "size-wide" : seed % 4 === 1 ? "size-strip" : "size-landscape";
  if (size === "portrait") return seed % 2 === 0 ? "size-tall" : "size-portrait";

  const pattern = ["size-default", "size-mini", "size-default", "size-landscape", "size-default", "size-tall", "size-mini", "size-default", "size-wide", "size-default", "size-portrait", "size-default"];
  return pattern[seed];
}

function legacySizeClass(size?: string) {
  switch (size) {
    case "mini": return "size-mini";
    case "landscape": return "size-landscape";
    case "portrait":  return "size-portrait";
    case "square":    return "size-square";
    case "wide":      return "size-wide";
    case "tall":      return "size-tall";
    case "hero":      return "size-hero";
    case "strip":     return "size-strip";
    default:          return "size-default";
  }
}

interface Props {
  data: GamesData;
  games: Game[];                    // possibly filtered
  onOpen: (link: string) => void;
  isFavorite: (id: number) => boolean;
  onToggleFav: (e: React.MouseEvent, id: number) => void;
  /** true when a header menu is open — prevent game clicks */
  gamesDisabled?: boolean;
}

function buildSections(mode: GamesData["mode"], games: Game[], groups: GroupDef[], genres: GenreDef[]): Section[] | null {
  if (mode === "off") return null;
  if (mode === "groups") {
    const byId = new Map<number, Game[]>();
    games.forEach((g) => {
      const gid = g.group ?? 0;
      if (!byId.has(gid)) byId.set(gid, []);
      byId.get(gid)!.push(g);
    });
    return groups
      .slice()
      .sort((a, b) => b.priority - a.priority)
      .map((gr) => ({ id: gr.id, name: gr.name, games: byId.get(gr.id) || [] }))
      .filter((s) => s.games.length > 0);
  }
  // genres
  const byId = new Map<number | string, Game[]>();
  games.forEach((g) => {
    const key = g.genre ?? "Other";
    if (!byId.has(key)) byId.set(key, []);
    byId.get(key)!.push(g);
  });
  return genres
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .map((ge) => ({ id: ge.id, name: ge.name, games: byId.get(ge.id) || [] }))
    .filter((s) => s.games.length > 0);
}

function Card({
  game, index, sectionId, onOpen, isFavorite, onToggleFav, gamesDisabled,
}: {
  game: Game;
  index: number;
  sectionId?: number;
  onOpen: (link: string) => void;
  isFavorite: (id: number) => boolean;
  onToggleFav: (e: React.MouseEvent, id: number) => void;
  gamesDisabled?: boolean;
}) {
  return (
    <div
      onClick={(e) => {
        if (gamesDisabled) { e.preventDefault(); e.stopPropagation(); return; }
        if (game.link) { e.preventDefault(); onOpen(game.link); }
      }}
      className={`game-slot-filled ${sectionId === undefined ? legacySizeClass(game.size) : sizeClass(game, index, sectionId)} flex flex-col relative group`}
    >
      <button
        onClick={(e) => onToggleFav(e, game.id)}
        className="absolute top-1.5 right-1.5 z-[2] p-1 rounded-full bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={isFavorite(game.id) ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`w-3.5 h-3.5 transition-colors ${isFavorite(game.id) ? "fill-destructive text-destructive" : "text-muted-foreground hover:text-destructive"}`} />
      </button>
      {game.image ? (
        <img src={game.image} alt={game.name} className="w-full flex-1 min-h-0 object-cover" loading="lazy" />
      ) : (
        <div className="w-full flex-1 min-h-0 bg-muted flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="game-card-title shrink-0 px-1.5 py-1 flex items-start gap-1">
        <p className="text-[10px] leading-tight font-medium text-foreground flex-1 line-clamp-2 break-words">
          {game.name}
        </p>
        {game.link && <ExternalLink className="w-2.5 h-2.5 text-muted-foreground shrink-0 mt-0.5" />}
      </div>
    </div>
  );
}

export function GameGrid({ data, games, onOpen, isFavorite, onToggleFav, gamesDisabled }: Props) {
  const sections = buildSections(data.mode, games, data.groups, data.genres);

  const gridProps = {
    className: "game-grid",
  };

  if (!sections) {
    return (
      <div {...gridProps}>
        {games.map((g) => (
          <Card key={g.id} game={g} index={0} game={g} onOpen={onOpen} isFavorite={isFavorite} onToggleFav={onToggleFav} gamesDisabled={gamesDisabled} />
        ))}
      </div>
    );
  }

  return (
    <div className="game-sections">
      {sections.map((section) => (
        <fieldset key={section.id} className="game-group-fieldset">
          <legend className="game-group-legend">{section.name}</legend>
          <div {...gridProps}>
            {section.games.map((g, index) => (
              <Card key={g.id} game={g} index={index} sectionId={section.id} onOpen={onOpen} isFavorite={isFavorite} onToggleFav={onToggleFav} gamesDisabled={gamesDisabled} />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
