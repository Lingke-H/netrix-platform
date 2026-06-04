import Link from "next/link";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { AcademicProfile } from "@/features/profile/schemas";
import { getCurrentUserProfileData } from "@/features/profile/server/service";

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
  return (
    <section className="space-y-5">
      <div className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="ready">{profile.completionStatus}</StatusBadge>
          <StatusBadge>{profile.visibility}</StatusBadge>
          <span className="text-xs font-medium text-[var(--color-muted)]">Updated {new Date(profile.updatedAt).toLocaleString("en")}</span>
        </div>
        <div className="mt-4 space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">{profile.nickname}</h2>
          <div className="flex flex-wrap gap-2 text-sm font-medium text-[var(--color-muted)]">
            <span>{profile.major}</span>
            <span>{profile.year}</span>
          </div>
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

export default async function MePage() {
  const { gate, routeState } = await getCurrentUserProfileData();

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
    </PageFrame>
  );
}
