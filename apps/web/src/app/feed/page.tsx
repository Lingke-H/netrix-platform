import Link from "next/link";
import { Plus, UserCircle } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import {
  FeedEmptyState,
  PostCard,
  PostTypeFilter,
  type FeedPostTypeFilter,
} from "@/features/posts/components";
import type { PostType } from "@/features/posts/schemas";
import { getCurrentUserCampusFeed } from "@/features/posts/server/service";

export const dynamic = "force-dynamic";

type FeedPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

const postTypes = new Set<PostType>(["question", "resource", "experience"]);

function getActiveType(value: string | undefined): FeedPostTypeFilter {
  return value && postTypes.has(value as PostType) ? (value as PostType) : "all";
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const query = await searchParams;
  const activeType = getActiveType(query.type);
  const feed = await getCurrentUserCampusFeed();
  const visibleItems = activeType === "all" ? feed.items : feed.items.filter((post) => post.type === activeType);

  return (
    <PageFrame
      eyebrow="Campus feed"
      title="Academic Feed"
      description="Published campus posts from verified students, enriched with each author's academic profile summary."
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="ready">published</StatusBadge>
          <StatusBadge>campus</StatusBadge>
          <StatusBadge>{visibleItems.length} visible posts</StatusBadge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/me"
            className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <UserCircle size={16} aria-hidden="true" />
            My profile
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

      <PostTypeFilter activeType={activeType} />

      {visibleItems.length === 0 ? (
        <FeedEmptyState activeType={activeType} />
      ) : (
        <div className="space-y-4">
          {visibleItems.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {feed.hasNextPage ? (
            <p className="text-sm leading-7 text-[var(--color-muted)]">More posts are available beyond this first page.</p>
          ) : null}
        </div>
      )}
    </PageFrame>
  );
}
