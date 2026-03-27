# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Map

ApolloOS is the analytics dashboard for Apollo S2L (speed-to-lead AI system).

| Platform  | Name                  | URL / Ref                                              |
|-----------|-----------------------|--------------------------------------------------------|
| GitHub    | apolloos-insights     | github.com/davidstorer83/apolloos-insights             |
| Netlify   | apolloos-dashboard    | apolloos-dashboard.netlify.app                         |
| Supabase  | apollo-s2l-prod       | Supabase project (env vars in .env)                    |
| N8N       | ApolloOS — *          | Workflows prefixed "ApolloOS —"                        |
| GHL       | Apollo TEXT First      | Workflow folder in GoHighLevel                         |

## Commands

```bash
npm run dev          # start Vite dev server (localhost:8080)
npm run build        # production build → dist/
npm run lint         # ESLint
npm run test         # run tests once (vitest)
npm run test:watch   # vitest in watch mode
```

Netlify auto-deploys on push to `main`. No manual deploy needed.

## Environment

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Both vars are required at runtime — the Supabase client (`src/lib/supabase.ts`) will throw if they're missing. Same vars are set in Netlify environment variables for production.

## Architecture

ApolloOS is a single-page analytics dashboard for an AI speed-to-lead system. It tracks two engagement systems:

- **Text-first:** Lead → SMS → ConvoAI → conversation → CTA → call request or text booking
- **Voice-first:** Lead → immediate Retell call → qualification → booking or follow-up sequence

### Three tabs + persistent sales pipeline

- **Overview** — combined metrics across both systems, side-by-side comparison
- **Voice** — voice-first system metrics + calls triggered from text system
- **Text** — text-first system metrics including SMS, ConvoAI, and crossover calls
- **Sales Pipeline** — always visible at bottom, tracks booked → showed → offered → closed

### Supabase tables (apollo-s2l-prod)

| Table          | Purpose                                    | Data source              |
|----------------|--------------------------------------------|--------------------------|
| leads          | One row per lead, attribution, journey     | GHL webhook → N8N        |
| calls          | One row per Retell call attempt            | Sympana → GHL → N8N      |
| sms_events     | Every SMS sent and received per lead       | GHL webhook → N8N        |
| appointments   | Booked strategy sessions + sales outcomes  | Cal.com webhook + manual |
| events_log     | Activity feed, every meaningful event      | All sources via N8N      |
| ad_metrics     | Daily Meta Ads campaign-level metrics      | Meta API → N8N scheduled |

### Key fields for system separation

- `leads.engagement_method` — 'text_first' or 'voice_first'
- `calls.engagement_method` — inherited from lead
- `calls.call_trigger` — 'convo_ai_request' | 'scheduled_callback' | 'immediate' | 'sequence_attempt'
- `appointments.booking_source` — 'retell_from_text' | 'convo_ai_text' | 'retell_direct' | 'retell_sequence' | 'manual'

### Supabase views

| View                  | Purpose                                        |
|-----------------------|------------------------------------------------|
| v_attribution_funnel  | Ad → lead → call → sale, grouped by campaign   |
| v_campaign_roas       | Campaign spend vs revenue for ROAS calculation  |
| v_system_comparison   | Text-first vs voice-first side-by-side metrics  |
| v_text_funnel         | Full text-first journey with conversion rates   |
| v_voice_funnel        | Full voice-first journey with conversion rates  |

## Data flow

```
Lead sources (Meta, website, organic)
  → GHL (CRM, SMS, ConvoAI)
    → Sympana/Retell (voice calls)
    → N8N (webhooks, data routing)
      → Supabase (data storage)
        → ApolloOS dashboard (reads and displays)
```

N8N receives webhooks from GHL and writes to Supabase. The dashboard reads from Supabase. Claude Code edits code → pushes to GitHub → Netlify auto-deploys.

## Component model

- `src/pages/Index.tsx` — shell: sticky header, tab switcher, lead source filter pills, tab content, SalesPipeline
- `src/components/dashboard/` — one file per tab plus shared primitives:
  - `OverviewTab` — combined metrics, system comparison, combined funnel
  - `VoiceTab` — LIVE DATA from Supabase calls table via `useVoiceData` hook
  - `TextTab` — currently mock data, will wire to sms_events + leads
  - `SalesPipeline` — currently mock data, will wire to appointments
  - `KPICard` — metric card with optional sparkline, trend, prefix/suffix
  - `FunnelCard` — percentage metric with progress bar
  - `Sparkline` — thin recharts AreaChart wrapper
- `src/components/ui/` — shadcn/ui components (do not edit)
- `src/data/mockData.ts` — mock data for tabs not yet wired to Supabase (to be removed)

## Styling

Tailwind with custom apollo theme tokens (defined in `tailwind.config.ts`):

- `bg-apollo-dark` (#09090b) — page background
- `bg-apollo-card` / `border-apollo-card-border` — card surfaces
- `text-apollo-cyan` (#14e6eb) / `text-apollo-green` (#34d399) — accent colors
- `gradient-text` — CSS class for the cyan→green brand gradient

## Adding a new live data hook

Follow the pattern in `src/hooks/useVoiceData.ts`:

1. Import `supabase` from `@/lib/supabase`
2. Fetch in a `useEffect`, compute derived state locally
3. Return typed shape with `loading` and `error` fields
4. Replace the mock import in the corresponding tab component

## N8N workflow naming convention

All workflows for this project use the prefix: `ApolloOS —`

- `ApolloOS — 1. Post Call Data Logger` (live, receiving Sympana data)
- `ApolloOS — 2. New Lead Logger` (to build)
- `ApolloOS — 3. SMS Event Logger` (to build)
- `ApolloOS — 4. Cal.com Booking Handler` (to build)
- `ApolloOS — 5. Meta Ads Daily Pull` (to build)

## Team

- David — architecture, strategy, sales closes, Claude Code
- Sachin — GHL, N8N, Retell/Sympana operations
- Rolve — marketing, Meta ads, lead gen
- Dan — prompt engineering, Cal.com/Retell integration
