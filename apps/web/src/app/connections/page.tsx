import Link from "next/link";
import { Clock, Link2, XCircle } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { ConnectionActionButton } from "@/features/connections/components/connection-action-button";
import { respondToConnectionRequestAction } from "@/features/connections/server/actions";
import { getConnectionsPageDataForUser } from "@/features/connections/server/service";
import type { ConnectionRequestWithPeer, ConnectionWithPeer } from "@/features/connections/types";
import type { Major, StudyYear } from "@/features/profile/schemas";
import { requirePageCompletedAcademicProfile } from "@/server/auth/redirects";
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

const majorLabels: Record<Major, string> = {
  math: "Math",
  "computer-science": "Computer Science",
  eee: "EEE",
  fam: "FAM",
  ibe: "IBE",
  other: "Other",
};

const studyYearLabels: Record<StudyYear, string> = {
  foundation: "Foundation",
  "year-1": "Year 1",
  "year-2": "Year 2",
  "year-3": "Year 3",
  "year-4": "Year 4",
  postgraduate: "Postgraduate",
};

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
  icon,
  pendingLabel,
  tone = "info",
}: {
  action: "accept" | "reject" | "cancel";
  children: React.ReactNode;
  icon: "accept" | "cancel";
  pendingLabel: string;
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
      <input name="next" type="hidden" value="/connections" />
      <input name="requestId" type="hidden" value={requestId} />
      <input name="action" type="hidden" value={action} />
      <ConnectionActionButton className={buttonClasses} icon={icon} label={children} pendingLabel={pendingLabel} />
    </form>
  );
}

function PeerHeading({
  fallbackId,
  item,
}: {
  fallbackId: string;
  item: ConnectionRequestWithPeer | ConnectionWithPeer;
}) {
  if (!item.peerProfile) {
    return <h2 className="text-lg font-semibold text-[var(--color-ink)]">Student {compactId(fallbackId)}</h2>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/profiles/${item.peerProfile.userId}`}
          className="text-lg font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-accent)]"
        >
          {item.peerProfile.nickname}
        </Link>
        <StatusBadge>{item.peerProfile.visibility}</StatusBadge>
      </div>
      <div className="flex flex-wrap gap-2 text-sm font-medium text-[var(--color-muted)]">
        <span>{majorLabels[item.peerProfile.major]}</span>
        <span>{studyYearLabels[item.peerProfile.year]}</span>
      </div>
      {item.peerProfile.profileSummary ? (
        <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)]">{item.peerProfile.profileSummary}</p>
      ) : null}
    </div>
  );
}

function PendingRequestCard({ currentUserId, request }: { currentUserId: string; request: ConnectionRequestWithPeer }) {
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
          <PeerHeading fallbackId={peerId} item={request} />
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
            <RequestActionForm action="accept" icon="accept" pendingLabel="Accepting..." requestId={request.id} tone="ready">
              Accept
            </RequestActionForm>
            <RequestActionForm action="reject" icon="cancel" pendingLabel="Rejecting..." requestId={request.id} tone="caution">
              Reject
            </RequestActionForm>
          </>
        ) : (
          <RequestActionForm action="cancel" icon="cancel" pendingLabel="Cancelling..." requestId={request.id} tone="caution">
            Cancel
          </RequestActionForm>
        )}
      </div>
    </article>
  );
}

function AcceptedConnectionCard({ connection, currentUserId }: { connection: ConnectionWithPeer; currentUserId: string }) {
  const peerId = connection.userAId === currentUserId ? connection.userBId : connection.userAId;

  return (
    <article className="space-y-4 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="ready">{connection.status}</StatusBadge>
            <StatusBadge>accepted</StatusBadge>
            {connection.messageThreadId ? <StatusBadge tone="ready">messages available</StatusBadge> : null}
          </div>
          <PeerHeading fallbackId={peerId} item={connection} />
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            Connected {formatDate(connection.createdAt)} from request {compactId(connection.requestId)}
          </p>
        </div>
        <Link2 size={20} className="text-[var(--color-accent)]" aria-hidden="true" />
      </div>

      {connection.messageThreadId ? (
        <Link
          href={`/messages/${connection.messageThreadId}`}
          className="inline-flex h-9 items-center justify-center border border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] px-3 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(36,117,95,0.16)]"
        >
          Open messages
        </Link>
      ) : (
        <p className="text-sm leading-7 text-[var(--color-muted)]">
          Message thread will appear after the accepted connection setup completes.
        </p>
      )}
    </article>
  );
}

function RejectedRequestCard({ request }: { request: ConnectionRequestWithPeer }) {
  const respondedAt = request.respondedAt ? formatDate(request.respondedAt) : "No response time";

  return (
    <article className="space-y-3 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="caution">{request.status}</StatusBadge>
            <StatusBadge>{respondedAt}</StatusBadge>
          </div>
          <PeerHeading fallbackId={request.recipientId} item={request} />
          {request.message ? <p className="text-sm leading-7 text-[var(--color-muted)]">{request.message}</p> : null}
        </div>
        <XCircle size={20} className="text-[var(--color-warning)]" aria-hidden="true" />
      </div>
    </article>
  );
}

export default async function ConnectionsPage() {
  const gate = await requirePageCompletedAcademicProfile("/connections");
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
