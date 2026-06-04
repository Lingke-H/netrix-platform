import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCompletedAcademicProfileMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/auth/onboarding-gate", () => ({
  requireCompletedAcademicProfile: requireCompletedAcademicProfileMock,
}));

import { buildEmptyRecommendationFeedData, getCurrentUserRecommendationFeed } from "@/features/recommendations/server/service";

describe("recommendation read service", () => {
  beforeEach(() => {
    requireCompletedAcademicProfileMock.mockReset();
  });

  it("builds the initial empty recommendation feed DTO", () => {
    expect(buildEmptyRecommendationFeedData()).toEqual({
      hasEnoughSignals: false,
      items: [],
    });
  });

  it("requires a completed academic profile before reading recommendations", async () => {
    requireCompletedAcademicProfileMock.mockResolvedValue({
      canCreatePost: true,
      canViewOwnProfile: true,
      nextRoute: "/feed",
      profile: {
        completionStatus: "basic_complete",
        id: "11111111-1111-4111-8111-111111111111",
      },
      session: {
        authUserId: "22222222-2222-4222-8222-222222222222",
        email: "student@nottingham.edu.cn",
        emailDomain: "nottingham.edu.cn",
        emailVerified: true,
        role: "student",
        userId: "33333333-3333-4333-8333-333333333333",
        verifiedAt: "2026-01-02T03:04:05.000Z",
      },
      state: "profile_ready",
    });

    await expect(getCurrentUserRecommendationFeed()).resolves.toEqual({
      hasEnoughSignals: false,
      items: [],
    });
    expect(requireCompletedAcademicProfileMock).toHaveBeenCalledOnce();
  });
});
