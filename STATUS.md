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
| Content seeding | Demo seed data now covers verified users, academic profiles, Q&A, Resource, and Experience posts, a persisted recommendation, an accepted connection, a message thread, and starter messages. | Expand seed coverage into resource-library items and additional Math / CS / EEE interview-test scenarios. |
| Recommendation logic | The initial recommendation service now combines transparent rule scoring with persisted recommendation cards, OpenAI provider activation, and demo recommendation data. | Add production-grade generation job tracking, monitoring, and richer post-derived recommendation signals. |
| Authentication and onboarding gates | `/auth` now uses Supabase campus email link sign-in and callback handling, demo auth bypass is restricted to local development or explicit Playwright E2E runs, protected pages/actions now redirect through auth/onboarding, and `/api/health` now reports deployment readiness for Supabase and database configuration. | Run the checklist against the selected hosted Supabase project and fix any failed health checks before user testing. |

## Near-Term Execution Sequence

The Biz reference folder has now been initiated. It includes guidance for business-plan structure, CVP, USP, revenue-model hypotheses, survey-data usage, market validation, and pitch narrative. The Dev operating manual has also been initiated in Chinese under `docs/dev/`, and the first application scaffold now exists in `apps/web`.

The Biz team should use the existing survey responses as early evidence and conduct targeted interviews with Math, CS, and EEE students. In parallel, the Dev team should branch from `main` and develop on the scaffold baseline according to `docs/dev/`: `apps/web`, Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Drizzle, server-side LLM access, and layer-split collaboration.

The first implementation milestone should be a demonstrable end-to-end path: a verified student creates or reads academic posts, completes an academic profile, receives explainable recommended profiles, sends a connection request, and messages only after acceptance.

## Verification Status

The repository now contains executable application scaffold code under `apps/web`. The current baseline includes route skeletons, shared DTO and schema files, Drizzle table skeletons, AI schema placeholders, environment-variable examples, and root package scripts for the web app.

During the latest AI/recommendation workstream update, the shared AI boundary was tightened further with a unified `apps/web/src/server/ai` export surface, task-based model/provider selection for the SillyTavern-compatible deployment path, prompt builders, an execution/request layer, response parsing, job-state helpers, output-structure validation, transparent recommendation scoring, a minimal core recommendation path, event-recording helpers, persisted recommendation cards, and OpenAI provider activation. The AI flow now includes nickname, academic portrait, and recommendation-explanation paths with dedicated schema validation and tests, and demo seed data now exercises the first loop from posts and profiles through recommendations, accepted connections, and messages.

The auth entry now uses Supabase email link sign-in for `@nottingham.edu.cn` accounts, exchanges callback codes through `/auth/callback`, provisions the application user row from verified Supabase sessions, and keeps demo bypass available only for local development or explicit E2E support.

Protected route and server-action entry points now share auth/onboarding redirect helpers. Feed, post detail, profile detail, current-profile, onboarding, new-post, recommendation, connection, and message routes redirect unauthenticated users to `/auth?next=...`; profile-required actions and pages route users through onboarding instead of surfacing raw server errors.

Deployment readiness now has a dedicated checklist in `docs/dev/supabase-deployment-checklist.md` and a runtime `/api/health` response covering required environment variables, expected Supabase auth callback URL, database connectivity, and service role validation without exposing secrets.

The current verification family is active: `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`, and `corepack pnpm test:e2e`. The E2E suite now includes a real Playwright scenario for the seeded posts -> profile -> recommendation -> accepted connection -> message path. When `DATABASE_URL` is unavailable, the E2E scenario is explicitly skipped rather than treated as a missing-test success.
