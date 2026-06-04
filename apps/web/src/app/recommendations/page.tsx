import Link from "next/link";
import { Lock, MessageCircle, UserRound } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { Major, StudyYear } from "@/features/profile/schemas";
import type { Recommendation } from "@/features/recommendations/schemas";
import { getCurrentUserRecommendationFeed } from "@/features/recommendations/server/service";

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

function RecommendationsEmptyState({ hasEnoughSignals }: { hasEnoughSignals: boolean }) {
  return (
    <div className="space-y-3 border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        No recommendations are ready yet. The next slice can connect structured profile and post signals into this
        feed.
      </p>
      {!hasEnoughSignals ? (
        <p className="text-xs leading-6 text-[var(--color-muted)]">
          Recommendation generation is waiting for enough academic signals from profiles, posts, modules, and interests.
        </p>
      ) : null}
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

function PrivateRecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <article className="space-y-4 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-[rgba(61,90,134,0.12)] text-[var(--color-info)]">
            <Lock size={18} aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">{recommendation.nickname}</h2>
            <p className="text-sm leading-6 text-[var(--color-muted)]">{recommendation.explanationSummary}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge>{recommendation.status}</StatusBadge>
          <StatusBadge tone="caution">private</StatusBadge>
        </div>
      </div>
      <p className="text-xs leading-6 text-[var(--color-muted)]">
        Connection actions and profile details stay hidden while this student keeps their academic profile private.
      </p>
    </article>
  );
}

function VisibleRecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  if (recommendation.profileVisibility === "private") {
    return <PrivateRecommendationCard recommendation={recommendation} />;
  }

  return (
    <article className="space-y-5 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <UserRound size={18} aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <Link
              href={`/profiles/${recommendation.recommendedUserId}`}
              className="text-lg font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-accent)]"
            >
              {recommendation.nickname}
            </Link>
            <div className="flex flex-wrap gap-2 text-sm font-medium text-[var(--color-muted)]">
              <span>{majorLabels[recommendation.major]}</span>
              <span>{studyYearLabels[recommendation.year]}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={recommendation.status === "active" ? "ready" : "info"}>{recommendation.status}</StatusBadge>
          <StatusBadge>{recommendation.profileVisibility}</StatusBadge>
        </div>
      </div>

      <p className="text-sm leading-7 text-[var(--color-muted)]">{recommendation.profileSummary}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <SignalList label="Shared signals" items={recommendation.sharedSignals} />
        <SignalList label="Complementary signals" items={recommendation.complementarySignals} />
      </div>

      <div className="space-y-2 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Why this match</h3>
        <p className="text-sm leading-7 text-[var(--color-ink)]">{recommendation.explanationSummary}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)]">{recommendation.conversationStarter}</p>
        <button
          type="button"
          disabled={!recommendation.canRequestConnect}
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[rgba(29,107,87,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Request connect
        </button>
      </div>
    </article>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return recommendation.profileVisibility === "private" ? (
    <PrivateRecommendationCard recommendation={recommendation} />
  ) : (
    <VisibleRecommendationCard recommendation={recommendation} />
  );
}

export default async function RecommendationsPage() {
  const feed = await getCurrentUserRecommendationFeed();

  return (
    <PageFrame
      eyebrow="Recommendations"
      title="Recommended Connections"
      description="Explainable academic connection recommendations generated from user-confirmed profile and post signals."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">requires completed profile</StatusBadge>
        <StatusBadge>{feed.items.length} recommendations</StatusBadge>
        <StatusBadge tone={feed.hasEnoughSignals ? "ready" : "caution"}>
          {feed.hasEnoughSignals ? "signals ready" : "signals pending"}
        </StatusBadge>
      </div>

      {feed.items.length === 0 ? (
        <RecommendationsEmptyState hasEnoughSignals={feed.hasEnoughSignals} />
      ) : (
        <div className="space-y-4">
          {feed.items.map((recommendation) => (
            <RecommendationCard key={recommendation.recommendationId} recommendation={recommendation} />
          ))}
        </div>
      )}
    </PageFrame>
  );
}
