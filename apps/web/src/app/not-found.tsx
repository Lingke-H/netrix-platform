import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[rgba(255,255,255,0.82)] px-6 py-10 shadow-[var(--shadow-soft)]">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Not found</p>
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">这个路由还没有对应页面。</h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
          目前仓库只完成了可并行开发的脚手架基线。你可以回到信息流入口，继续从主要页面开始接功能。
        </p>
        <Link className="inline-flex rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white" href="/feed">
          回到 Feed
        </Link>
      </div>
    </div>
  );
}
