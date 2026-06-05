import { PageFrame } from "@/components/page-frame";
import { PostComposer, ProfileRequiredPrompt } from "@/features/posts/components";
import { getOnboardingGate } from "@/server/auth/onboarding-gate";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const gate = await getOnboardingGate();
  const completionStatus = gate.profile?.completionStatus ?? "incomplete";

  return (
    <PageFrame
      eyebrow="Create post"
      title="New Academic Post"
      description="Create a Q&A, Resource, or Experience post for the campus academic feed."
    >
      {!gate.canCreatePost ? <ProfileRequiredPrompt completionStatus={completionStatus} /> : null}
      {gate.canCreatePost ? <PostComposer /> : null}
    </PageFrame>
  );
}
