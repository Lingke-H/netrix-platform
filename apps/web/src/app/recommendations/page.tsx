import Link from "next/link";
import { UserRound } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { Major, StudyYear } from "@/features/profile/schemas";
import {
  getCurrentUserScoredRecommendationCandidates,
  type ScoredRecommendationCandidate,
} from "@/features/recommendations/server/service";

export const dynamic = "force-dynamic";

const majorLabels: Record<Major, string> = {
  math: "Math",
  "computer-science": "Computer Science",
  eee: "EEE",
  fam: "FAM",
  ibe: "IBE",
  other: "Other",
};

const studyYearLabels: Record<StudyYear, string> = {
  foundation: "Foundation",
  "year-1": "Year 1",
  "year-2": "Year 2",
  "year-3": "Year 3",
  "year-4": "Year 4",
  postgraduate: "Postgraduate",
};

function RecommendationsEmptyState() {
  return (
    <div className="space-y-3 border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        No scored recommendation candidates are ready yet. This can happen when there are not enough campus-visible
        profiles with overlapping academic signals.
      </p>
      <p className="text-xs leading-6 text-[var(--color-muted)]">
        This view currently uses in-memory rule scoring only. It does not create recommendation rows or generate LLM
        explanations.
      </p>
    </div>
  );
}

function SignalList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="bg-[var(--color-accent-soft)] px-2 py-1 text-xs font-medium text-[var(--color-accent)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScoreBreakdown({ scoredCandidate }: { scoredCandidate: ScoredRecommendationCandidate }) {
  const rows = [
    ["Module overlap", scoredCandidate.scoreSummary.moduleOverlap],
    ["Interest overlap", scoredCandidate.scoreSummary.interestOverlap],
    ["Skill overlap", scoredCandidate.scoreSummary.skillOverlap],
    ["Help complementarity", scoredCandidate.scoreSummary.helpComplementarity],
    ["Collaboration preference", scoredCandidate.scoreSummary.collaborationPreferenceOverlap],
  ] as const;

  return (
    <dl className="grid gap-2 text-xs text-[var(--color-muted)] sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-3 py-2">
          <dt>{label}</dt>
          <dd className="font-semibold text-[var(--color-ink)]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ScoredRecommendationCard({ scoredCandidate }: { scoredCandidate: ScoredRecommendationCandidate }) {
  const { candidate } = scoredCandidate;

  return (
    <article className="space-y-5 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <UserRound size={18} aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <Link
              href={`/profiles/${candidate.userId}`}
              className="text-lg font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-accent)]"
            >
              {candidate.nickname}
            </Link>
            <div className="flex flex-wrap gap-2 text-sm font-medium text-[var(--color-muted)]">
              <span>{majorLabels[candidate.major]}</span>
              <span>{studyYearLabels[candidate.year]}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="ready">score {scoredCandidate.score}</StatusBadge>
          <StatusBadge>{candidate.visibility}</StatusBadge>
        </div>
      </div>

      <ScoreBreakdown scoredCandidate={scoredCandidate} />

      <div className="grid gap-4 md:grid-cols-2">
        <SignalList label="Shared signals" items={scoredCandidate.sharedSignals} />
        <SignalList label="Complementary signals" items={scoredCandidate.complementarySignals} />
      </div>
    </article>
  );
}

export default async function RecommendationsPage() {
  const scoredCandidates = await getCurrentUserScoredRecommendationCandidates();

  return (
    <PageFrame
      eyebrow="Recommendations"
      title="Recommended Connections"
      description="Rule-scored academic connection candidates generated from user-confirmed profile signals."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">requires completed profile</StatusBadge>
        <StatusBadge>{scoredCandidates.length} scored candidates</StatusBadge>
        <StatusBadge tone="caution">no LLM explanation</StatusBadge>
      </div>

      {scoredCandidates.length === 0 ? (
        <RecommendationsEmptyState />
      ) : (
        <div className="space-y-4">
          {scoredCandidates.map((scoredCandidate) => (
            <ScoredRecommendationCard key={scoredCandidate.candidate.userId} scoredCandidate={scoredCandidate} />
          ))}
        </div>
      )}
    </PageFrame>
  );
}
