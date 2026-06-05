import Link from "next/link";
import { Pencil } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { ProfileSignalField } from "@/features/profile/components/profile-fields";
import type { AcademicProfile } from "@/features/profile/schemas";

export function ProfileSummary({ profile }: { profile: AcademicProfile }) {
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
        <ProfileSignalField label="Modules" items={profile.modules} />
        <ProfileSignalField label="Interests" items={profile.interests} />
        <ProfileSignalField label="Skills" items={profile.skills} />
        <ProfileSignalField label="Help offered" items={profile.helpOffered} />
        <ProfileSignalField label="Help needed" items={profile.helpNeeded} />
        <ProfileSignalField label="Collaboration" items={profile.collaborationPreference} />
      </div>
    </section>
  );
}

export function EmptyProfileState() {
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
