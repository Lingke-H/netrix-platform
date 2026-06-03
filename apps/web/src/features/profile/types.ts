import type {
  AcademicPortrait,
  AcademicProfile,
  AcademicProfileFormInput,
  ProfileCompletionStatus,
  ProfileVisibility,
  PublicAcademicProfile,
} from "./schemas";

export type ProfileFormMode = "create" | "edit";

export type ProfileRouteState = {
  profile: AcademicProfile | null;
  portrait: AcademicPortrait | null;
  completionStatus: ProfileCompletionStatus;
  visibility: ProfileVisibility;
};

export type ProfileDraftPayload = AcademicProfileFormInput;
export type PublicProfileCardData = Pick<
  PublicAcademicProfile,
  "userId" | "nickname" | "major" | "year" | "interests" | "completionStatus"
>;
