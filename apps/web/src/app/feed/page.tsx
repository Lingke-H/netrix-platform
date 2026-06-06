import Link from "next/link";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { PostAuthorSummary, PostFeedItem } from "@/features/posts/schemas";
import { getCurrentUserCampusFeed } from "@/features/posts/server/service";
import { getPostAuthorProfileHref } from "@/features/posts/types";
import { resolveProtectedPageData } from "@/server/auth/redirects";

export const dynamic = "force-dynamic";

function formatPostType(type: PostFeedItem["type"]) {
  const labels = {
    experience: "Experience",
    question: "Q&A",
    resource: "Resource",
  } as const;

  return labels[type];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function FeedEmptyState() {
  return (
    <div className="border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] px-5 py-8 text-sm leading-7 text-[var(--color-muted)]">
      No campus posts yet. Once verified students publish Q&A, Resource, or Experience posts, they will appear here.
    </div>
  );
}

function AuthorName({ author }: { author: PostAuthorSummary }) {
  const profileHref = getPostAuthorProfileHref(author);

  if (!profileHref) {
    return <span>{author.nickname}</span>;
  }

  return (
    <Link href={profileHref} className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)]">
      {author.nickname}
    </Link>
  );
}

function FeedPostCard({ post }: { post: PostFeedItem }) {
  return (
    <article className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="ready">{formatPostType(post.type)}</StatusBadge>
        <StatusBadge>{post.visibility}</StatusBadge>
        <span className="text-xs font-medium text-[var(--color-muted)]">{formatDate(post.createdAt)}</span>
      </div>
      <div className="mt-4 space-y-2">
        <h2 className="text-xl font-semibold leading-snug text-[var(--color-ink)]">{post.title}</h2>
        <p className="line-clamp-3 text-sm leading-7 text-[var(--color-muted)]">{post.body}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
        <AuthorName author={post.author} />
        {post.author.major ? <span>{post.author.major}</span> : null}
        {post.author.year ? <span>{post.author.year}</span> : null}
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
  );
}

export default async function FeedPage() {
  const feed = await resolveProtectedPageData("/feed", () => getCurrentUserCampusFeed());

  return (
    <PageFrame
      eyebrow="Campus feed"
      title="Academic Feed"
      description="Published campus posts from verified students, enriched with each author's academic profile summary."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">published</StatusBadge>
        <StatusBadge>campus</StatusBadge>
        <StatusBadge>{feed.items.length} posts</StatusBadge>
      </div>
      {feed.items.length === 0 ? (
        <FeedEmptyState />
      ) : (
        <div className="space-y-4">
          {feed.items.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
          {feed.hasNextPage ? (
            <p className="text-sm leading-7 text-[var(--color-muted)]">More posts are available beyond this first page.</p>
          ) : null}
        </div>
      )}
    </PageFrame>
  );
}
