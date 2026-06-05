import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import {
  AcademicProfileForm,
  ProfileRequiredNotice,
} from "@/features/profile/components";
import { getCurrentUserProfileData } from "@/features/profile/server/service";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const query = await searchParams;
  const { gate, routeState } = await getCurrentUserProfileData();
  const showProfileRequiredNotice = query.reason === "profile-required";

  return (
    <PageFrame
      eyebrow="Onboarding"
      title="Academic Profile Setup"
      description="Confirm the academic signals that unlock posting, your profile page, and later AI-assisted profile refinement."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={gate.state === "profile_ready" ? "ready" : "caution"}>{gate.state}</StatusBadge>
        <StatusBadge>{routeState.completionStatus}</StatusBadge>
        <StatusBadge>{routeState.visibility}</StatusBadge>
      </div>

      {showProfileRequiredNotice ? <ProfileRequiredNotice /> : null}

      <AcademicProfileForm profile={routeState.profile} />
    </PageFrame>
  );
}
