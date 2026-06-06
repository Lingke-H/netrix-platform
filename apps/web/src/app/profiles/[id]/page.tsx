import { notFound } from "next/navigation";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { PublicAcademicProfile } from "@/features/profile/schemas";
import { getCurrentUserVisibleAcademicProfile } from "@/features/profile/server/service";
import { resolveProtectedPageData } from "@/server/auth/redirects";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function FieldList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-sm text-[var(--color-muted)]">Not shared yet</span>;
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

function PublicProfileSummary({ profile }: { profile: PublicAcademicProfile }) {
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
        <ProfileField label="Modules" items={profile.modules} />
        <ProfileField label="Interests" items={profile.interests} />
        <ProfileField label="Collaboration" items={profile.collaborationPreference} />
      </div>
    </section>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const profile = await resolveProtectedPageData(`/profiles/${id}`, () => getCurrentUserVisibleAcademicProfile(id));

  if (!profile) {
    notFound();
  }

  const description =
    profile.visibility === "private"
      ? "Your private academic profile is visible only to you and platform permissions."
      : "A campus-visible academic profile shared by a verified NeTrix student.";

  return (
    <PageFrame
      eyebrow="Academic profile"
      title={profile.nickname}
      description={description}
    >
      <PublicProfileSummary profile={profile} />
    </PageFrame>
  );
}
