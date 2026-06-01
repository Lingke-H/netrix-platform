# NeTrix Direction Memo

| Field | Description |
| --- | --- |
| Document status | Strategic direction baseline |
| Primary audience | Project owner, Biz team, Techno team, product contributors |
| Function | Establish the shared product thesis before business-plan drafting and MVP implementation planning |
| Authority | This memo informs strategy and storytelling; `SPEC.md` remains the operational source of truth for product and engineering scope |

## 1. Executive Position

NeTrix is an AI-assisted academic connection network for UNNC students. It is designed for a campus environment in which academic learning is increasingly supported by AI tools, private chats, scattered resources, informal peer networks, and fragmented information channels.

The central position of NeTrix is that AI should not make learning more isolated. If AI-assisted study remains locked inside private one-to-one conversations, students may receive faster individual answers while losing visibility into the questions, resources, experiences, and peer expertise around them. NeTrix responds to this risk by turning academic posts, student profiles, and AI-assisted recommendations into a social infrastructure for academic discovery.

The first MVP should focus on Math, Computer Science, and EEE students at UNNC. This is a narrow enough wedge to be reachable and implementable, while still representing the broader ambition: a UNNC-wide academic connection layer that helps students discover knowledge, experience, and relevant peers.

## 2. Strategic Thesis

The product thesis is that academic value on campus does not exist only in official information channels or formal course materials. It also exists in student questions, study methods, resource discoveries, module experience, project experience, skill signals, and informal willingness to help or collaborate. At present, much of this value is unevenly distributed and difficult to find.

NeTrix creates value by giving those signals a shared structure. Students post academic questions, resources, and experience. Those posts contribute to user-confirmed academic profiles. The platform then uses AI to recommend relevant academic connections and explain why those recommendations may be useful. The result is a loop in which content, identity, and connection reinforce one another.

```text
academic posts -> academic profiles -> AI-assisted recommendations -> academic connections
```

This loop should guide product design, business storytelling, and technical implementation. NeTrix should not be framed as a generic campus forum, a static resource database, a professional networking clone, or an AI chatbot. Its stronger identity is an academic connection layer for students.

## 3. Problem Definition

UNNC students already rely on multiple channels to support academic learning: official pages, Student Hub materials, WeChat groups, private messages, peer conversations, shared files, AI models, and ad hoc resource lists. These channels are useful, but they do not create a coherent academic knowledge environment.

The resulting information gap has several dimensions. Useful questions disappear inside private chats. Strong study experience remains limited to small friend groups. Resources circulate unevenly across majors and years. Students who need collaborators or study partners often lack a structured way to discover academically relevant peers. AI-assisted learning outputs, although increasingly important, remain largely private, unverified, and disconnected from the wider student community.

The problem is therefore not merely that information is scattered. The deeper issue is that academic learning signals are becoming less visible at the same time that AI makes individual learning more private. NeTrix aims to convert those private or fragmented signals into a more discoverable academic network.

## 4. Product Positioning

The recommended positioning is:

> NeTrix is the AI-assisted academic connection layer for UNNC students.

An expanded version is:

> NeTrix helps students share academic questions, resources, and experience; build user-confirmed academic profiles; and discover relevant peers through explainable AI-assisted recommendations.

This positioning creates a clear distinction from adjacent categories. Compared with a resource database, NeTrix is more social and identity-aware. Compared with a Q&A forum, it connects questions to profiles and people. Compared with LinkedIn, it is academic, student-centred, and campus-specific rather than professional and career-first. Compared with an AI chatbot, it uses AI to strengthen human academic connection rather than replace it.

## 5. Initial User Wedge

The first MVP should target Math, Computer Science, and EEE students. These groups are suitable because they are reachable through existing team access, likely to share overlapping academic pain points, and likely to produce concrete use cases around modules, technical problem-solving, coursework, projects, tools, and peer collaboration.

The long-term vision remains UNNC-wide. However, the first product test should not attempt to serve every major, year, and academic scenario at once. The correct strategic framing is:

```text
UNNC-wide vision, Math / CS / EEE first wedge
```

FAM and IBE may be considered as expansion pilots if execution capacity allows. They should not dilute the first validation cycle unless there is a specific strategic reason to include them.

## 6. Product System

The product should be understood as a system of five connected layers rather than a set of independent features.

| Layer | Strategic Role | MVP Expression |
| --- | --- | --- |
| Post Layer | Creates public academic signals. | Q&A posts, Resource posts, and Experience Sharing posts in a shared feed. |
| Profile Layer | Turns student activity and self-description into academic identity. | User-provided profile fields refined by AI and confirmed by the user. |
| AI Recommendation Layer | Converts academic signals into relevant peer discovery. | Explainable recommended profiles based on modules, interests, skills, posts, tags, and collaboration intent. |
| Connection Layer | Enables intentional academic relationship formation. | Request-to-connect, acceptance or rejection, and messaging after acceptance. |
| Library Layer | Preserves high-value resources and campus academic information. | Resource Centre built from seeded materials and promoted Resource posts. |

The Post Layer should remain the primary entry point. Q&A, Resource, and Experience Sharing should be treated as post categories rather than separate products. This keeps the MVP coherent and prevents the team from building three parallel systems before validating the central loop.

## 7. AI Role And Boundaries

AI is essential to the NeTrix proposition, but it should be designed as infrastructure rather than theatre. The first MVP should prioritise two AI functions: academic profile generation or refinement, and academic connection recommendation.

For profile generation, AI may help transform user-provided information and platform behaviour into a clearer academic portrait. The user must remain in control: the profile should be editable, confirmable, and based on information the user has provided or made visible inside the platform.

For connection recommendation, AI should help identify academically relevant peers and explain the reasoning. A recommendation should not merely say that two students match. It should state the relevant shared or complementary signals, such as common modules, overlapping interests, similar resource needs, complementary skills, Q&A activity, or stated collaboration goals.

The first MVP should not depend on importing memory from external AI products. That concept may be strategically interesting in a later phase, but it introduces privacy, platform dependency, consent, interoperability, and implementation complexity that are not appropriate for the first validation cycle.

## 8. Identity And Trust Model

The MVP should require campus email verification because the product relies on a bounded and trusted academic context. Verification supports credibility, reduces low-quality participation, and makes recommendations more meaningful.

The user identity model should be academic rather than fully professional or fully anonymous. Students should create profiles around major, year, modules, interests, skills, help-offered areas, help-needed areas, collaboration preferences, and academic goals. The platform may offer AI-generated academic nickname suggestions after the basic profile is completed, but the user should be able to modify and confirm the final nickname.

This model is intentionally different from LinkedIn. It should reduce the pressure of formal professional self-presentation while still preserving enough identity and accountability for useful academic connection.

## 9. MVP Scope

The MVP should be a real web platform prototype with a real backend and real LLM API usage for the first AI functions. It should be scoped tightly enough for the Techno team to build, but complete enough to demonstrate the product loop from post creation to connection.

The required MVP capabilities are campus email verification, user profile creation, AI-assisted academic nickname suggestions, the three post types, a main academic feed, a basic Library or Resource Centre, AI-assisted profile generation or refinement, explainable recommended profiles, request-to-connect, and accepted-only messaging.

The MVP should not include a generic AI chatbot as the primary interface, full UNNC-wide deployment, heavy black-box matching, direct external AI-memory integration, a campus super-app scope, or an overly stylised cyberpunk or sci-fi interface system. These would distract from the first validation question.

## 10. UX Direction

The recommended UX direction is:

```text
Academic Feed-first + Profile Sidecar
```

The main experience should feel like entering an intelligent academic community. Users should first encounter active academic posts, not a blank dashboard or an AI command box. The feed should make it easy to move between Q&A, Resource, and Experience Sharing posts, with filtering by major, module, topic, and relevance.

The profile sidecar should make the AI layer visible without making it dominant. On desktop, it can show profile completeness, academic portrait signals, recommended connections, pending requests, and AI suggestions for improving the profile. On mobile, the same functions can become a dedicated profile or connection area.

The visual system should be clean, structured, warm, and academically credible. It should not imitate a corporate career platform, a school administrative portal, or a futuristic AI product. The interface should communicate that NeTrix is social and intelligent, but still grounded in real student academic life.

## 11. Business-Plan Implications

The business plan should not present NeTrix as an information aggregation tool. That framing is too weak and too easy to compare with existing school pages, group chats, or generic resource folders.

The stronger narrative is that AI-assisted learning is creating a new academic information gap. Students may gain private AI support while losing visibility into peer knowledge, shared experience, and potential collaborators. NeTrix addresses this by transforming academic signals into a campus connection network.

The CVP should focus on helping students discover relevant academic knowledge, experience, and peers with less friction. The USP should focus on the combination of post-based academic signals, user-confirmed academic profiles, and explainable AI-assisted academic connection recommendations inside a verified UNNC context.

The existing 60 survey responses should be treated as early evidence. They can support the problem narrative and help identify promising user segments, but they should not be used as conclusive proof of demand. The next evidence layer should include targeted interviews, seeded-content testing, and MVP usage data.

## 12. Technical Implications

The Techno team should treat the following as core product objects: User, Academic Profile, Post, Post Type, Tag, Topic, Module, Resource, Recommendation, Connection Request, and Message.

The first implementation should prioritise clean data modelling, reliable authentication, campus email verification, post creation and browsing, profile creation, AI-assisted profile refinement, explainable recommendation cards, connection requests, and accepted-only messaging. The recommendation system may begin as a hybrid of structured profile fields, tags, post metadata, simple rule-based scoring, and LLM-generated explanations. It does not need to begin as a sophisticated machine-learning system.

The technical architecture should preserve future extensibility, but it should not over-engineer for a data scale or recommendation complexity that the MVP has not yet earned.

## 13. Strategic Risks

| Risk | Why It Matters | Mitigation |
| --- | --- | --- |
| Scope expansion into a campus super-app | The team may lose the narrow use case needed for validation. | Keep the MVP centred on posts, profiles, recommendations, and connections for Math / CS / EEE. |
| AI becomes the product rather than the enabler | A chatbot-first design would weaken the human-connection thesis. | Use AI for profile refinement and recommendation, not as the primary user experience. |
| Recommendations feel opaque | Black-box matching would contradict the anti-black-box product philosophy. | Every recommendation should include visible reasoning and user-understandable signals. |
| Messaging recreates private isolation | If value moves entirely into DMs, the platform may reproduce the information gap. | Maintain public posts and profiles as the main source of academic signals. |
| Empty-feed problem | Users will not understand the product if the first feed lacks density and relevance. | Seed high-quality Q&A, Resource, and Experience posts before user testing. |

## 14. Immediate Planning Outputs

The next phase should produce two formal guidance documents. The Biz guidance document should translate this memo into business-plan structure, CVP, USP, validation strategy, target-user narrative, evidence requirements, and pitch logic. The Techno guidance document should translate the same direction into MVP scope, information architecture, data model, user flows, AI prompts or services, UI/UX principles, backend requirements, and verification commands.

These documents should be created before a new implementation scaffold is introduced. That sequence will allow the team to avoid rebuilding around incomplete or outdated assumptions.

## 15. North Star Statement

NeTrix should use AI to make academic information, student experience, and relevant peers easier to discover and connect with. It should not use AI to replace human academic interaction or push learning further into private black boxes. The product succeeds only if posts, profiles, recommendations, and connections together create a more visible and more useful academic network for students.
