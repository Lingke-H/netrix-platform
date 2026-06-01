# NeTrix Product And Engineering Specification

`SPEC.md` is the operational source of truth for NeTrix. It defines the current product direction, MVP boundaries, AI role, and engineering constraints that must guide business-plan drafting, technical planning, and implementation work.

Any durable change to product positioning, target users, MVP scope, AI capability, data model, or technical architecture must be reflected in this file before other repository documents or code are updated.

## 1. Programme Stage

NeTrix has moved from early problem framing into a direction-locked MVP planning stage. The project is no longer trying to choose among unrelated platform concepts; it is now aligning Biz and Techno work around a single product thesis.

At this stage, the repository should not contain speculative interface concepts or premature architecture decisions. The correct output is a coherent decision base from which the business plan, validation plan, and MVP implementation guide can be drafted.

## 2. Product Definition

NeTrix is an AI-assisted academic connection network for UNNC students. Students create academic signals through Q&A posts, Resource posts, and Experience Sharing posts. The platform uses those signals, together with user-confirmed academic profiles, to recommend relevant academic peers and support intentional academic connections.

The governing product loop is:

```text
academic posts -> academic profiles -> AI-assisted recommendations -> academic connections
```

This loop is the central constraint for the first MVP. Features that do not strengthen at least one part of the loop should be deferred unless a later specification revision makes them necessary.

## 3. Strategic Scope

The external vision is UNNC-wide academic infrastructure. The initial validation wedge is narrower: Math, Computer Science, and EEE students at UNNC. This wedge is selected because these students are accessible, likely to share overlapping academic needs, and suitable for testing concrete use cases around modules, coursework, technical questions, resources, projects, and peer collaboration.

FAM, IBE, and the broader UNNC student body remain expansion paths. They should not be treated as first-phase requirements unless the project owner explicitly expands the validation scope.

## 4. MVP Product System

The MVP should be designed as a web-based academic community rather than as a collection of isolated tools. Its primary entry point is a post feed, and its differentiated value comes from the way posts become profile signals and profile signals become explainable recommendations.

| Layer | Required Role In MVP |
| --- | --- |
| Post Layer | Support Q&A posts, Resource posts, and Experience Sharing posts as the primary content and signal-generation mechanism. |
| Profile Layer | Allow users to create foundational academic profiles and confirm or edit AI-assisted profile refinements. |
| AI Recommendation Layer | Recommend academically relevant peers using profile fields, posts, tags, topics, modules, and interaction signals. |
| Connection Layer | Support recommended profiles, request-to-connect, acceptance or rejection, and messaging only after acceptance. |
| Library Layer | Provide a secondary resource centre formed from seeded resources and saved or promoted Resource posts. |

The Library is important, but it is not the primary product identity. The main product identity is academic connection enabled by posts, profiles, and AI-assisted recommendations.

## 5. AI Role And Constraints

AI is a core enabling layer, not the main user interface. The first MVP should use real LLM functionality for two purposes: academic profile generation or refinement, and academic connection recommendation.

AI-generated outputs must remain user-confirmable and explainable. A recommended connection should make clear why the person is relevant, which signals informed the recommendation, and what academic context the user may share with that person. The MVP should avoid black-box matching, a homepage chatbot as the primary experience, and any dependency on importing memory from external AI products.

The guiding principle is that AI should help academic information and people become more discoverable. It should not replace student interaction or move learning further into private black-box environments.

## 6. Identity, Trust, And Access

The MVP should require campus email verification. The product depends on trust, academic relevance, and a bounded UNNC context; verified access is therefore part of the core design rather than a later security enhancement.

The identity model should use academic-background-based nicknames rather than forcing a fully professional real-name networking style. After a user completes the basic profile, AI may suggest unique academic nickname options, and the user must be able to modify and confirm the final choice.

## 7. MVP Inclusion And Exclusion

The first MVP must include a real web platform, a real backend, campus email verification, user profiles, academic nickname support, the three post types, a main post feed, a basic Library or Resource Centre, AI-assisted academic profile generation or refinement, AI-assisted academic connection recommendation, explainable recommended profile cards, request-to-connect, and messaging after accepted connection.

The first MVP should exclude a generic campus super-app scope, an AI chatbot as the main product interface, complex black-box matching, overly stylised cyberpunk or sci-fi interface concepts, large-scale UNNC-wide deployment, and direct reliance on external AI memory systems.

## 8. UX Direction

The approved UX direction is:

```text
Academic Feed-first + Profile Sidecar
```

The product should feel like an intelligent academic community rather than a standalone AI utility. The main screen should privilege posts and academic discovery. On desktop, a profile sidecar may surface academic portrait progress, profile signals, AI suggestions, recommended connections, and pending requests. On mobile, the same functions may become a dedicated profile or connection area.

Visual design should be clean, academic, warm, and socially credible. It should avoid cyberpunk aesthetics, exaggerated AI branding, corporate LinkedIn imitation, and administrative school-portal styling.

## 9. Evidence And Validation

The existing survey responses should be treated as early signal rather than proof of market demand. They may support problem discovery and initial segmentation, but the next evidence layer should include targeted interviews with Math, CS, and EEE students, seeded-content testing, MVP usability testing, and observation of whether users actually post, refine profiles, request connections, and message after acceptance.

The primary validation question is not whether students generally like the idea of a platform. The primary question is whether the post-to-profile-to-recommendation-to-connection loop creates enough practical academic value for repeated use.

## 10. Change Control

This specification must be updated before any of the following changes are made elsewhere in the repository: changing the first user wedge, changing the post taxonomy, changing the AI role, changing the connection model, introducing a new technical stack, adding a backend service, or reframing NeTrix as a different product category.
