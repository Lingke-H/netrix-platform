import type { ResourceItem } from "./schemas";

export type LibraryFilterState = {
  tag: string | null;
  module: string | null;
  source: "all" | "resources" | "promoted-posts";
};

export type LibraryPageData = {
  items: ResourceItem[];
  featuredResourceIds: string[];
};
