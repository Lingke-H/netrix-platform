# NeTrix Programme Status

`STATUS.md` records the current operating state of the NeTrix project. It is not a strategy memo and should not restate the full product thesis. Its purpose is to show what has been decided, what remains open, and what the next execution sequence should be.

## Current Snapshot

NeTrix has been in development and exploration for approximately two to three months. The team has grown from two members to five, and the early discovery process has produced multiple rounds of brainstorming material, local project notes, and approximately 60 preliminary survey responses.

The project owner has now locked the working direction: NeTrix is an AI-assisted academic connection network for UNNC students. The first MVP should focus on Math, Computer Science, and EEE students, with a post feed as the primary experience and AI-assisted academic profile and connection recommendation as the main differentiator.

The repository has been reset into a direction-first structure and now includes a fresh scaffold baseline under `apps/web`. Earlier web scaffold files, preliminary Supabase schema files, cyber-network concepts, AI Oracle flows, and outdated planning documents were removed because they no longer represent the current product direction.

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
| MVP planning | Chinese Dev operating documents have been added under `docs/dev/`, and the scaffold baseline has been created in `apps/web` with the first MVP stack locked as Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Drizzle, server-side LLM access, and `corepack pnpm`. | Begin the first layer-split development sprint on top of the existing scaffold baseline. |
| User validation | The 60-response survey has been analysed at aggregate level in `docs/business/survey-analysis/`; results remain exploratory early evidence rather than conclusive proof. | Targeted interviews with Math, CS, and EEE students. |
| Content seeding | Post types are defined, but initial topics and seed content have not yet been selected. | First batch of Q&A, Resource, and Experience Sharing seed topics. |
| Recommendation logic | The first recommendation approach is defined as rule-based candidate generation and transparent scoring, followed by LLM-generated explanation through a server-side wrapper. | Implement the initial recommendation service, prompt schema, and demo data. |

## Near-Term Execution Sequence

The Biz reference folder has now been initiated. It includes guidance for business-plan structure, CVP, USP, revenue-model hypotheses, survey-data usage, market validation, and pitch narrative. The Dev operating manual has also been initiated in Chinese under `docs/dev/`, and the first application scaffold now exists in `apps/web`.

The Biz team should use the existing survey responses as early evidence and conduct targeted interviews with Math, CS, and EEE students. In parallel, the Dev team should branch from `main` and develop on the scaffold baseline according to `docs/dev/`: `apps/web`, Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Drizzle, server-side LLM access, and layer-split collaboration.

The first implementation milestone should be a demonstrable end-to-end path: a verified student creates or reads academic posts, completes an academic profile, receives explainable recommended profiles, sends a connection request, and messages only after acceptance.

## Verification Status

The repository now contains executable application scaffold code under `apps/web`. The current baseline includes route skeletons, shared DTO and schema files, Drizzle table skeletons, AI schema placeholders, environment-variable examples, and root package scripts for the web app.

The current verification family is active and passing at scaffold level: `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`, and `corepack pnpm test:e2e`. The current E2E script is a baseline placeholder with no scenario file yet; subsequent feature work should replace that placeholder with real end-to-end coverage.
