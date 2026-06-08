import Link from "next/link";
import { Pencil } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { StatusBadge } from "@/components/status-badge";
import type { AiJobRecord } from "@/server/ai/jobs";
import type { AcademicPortrait, AcademicProfile } from "@/features/profile/schemas";
import { getCurrentUserProfileData } from "@/features/profile/server/service";
import { listCurrentUserJobs } from "@/server/ai/job-service";
import { confirmPortraitAction, dismissPortraitAction } from "@/features/profile/server/portrait-actions";
import { resolveProtectedPageData } from "@/server/auth/redirects";

export const dynamic = "force-dynamic";

function FieldList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-sm text-[var(--color-muted)]">Not added yet</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="bg-[var(--color-accent-soft)] px-2 py-1 text-xs font-medium text-[var(--color-accent)]">
          {item}
        </span>
      ))}
    </div>
  );
}

function ProfileField({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-2 border border-[var(--color-line)] bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</h3>
      <FieldList items={items} />
    </div>
  );
}

function ProfileSummary({ profile }: { profile: AcademicProfile }) {
  const visibilityDescription =
    profile.visibility === "private"
      ? "Private: visible only to you and platform permissions."
      : "Campus: visible to verified UNNC campus users.";

  return (
    <section className="space-y-5">
      <div className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="ready">{profile.completionStatus}</StatusBadge>
            <StatusBadge>{profile.visibility}</StatusBadge>
            <span className="text-xs font-medium text-[var(--color-muted)]">
              Updated {new Date(profile.updatedAt).toLocaleString("en")}
            </span>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <Pencil size={16} aria-hidden="true" />
            Edit profile
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">{profile.nickname}</h2>
          <div className="flex flex-wrap gap-2 text-sm font-medium text-[var(--color-muted)]">
            <span>{profile.major}</span>
            <span>{profile.year}</span>
          </div>
          <p className="text-xs leading-6 text-[var(--color-muted)]">{visibilityDescription}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField label="Modules" items={profile.modules} />
        <ProfileField label="Interests" items={profile.interests} />
        <ProfileField label="Skills" items={profile.skills} />
        <ProfileField label="Help offered" items={profile.helpOffered} />
        <ProfileField label="Help needed" items={profile.helpNeeded} />
        <ProfileField label="Collaboration" items={profile.collaborationPreference} />
      </div>
    </section>
  );
}

function EmptyProfileState() {
  return (
    <div className="space-y-4 border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5">
      <p className="text-sm leading-7 text-[var(--color-muted)]">
        Your campus account is verified, but your academic profile has not been completed yet.
      </p>
      <Link
        href="/onboarding"
        className="inline-flex bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
      >
        Complete profile
      </Link>
    </div>
  );
}

function PortraitSection({ portrait }: { portrait: AcademicPortrait }) {
  return (
    <section className="space-y-4 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={portrait.status === "confirmed" ? "ready" : "info"}>
            {portrait.status}
          </StatusBadge>
          {portrait.promptVersion ? (
            <span className="text-xs font-medium text-[var(--color-muted)]">
              v{portrait.promptVersion}
            </span>
          ) : null}
        </div>
        {portrait.status !== "confirmed" && portrait.status !== "dismissed" ? (
          <div className="flex items-center gap-2">
            <form action={confirmPortraitAction}>
              <PendingSubmitButton
                icon="check"
                label="Confirm"
                pendingLabel="Confirming..."
                className="inline-flex h-8 items-center gap-2 border border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] px-3 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(36,117,95,0.16)]"
              />
            </form>
            <form action={dismissPortraitAction}>
              <PendingSubmitButton
                icon="dismiss"
                label="Dismiss"
                pendingLabel="Dismissing..."
                className="inline-flex h-8 items-center gap-2 border border-[rgba(181,106,30,0.3)] bg-[rgba(181,106,30,0.1)] px-3 text-xs font-semibold text-[var(--color-warning)] transition hover:bg-[rgba(181,106,30,0.16)]"
              />
            </form>
          </div>
        ) : null}
      </div>
      {portrait.summary ? (
        <p className="text-sm leading-7 text-[var(--color-muted)]">{portrait.summary}</p>
      ) : null}
      {portrait.strengthsDraft.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Strengths
          </h3>
          <div className="flex flex-wrap gap-2">
            {portrait.strengthsDraft.map((s) => (
              <span key={s} className="bg-[var(--color-accent-soft)] px-2 py-1 text-xs font-medium text-[var(--color-accent)]">
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {portrait.suggestedTags.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Suggested tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {portrait.suggestedTags.map((t) => (
              <span key={t} className="bg-[rgba(61,90,134,0.12)] px-2 py-1 text-xs font-medium text-[var(--color-info)]">
                #{t}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {portrait.collaborationDraft ? (
        <p className="text-sm leading-7 text-[var(--color-muted)]">
          Collaboration style: {portrait.collaborationDraft}
        </p>
      ) : null}
    </section>
  );
}

export default async function MePage() {
  const { gate, routeState } = await resolveProtectedPageData("/me", () => getCurrentUserProfileData());
  const jobs: AiJobRecord[] = gate.state === "profile_ready" ? await resolveProtectedPageData("/me", async () => listCurrentUserJobs(5)) : [];

  return (
    <PageFrame
      eyebrow="My academic profile"
      title="Academic Profile"
      description="Your current profile state, onboarding gate status, and confirmed academic signals."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={gate.state === "profile_ready" ? "ready" : "caution"}>{gate.state}</StatusBadge>
        <StatusBadge>{routeState.completionStatus}</StatusBadge>
        <StatusBadge>{routeState.visibility}</StatusBadge>
      </div>

      {routeState.profile ? <ProfileSummary profile={routeState.profile} /> : <EmptyProfileState />}

      {routeState.portrait ? <PortraitSection portrait={routeState.portrait} /> : null}

      {jobs.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Recent AI activity</h2>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-wrap items-center gap-3 border border-[var(--color-line)] bg-white px-4 py-3">
                <StatusBadge tone={job.status === "succeeded" ? "ready" : job.status === "failed" ? "caution" : "info"}>
                  {job.status}
                </StatusBadge>
                <span className="text-xs font-medium text-[var(--color-muted)]">
                  {job.type === "nickname" ? "Nickname" : job.type === "profile-portrait" ? "Portrait" : "Recommendation"}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {new Date(job.createdAt).toLocaleString("en")}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </PageFrame>
  );
}
