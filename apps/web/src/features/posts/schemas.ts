import { z } from "zod";

import { majorSchema, studyYearSchema } from "@/features/profile/schemas";

export const postTypeSchema = z.enum(["qa", "resource", "experience"]);
export const postVisibilitySchema = z.enum(["campus", "connections"]);

export const postTagSchema = z.string().trim().min(1).max(48);

export const postAuthorSummarySchema = z.object({
  userId: z.string().uuid(),
  nickname: z.string().trim().min(2).max(40),
  major: majorSchema,
  year: studyYearSchema,
});

export const postSchema = z.object({
  id: z.string().uuid(),
  author: postAuthorSummarySchema,
  type: postTypeSchema,
  title: z.string().trim().min(4).max(120),
  content: z.string().trim().min(12).max(4000),
  moduleCode: z.string().trim().min(1).max(24).nullable(),
  tags: z.array(postTagSchema).max(8),
  visibility: postVisibilitySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createPostInputSchema = postSchema.omit({
  id: true,
  author: true,
  createdAt: true,
  updatedAt: true,
});

export const postFeedItemSchema = postSchema.extend({
  replyCount: z.number().int().min(0),
  savedCount: z.number().int().min(0),
});

export type PostType = z.infer<typeof postTypeSchema>;
export type PostVisibility = z.infer<typeof postVisibilitySchema>;
export type PostAuthorSummary = z.infer<typeof postAuthorSummarySchema>;
export type Post = z.infer<typeof postSchema>;
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type PostFeedItem = z.infer<typeof postFeedItemSchema>;
