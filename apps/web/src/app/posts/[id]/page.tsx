import { notFound } from "next/navigation";

import { PageFrame } from "@/components/page-frame";
import { PostDetailView } from "@/features/posts/components";
import { getCurrentUserPostDetail } from "@/features/posts/server/service";

export const dynamic = "force-dynamic";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const detail = await getCurrentUserPostDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <PageFrame
      eyebrow="Post detail"
      title={detail.post.title}
      description="A published campus post with the author's academic profile summary."
    >
      <PostDetailView post={detail.post} />
    </PageFrame>
  );
}
