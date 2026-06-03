import type { AppEventDto, EventName } from "./schemas";

export type EventLogPayload = AppEventDto;
export type EventAuditSummary = {
  eventName: EventName;
  count: number;
};
