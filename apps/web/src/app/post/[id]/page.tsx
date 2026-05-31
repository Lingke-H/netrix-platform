import Link from "next/link";
import { demoComments, demoPosts } from "@/data/mock";

export default function PostPage({ params }: { params: { id: string } }) {
  const post = demoPosts.find((item) => item.id === params.id);
  const comments = demoComments.filter((item) => item.postId === params.id);

  if (!post) {
    return <main className="p-8">Post not found.</main>;
  }

  return (
    <main className="min-h-dvh px-6 py-8">
      <article className="mx-auto max-w-4xl">
        <Link className="text-sm text-slate-400 hover:text-white" href={`/node/${post.hubSlug}`}>
          Back to node
        </Link>
        <div className="mt-5 rounded border border-white/10 bg-black/35 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-netrix-magenta">{post.authorPlugin}</p>
          <h1 className="mt-3 text-3xl font-semibold">{post.title}</h1>
          <p className="mt-2 text-sm text-slate-500">Asked by {post.authorName}</p>
          <p className="mt-6 leading-7 text-slate-200">{post.content}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xl font-medium">Answers</h2>
          <button className="rounded bg-netrix-gold px-4 py-2 text-sm font-semibold text-black">
            Summon Oracle
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {comments.map((comment) => (
            <section
              className="rounded border border-white/10 bg-black/30 p-5"
              key={comment.id}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{comment.authorName}</p>
                {comment.isAiGenerated ? (
                  <span className="rounded border border-netrix-gold px-2 py-1 text-xs text-netrix-gold">
                    AI peer
                  </span>
                ) : null}
              </div>
              <p className="mt-3 leading-7 text-slate-300">{comment.content}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

