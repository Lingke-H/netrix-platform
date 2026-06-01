# NeTrix Platform

NeTrix is an AI-assisted academic connection network for UNNC students. The product is designed to help academic questions, learning resources, study experience, personal academic identity, and peer connections circulate more effectively across the campus.

This repository is currently maintained as a direction-first project workspace. It deliberately contains only the documents required to align product strategy, business planning, and MVP implementation before a new technical scaffold is introduced. Earlier prototype assumptions have been removed so that future work begins from the current product thesis rather than from outdated interface or architecture experiments.

## Strategic Baseline

The current strategic direction is defined in [docs/strategy/DIRECTION_MEMO.md](docs/strategy/DIRECTION_MEMO.md). In summary, NeTrix starts with Math, Computer Science, and EEE students at UNNC and validates the following product loop:

```text
academic posts -> academic profiles -> AI-assisted recommendations -> academic connections
```

The first MVP is not intended to be a campus super-app, a generic AI chatbot, or a static resource directory. Its purpose is to demonstrate whether students will share academic signals through posts, convert those signals into trustworthy academic profiles, and use AI-assisted recommendations to discover relevant peers.

## Repository Canon

The repository is organised around a small set of source documents. Each file has a distinct authority so that future business and technical work can reference the same baseline.

| File | Role |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Collaboration protocol for Codex and other AI-assisted contributors. |
| [SPEC.md](SPEC.md) | Product and engineering source of truth. Product direction changes must be reflected here before implementation work begins. |
| [STATUS.md](STATUS.md) | Current programme state, open workstreams, and near-term execution sequence. |
| [docs/strategy/DIRECTION_MEMO.md](docs/strategy/DIRECTION_MEMO.md) | Strategic direction memo for business-plan drafting and MVP planning. |
| [docs/business/](docs/business) | Business-planning guidance for BP structure, CVP, USP, revenue logic, survey analysis, validation, and pitch narrative. |

## Working Protocol

All contributors should read `SPEC.md` and `STATUS.md` before changing product scope, technical scope, or documentation structure. The direction memo should be treated as the strategic narrative baseline, while `SPEC.md` should be treated as the operational constraint set for product and engineering decisions.

When the product direction changes, `SPEC.md` must be updated first. When the current operating status changes, `STATUS.md` must be updated. New business-plan or MVP implementation documents should extend these files rather than duplicate or contradict them.

## Current Scope

The first MVP should focus on a web-based academic community experience with three post types: Q&A posts, Resource posts, and Experience Sharing posts. The core AI functions are academic profile generation or refinement and academic connection recommendation. Connection should remain intentional: users request to connect, recipients accept or reject, and private messaging becomes available only after acceptance.

The initial user wedge is Math, Computer Science, and EEE students. FAM, IBE, and the broader UNNC student body remain expansion opportunities after the first wedge has produced stronger validation.

## Next Workstreams

The Biz guidance folder now provides the first business-plan writing system. The next major repository addition should be the Techno MVP implementation guide, which should translate the same thesis into MVP scope, data models, user flows, AI boundaries, backend requirements, UI/UX principles, and verification commands.
