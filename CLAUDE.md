# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Vite dev server (localhost:5173)
npm run build        # production build → dist/
npm run lint         # ESLint
npm run test         # run tests once (vitest)
npm run test:watch   # vitest in watch mode
```

Deploy to production:
```bash
netlify deploy --build --prod   # requires netlify CLI linked to site
```

The Netlify site (`apolloos-dashboard`) is connected to this repo. Netlify auto-deploys on push to `main`, but you can also trigger manually with the command above.

## Environment

Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Both vars are required at runtime — the Supabase client (`src/lib/supabase.ts`) will throw if they're missing.

## Architecture

**ApolloOS** is a single-page analytics dashboard for an AI speed-to-lead system. It has three tabs (Overview, Voice, Text) plus a persistent Sales Pipeline section below.

### Data flow

- **Voice tab** — the only tab wired to live Supabase data. `src/hooks/useVoiceData.ts` fetches from the `calls` table and computes all KPIs, sparklines, sentiment, outcomes, and period-over-period changes client-side. All other tabs (Overview, Text, Sales Pipeline) still consume `src/data/mockData.ts`.
- **Supabase project**: `apollo-s2l-prod`. Tables: `leads`, `calls`, `appointments`, `events_log`, `ad_metrics`. The `calls` table receives live data from Retell voice agent calls via N8N webhooks.
- The `disposition` field in `calls` arrives as a raw Sympana string (`"call_outcome: voicemail,\ncallback_time: ,"`). `parseDisposition()` in `useVoiceData.ts` extracts the clean value.

### Component model

- `src/pages/Index.tsx` — shell: sticky header, tab switcher, lead source filter pills, tab content, SalesPipeline. Tab state is local `useState`.
- `src/components/dashboard/` — one file per tab (`OverviewTab`, `VoiceTab`, `TextTab`, `SalesPipeline`) plus shared primitives:
  - `KPICard` — metric card with optional sparkline, trend indicator, prefix/suffix. Inverts color logic for cost/DQ metrics.
  - `Sparkline` — thin recharts `AreaChart` wrapper used inside KPICard.
- `src/components/ui/` — shadcn/ui components (do not edit these).

### Styling

Tailwind with custom apollo theme tokens (defined in `tailwind.config.ts`):
- `bg-apollo-dark` (`#09090b`) — page background
- `bg-apollo-card` / `border-apollo-card-border` — card surfaces
- `text-apollo-cyan` (`#14e6eb`) / `text-apollo-green` (`#34d399`) — accent colors
- `gradient-text` — CSS class for the cyan→green brand gradient

### Adding a new live data hook

Follow the pattern in `src/hooks/useVoiceData.ts`:
1. Import `supabase` from `@/lib/supabase`
2. Fetch in a `useEffect`, compute derived state locally, return typed shape with `loading` and `error` fields
3. Replace the mock import in the corresponding tab component
