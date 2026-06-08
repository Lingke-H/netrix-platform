"use client";

import { Check, Send, X } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ConnectionActionButtonProps = {
  className?: string;
  label: ReactNode;
  pendingLabel: string;
  icon: "accept" | "cancel" | "request";
  disabled?: boolean;
};

const iconMap = {
  accept: Check,
  cancel: X,
  request: Send,
};

export function ConnectionActionButton({
  className,
  disabled = false,
  icon,
  label,
  pendingLabel,
}: ConnectionActionButtonProps) {
  const { pending } = useFormStatus();
  const Icon = iconMap[icon];

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`inline-flex items-center justify-center gap-2 border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className ?? "border-[var(--color-line)] bg-white text-[var(--color-ink)] enabled:hover:border-[var(--color-accent)] enabled:hover:text-[var(--color-accent)]"}`}
    >
      <Icon size={16} aria-hidden="true" />
      {pending ? pendingLabel : label}
    </button>
  );
}
