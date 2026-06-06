import { z } from "zod";

import { majorSchema, studyYearSchema } from "@/features/profile/schemas";

export const postTypeSchema = z.enum(["question", "resource", "experience"]);
export const visibilitySchema = z.enum(["private", "campus", "public"]);
export const postStatusSchema = z.enum(["draft", "published", "archived"]);

export const postTagSchema = z.string().trim().min(1).max(48);

export const postAuthorSummarySchema = z.object({
  userId: z.string().uuid().nullable(),
  nickname: z.string().trim().min(2).max(40),
  major: majorSchema.nullable(),
  profileVisibility: visibilitySchema,
  year: studyYearSchema.nullable(),
});

export const postSchema = z.object({
  id: z.string().uuid(),
  author: postAuthorSummarySchema,
  type: postTypeSchema,
  title: z.string().trim().min(4).max(120),
  body: z.string().trim().min(12).max(4000),
  modules: z.array(z.string().trim().min(1).max(80)).max(8),
  tags: z.array(postTagSchema).max(8),
  visibility: visibilitySchema,
  status: postStatusSchema,
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
export type Visibility = z.infer<typeof visibilitySchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;
export type PostAuthorSummary = z.infer<typeof postAuthorSummarySchema>;
export type Post = z.infer<typeof postSchema>;
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type PostFeedItem = z.infer<typeof postFeedItemSchema>;
