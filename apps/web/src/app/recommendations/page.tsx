import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUserRecommendationFeed } from "@/features/recommendations/server/service";

export const dynamic = "force-dynamic";

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

      {feed.items.length === 0 ? <RecommendationsEmptyState hasEnoughSignals={feed.hasEnoughSignals} /> : null}
    </PageFrame>
  );
}
