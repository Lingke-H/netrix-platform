import { describe, expect, it } from "vitest";

import {
  AcademicProfileUpsertError,
  parseAcademicProfileUpsertInput,
} from "@/features/profile/server/service";

const userId = "11111111-1111-4111-8111-111111111111";

const validInput = {
  collaborationPreference: ["pair study"],
  helpNeeded: ["signals"],
  helpOffered: ["typescript"],
  interests: ["web apps"],
  major: "computer-science",
  modules: ["COMP1048"],
  nickname: "TypeScript Builder",
  skills: ["react"],
  visibility: "campus",
  year: "year-2",
};

describe("academic profile upsert service", () => {
  it("builds trusted profile input and forces the current user completion status", () => {
    expect(
      parseAcademicProfileUpsertInput(
        {
          ...validInput,
          completionStatus: "recommendation_ready",
          userId: "99999999-9999-4999-8999-999999999999",
        },
        userId,
      ),
    ).toEqual({
      ...validInput,
      completionStatus: "basic_complete",
      userId,
    });
  });

  it("rejects invalid profile form input", () => {
    expect(() =>
      parseAcademicProfileUpsertInput(
        {
          ...validInput,
          nickname: "x",
        },
        userId,
      ),
    ).toThrow(AcademicProfileUpsertError);
  });
});
