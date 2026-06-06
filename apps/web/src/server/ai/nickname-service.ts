import { eq } from "drizzle-orm";

import { requireCurrentUser } from "@/server/auth/session";
import { createDb, type DbClient } from "@/server/db/client";
import { academicProfiles } from "@/server/db/schema";

export class NicknameUpdateError extends Error {
  constructor(
    message: string,
    public readonly code: "NICKNAME_INVALID" | "NICKNAME_UPDATE_FAILED",
  ) {
    super(message);
    this.name = "NicknameUpdateError";
  }
}

export async function confirmNickname(
  db: DbClient,
  userId: string,
  nickname: string,
): Promise<{ nickname: string; userId: string }> {
  const trimmed = nickname.trim();

  if (trimmed.length < 2 || trimmed.length > 40) {
    throw new NicknameUpdateError(
      "Nickname must be between 2 and 40 characters.",
      "NICKNAME_INVALID",
    );
  }

  const [row] = await db
    .update(academicProfiles)
    .set({ nickname: trimmed, updatedAt: new Date() })
    .where(eq(academicProfiles.userId, userId))
    .returning({ nickname: academicProfiles.nickname, userId: academicProfiles.userId });

  if (!row) {
    throw new NicknameUpdateError(
      "Unable to update the nickname. Profile may not exist yet.",
      "NICKNAME_UPDATE_FAILED",
    );
  }

  return { nickname: row.nickname, userId: row.userId };
}

export async function confirmCurrentUserNickname(
  nickname: string,
): Promise<{ nickname: string; userId: string }> {
  const session = await requireCurrentUser();
  const db = createDb();

  return confirmNickname(db, session.userId, nickname);
}
