import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import type { ResourceItem } from "@/features/library/schemas";

const originLabels: Record<ResourceItem["origin"], string> = {
  "campus-resource": "Campus",
  "promoted-post": "Promoted Post",
  "student-resource": "Student",
};

const curationLabels: Record<ResourceItem["curationStatus"], string> = {
  archived: "Archived",
  featured: "Featured",
  seeded: "Seeded",
};

export function ResourceCard({ item }: { item: ResourceItem }) {
  return (
    <article className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={item.curationStatus === "featured" ? "ready" : "info"}>
          {curationLabels[item.curationStatus]}
        </StatusBadge>
        <StatusBadge>{originLabels[item.origin]}</StatusBadge>
      </div>
      <div className="mt-4 space-y-2">
        <h2 className="text-xl font-semibold leading-snug text-[var(--color-ink)]">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)]"
            >
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h2>
        <p className="line-clamp-3 text-sm leading-7 text-[var(--color-muted)]">{item.description}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
        {item.sourcePostId ? (
          <Link
            href={`/posts/${item.sourcePostId}`}
            className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
          >
            View source post
          </Link>
        ) : null}
        {item.modules.map((module) => (
          <span key={module} className="bg-[var(--color-accent-soft)] px-2 py-1 text-[var(--color-accent)]">
            {module}
          </span>
        ))}
        {item.tags.map((tag) => (
          <span key={tag} className="bg-[rgba(61,90,134,0.12)] px-2 py-1 text-[var(--color-info)]">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
