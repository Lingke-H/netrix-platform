import type { CreatePostInput, Post, PostFeedItem, PostType } from "./schemas";

export type PostComposerMode = "create" | "edit";

export type PostFilterState = {
  type: PostType | "all";
  tag: string | null;
  moduleCode: string | null;
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
