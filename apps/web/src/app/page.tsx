import Link from "next/link";

const protocols = ["Seeker", "Oracle", "Builder", "Stealth"];
const plugins = ["Optimization Starter Pack", "Regression Debugger", "Advanced Calculus Engine"];

export default function HomePage() {
  return (
    <main className="min-h-dvh px-6 py-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-netrix-cyan">NeTrix MVP</p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight text-white">
            Campus academic intelligence, corrected by humans.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Choose a protocol, equip a plugin, enter the academic matrix, and summon Oracle only when the discussion needs a first spark.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border border-cyan-300/30 bg-black/30 p-5">
            <h2 className="text-lg font-medium text-netrix-cyan">Protocol</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {protocols.map((protocol) => (
                <button
                  className="rounded border border-white/15 px-4 py-3 text-left text-sm text-slate-100 hover:border-netrix-cyan"
                  key={protocol}
                >
                  {protocol}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded border border-fuchsia-300/30 bg-black/30 p-5">
            <h2 className="text-lg font-medium text-netrix-magenta">Plugin</h2>
            <div className="mt-4 flex flex-col gap-3">
              {plugins.map((plugin) => (
                <button
                  className="rounded border border-white/15 px-4 py-3 text-left text-sm text-slate-100 hover:border-netrix-magenta"
                  key={plugin}
                >
                  {plugin}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Link
          className="inline-flex w-fit rounded bg-netrix-cyan px-5 py-3 text-sm font-semibold text-black"
          href="/matrix"
        >
          Enter Matrix
        </Link>
      </section>
    </main>
  );
}

