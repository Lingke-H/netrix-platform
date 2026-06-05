export function RecommendationEmptyState() {
  return (
    <div className="space-y-3 border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        No scored recommendation candidates are ready yet. This can happen when there are not enough campus-visible
        profiles with overlapping academic signals.
      </p>
      <p className="text-xs leading-6 text-[var(--color-muted)]">
        This view currently uses in-memory rule scoring and mock explanation generation. It does not create recommendation
        rows or call OpenAI.
      </p>
    </div>
  );
}
