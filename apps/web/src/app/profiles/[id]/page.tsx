import { notFound } from "next/navigation";

import { PageFrame } from "@/components/page-frame";
import { PublicProfileSummary } from "@/features/profile/components";
import { getCurrentUserVisibleAcademicProfile } from "@/features/profile/server/service";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const profile = await getCurrentUserVisibleAcademicProfile(id);

  if (!profile) {
    notFound();
  }

  const description =
    profile.visibility === "private"
      ? "Your private academic profile is visible only to you and platform permissions."
      : "A campus-visible academic profile shared by a verified NeTrix student.";

  return (
    <PageFrame eyebrow="Academic profile" title={profile.nickname} description={description}>
      <PublicProfileSummary profile={profile} />
    </PageFrame>
  );
}
