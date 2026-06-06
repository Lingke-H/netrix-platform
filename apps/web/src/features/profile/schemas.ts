import { z } from "zod";

export const majorSchema = z.enum([
  "math",
  "computer-science",
  "eee",
  "fam",
  "ibe",
  "other",
]);

export const studyYearSchema = z.enum([
  "foundation",
  "year-1",
  "year-2",
  "year-3",
  "year-4",
  "postgraduate",
]);

export const visibilitySchema = z.enum(["private", "campus", "public"]);

export const profileCompletionStatusSchema = z.enum([
  "incomplete",
  "basic_complete",
  "recommendation_ready",
]);

export const academicPortraitStatusSchema = z.enum([
  "draft",
  "confirmed",
  "dismissed",
  "failed",
]);

export const academicProfileSchema = z.object({
  userId: z.string().uuid(),
  nickname: z.string().trim().min(2).max(40),
  major: majorSchema,
  year: studyYearSchema,
  modules: z.array(z.string().trim().min(1).max(80)).max(12),
  interests: z.array(z.string().trim().min(1).max(80)).max(12),
  skills: z.array(z.string().trim().min(1).max(80)).max(10),
  helpOffered: z.array(z.string().trim().min(1).max(80)).max(10),
  helpNeeded: z.array(z.string().trim().min(1).max(80)).max(10),
  collaborationPreference: z.array(z.string().trim().min(1).max(80)).max(8),
  visibility: visibilitySchema,
  completionStatus: profileCompletionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const academicProfileFormInputSchema = academicProfileSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const academicPortraitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceSnapshot: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()])),
  summary: z.string().trim().min(1).max(500).nullable(),
  suggestedTags: z.array(z.string().trim().min(1).max(100)).max(6),
  strengthsDraft: z.array(z.string().trim().min(1).max(100)).max(6),
  collaborationDraft: z.string().trim().min(1).max(240).nullable(),
  status: academicPortraitStatusSchema,
  promptVersion: z.string().trim().min(1).max(80).nullable(),
  generatedAt: z.string().datetime().nullable(),
  confirmedAt: z.string().datetime().nullable(),
});

export const publicAcademicProfileSchema = academicProfileSchema.pick({
  userId: true,
  nickname: true,
  major: true,
  year: true,
  modules: true,
  interests: true,
  collaborationPreference: true,
  visibility: true,
  completionStatus: true,
  updatedAt: true,
});

export type Major = z.infer<typeof majorSchema>;
export type StudyYear = z.infer<typeof studyYearSchema>;
export type Visibility = z.infer<typeof visibilitySchema>;
export type ProfileCompletionStatus = z.infer<typeof profileCompletionStatusSchema>;
export type AcademicPortraitStatus = z.infer<typeof academicPortraitStatusSchema>;
export type AcademicProfile = z.infer<typeof academicProfileSchema>;
export type AcademicProfileFormInput = z.infer<typeof academicProfileFormInputSchema>;
export type AcademicPortrait = z.infer<typeof academicPortraitSchema>;
export type PublicAcademicProfile = z.infer<typeof publicAcademicProfileSchema>;
