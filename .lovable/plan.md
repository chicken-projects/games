This is a big set of changes. Grouping into 5 areas.

## 1. Header interactions

- Remove bubble/sheen animation on search results — cards appear instantly.
- Search bar: click → expands as a bubble (from the icon origin) to fill the full header width **except** the "Games" logo+text on the left. Bubble easing, ~350ms. Close on outside click, Esc, or a small × on the right.
- Settings: same behavior — expands sideways from the Settings button to engulf the whole header except "Games" text. Same bubble animation, same close rules.
- While either menu is open, an invisible overlay covers the grid so clicking a game only closes the menu (does not launch the game).
- Tiny-star shimmer: a burst of ~14 small twinkling star particles emitted from the click point, drifting outward and fading (~700ms). Runs on open for both menus.

## 2. Settings menu contents

- Move **Disguise (about:blank cloak)** button out of Settings into the header, next to the Settings button (its own pill with the external-link icon).
- Open-behavior toggle: replace the on/off Switch with a **text toggle** — two pill segments "New window" | "Current window", the active one filled with primary color.
- Keep Tab title, Favicon domain, Export, Import, Reset in Settings.

## 3. "Current window" in-game minimized header

When `openBehavior === "current-window"` AND a game has been launched in the same tab:
- We replace the document with the game wrapper (existing behavior), so this UI applies to the wrapper page's top bar.
- The wrapper renders a minimal header containing:
  - A **Back button** to the left of the "Games" text. Collapsed = just the arrow icon; on hover it expands rightward to reveal the word "Back" with a smooth width transition.
  - The "Games" text (no gamepad icon).
  - A **search icon only** (click expands into the same bubble search on the wrapper — but for the wrapper we keep it simple: clicking Back returns to the library).
- No favorites pill, no genres pill, no notice pill, no gamepad icon.

## 4. Grouped, variable-size game grid

New `games.json` schema (backward compatible):

```json
{
  "mode": "groups",              // "groups" | "genres" | "off"
  "groups": [
    { "id": 1, "name": "Featured", "priority": 100 },
    { "id": 2, "name": "Mario",    "priority": 90 }
  ],
  "genres": [
    { "id": 1, "name": "Platformer", "priority": 90 },
    { "id": 2, "name": "Racing",     "priority": 80 }
  ],
  "games": [
    { "id": 1, "name": "Slope", "link": "...", "image": "...",
      "genre": 1, "group": 1, "size": "landscape" }
  ]
}
```

Rules:
- `mode: "off"` → current flat grid.
- `mode: "genres"` → group cards by genre, ordered by genre `priority` desc.
- `mode: "groups"` → every game **must** have a `group` id; groups ordered by `priority` desc.
- Each group renders as a bordered section with the group name inset into the top border (fieldset-style).
- Sizes (CSS grid spans, base cell = 1×1 portrait card):
  - default: 1 col × 1 row
  - `landscape`: 2 cols × 1 row
  - `portrait`:  1 col × 2 rows (≈1.5 slots — using 2 rows for a clean grid)
  - `square`:    2 cols × 2 rows
- Uses `grid-auto-flow: dense` so small tiles fill gaps.

## 5. Revised `public/games.json`

- Convert to the new schema with `mode: "groups"`.
- Define curated groups such as: Featured, Mario, Pokémon, FNAF, Subway Surfers, Bloons/TD, Racing & Driving, Shooters, Retro/Arcade, Physics & Puzzle, Horror, IO, Sandbox, Sports, Everything Else.
- Give each group a priority (Featured highest).
- Preserve existing `genre` values, and add a `genres` registry with priorities.
- "Make well-known games pop" = assign larger `size` (landscape/square) to popular titles (Slope, Slope 2, Cookie Clicker, Retro Bowl, Subway Surfers, Bloons TD 6, Super Mario 64, FNAF, Pokémon Emerald, Minecraft-likes, etc.). Everything else stays default.

## Files to touch

- `src/pages/Index.tsx` — new expanding search bubble, overlay, remove filter animation, minimized header mode, star-shimmer trigger, grid rendering via new group renderer.
- `src/components/SettingsMenu.tsx` — bubble expansion, star shimmer, text toggle, remove Disguise (moves out).
- `src/components/DisguiseButton.tsx` (new) — standalone pill.
- `src/components/StarShimmer.tsx` (new) — particle burst helper.
- `src/components/GameGrid.tsx` (new) — handles modes/groups/sizes.
- `src/data/gameTypes.ts` — new interfaces (Group, Genre, size).
- `src/data/games.ts` — load new-shape JSON; back-compat if array.
- `src/utils/about-blank.ts` — pass a flag so the wrapper renders minimized header + back link.
- `src/index.css` — remove bubble/sheen for filters; add bubble-expand keyframes, star keyframes, fieldset border style.
- `public/games.json` — rewritten to new schema.

## Ambiguity I'm resolving by choice (call out if wrong)

- **Star shimmer** = light particle burst from click point (not a continuous background). If you wanted a sweeping star field across the whole menu instead, say the word.
- **Portrait size** rendered as 1×2 (double-tall) since "1.5 slots" doesn't map cleanly to a grid. Square rendered as 2×2.
- **Disguise button** placed as a pill immediately to the left of Settings in the header.
- **In-game wrapper search icon** just acts as a back-to-library button (no separate live search inside the game frame).
