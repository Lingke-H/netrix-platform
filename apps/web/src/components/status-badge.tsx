import { cn } from "@/lib/cn";

const toneClasses = {
  ready: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  caution: "bg-[rgba(181,106,30,0.14)] text-[var(--color-warning)]",
  info: "bg-[rgba(61,90,134,0.12)] text-[var(--color-info)]",
} as const;

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
};

export function StatusBadge({ children, tone = "info" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
