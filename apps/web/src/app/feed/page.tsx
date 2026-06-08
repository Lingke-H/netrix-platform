import Link from "next/link";
import { Network, UserCircle } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUserConnectionsPageData } from "@/features/connections/server/service";
import type { PostAuthorSummary, PostFeedItem } from "@/features/posts/schemas";
import { getCurrentUserCampusFeed } from "@/features/posts/server/service";
import { getPostAuthorProfileHref } from "@/features/posts/types";
import { getCurrentUserProfileData } from "@/features/profile/server/service";
import { getCurrentUserRecommendationFeed } from "@/features/recommendations/server/service";
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

function FeedSidecar({
  acceptedCount,
  pendingCount,
  profileStatus,
  recommendationCount,
}: {
  acceptedCount: number;
  pendingCount: number;
  profileStatus: string;
  recommendationCount: number;
}) {
  return (
    <aside className="space-y-4">
      <section className="space-y-3 border border-[var(--color-line)] bg-white p-4">
        <div className="flex items-center gap-2">
          <UserCircle size={18} className="text-[var(--color-accent)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Profile progress</h2>
        </div>
        <StatusBadge tone={profileStatus === "incomplete" ? "caution" : "ready"}>{profileStatus}</StatusBadge>
        <Link
          href="/me"
          className="inline-flex h-9 items-center justify-center border border-[var(--color-line)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Review profile
        </Link>
      </section>

      <section className="space-y-3 border border-[var(--color-line)] bg-white p-4">
        <div className="flex items-center gap-2">
          <Network size={18} className="text-[var(--color-accent)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Academic network</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={recommendationCount > 0 ? "ready" : "caution"}>
            {recommendationCount} recommendations
          </StatusBadge>
          <StatusBadge tone={pendingCount > 0 ? "caution" : "info"}>{pendingCount} pending</StatusBadge>
          <StatusBadge tone={acceptedCount > 0 ? "ready" : "info"}>{acceptedCount} accepted</StatusBadge>
        </div>
        <p className="text-sm leading-7 text-[var(--color-muted)]">
          Use recommendations to request academic connections, then continue into messages after acceptance.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/recommendations"
            className="inline-flex h-9 items-center justify-center border border-[var(--color-line)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Recommendations
          </Link>
          <Link
            href="/connections"
            className="inline-flex h-9 items-center justify-center border border-[var(--color-line)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Connections
          </Link>
        </div>
      </section>
    </aside>
  );
}

export default async function FeedPage() {
  const { connections, feed, profileData, recommendations } = await resolveProtectedPageData("/feed", async () => {
    const [campusFeed, currentProfileData] = await Promise.all([
      getCurrentUserCampusFeed(),
      getCurrentUserProfileData(),
    ]);
    const [recommendationFeed, connectionsPageData] =
      currentProfileData.gate.state === "profile_ready"
        ? await Promise.all([getCurrentUserRecommendationFeed(), getCurrentUserConnectionsPageData()])
        : [
            {
              hasEnoughSignals: false,
              items: [],
            },
            {
              accepted: [],
              pending: [],
              rejected: [],
            },
          ];

    return {
      connections: connectionsPageData,
      feed: campusFeed,
      profileData: currentProfileData,
      recommendations: recommendationFeed,
    };
  });

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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {feed.items.length === 0 ? (
          <FeedEmptyState />
        ) : (
          <div className="space-y-4">
            {feed.items.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
            {feed.hasNextPage ? (
              <p className="text-sm leading-7 text-[var(--color-muted)]">
                More posts are available beyond this first page.
              </p>
            ) : null}
          </div>
        )}

        <div className="lg:sticky lg:top-6 lg:self-start">
          <FeedSidecar
            acceptedCount={connections.accepted.length}
            pendingCount={connections.pending.length}
            profileStatus={profileData.routeState.completionStatus}
            recommendationCount={recommendations.items.length}
          />
        </div>
      </div>
    </PageFrame>
  );
}
