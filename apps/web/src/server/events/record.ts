import { logEvent } from "./log-event";
import type { AppEventDto } from "@/features/events/schemas";
import type { DbClient } from "@/server/db/client";

export function recordEvent(db: DbClient, event: AppEventDto, actorId?: string | null) {
  return logEvent(db, {
    ...event,
    metadata: event.metadata ?? {},
  }, actorId);
}
