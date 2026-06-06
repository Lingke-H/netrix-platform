import type { AppEventDto } from "@/features/events/schemas";
import type { DbClient } from "@/server/db/client";
import { eventLogs } from "@/server/db/schema";

export async function logEvent(db: DbClient, event: AppEventDto, actorId?: string | null) {
  const [saved] = await db
    .insert(eventLogs)
    .values({
      actorId: actorId ?? null,
      eventType: event.eventType,
      metadata: (event.metadata ?? {}) as Record<string, string | number | boolean | null>,
      objectId: event.objectId,
      objectType: event.objectType,
    })
    .returning({ id: eventLogs.id });

  return saved;
}
