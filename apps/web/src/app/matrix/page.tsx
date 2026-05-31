import Link from "next/link";

const nodes = [
  { slug: "math-modeling", label: "Math Modeling", x: "18%", y: "34%", color: "cyan" },
  { slug: "business-analytics", label: "Business Analytics", x: "62%", y: "28%", color: "magenta" },
  { slug: "exam-sprint", label: "Exam Sprint", x: "42%", y: "68%", color: "gold" },
];

export default function MatrixPage() {
  return (
    <main className="min-h-dvh px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-netrix-cyan">Matrix</p>
            <h1 className="text-3xl font-semibold">Academic nodes</h1>
          </div>
          <Link className="text-sm text-slate-300 hover:text-white" href="/">
            Change protocol
          </Link>
        </div>

        <section className="relative h-[620px] overflow-hidden rounded border border-white/10 bg-black/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(35,247,255,0.15),transparent_45%)]" />
          {nodes.map((node) => (
            <Link
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black px-5 py-4 text-sm font-medium text-white shadow-[0_0_40px_rgba(35,247,255,0.35)] hover:border-white"
              href={`/node/${node.slug}`}
              key={node.slug}
              style={{ left: node.x, top: node.y }}
            >
              {node.label}
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

