import { and, desc, eq } from "drizzle-orm";

import {
  createPostInputSchema,
  postFeedItemSchema,
  type CreatePostInput,
  type PostFeedItem,
  type PostStatus,
} from "@/features/posts/schemas";
import type { FeedData } from "@/features/posts/types";
import { requireVerifiedCampusUser } from "@/server/auth/session";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles, posts } from "@/server/db/schema";

export type CreatePostResult = {
  postId: string;
  authorId: string;
  status: PostStatus;
  nextRoute: `/posts/${string}`;
};

export class CreatePostError extends Error {
  constructor(
    message: string,
    public readonly code: "POST_INPUT_INVALID" | "POST_CREATE_FAILED",
  ) {
    super(message);
    this.name = "CreatePostError";
  }
}

type CampusFeedPostRow = {
  body: string;
  createdAt: Date;
  id: string;
  modules: string[];
  status: "published";
  tags: string[];
  title: string;
  type: "question" | "resource" | "experience";
  updatedAt: Date;
  visibility: "campus";
  author: {
    major: "math" | "computer-science" | "eee" | "fam" | "ibe" | "other";
    nickname: string;
    userId: string;
    year: "foundation" | "year-1" | "year-2" | "year-3" | "year-4" | "postgraduate";
  };
};

export type CampusFeedOptions = {
  limit?: number;
};

export function parseCreatePostInput(input: unknown): CreatePostInput {
  const parsedInput = createPostInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new CreatePostError("Post input is invalid.", "POST_INPUT_INVALID");
  }

  return parsedInput.data;
}

export function getCampusFeedPageSize(limit = 20) {
  return Math.min(Math.max(Math.trunc(limit), 1), 50);
}

export function buildCampusFeedItem(row: CampusFeedPostRow): PostFeedItem {
  return postFeedItemSchema.parse({
    author: row.author,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    modules: row.modules,
    replyCount: 0,
    savedCount: 0,
    status: row.status,
    tags: row.tags,
    title: row.title,
    type: row.type,
    updatedAt: row.updatedAt.toISOString(),
    visibility: row.visibility,
  });
}

export function buildCampusFeedData(rows: CampusFeedPostRow[], pageSize: number): FeedData {
  return {
    hasNextPage: rows.length > pageSize,
    items: rows.slice(0, pageSize).map(buildCampusFeedItem),
  };
}

export async function listCampusFeedPosts(db: DbClient, options: CampusFeedOptions = {}): Promise<FeedData> {
  const pageSize = getCampusFeedPageSize(options.limit);
  const rows = await db
    .select({
      author: {
        major: academicProfiles.major,
        nickname: academicProfiles.nickname,
        userId: academicProfiles.userId,
        year: academicProfiles.year,
      },
      body: posts.body,
      createdAt: posts.createdAt,
      id: posts.id,
      modules: posts.modules,
      status: posts.status,
      tags: posts.tags,
      title: posts.title,
      type: posts.type,
      updatedAt: posts.updatedAt,
      visibility: posts.visibility,
    })
    .from(posts)
    .innerJoin(academicProfiles, eq(posts.authorId, academicProfiles.userId))
    .where(and(eq(posts.status, "published"), eq(posts.visibility, "campus")))
    .orderBy(desc(posts.createdAt))
    .limit(pageSize + 1);

  return buildCampusFeedData(
    rows.map((row) => ({
      ...row,
      status: "published",
      visibility: "campus",
    })),
    pageSize,
  );
}

export async function createPostForUser(
  db: DbClient,
  authorId: string,
  input: unknown,
): Promise<CreatePostResult> {
  const postInput = parseCreatePostInput(input);
  const [createdPost] = await db
    .insert(posts)
    .values({
      authorId,
      body: postInput.body,
      modules: postInput.modules,
      status: postInput.status,
      tags: postInput.tags,
      title: postInput.title,
      type: postInput.type,
      visibility: postInput.visibility,
    })
    .returning({
      authorId: posts.authorId,
      id: posts.id,
      status: posts.status,
    });

  if (!createdPost) {
    throw new CreatePostError("Unable to create the post.", "POST_CREATE_FAILED");
  }

  return {
    authorId: createdPost.authorId,
    nextRoute: `/posts/${createdPost.id}`,
    postId: createdPost.id,
    status: createdPost.status,
  };
}

export async function createCurrentUserPost(input: unknown): Promise<CreatePostResult> {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();

  return createPostForUser(db, gate.session.userId, input);
}

export async function getCurrentUserCampusFeed(options: CampusFeedOptions = {}): Promise<FeedData> {
  await requireVerifiedCampusUser();
  const db = createDb();

  return listCampusFeedPosts(db, options);
}
