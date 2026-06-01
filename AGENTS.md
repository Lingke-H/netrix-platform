# NeTrix Agent Collaboration Protocol

This document defines the operating protocol for Codex and other AI-assisted contributors working inside the NeTrix repository. It exists to prevent accidental drift from the current product direction and to keep strategy, business planning, and MVP implementation aligned.

The latest explicit instruction from the project owner takes precedence over this document. However, durable changes to product direction, MVP scope, or technical architecture must be recorded in `SPEC.md` before downstream documents or implementation files are updated.

## Source Of Authority

Every task should begin by reading the repository canon in the following order:

| Source | Purpose |
| --- | --- |
| `SPEC.md` | Defines the current product direction, MVP boundaries, AI role, and engineering constraints. |
| `STATUS.md` | Records the current operating state, open workstreams, and near-term execution priorities. |
| `docs/strategy/DIRECTION_MEMO.md` | Provides the strategic narrative used by both business-plan and MVP planning work. |

Implementation or documentation changes must not contradict `SPEC.md`. If a task reveals that the specification no longer reflects the project owner's intent, update `SPEC.md` first and then propagate the change into other files.

## Product Constraint

NeTrix is currently defined as an AI-assisted academic connection network for UNNC students. The first validation wedge is Math, Computer Science, and EEE. The governing product loop is:

```text
academic posts -> academic profiles -> AI-assisted recommendations -> academic connections
```

New features, documents, and technical decisions should be evaluated by whether they strengthen this loop. Work that turns NeTrix into a generic campus forum, a generic AI chatbot, a static resource directory, or a broad campus super-app should be treated as out of scope unless the specification is explicitly revised.

## Technical Boundary

The repository is currently a direction-first workspace and does not retain the previous web scaffold. A future MVP may use Next.js, TypeScript, Tailwind CSS, and `corepack pnpm`, but those choices should be formalised in a Techno MVP implementation guide before code is reintroduced.

Contributors should avoid adding frameworks, external services, or heavy dependencies before the MVP architecture is documented. If package management is reintroduced, prefer commands invoked through `corepack pnpm` rather than assuming that a global `pnpm` binary is available.

## Documentation Standard

Repository documents should read as professional reference material rather than meeting notes. The preferred style is formal, native English with clear hierarchy, stable terminology, and explicit ownership of decisions, assumptions, and open questions. Internal Chinese notes may be used when the project owner requests them, but canonical repository files should remain coherent as a shared reference for Biz, Techno, and product contributors.

Business and strategy documents should distinguish evidence, assumptions, and recommendations. Technical documents should distinguish confirmed scope, proposed architecture, deferred work, and verification requirements. Unvalidated commercial claims should not be written as settled conclusions.

## Verification Standard

When the repository contains executable code, contributors must run verification commands appropriate to the scope of the change before delivery. The final response should state which checks were run and whether any residual risk remains. For documentation-only changes, it is acceptable to skip code verification, provided that the final response says so clearly.

If the future web MVP uses the previously discussed JavaScript toolchain, the likely verification family will include:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

The authoritative verification commands should be defined in the future Techno MVP implementation guide once the stack is finalised.

## Git And Collaboration Rules

Contributors must inspect the working tree before editing and must not overwrite user-created changes. Unrelated changes should not be bundled into the same commit. Direct pushes to `main` or `master` require explicit user instruction. When a branch is needed, use a human-readable branch name such as `<github-login>/<short-task>`.

Generated files, local build outputs, private logs, screenshots, recordings, `.env` files, API keys, student personal data, survey raw identifiers, private contact information, `.next/`, `dist/`, `out/`, and `*.tsbuildinfo` must not be committed.

## Default Execution Sequence

For any substantial Biz, Techno, or product task, the preferred sequence is to identify the hypothesis being validated, check it against `SPEC.md`, choose the smallest useful artifact or implementation path, complete the artifact, and record the resulting status or next decision in `STATUS.md` where appropriate.
