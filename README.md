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
