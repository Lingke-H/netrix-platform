# NeTrix Business Planning Folder

This folder provides the business-planning guidance for NeTrix. It translates the shared strategic origin in `docs/strategy/DIRECTION_MEMO.md` into a structured business-plan workflow for the Biz team.

The documents in this folder are not a finished business plan. They are reference guides for deciding what the business plan should argue, what evidence it should use, which assumptions must remain visible, and how the team should avoid overstating the project before validation.

## 1. Relationship To The Repository Canon

`DIRECTION_MEMO.md` is the common origin for both Biz and Techno work. It defines the strategic thesis: NeTrix is an AI-assisted academic connection network for UNNC students, beginning with Math, Computer Science, and EEE as the first wedge.

The Biz folder should use the Direction Memo as its source of strategic narrative. It should not rely on `SPEC.md` as the primary business document. `SPEC.md` is mainly for product and engineering execution, especially when the Techno team later defines implementation scope, architecture, and verification commands.

| Repository File | How Biz Should Use It |
| --- | --- |
| `docs/strategy/DIRECTION_MEMO.md` | Treat as the strategic origin and narrative baseline. |
| `docs/business/` | Use as the business-plan writing system and evidence framework. |
| `README.md` | Use for repository orientation and document map. |
| `AGENTS.md` | Use for collaboration rules when AI-assisted contributors work in the repo. |
| `SPEC.md` | Reference only when the business plan must stay consistent with MVP scope and product constraints. |
| `STATUS.md` | Check for the latest operating state and open workstreams. |

## 2. Document Map

| Document | Purpose |
| --- | --- |
| `BUSINESS_PLAN_WRITING_GUIDE.md` | Defines the recommended business-plan structure, section logic, evidence expectations, and writing standards. |
| `CVP_USP_REVENUE_GUIDE.md` | Explains how to determine the customer value proposition, unique selling proposition, and revenue model without overclaiming. |
| `RESEARCH_AND_SURVEY_ANALYSIS_GUIDE.md` | Explains how to use the existing 60 survey responses responsibly, including when statistical inference is or is not appropriate. |
| `SURVEY_ANALYSIS_BRIEF.md` | Summarises the current 60-response dataset at an anonymised aggregate level for business-plan reference. |
| `survey_analysis/` | Stores the dedicated survey analysis report, methodology note, SVG visualisations, and aggregate CSV tables. |
| `MARKET_VALIDATION_GUIDE.md` | Defines the next validation plan for interviews, seeded-content testing, MVP testing, and success metrics. |
| `PITCH_NARRATIVE_GUIDE.md` | Provides a coherent pitch storyline, positioning language, and argument structure for presentations. |

## 3. Recommended Workflow

The Biz team should begin by reading the Direction Memo in full. After that, the team should use `BUSINESS_PLAN_WRITING_GUIDE.md` to understand the expected final structure of the business plan. The CVP, USP, and revenue model should then be drafted with `CVP_USP_REVENUE_GUIDE.md`, because these decisions affect the entire commercial logic of the plan.

The survey and validation documents should be used before writing the market evidence section. The existing 60 survey responses can support problem discovery and early segmentation, but they should not be presented as conclusive market proof unless the sampling method justifies that level of claim. `SURVEY_ANALYSIS_BRIEF.md` should be used as the current aggregate reference, and `survey_analysis/` should be used for the detailed report, visualisations, and summary tables. The raw Excel file should remain outside the repository unless anonymised.

The pitch narrative should be written last. A strong pitch should compress the business plan into a clear story, not replace the analytical work behind it.

## 4. Writing Standard

All business-plan documents should use formal, native English. The preferred style is analytical, structured, and evidence-conscious. Claims should be separated from assumptions, and recommendations should be linked to observable evidence or clear strategic reasoning.

The business plan should avoid presenting NeTrix as a generic information aggregator. The stronger narrative is that AI-assisted learning is producing a new kind of academic information gap, and NeTrix turns academic posts, profiles, and explainable recommendations into a campus-level academic connection network.

## 5. Immediate Biz Deliverables

The next Biz outputs should be a first full business-plan draft, a CVP and USP statement, a defensible revenue-model hypothesis, an analysis summary of the existing survey data, and a short validation plan for Math, Computer Science, and EEE students.
