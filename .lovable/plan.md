## Problem

The YouTube page's search fails because the public Piped API instances are unreliable — they frequently return errors, get rate-limited, or block cross-origin browser requests (CORS). Hardcoding a list of instances is fragile.

## Plan

Rework `public/yt.html` search to be resilient:

1. **Fetch a live instance list** from `https://piped-instances.kavin.rocks/` (a maintained JSON registry) on page load, cache it in `localStorage` for 6h, and fall back to a hardcoded list if the registry itself fails.
2. **Add Invidious as a secondary backend.** If every Piped instance fails, try a rotating list of Invidious instances (`/api/v1/search?q=...&type=video`). Normalize both response shapes into one internal format.
3. **Race requests in parallel** across the top 4–5 healthy instances (whichever responds first wins) instead of serial fallback, so one slow instance doesn't stall the whole search.
4. **Show a real error message** with a Retry button when all backends fail, instead of the generic "Search failed" line. Include which backend was tried.
5. **Keep the "Paste Link" tab as the guaranteed path** — it never depends on any API. Surface a hint pointing to it when search fails.

No changes to playback (still YouTube embed), no API key required, no other files touched.

## Technical notes

- Single file edit: `public/yt.html`.
- `Promise.any` for racing; `AbortController` to cancel losers.
- Instance health cached under `localStorage['yt_instances_v1']` with a timestamp.
- Invidious response uses `videoId`, `title`, `author`, `lengthSeconds`, `videoThumbnails[]`; Piped uses `url`, `title`, `uploaderName`, `duration`, `thumbnail`. Normalize both to `{id, title, uploader, duration, thumb}`.
