

## Updated Plan

Same as the previous plan, with one change:

**Spoof defaults** — The default title and favicon will be **Google Classroom**, not Google:
- Default title: `"Google Classroom"`
- Default favicon: `https://classroom.google.com/favicon.ico`

This applies to:
- `src/hooks/use-spoof.ts` — default values
- `src/utils/about-blank.ts` — fallback constants
- `src/components/SpoofSettings.tsx` — placeholder text

Everything else (favorites limit removal, YouTube page, about:blank improvements, spoof settings UI) remains unchanged from the previous plan.

