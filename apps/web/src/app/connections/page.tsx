import { Clock, Link2, XCircle } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { Connection, ConnectionRequest } from "@/features/connections/schemas";
import { respondToConnectionRequestAction } from "@/features/connections/server/actions";
import { getConnectionsPageDataForUser } from "@/features/connections/server/service";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";
import { createDb } from "@/server/db/client";

export const dynamic = "force-dynamic";

async function respondToConnectionRequestFormAction(formData: FormData) {
  "use server";

  await respondToConnectionRequestAction(formData);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function compactId(value: string) {
  return value.slice(0, 8);
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5 text-sm leading-7 text-[var(--color-muted)]">
      {text}
    </div>
  );
}

function RequestActionForm({
  action,
  children,
  requestId,
  tone = "info",
}: {
  action: "accept" | "reject" | "cancel";
  children: React.ReactNode;
  requestId: string;
  tone?: "ready" | "caution" | "info";
}) {
  const buttonClasses = {
    caution:
      "border-[rgba(181,106,30,0.28)] bg-[rgba(181,106,30,0.10)] text-[var(--color-warning)] hover:bg-[rgba(181,106,30,0.16)]",
    info: "border-[rgba(61,90,134,0.24)] bg-[rgba(61,90,134,0.08)] text-[var(--color-info)] hover:bg-[rgba(61,90,134,0.14)]",
    ready:
      "border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[rgba(36,117,95,0.16)]",
  }[tone];

  return (
    <form action={respondToConnectionRequestFormAction}>
      <input name="requestId" type="hidden" value={requestId} />
      <input name="action" type="hidden" value={action} />
      <button
        type="submit"
        className={`inline-flex h-9 items-center justify-center border px-3 text-sm font-semibold transition ${buttonClasses}`}
      >
        {children}
      </button>
    </form>
  );
}

function PendingRequestCard({ currentUserId, request }: { currentUserId: string; request: ConnectionRequest }) {
  const isIncoming = request.recipientId === currentUserId;
  const peerId = isIncoming ? request.requesterId : request.recipientId;

  return (
    <article className="space-y-4 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={isIncoming ? "caution" : "info"}>{isIncoming ? "incoming" : "outgoing"}</StatusBadge>
            <StatusBadge>{request.status}</StatusBadge>
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Student {compactId(peerId)}</h2>
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            Created {formatDate(request.createdAt)}
            {request.recommendationId ? ` from recommendation ${compactId(request.recommendationId)}` : ""}
          </p>
        </div>
        <Clock size={20} className="text-[var(--color-muted)]" aria-hidden="true" />
      </div>

      {request.message ? (
        <p className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4 text-sm leading-7 text-[var(--color-ink)]">
          {request.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {isIncoming ? (
          <>
            <RequestActionForm action="accept" requestId={request.id} tone="ready">
              Accept
            </RequestActionForm>
            <RequestActionForm action="reject" requestId={request.id} tone="caution">
              Reject
            </RequestActionForm>
          </>
        ) : (
          <RequestActionForm action="cancel" requestId={request.id} tone="caution">
            Cancel
          </RequestActionForm>
        )}
      </div>
    </article>
  );
}

function AcceptedConnectionCard({ connection, currentUserId }: { connection: Connection; currentUserId: string }) {
  const peerId = connection.userAId === currentUserId ? connection.userBId : connection.userAId;

  return (
    <article className="space-y-3 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="ready">{connection.status}</StatusBadge>
            <StatusBadge>accepted</StatusBadge>
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Student {compactId(peerId)}</h2>
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            Connected {formatDate(connection.createdAt)} from request {compactId(connection.requestId)}
          </p>
        </div>
        <Link2 size={20} className="text-[var(--color-accent)]" aria-hidden="true" />
      </div>
    </article>
  );
}

function RejectedRequestCard({ request }: { request: ConnectionRequest }) {
  const respondedAt = request.respondedAt ? formatDate(request.respondedAt) : "No response time";

  return (
    <article className="space-y-3 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="caution">{request.status}</StatusBadge>
            <StatusBadge>{respondedAt}</StatusBadge>
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Request {compactId(request.id)}
          </h2>
          {request.message ? <p className="text-sm leading-7 text-[var(--color-muted)]">{request.message}</p> : null}
        </div>
        <XCircle size={20} className="text-[var(--color-warning)]" aria-hidden="true" />
      </div>
    </article>
  );
}

export default async function ConnectionsPage() {
  const gate = await requireCompletedAcademicProfile();
  const db = createDb();
  const data = await getConnectionsPageDataForUser(db, gate.session.userId);

  return (
    <PageFrame
      eyebrow="Connections"
      title="Connection Requests"
      description="Review academic connection requests, accepted connections, and recently rejected requests."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="caution">{data.pending.length} pending</StatusBadge>
        <StatusBadge tone="ready">{data.accepted.length} accepted</StatusBadge>
        <StatusBadge>{data.rejected.length} rejected</StatusBadge>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--color-ink)]">Pending</h2>
        {data.pending.length === 0 ? (
          <EmptyState text="No pending connection requests." />
        ) : (
          <div className="grid gap-4">
            {data.pending.map((request) => (
              <PendingRequestCard key={request.id} currentUserId={gate.session.userId} request={request} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--color-ink)]">Accepted</h2>
        {data.accepted.length === 0 ? (
          <EmptyState text="No accepted connections yet." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.accepted.map((connection) => (
              <AcceptedConnectionCard key={connection.id} connection={connection} currentUserId={gate.session.userId} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--color-ink)]">Rejected</h2>
        {data.rejected.length === 0 ? (
          <EmptyState text="No rejected requests." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.rejected.map((request) => (
              <RejectedRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </section>
    </PageFrame>
  );
}
