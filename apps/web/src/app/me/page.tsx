import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { EmptyProfileState, ProfileSummary } from "@/features/profile/components";
import { getCurrentUserProfileData } from "@/features/profile/server/service";

export const dynamic = "force-dynamic";

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
