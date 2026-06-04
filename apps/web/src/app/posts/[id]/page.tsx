import { notFound } from "next/navigation";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { Post } from "@/features/posts/schemas";
import { getCurrentUserPostDetail } from "@/features/posts/server/service";

export const dynamic = "force-dynamic";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPostType(type: Post["type"]) {
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

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const detail = await getCurrentUserPostDetail(id);

  if (!detail) {
    notFound();
  }

  const { post } = detail;

  return (
    <PageFrame
      eyebrow="Post detail"
      title={post.title}
      description="A published campus post with the author's academic profile summary."
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="ready">{formatPostType(post.type)}</StatusBadge>
        <StatusBadge>{post.visibility}</StatusBadge>
        <StatusBadge>{post.status}</StatusBadge>
        <span className="text-xs font-medium text-[var(--color-muted)]">{formatDate(post.createdAt)}</span>
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
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Author</p>
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">{post.author.nickname}</h2>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-[var(--color-muted)]">
            {post.author.major ? <span>{post.author.major}</span> : null}
            {post.author.year ? <span>{post.author.year}</span> : null}
          </div>
        </div>
      </aside>
    </PageFrame>
  );
}
