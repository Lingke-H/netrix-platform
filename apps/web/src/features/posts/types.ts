import type { CreatePostInput, Post, PostAuthorSummary, PostFeedItem, PostType } from "./schemas";

export type PostComposerMode = "create" | "edit";

export type PostFilterState = {
  type: PostType | "all";
  tag: string | null;
  module: string | null;
};

export type PostComposerDraft = CreatePostInput;
export type FeedData = {
  items: PostFeedItem[];
  hasNextPage: boolean;
};

export type PostDetailData = {
  post: Post;
  relatedPostIds: string[];
};

export function getPostAuthorProfileHref(author: PostAuthorSummary): `/profiles/${string}` | null {
  return author.userId ? `/profiles/${author.userId}` : null;
}
