import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { PostAuthorSummary } from "@/features/posts/components/post-author-summary";
import { formatPostDate, formatPostType } from "@/features/posts/components/post-card";
import type { Post } from "@/features/posts/schemas";

export function PostDetailView({ post }: { post: Post }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="ready">{formatPostType(post.type)}</StatusBadge>
          <StatusBadge>{post.visibility}</StatusBadge>
          <StatusBadge>{post.status}</StatusBadge>
          <span className="text-xs font-medium text-[var(--color-muted)]">{formatPostDate(post.createdAt)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Feed
          </Link>
          <Link
            href="/posts/new"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
          >
            <Plus size={16} aria-hidden="true" />
            New post
          </Link>
        </div>
      </div>

      <article className="space-y-5 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-ink)]">{post.body}</p>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {post.modules.map((module) => (
            <span key={module} className="bg-[var(--color-accent-soft)] px-2 py-1 text-[var(--color-accent)]">
              {module}
            </span>
          ))}
          {post.tags.map((tag) => (
            <span key={tag} className="bg-[rgba(61,90,134,0.12)] px-2 py-1 text-[var(--color-info)]">
              #{tag}
            </span>
          ))}
        </div>
      </article>

      <aside className="border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Author</p>
          <PostAuthorSummary author={post.author} />
        </div>
      </aside>
    </div>
  );
}
