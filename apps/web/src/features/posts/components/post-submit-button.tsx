"use client";

import { Send } from "lucide-react";
import { useFormStatus } from "react-dom";

export function PostSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-[rgba(29,107,87,0.9)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Send size={16} aria-hidden="true" />
      {pending ? "Creating..." : "Create post"}
    </button>
  );
}
