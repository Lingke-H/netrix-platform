import { desc, inArray } from "drizzle-orm";

import type { LibraryPageData } from "@/features/library/types";
import { resourceItemSchema, type ResourceItem } from "@/features/library/schemas";
import { requireVerifiedCampusUser } from "@/server/auth/session";
import { createDb, type DbClient } from "@/server/db/client";
import { resourceItems } from "@/server/db/schema";

type LibraryResourceRow = {
  createdAt: Date;
  curationStatus: "seeded" | "featured" | "archived";
  description: string;
  id: string;
  modules: string[];
  origin: "campus-resource" | "student-resource" | "promoted-post";
  sourcePostId: string | null;
  tags: string[];
  title: string;
  url: string | null;
};

function buildResourceItem(row: LibraryResourceRow): ResourceItem {
  return resourceItemSchema.parse({
    createdAt: row.createdAt.toISOString(),
    curationStatus: row.curationStatus,
    description: row.description,
    id: row.id,
    modules: row.modules,
    origin: row.origin,
    sourcePostId: row.sourcePostId,
    tags: row.tags,
    title: row.title,
    url: row.url,
  });
}

function buildLibraryPageData(rows: LibraryResourceRow[]): LibraryPageData {
  const items = rows.map(buildResourceItem);
  const featuredResourceIds = rows
    .filter((row) => row.curationStatus === "featured")
    .map((row) => row.id);

  return { items, featuredResourceIds };
}

export async function listLibraryResources(db: DbClient): Promise<LibraryPageData> {
  const rows = await db
    .select({
      createdAt: resourceItems.createdAt,
      curationStatus: resourceItems.curationStatus,
      description: resourceItems.description,
      id: resourceItems.id,
      modules: resourceItems.modules,
      origin: resourceItems.origin,
      sourcePostId: resourceItems.sourcePostId,
      tags: resourceItems.tags,
      title: resourceItems.title,
      url: resourceItems.url,
    })
    .from(resourceItems)
    .where(inArray(resourceItems.curationStatus, ["seeded", "featured"]))
    .orderBy(desc(resourceItems.createdAt))
    .limit(50);

  return buildLibraryPageData(rows);
}

export async function getCurrentUserLibrary(): Promise<LibraryPageData> {
  await requireVerifiedCampusUser();
  const db = createDb();

  return listLibraryResources(db);
}
