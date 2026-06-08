"use client";

import {
  Check,
  LogOut,
  Mail,
  Save,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  className?: string;
  disabled?: boolean;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  icon: "check" | "dismiss" | "log-out" | "mail" | "save" | "send" | "sparkles";
  label: string;
  pendingLabel: string;
};

const iconMap = {
  check: Check,
  dismiss: X,
  "log-out": LogOut,
  mail: Mail,
  save: Save,
  send: Send,
  sparkles: Sparkles,
};

export function PendingSubmitButton({
  className = "",
  disabled = false,
  formAction,
  icon,
  label,
  pendingLabel,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();
  const Icon = iconMap[icon];

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      formAction={formAction}
      className={`inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Icon size={16} aria-hidden="true" />
      {pending ? pendingLabel : label}
    </button>
  );
}
