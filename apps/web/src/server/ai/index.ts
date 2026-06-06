export { getAiClient } from "./client";
export { createAiJobRecord, type AiJobRecord, type AiJobStatus, type AiJobType, type CreateAiJobInput } from "./jobs";
export {
  aiPromptVersions,
  parseNicknameSuggestionOutput,
  parseProfilePortraitOutput,
  parseRecommendationExplanationOutput,
  type AiPromptKey,
} from "./contracts";
export { buildNicknameSuggestions, type NicknameCandidateInput } from "./nickname";
export { buildProfilePortrait, type ProfilePortraitCandidateInput } from "./profile-portrait";
export { buildRecommendation, type RecommendationCandidateInput } from "./recommendation";
export { runCoreRecommendationPath, type CorePathInput, type CorePathResult } from "./core-path";
export { scoreRecommendationMatch, type RecommendationScoringInput, type RecommendationSignalBundle } from "./scoring";
export {
  createJob,
  updateJobStatus,
  getJobById,
  listJobsForUser,
  getCurrentUserJob,
  listCurrentUserJobs,
  AiJobError,
} from "./job-service";
export {
  upsertPortrait,
  getPortraitForUser,
  confirmPortrait,
  dismissPortrait,
  getCurrentUserPortrait,
  upsertCurrentUserPortrait,
  confirmCurrentUserPortrait,
  dismissCurrentUserPortrait,
  AcademicPortraitError,
} from "./portrait-service";
export {
  persistAiPortrait,
  persistAiRecommendation,
  persistAiNicknameDraft,
  type PersistedAiPortrait,
  type PersistedAiRecommendation,
  type PersistedAiNicknameDraft,
} from "./persist";
export {
  confirmNickname,
  confirmCurrentUserNickname,
  NicknameUpdateError,
} from "./nickname-service";
