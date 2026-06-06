import Link from "next/link";
import { Sparkles, UserRound } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { createConnectionRequestAction } from "@/features/connections/server/actions";
import type { Major, StudyYear } from "@/features/profile/schemas";
import type { Recommendation } from "@/features/recommendations/schemas";
import { persistRecommendationDryRunDraftsAction } from "@/features/recommendations/server/actions";
import { getCurrentUserRecommendationFeed } from "@/features/recommendations/server/service";

export const dynamic = "force-dynamic";

async function persistRecommendationsFormAction() {
  "use server";

  await persistRecommendationDryRunDraftsAction();
}

async function createConnectionRequestFormAction(formData: FormData) {
  "use server";

  await createConnectionRequestAction(formData);
}

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
        No persisted recommendation cards are ready yet. Generate recommendations from your completed academic profile
        to create durable cards that can become connection requests.
      </p>
      <p className="text-xs leading-6 text-[var(--color-muted)]">
        Recommendations are generated from campus-visible profiles, transparent rule scoring, and server-side explanation
        metadata before they are saved to the recommendation feed.
      </p>
    </div>
  );
}

function GenerateRecommendationsPanel() {
  return (
    <form
      action={persistRecommendationsFormAction}
      className="flex flex-wrap items-center justify-between gap-4 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Generate persisted recommendations</h2>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Save eligible recommendation candidates into your feed, then request a connection from a card.
        </p>
      </div>
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-2 border border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] px-4 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(36,117,95,0.16)]"
      >
        <Sparkles size={16} aria-hidden="true" />
        Generate
      </button>
    </form>
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

function RequestConnectionForm({ recommendation }: { recommendation: Extract<Recommendation, { canRequestConnect: true }> }) {
  return (
    <form action={createConnectionRequestFormAction} className="space-y-3 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4">
      <input name="recommendationId" type="hidden" value={recommendation.recommendationId} />
      <input name="recipientId" type="hidden" value={recommendation.recommendedUserId} />
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">Request message</span>
        <textarea
          name="message"
          rows={3}
          maxLength={240}
          className="min-h-20 w-full resize-y border border-[var(--color-line)] bg-white px-3 py-2 text-sm leading-6 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]"
          placeholder="Mention a module, shared signal, or study goal."
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center border border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] px-3 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(36,117,95,0.16)]"
      >
        Request connection
      </button>
    </form>
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

      {recommendation.canRequestConnect ? <RequestConnectionForm recommendation={recommendation} /> : null}
    </article>
  );
}

export default async function RecommendationsPage() {
  const recommendationFeed = await getCurrentUserRecommendationFeed();

  return (
    <PageFrame
      eyebrow="Recommendations"
      title="Recommended Connections"
      description="Persisted academic connection cards generated from profile signals and transparent recommendation metadata."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">requires completed profile</StatusBadge>
        <StatusBadge>{recommendationFeed.items.length} recommendations</StatusBadge>
        <StatusBadge tone="ready">persisted feed</StatusBadge>
      </div>

      <GenerateRecommendationsPanel />

      {recommendationFeed.items.length === 0 ? (
        <RecommendationsEmptyState />
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
