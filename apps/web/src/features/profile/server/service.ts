import { academicProfileFormInputSchema, type AcademicProfileFormInput } from "@/features/profile/schemas";
import { requireVerifiedCampusUser } from "@/server/auth/session";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles } from "@/server/db/schema";

export type AcademicProfileUpsertInput = Omit<AcademicProfileFormInput, "completionStatus" | "userId">;

export type AcademicProfileUpsertResult = {
  profileId: string;
  userId: string;
  completionStatus: "basic_complete";
  nextRoute: "/feed";
};

export class AcademicProfileUpsertError extends Error {
  constructor(
    message: string,
    public readonly code: "PROFILE_INPUT_INVALID" | "PROFILE_UPSERT_FAILED",
  ) {
    super(message);
    this.name = "AcademicProfileUpsertError";
  }
}

export const academicProfileUpsertInputSchema = academicProfileFormInputSchema.omit({
  completionStatus: true,
  userId: true,
});

export function parseAcademicProfileUpsertInput(input: unknown, userId: string): AcademicProfileFormInput {
  const parsedInput = academicProfileUpsertInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new AcademicProfileUpsertError("Academic profile input is invalid.", "PROFILE_INPUT_INVALID");
  }

  const trustedInput = academicProfileFormInputSchema.safeParse({
    ...parsedInput.data,
    completionStatus: "basic_complete",
    userId,
  });

  if (!trustedInput.success) {
    throw new AcademicProfileUpsertError("Academic profile input is invalid.", "PROFILE_INPUT_INVALID");
  }

  return trustedInput.data;
}

export async function upsertAcademicProfile(
  db: DbClient,
  userId: string,
  input: unknown,
): Promise<AcademicProfileUpsertResult> {
  const profileInput = parseAcademicProfileUpsertInput(input, userId);
  const now = new Date();
  const [profile] = await db
    .insert(academicProfiles)
    .values(profileInput)
    .onConflictDoUpdate({
      target: academicProfiles.userId,
      set: {
        collaborationPreference: profileInput.collaborationPreference,
        completionStatus: "basic_complete",
        helpNeeded: profileInput.helpNeeded,
        helpOffered: profileInput.helpOffered,
        interests: profileInput.interests,
        major: profileInput.major,
        modules: profileInput.modules,
        nickname: profileInput.nickname,
        skills: profileInput.skills,
        updatedAt: now,
        visibility: profileInput.visibility,
        year: profileInput.year,
      },
    })
    .returning({
      completionStatus: academicProfiles.completionStatus,
      id: academicProfiles.id,
      userId: academicProfiles.userId,
    });

  if (!profile || profile.completionStatus !== "basic_complete") {
    throw new AcademicProfileUpsertError("Unable to upsert the academic profile.", "PROFILE_UPSERT_FAILED");
  }

  return {
    completionStatus: "basic_complete",
    nextRoute: "/feed",
    profileId: profile.id,
    userId: profile.userId,
  };
}

export async function upsertCurrentUserAcademicProfile(input: unknown): Promise<AcademicProfileUpsertResult> {
  const session = await requireVerifiedCampusUser();
  const db = createDb();

  return upsertAcademicProfile(db, session.userId, input);
}
