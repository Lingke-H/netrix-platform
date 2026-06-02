# NeTrix Programme Status

`STATUS.md` records the current operating state of the NeTrix project. It is not a strategy memo and should not restate the full product thesis. Its purpose is to show what has been decided, what remains open, and what the next execution sequence should be.

## Current Snapshot

NeTrix has been in development and exploration for approximately two to three months. The team has grown from two members to five, and the early discovery process has produced multiple rounds of brainstorming material, local project notes, and approximately 60 preliminary survey responses.

The project owner has now locked the working direction: NeTrix is an AI-assisted academic connection network for UNNC students. The first MVP should focus on Math, Computer Science, and EEE students, with a post feed as the primary experience and AI-assisted academic profile and connection recommendation as the main differentiator.

The repository has been reset into a direction-first structure. Earlier web scaffold files, preliminary Supabase schema files, cyber-network concepts, AI Oracle flows, and outdated planning documents have been removed because they no longer represent the current product direction.

## Decision Baseline

The current baseline is defined by three linked documents. `SPEC.md` is the operational source of truth for product and engineering decisions. `docs/strategy/direction-memo.md` is the strategic narrative baseline for business-plan and MVP planning. `AGENTS.md` defines how AI-assisted contributors should work inside the repository.

The core validation loop is:

```text
academic posts -> academic profiles -> AI-assisted recommendations -> academic connections
```

Business and technical work should now move from broad ideation into structured execution around this loop.

## Open Workstreams

| Workstream | Current State | Required Next Output |
| --- | --- | --- |
| Business planning | Biz guidance folder has been initiated, including BP structure, CVP, USP, revenue, survey analysis, validation, and pitch guidance. | First full business-plan draft based on the guidance folder. |
| MVP planning | Chinese Dev operating documents have been added under `docs/dev/`, with the first MVP stack locked as Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Drizzle, server-side LLM access, and `apps/web`. | Create the web MVP scaffold and begin the first layer-split development sprint. |
| User validation | The 60-response survey has been analysed at aggregate level in `docs/business/survey-analysis/`; results remain exploratory early evidence rather than conclusive proof. | Targeted interviews with Math, CS, and EEE students. |
| Content seeding | Post types are defined, but initial topics and seed content have not yet been selected. | First batch of Q&A, Resource, and Experience Sharing seed topics. |
| Recommendation logic | The first recommendation approach is defined as rule-based candidate generation and transparent scoring, followed by LLM-generated explanation through a server-side wrapper. | Implement the initial recommendation service, prompt schema, and demo data. |

## Near-Term Execution Sequence

The Biz reference folder has now been initiated. It includes guidance for business-plan structure, CVP, USP, revenue-model hypotheses, survey-data usage, market validation, and pitch narrative. The Dev operating manual has also been initiated in Chinese under `docs/dev/`.

The Biz team should use the existing survey responses as early evidence and conduct targeted interviews with Math, CS, and EEE students. In parallel, the Dev team should scaffold the MVP according to `docs/dev/`: `apps/web`, Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Drizzle, server-side LLM access, and layer-split collaboration.

The first implementation milestone should be a demonstrable end-to-end path: a verified student creates or reads academic posts, completes an academic profile, receives explainable recommended profiles, sends a connection request, and messages only after acceptance.

## Verification Status

The repository currently contains strategy, specification, and collaboration documents only. No executable application code is present, so no lint, typecheck, build, or test command is currently applicable.

When code is reintroduced, the Dev implementation plan defines the expected verification family: `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`, and database or E2E commands when their scripts exist.
