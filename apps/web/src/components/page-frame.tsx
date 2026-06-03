type PageFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageFrame({ eyebrow, title, description, children }: PageFrameProps) {
  return (
    <section className="space-y-6 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] backdrop-blur">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold leading-tight text-[var(--color-ink)]">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-muted)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
