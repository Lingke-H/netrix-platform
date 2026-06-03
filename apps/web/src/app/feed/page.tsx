import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";

export default function FeedPage() {
  return (
    <PageFrame
      eyebrow="Primary entry"
      title="Academic Feed-first + Profile Sidecar"
      description="这页是产品主入口。前端可以从这里接帖子卡片、筛选器和侧栏布局；后端从这里提供 feed DTO；AI 线后续把推荐与档案信号接进右侧侧栏。"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="ready">Frontend owner</StatusBadge>
            <StatusBadge>Route /feed</StatusBadge>
          </div>
          <div className="rounded-2xl border border-dashed border-[var(--color-line)] px-4 py-6 text-sm leading-7 text-[var(--color-muted)]">
            这里将承接三类帖子的信息流、标签筛选、模块筛选和空状态。第一轮目标是先把列表骨架与帖子卡片接上，确保
            {" demo user -> profile -> post -> recommendation card -> request connect "}
            这条路径可以在视觉上顺畅展开。
          </div>
          <div className="grid gap-3">
            {["Q&A post card placeholder", "Resource post card placeholder", "Experience Sharing post card placeholder"].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--color-line)] bg-[rgba(244,240,231,0.6)] px-4 py-4 text-sm text-[var(--color-ink)]">
                {item}
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="caution">Shared surface</StatusBadge>
            <StatusBadge>profile + recommendation</StatusBadge>
          </div>
          <div className="space-y-3 text-sm leading-7 text-[var(--color-muted)]">
            <p>这里预留档案完整度、AI 档案建议、推荐档案卡片和待处理请求。前端可以先固定布局，后端和 AI 线随后接真实数据。</p>
            <div className="rounded-2xl border border-dashed border-[var(--color-line)] px-4 py-4">
              Profile completeness placeholder
            </div>
            <div className="rounded-2xl border border-dashed border-[var(--color-line)] px-4 py-4">
              Recommendation card placeholder
            </div>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}
