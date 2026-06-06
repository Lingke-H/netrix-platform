import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { StatusBadge } from "@/components/status-badge";
import type { Message, MessageThread } from "@/features/messages/schemas";
import { createMessageAction } from "@/features/messages/server/actions";
import { getCurrentUserAcceptedMessageThreadData } from "@/features/messages/server/service";
import { requireCompletedAcademicProfile } from "@/server/auth/onboarding-gate";

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
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-2 border border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] px-4 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[rgba(36,117,95,0.16)]"
      >
        <Send size={16} aria-hidden="true" />
        Send
      </button>
    </form>
  );
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const [{ threadId }, gate] = await Promise.all([params, requireCompletedAcademicProfile()]);
  const data = await getCurrentUserAcceptedMessageThreadData(threadId);

  if (!data) {
    notFound();
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
