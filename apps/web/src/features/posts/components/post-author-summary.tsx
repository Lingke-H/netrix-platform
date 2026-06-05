import Link from "next/link";
import { Lock } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import type { PostAuthorSummary as PostAuthorSummaryData } from "@/features/posts/schemas";
import { getPostAuthorProfileHref } from "@/features/posts/types";

type PostAuthorSummaryProps = {
  author: PostAuthorSummaryData;
  compact?: boolean;
};

export function PostAuthorSummary({ author, compact = false }: PostAuthorSummaryProps) {
  const profileHref = getPostAuthorProfileHref(author);

  if (!profileHref) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
        <Lock size={14} aria-hidden="true" />
        <span>Private profile</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Link
        href={profileHref}
        className={
          compact
            ? "font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
            : "text-xl font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
        }
      >
        {author.nickname}
      </Link>
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
        {author.major ? <span>{author.major}</span> : null}
        {author.year ? <span>{author.year}</span> : null}
        <StatusBadge>{author.profileVisibility}</StatusBadge>
      </div>
    </div>
  );
}
