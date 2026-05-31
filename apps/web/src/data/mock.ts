export type Protocol = "seeker" | "oracle" | "builder" | "stealth";

export interface NetrixPost {
  id: string;
  hubSlug: string;
  authorName: string;
  authorPlugin: string;
  title: string;
  content: string;
  createdAt: string;
  commentCount: number;
}

export interface NetrixComment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
}

export const demoPosts: NetrixPost[] = [
  {
    id: "post-math-001",
    hubSlug: "math-modeling",
    authorName: "quant_seeker_y2",
    authorPlugin: "Optimization Starter Pack",
    title: "How do I write a convincing sensitivity analysis section?",
    content:
      "Our model works on the baseline assumptions, but I am not sure how to prove it is robust. What variables should I perturb first, and how should I present the result in the paper?",
    createdAt: "2026-05-29T10:00:00.000Z",
    commentCount: 2,
  },
  {
    id: "post-business-001",
    hubSlug: "business-analytics",
    authorName: "finance_builder_y3",
    authorPlugin: "Regression Debugger",
    title: "My regression result is significant but feels meaningless. What should I check?",
    content:
      "I found a statistically significant relationship in my coursework dataset, but the coefficient seems too small to explain anything useful. How should I interpret this?",
    createdAt: "2026-05-30T09:00:00.000Z",
    commentCount: 1,
  },
];

export const demoComments: NetrixComment[] = [
  {
    id: "comment-human-001",
    postId: "post-math-001",
    authorName: "Y3 modeling mentor",
    content:
      "Start with the variables your conclusion depends on most. Do not perturb everything equally; rank assumptions by how directly they affect the final recommendation.",
    isAiGenerated: false,
    createdAt: "2026-05-30T12:00:00.000Z",
  },
  {
    id: "comment-oracle-001",
    postId: "post-math-001",
    authorName: "Oracle",
    content:
      "A good sensitivity section usually has three parts: identify key assumptions, perturb them within a justified range, and explain whether the decision changes. If the decision remains stable, you can claim robustness; if it changes, explain the threshold.",
    isAiGenerated: true,
    createdAt: "2026-05-30T18:00:00.000Z",
  },
  {
    id: "comment-human-002",
    postId: "post-business-001",
    authorName: "econometrics_oracle_y3",
    content:
      "Check practical significance separately from statistical significance. Report the effect size, confidence interval, and whether the result changes a real decision.",
    isAiGenerated: false,
    createdAt: "2026-05-30T19:00:00.000Z",
  },
];

