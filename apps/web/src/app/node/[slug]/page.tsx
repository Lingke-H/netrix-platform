import Link from "next/link";
import { demoPosts } from "@/data/mock";

export default function NodePage({ params }: { params: { slug: string } }) {
  const posts = demoPosts.filter((post) => post.hubSlug === params.slug);

  return (
    <main className="min-h-dvh px-6 py-8">
      <section className="mx-auto max-w-4xl">
        <Link className="text-sm text-slate-400 hover:text-white" href="/matrix">
          Back to Matrix
        </Link>
        <h1 className="mt-4 text-3xl font-semibold capitalize">{params.slug.replaceAll("-", " ")}</h1>
        <div className="mt-6 flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              className="rounded border border-white/10 bg-black/35 p-5 hover:border-netrix-cyan"
              href={`/post/${post.id}`}
              key={post.id}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-netrix-cyan">{post.authorPlugin}</p>
              <h2 className="mt-2 text-xl font-medium">{post.title}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{post.content}</p>
              <p className="mt-4 text-xs text-slate-500">{post.commentCount} comments</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

