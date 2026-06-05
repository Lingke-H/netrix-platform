import { logEvent } from "./log-event";
import type { AppEventDto } from "@/features/events/schemas";

export function recordEvent(event: AppEventDto) {
  return logEvent({
    ...event,
    metadata: event.metadata ?? {},
  });
}
