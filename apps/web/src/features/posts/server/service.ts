import { createPostInputSchema, type CreatePostInput, type PostStatus } from "@/features/posts/schemas";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";
import { createDb, type DbClient } from "@/server/db/client";
import { posts } from "@/server/db/schema";

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

export function parseCreatePostInput(input: unknown): CreatePostInput {
  const parsedInput = createPostInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new CreatePostError("Post input is invalid.", "POST_INPUT_INVALID");
  }

  return parsedInput.data;
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
