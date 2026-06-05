import Link from "next/link";
import { FileText, HelpCircle, LibraryBig, Plus } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/cn";
import { PostAuthorSummary } from "@/features/posts/components/post-author-summary";
import type { PostFeedItem, PostType } from "@/features/posts/schemas";

export type FeedPostTypeFilter = PostType | "all";

const postTypeLabels: Record<PostType, string> = {
  experience: "Experience",
  question: "Q&A",
  resource: "Resource",
};

const filterItems: Array<{ href: string; label: string; type: FeedPostTypeFilter }> = [
  { href: "/feed", label: "All", type: "all" },
  { href: "/feed?type=question", label: "Q&A", type: "question" },
  { href: "/feed?type=resource", label: "Resources", type: "resource" },
  { href: "/feed?type=experience", label: "Experience", type: "experience" },
];

export function formatPostType(type: PostType) {
  return postTypeLabels[type];
}

export function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PostTypeIcon({ type }: { type: PostType }) {
  const iconProps = { "aria-hidden": true, size: 17 };

  if (type === "question") {
    return <HelpCircle {...iconProps} />;
  }

  if (type === "resource") {
    return <LibraryBig {...iconProps} />;
  }

  return <FileText {...iconProps} />;
}

export function PostTypeFilter({ activeType }: { activeType: FeedPostTypeFilter }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterItems.map((item) => (
        <Link
          key={item.type}
          href={item.href}
          className={cn(
            "border px-3 py-2 text-sm font-semibold transition",
            item.type === activeType
              ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
              : "border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function FeedEmptyState({ activeType }: { activeType: FeedPostTypeFilter }) {
  const message =
    activeType === "all"
      ? "No campus posts yet. Once verified students publish Q&A, Resource, or Experience posts, they will appear here."
      : `No ${formatPostType(activeType).toLowerCase()} posts are visible yet.`;

  return (
    <div className="space-y-4 border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] px-5 py-8">
      <p className="text-sm leading-7 text-[var(--color-muted)]">{message}</p>
      <Link
        href="/posts/new"
        className="inline-flex items-center gap-2 bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
      >
        <Plus size={16} aria-hidden="true" />
        Create post
      </Link>
    </div>
  );
}

export function PostCard({ post }: { post: PostFeedItem }) {
  return (
    <article className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-5 py-4 transition hover:border-[rgba(29,107,87,0.42)]">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="ready">
          <span className="inline-flex items-center gap-1.5">
            <PostTypeIcon type={post.type} />
            {formatPostType(post.type)}
          </span>
        </StatusBadge>
        <StatusBadge>{post.visibility}</StatusBadge>
        <span className="text-xs font-medium text-[var(--color-muted)]">{formatPostDate(post.createdAt)}</span>
      </div>

      <div className="mt-4 space-y-2">
        <Link
          href={`/posts/${post.id}`}
          className="block text-xl font-semibold leading-snug text-[var(--color-ink)] hover:text-[var(--color-accent)]"
        >
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-7 text-[var(--color-muted)]">{post.body}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
        <PostAuthorSummary author={post.author} compact />
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
        <Link href={`/posts/${post.id}`} className="ml-auto text-[var(--color-accent)] hover:underline">
          Open post
        </Link>
      </div>
    </article>
  );
}
