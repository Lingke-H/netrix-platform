import { describe, expect, it, vi } from "vitest";

const persistCurrentUserRecommendationDryRunDraftsMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/recommendations/server/service", () => ({
  persistCurrentUserRecommendationDryRunDrafts: persistCurrentUserRecommendationDryRunDraftsMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { persistRecommendationDryRunDraftsAction } from "@/features/recommendations/server/actions";

describe("recommendation server actions", () => {
  it("persists current user dry-run drafts and revalidates recommendation surfaces", async () => {
    const result = {
      inserted: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          recommendedUserId: "22222222-2222-4222-8222-222222222222",
          recipientUserId: "33333333-3333-4333-8333-333333333333",
          status: "active",
        },
      ],
      rejected: [],
    };

    persistCurrentUserRecommendationDryRunDraftsMock.mockResolvedValue(result);

    await expect(persistRecommendationDryRunDraftsAction()).resolves.toBe(result);
    expect(persistCurrentUserRecommendationDryRunDraftsMock).toHaveBeenCalledOnce();
    expect(revalidatePathMock).toHaveBeenCalledWith("/recommendations");
    expect(revalidatePathMock).toHaveBeenCalledWith("/connections");
  });
});
