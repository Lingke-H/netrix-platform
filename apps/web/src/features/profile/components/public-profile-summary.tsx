import { StatusBadge } from "@/components/status-badge";
import { ProfileSignalField } from "@/features/profile/components/profile-fields";
import type { PublicAcademicProfile } from "@/features/profile/schemas";

export function PublicProfileSummary({ profile }: { profile: PublicAcademicProfile }) {
  return (
    <section className="space-y-5">
      <div className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="ready">{profile.completionStatus}</StatusBadge>
          <StatusBadge>{profile.visibility}</StatusBadge>
          <span className="text-xs font-medium text-[var(--color-muted)]">
            Updated {new Date(profile.updatedAt).toLocaleString("en")}
          </span>
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
        <ProfileSignalField label="Modules" items={profile.modules} emptyText="Not shared yet" />
        <ProfileSignalField label="Interests" items={profile.interests} emptyText="Not shared yet" />
        <ProfileSignalField label="Collaboration" items={profile.collaborationPreference} emptyText="Not shared yet" />
      </div>
    </section>
  );
}
