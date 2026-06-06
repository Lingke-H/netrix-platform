import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { ResourceCard } from "@/features/library/components/resource-card";
import { getCurrentUserLibrary } from "@/features/library/server/service";
import { resolveProtectedPageData } from "@/server/auth/redirects";

export const dynamic = "force-dynamic";

function LibraryEmptyState() {
  return (
    <div className="border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] px-5 py-8 text-sm leading-7 text-[var(--color-muted)]">
      The resource library is being assembled. Check back soon for curated academic resources and promoted community posts.
    </div>
  );
}

export default async function LibraryPage() {
  const library = await resolveProtectedPageData("/library", () => getCurrentUserLibrary());

  return (
    <PageFrame
      eyebrow="Resources"
      title="Resource Library"
      description="Curated academic resources and promoted community posts for Math, Computer Science, and EEE students."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">{library.featuredResourceIds.length} featured</StatusBadge>
        <StatusBadge>{library.items.length} items</StatusBadge>
      </div>
      {library.items.length === 0 ? (
        <LibraryEmptyState />
      ) : (
        <div className="space-y-4">
          {library.items.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageFrame>
  );
}
