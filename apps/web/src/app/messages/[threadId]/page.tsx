import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import { MessageSubmitButton } from "@/features/messages/components/message-submit-button";
import type { Message, MessageThread } from "@/features/messages/schemas";
import { createMessageAction } from "@/features/messages/server/actions";
import { getAcceptedMessageThreadDataForUser } from "@/features/messages/server/service";
import { requirePageCompletedAcademicProfile } from "@/server/auth/redirects";
import { createDb } from "@/server/db/client";

export const dynamic = "force-dynamic";

type MessageThreadPageProps = {
  params: Promise<{
    threadId: string;
  }>;
};

async function createMessageFormAction(formData: FormData) {
  "use server";

  await createMessageAction(formData);
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

function getPeerUserId(thread: MessageThread, currentUserId: string) {
  return thread.participantUserIds.find((userId) => userId !== currentUserId) ?? currentUserId;
}

function EmptyMessageState() {
  return (
    <div className="border border-dashed border-[var(--color-line)] bg-[rgba(255,255,255,0.72)] p-5 text-sm leading-7 text-[var(--color-muted)]">
      No messages have been sent in this accepted connection thread yet.
    </div>
  );
}

function LockedMessageState({ threadId }: { threadId: string }) {
  return (
    <PageFrame
      eyebrow="Messages"
      title="Thread Unavailable"
      description="Messages are only visible after an accepted connection is available for the signed-in student."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="caution">locked</StatusBadge>
        <StatusBadge>thread {compactId(threadId)}</StatusBadge>
      </div>

      <div className="space-y-4 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <p className="text-sm leading-7 text-[var(--color-muted)]">
          This conversation cannot be opened from the current session. The thread may not exist, may belong to another
          accepted connection, or may still be locked until the connection request is accepted.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/connections"
            className="inline-flex h-9 items-center justify-center border border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] px-3 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(36,117,95,0.16)]"
          >
            Back to connections
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex h-9 items-center justify-center border border-[var(--color-line)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            View recommendations
          </Link>
        </div>
      </div>
    </PageFrame>
  );
}

function MessageBubble({ currentUserId, message }: { currentUserId: string; message: Message }) {
  const isOwnMessage = message.senderId === currentUserId;

  return (
    <article className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-2xl border p-4 ${
          isOwnMessage
            ? "border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)]"
            : "border-[var(--color-line)] bg-white"
        }`}
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge tone={isOwnMessage ? "ready" : "info"}>{isOwnMessage ? "you" : "peer"}</StatusBadge>
          <span className="text-xs font-medium text-[var(--color-muted)]">{formatDate(message.createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-ink)]">{message.body}</p>
      </div>
    </article>
  );
}

function MessageComposer({ threadId }: { threadId: string }) {
  return (
    <form action={createMessageFormAction} className="space-y-3 border border-[var(--color-line)] bg-white p-5">
      <input name="next" type="hidden" value={`/messages/${threadId}`} />
      <input name="threadId" type="hidden" value={threadId} />
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">Message</span>
        <textarea
          name="body"
          required
          minLength={1}
          maxLength={2000}
          rows={4}
          className="min-h-28 w-full resize-y border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-3 py-2 text-sm leading-6 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]"
          placeholder="Share a module question, meeting idea, or useful resource."
        />
      </label>
      <MessageSubmitButton />
    </form>
  );
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { threadId } = await params;
  const gate = await requirePageCompletedAcademicProfile(`/messages/${threadId}`);
  const data = await getAcceptedMessageThreadDataForUser(createDb(), gate.session.userId, threadId);

  if (!data) {
    return <LockedMessageState threadId={threadId} />;
  }

  const peerUserId = getPeerUserId(data.thread, gate.session.userId);

  return (
    <PageFrame
      eyebrow="Messages"
      title={`Thread ${compactId(data.thread.id)}`}
      description="Accepted connection messages are available only to the two connected students."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone="ready">{data.thread.permissionStatus}</StatusBadge>
        <StatusBadge>peer {compactId(peerUserId)}</StatusBadge>
        {data.thread.lastMessageAt ? <StatusBadge>last {formatDate(data.thread.lastMessageAt)}</StatusBadge> : null}
      </div>

      <section className="space-y-4 border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-[var(--color-accent)]" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">Conversation</h2>
          </div>
          <Link href="/connections" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
            Back to connections
          </Link>
        </div>

        {data.messages.length === 0 ? (
          <EmptyMessageState />
        ) : (
          <div className="space-y-3">
            {data.messages.map((message) => (
              <MessageBubble key={message.id} currentUserId={gate.session.userId} message={message} />
            ))}
          </div>
        )}
      </section>

      <MessageComposer threadId={data.thread.id} />
    </PageFrame>
  );
}
