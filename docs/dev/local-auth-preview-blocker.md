# Local Auth Preview Blocker

## Summary

When previewing protected NeTrix pages locally, routes such as `/feed`, `/recommendations`, `/connections`, and `/messages/[threadId]` may all redirect to `/auth` instead of showing the feature pages.

Observed example:

```text
http://localhost:3000/auth?error=supabase-env-missing&next=%2Frecommendations
```

This is not a Dev A frontend flow regression. It is the expected result of the current `main` auth gate when Supabase environment variables are missing.

## Why It Happens

The current application now uses real Supabase Auth for protected pages and server actions. Before a page can render, the auth layer tries to resolve the current verified campus user session.

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, `createSupabaseSessionClient()` throws `SUPABASE_ENV_MISSING`. The protected-route helpers then redirect to `/auth` with:

```text
error=supabase-env-missing
```

So the browser showing the sign-in page for every protected route means the local auth environment is incomplete.

## Affected Preview Routes

These pages require auth and will not show their real content with empty Supabase config:

- `/feed`
- `/recommendations`
- `/connections`
- `/messages/[threadId]`
- `/me`
- `/profiles/[id]`
- `/posts/new`
- `/posts/[id]`
- `/library`

## Current Local Observation

In the local preview environment where this was discovered:

- `apps/web/.env.local` did not exist.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were empty.
- `DATABASE_URL` was empty.
- Local Supabase was not running.
- Docker and Supabase CLI were not available on the machine.

Because of that, the app could start with `corepack pnpm dev`, but protected pages could not pass the auth gate.

## How To Fix For Real Local Preview

Create `apps/web/.env.local` from `apps/web/.env.example` and fill at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
APP_BASE_URL=http://localhost:3000
```

Then make sure the database has the required schema and demo data:

1. Apply migrations from `supabase/migrations/`.
2. Seed demo data from `supabase/seed/seed.ts`.
3. Configure Supabase Auth redirect URL to include:

```text
http://localhost:3000/auth/callback
```

After that, open `/auth`, sign in with an allowed `@nottingham.edu.cn` email, and revisit the protected page.

## Demo Bypass Option

The codebase contains a local/E2E demo bypass path guarded by:

```bash
NETRIX_ENABLE_DEMO_AUTH_BYPASS=true
NETRIX_DEMO_AUTH_BYPASS_USER_ID=10000000-0000-4000-8000-000000000001
```

However, this still requires `DATABASE_URL` and seeded demo users because the bypass loads the configured demo user from the database. It does not remove the database dependency.

Do not enable demo bypass in production.

## What Dev A Should Know

The Dev A UX work on recommendations, connections, messages, and feed sidecar can only be visually reviewed after auth/session resolution works.

If every protected route renders `/auth?error=supabase-env-missing`, review cannot yet validate the A frontend changes. First fix local Supabase env/database, then preview:

- `/feed`
- `/recommendations`
- `/connections`
- `/messages/10000000-0000-4000-8000-000000000701`

## Handoff Checklist

Before asking another developer to review the local preview, confirm:

- `apps/web/.env.local` exists.
- Supabase public URL and anon key are set.
- `DATABASE_URL` points to a reachable Postgres/Supabase database.
- Migrations have been applied.
- Demo seed data has been inserted if using seeded demo routes.
- Demo bypass is either disabled or points to a seeded user.
- `/api/health` does not report missing Supabase/database configuration.

