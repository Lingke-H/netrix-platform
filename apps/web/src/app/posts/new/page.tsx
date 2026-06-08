import Link from "next/link";

import { PageFrame } from "@/components/page-frame";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { StatusBadge } from "@/components/status-badge";
import { createPostAction } from "@/features/posts/server/actions";
import { requirePageOnboardingGate } from "@/server/auth/redirects";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]";

const labelClass = "space-y-2 text-sm font-medium text-[var(--color-ink)]";

function ProfileRequiredPrompt({ completionStatus }: { completionStatus: string }) {
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
        href="/onboarding?reason=profile-required&next=%2Fposts%2Fnew"
        className="inline-flex bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
      >
        Complete profile
      </Link>
    </div>
  );
}

export default async function NewPostPage() {
  const gate = await requirePageOnboardingGate("/posts/new");
  const completionStatus = gate.profile?.completionStatus ?? "incomplete";

  return (
    <PageFrame
      eyebrow="Create post"
      title="New Academic Post"
      description="Create a Q&A, Resource, or Experience post for the campus academic feed."
    >
      {!gate.canCreatePost ? <ProfileRequiredPrompt completionStatus={completionStatus} /> : null}

      {gate.canCreatePost ? (
        <form action={createPostAction} className="space-y-5">
          <input name="next" type="hidden" value="/posts/new" />
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="ready">profile verified</StatusBadge>
            <StatusBadge>campus feed</StatusBadge>
          </div>

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
            <input name="title" type="text" minLength={4} maxLength={120} required className={inputClass} />
          </label>

          <label className={labelClass}>
            Body
            <textarea name="body" minLength={12} maxLength={4000} required rows={9} className={inputClass} />
          </label>

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

          <div className="flex justify-end">
            <PendingSubmitButton
              icon="send"
              label="Create post"
              pendingLabel="Creating..."
              className="bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgba(29,107,87,0.9)]"
            />
          </div>
        </form>
      ) : null}
    </PageFrame>
  );
}
