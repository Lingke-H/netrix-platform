import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { PostSubmitButton } from "@/features/posts/components/post-submit-button";
import { createPostAction } from "@/features/posts/server/actions";

const inputClass =
  "w-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]";

const labelClass = "space-y-2 text-sm font-medium text-[var(--color-ink)]";

export function ProfileRequiredPrompt({ completionStatus }: { completionStatus: string }) {
  return (
    <div className="space-y-4 border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        Complete your academic profile before creating a campus post. This keeps posts connected to verified academic
        signals and unlocks the posting flow.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="caution">profile required</StatusBadge>
        <StatusBadge>{completionStatus}</StatusBadge>
      </div>
      <Link
        href="/onboarding?reason=profile-required"
        className="inline-flex bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
      >
        Complete profile
      </Link>
    </div>
  );
}

export function PostComposer() {
  return (
    <form action={createPostAction} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">completed profile required</StatusBadge>
        <StatusBadge>campus feed</StatusBadge>
      </div>

      <section className="space-y-4 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className={labelClass}>
            Type
            <select name="type" defaultValue="question" className={inputClass}>
              <option value="question">Q&A</option>
              <option value="resource">Resource</option>
              <option value="experience">Experience</option>
            </select>
          </label>

          <label className={labelClass}>
            Visibility
            <select name="visibility" defaultValue="campus" className={inputClass}>
              <option value="campus">Campus</option>
              <option value="private">Private</option>
            </select>
          </label>

          <label className={labelClass}>
            Status
            <select name="status" defaultValue="published" className={inputClass}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        <label className={labelClass}>
          Title
          <input
            name="title"
            type="text"
            minLength={4}
            maxLength={120}
            required
            className={inputClass}
            placeholder="Ask a question, share a resource, or explain an academic experience"
          />
        </label>

        <label className={labelClass}>
          Body
          <textarea
            name="body"
            minLength={12}
            maxLength={4000}
            required
            rows={9}
            className={inputClass}
            placeholder="Write enough context for another verified student to understand and respond."
          />
        </label>
      </section>

      <section className="space-y-4 border border-[var(--color-line)] bg-white p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Academic signals</h2>
          <p className="text-xs leading-6 text-[var(--color-muted)]">
            Use comma-separated modules and tags so later recommendation work can reuse these signals.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Modules
            <input name="modules" type="text" className={inputClass} placeholder="COMP1048, MATH1038" />
          </label>

          <label className={labelClass}>
            Tags
            <input name="tags" type="text" className={inputClass} placeholder="typescript, coursework" />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          href="/feed"
          className="inline-flex items-center justify-center border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Back to feed
        </Link>
        <PostSubmitButton />
      </div>
    </form>
  );
}
