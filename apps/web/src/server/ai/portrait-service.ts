import { eq } from "drizzle-orm";

import type { AcademicPortrait, AcademicPortraitStatus } from "@/features/profile/schemas";
import { academicPortraitSchema } from "@/features/profile/schemas";
import { requireCurrentUser } from "@/server/auth/session";
import { createDb, type DbClient } from "@/server/db/client";
import { academicPortraits } from "@/server/db/schema";

export class AcademicPortraitError extends Error {
  constructor(
    message: string,
    public readonly code: "PORTRAIT_UPSERT_FAILED" | "PORTRAIT_NOT_FOUND",
  ) {
    super(message);
    this.name = "AcademicPortraitError";
  }
}

type PortraitInsertInput = {
  collaborationDraft?: string | null;
  generatedAt?: string | null;
  promptVersion?: string | null;
  sourceSnapshot?: Record<string, string | number | boolean | string[] | null>;
  status?: AcademicPortraitStatus;
  strengthsDraft?: string[];
  suggestedTags?: string[];
  summary?: string | null;
  userId: string;
};

function buildPortraitDto(row: typeof academicPortraits.$inferSelect): AcademicPortrait {
  return academicPortraitSchema.parse({
    collaborationDraft: row.collaborationDraft,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    generatedAt: row.generatedAt?.toISOString() ?? null,
    id: row.id,
    promptVersion: row.promptVersion,
    sourceSnapshot: row.sourceSnapshot as Record<string, string | number | boolean | string[] | null>,
    status: row.status,
    strengthsDraft: row.strengthsDraft,
    suggestedTags: row.suggestedTags,
    summary: row.summary,
    userId: row.userId,
  });
}

export async function upsertPortrait(
  db: DbClient,
  input: PortraitInsertInput,
): Promise<AcademicPortrait> {
  const [row] = await db
    .insert(academicPortraits)
    .values({
      collaborationDraft: input.collaborationDraft ?? null,
      generatedAt: input.generatedAt ? new Date(input.generatedAt) : null,
      promptVersion: input.promptVersion ?? null,
      sourceSnapshot: (input.sourceSnapshot ?? {}) as Record<string, string | number | boolean | string[] | null>,
      status: input.status ?? "draft",
      strengthsDraft: input.strengthsDraft ?? [],
      suggestedTags: input.suggestedTags ?? [],
      summary: input.summary ?? null,
      userId: input.userId,
    })
    .onConflictDoUpdate({
      set: {
        collaborationDraft: input.collaborationDraft ?? null,
        generatedAt: input.generatedAt ? new Date(input.generatedAt) : null,
        promptVersion: input.promptVersion ?? null,
        sourceSnapshot: (input.sourceSnapshot ?? {}) as Record<string, string | number | boolean | string[] | null>,
        status: input.status ?? "draft",
        strengthsDraft: input.strengthsDraft ?? [],
        suggestedTags: input.suggestedTags ?? [],
        summary: input.summary ?? null,
        updatedAt: new Date(),
      },
      target: academicPortraits.userId,
    })
    .returning();

  if (!row) {
    throw new AcademicPortraitError("Unable to upsert the academic portrait.", "PORTRAIT_UPSERT_FAILED");
  }

  return buildPortraitDto(row);
}

export async function getPortraitForUser(
  db: DbClient,
  userId: string,
): Promise<AcademicPortrait | null> {
  const [row] = await db
    .select()
    .from(academicPortraits)
    .where(eq(academicPortraits.userId, userId))
    .limit(1);

  return row ? buildPortraitDto(row) : null;
}

export async function confirmPortrait(
  db: DbClient,
  userId: string,
): Promise<AcademicPortrait> {
  const [row] = await db
    .update(academicPortraits)
    .set({
      confirmedAt: new Date(),
      status: "confirmed",
      updatedAt: new Date(),
    })
    .where(eq(academicPortraits.userId, userId))
    .returning();

  if (!row) {
    throw new AcademicPortraitError("Portrait not found for confirmation.", "PORTRAIT_NOT_FOUND");
  }

  return buildPortraitDto(row);
}

export async function dismissPortrait(
  db: DbClient,
  userId: string,
): Promise<AcademicPortrait> {
  const [row] = await db
    .update(academicPortraits)
    .set({
      status: "dismissed",
      updatedAt: new Date(),
    })
    .where(eq(academicPortraits.userId, userId))
    .returning();

  if (!row) {
    throw new AcademicPortraitError("Portrait not found for dismissal.", "PORTRAIT_NOT_FOUND");
  }

  return buildPortraitDto(row);
}

export async function getCurrentUserPortrait(): Promise<AcademicPortrait | null> {
  const session = await requireCurrentUser();
  const db = createDb();

  return getPortraitForUser(db, session.userId);
}

export async function upsertCurrentUserPortrait(
  input: PortraitInsertInput,
): Promise<AcademicPortrait> {
  const session = await requireCurrentUser();
  const db = createDb();

  return upsertPortrait(db, { ...input, userId: session.userId });
}

export async function confirmCurrentUserPortrait(): Promise<AcademicPortrait> {
  const session = await requireCurrentUser();
  const db = createDb();

  return confirmPortrait(db, session.userId);
}

export async function dismissCurrentUserPortrait(): Promise<AcademicPortrait> {
  const session = await requireCurrentUser();
  const db = createDb();

  return dismissPortrait(db, session.userId);
}
