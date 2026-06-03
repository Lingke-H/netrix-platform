"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { primaryRoutes } from "@/lib/routes";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[rgba(255,255,255,0.78)] px-5 py-4 shadow-[var(--shadow-soft)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">NeTrix scaffold baseline</p>
              <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Three-developer ready workspace</h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                这个基线只负责统一目录、脚本、路由骨架和共享边界，方便前端、后端和 AI 三条线立刻并行推进。
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white px-4 py-3 text-xs leading-6 text-[var(--color-muted)]">
              <div>`corepack pnpm dev`</div>
              <div>`corepack pnpm lint`</div>
              <div>`corepack pnpm typecheck`</div>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {primaryRoutes.map((route) => {
              const active = pathname === route.href || pathname.startsWith(`${route.href}/`);

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[rgba(29,107,87,0.18)]",
                  )}
                >
                  {route.label}
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
