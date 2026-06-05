import Link from "next/link";
import { UserRound } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { Major, StudyYear } from "@/features/profile/schemas";
import { RecommendationEmptyState } from "@/features/recommendations/components";
import type { Recommendation } from "@/features/recommendations/schemas";
import { getCurrentUserRecommendationCards } from "@/features/recommendations/server/service";

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

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <article className="space-y-5 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <UserRound size={18} aria-hidden="true" />
          </span>
          <div className="space-y-2">
            {recommendation.recommendedUserId === null ? (
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">{recommendation.nickname}</h2>
            ) : (
              <Link
                href={`/profiles/${recommendation.recommendedUserId}`}
                className="text-lg font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-accent)]"
              >
                {recommendation.nickname}
              </Link>
            )}
            <div className="flex flex-wrap gap-2 text-sm font-medium text-[var(--color-muted)]">
              {recommendation.major === null ? null : <span>{majorLabels[recommendation.major]}</span>}
              {recommendation.year === null ? null : <span>{studyYearLabels[recommendation.year]}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="ready">{recommendation.status}</StatusBadge>
          <StatusBadge>{recommendation.profileVisibility}</StatusBadge>
        </div>
      </div>

      {recommendation.profileSummary === null ? null : (
        <p className="text-sm leading-7 text-[var(--color-muted)]">{recommendation.profileSummary}</p>
      )}

      <div className="space-y-2 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Explanation</h3>
        <p className="text-sm leading-7 text-[var(--color-ink)]">{recommendation.explanationSummary}</p>
        {recommendation.conversationStarter === null ? null : (
          <p className="text-sm leading-7 text-[var(--color-muted)]">{recommendation.conversationStarter}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SignalList label="Shared signals" items={recommendation.sharedSignals} />
        <SignalList label="Complementary signals" items={recommendation.complementarySignals} />
      </div>
    </article>
  );
}

export default async function RecommendationsPage() {
  const recommendationFeed = await getCurrentUserRecommendationCards();

  return (
    <PageFrame
      eyebrow="Recommendations"
      title="Recommended Connections"
      description="Academic connection cards generated from user-confirmed profile signals and mock explanations."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">requires completed profile</StatusBadge>
        <StatusBadge>{recommendationFeed.items.length} recommendations</StatusBadge>
        <StatusBadge tone="caution">mock explanation</StatusBadge>
      </div>

      {recommendationFeed.items.length === 0 ? (
        <RecommendationEmptyState />
      ) : (
        <div className="space-y-4">
          {recommendationFeed.items.map((recommendation) => (
            <RecommendationCard key={recommendation.recommendationId} recommendation={recommendation} />
          ))}
        </div>
      )}
    </PageFrame>
  );
}
