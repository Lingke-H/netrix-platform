import { Send } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { createPostAction } from "@/features/posts/server/actions";

const inputClass =
  "w-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]";

const labelClass = "space-y-2 text-sm font-medium text-[var(--color-ink)]";

export default function NewPostPage() {
  return (
    <PageFrame
      eyebrow="Create post"
      title="New Academic Post"
      description="Create a Q&A, Resource, or Experience post for the campus academic feed."
    >
      <form action={createPostAction} className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="ready">requires completed profile</StatusBadge>
          <StatusBadge>server action</StatusBadge>
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
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
          >
            <Send size={16} aria-hidden="true" />
            Create post
          </button>
        </div>
      </form>
    </PageFrame>
  );
}
