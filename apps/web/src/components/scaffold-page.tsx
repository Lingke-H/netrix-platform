import { StatusBadge } from "@/components/status-badge";

type ScaffoldPageProps = {
  route: string;
  title: string;
  summary: string;
  owner: "Frontend" | "Backend" | "AI";
  focus: string[];
  sharedContracts: string[];
};

export function ScaffoldPage({
  route,
  title,
  summary,
  owner,
  focus,
  sharedContracts,
}: ScaffoldPageProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <StatusBadge tone="ready">{owner} owner</StatusBadge>
          <StatusBadge>{route}</StatusBadge>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">{title}</h2>
          <p className="text-sm leading-7 text-[var(--color-muted)]">{summary}</p>
        </div>
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">本页首批实现重点</h3>
          <ul className="space-y-3 text-sm text-[var(--color-ink)]">
            {focus.map((item) => (
              <li key={item} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <aside className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">共享契约</h3>
          <ul className="space-y-2 text-sm leading-7 text-[var(--color-muted)]">
            {sharedContracts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
