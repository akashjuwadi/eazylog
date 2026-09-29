# EazyLog — UI prototype

A Next.js (App Router) + Tailwind UI build-out of the EazyLog PRD. This is a **UI/UX prototype**: every screen is real React/TSX, styled and interactive at the component level (tabs, steppers, quantity pickers, nav), but nothing is wired to a backend or AI model yet — all data comes from `lib/mock-data.ts`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app renders inside a fixed-width phone shell (it's a mobile product), centered on a dark backdrop when your browser is wider than ~430px.

## Screens included

- `/onboarding` — 4-step flow: goal → about you → calorie target → macro goals
- `/` — Today's dashboard: calorie hero, macro tiles, meal list, frequent-combo nudge, "finish today's log"
- `/log` — Log Food sheet with 4 tabs: Photo, Voice, Search, Saved meals
- `/history` — Editable food log (edit / duplicate / delete affordances)
- `/calendar` — Month grid with crown / logged / partial / missed day states, streak stats
- `/day-complete` — End-of-day celebration (the `day_completed` event from the PRD)

## Design notes

- **Palette**: near-black charcoal (`#14161B`) surface with a warm gold accent (`#E8B23D`) tied to the crown/achievement motif, a cool blue for protein, green for fiber/success, and a muted red reserved for "missed" states — not a decoration, a status language.
- **Type**: Space Grotesk for numerals and headlines (tabular figures for calorie/macro counts that need to feel stable as they update), Inter for UI text.
- **Layout**: mobile app shell throughout, flat cards with hairline borders rather than heavy shadows, one pill-shaped accent (the floating "+" log button) as the single bold gesture per screen.

## What's stubbed / not functional yet

- Photo capture, voice recording, and AI parsing are static mock states (tap through them)
- Search returns one hardcoded result for any query
- No auth, persistence, or real calorie/macro calculation logic
- No backend — everything reads from `lib/mock-data.ts`

## Structure

```
app/
  layout.tsx          — fonts, phone-shell wrapper
  page.tsx             — home dashboard
  onboarding/page.tsx
  log/page.tsx
  history/page.tsx
  calendar/page.tsx
  day-complete/page.tsx
components/
  BottomNav.tsx, TopBar.tsx, ProgressBar.tsx, Crown.tsx
lib/
  mock-data.ts
```
