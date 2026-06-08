import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { PageFrame } from "@/components/page-frame";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { StatusBadge } from "@/components/status-badge";
import { requestEmailSignInAction, signOutAction } from "@/features/auth/server/actions";
import { sanitizeAuthNextRoute } from "@/features/auth/server/routing";
import { getServerEnv } from "@/lib/env";
import { AuthSessionError, getCurrentUser, isDemoAuthBypassRuntimeAllowed } from "@/server/auth/session";

export const dynamic = "force-dynamic";

type AuthPageProps = {
  searchParams: Promise<{
    email?: string;
    error?: string;
    next?: string;
    signed_out?: string;
    state?: string;
  }>;
};

const inputClass =
  "w-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]";

const authErrorMessages: Record<string, string> = {
  "callback-failed": "The verification link could not be completed. Request a new campus email link.",
  "campus-email-required": "Use a valid UNNC campus email address ending in @nottingham.edu.cn.",
  "auth-email-missing": "The active Supabase session does not include an email address. Sign in again with campus email.",
  "auth-session-unavailable": "The campus auth session could not be used. Sign in again before continuing.",
  "email-link-failed": "Supabase could not send the verification email. Check the project configuration and try again.",
  "email-verification-required": "Verify your campus email before continuing into NeTrix.",
  "missing-callback-code": "The verification link is missing its Supabase callback code.",
  "sign-out-failed": "The session could not be signed out. Try again from this page.",
  "supabase-env-missing": "Supabase URL and anon key must be configured before campus email sign-in can run.",
};

async function getAuthSessionSummary() {
  try {
    return {
      errorCode: null,
      session: await getCurrentUser(),
    };
  } catch (error) {
    if (error instanceof AuthSessionError && error.code === "SUPABASE_ENV_MISSING") {
      return {
        errorCode: "supabase-env-missing",
        session: null,
      };
    }

    throw error;
  }
}

function getDemoBypassStatus() {
  const { NETRIX_DEMO_AUTH_BYPASS_USER_ID, NETRIX_ENABLE_DEMO_AUTH_BYPASS } = getServerEnv();

  return {
    enabled:
      process.env.NODE_ENV !== "production" &&
      isDemoAuthBypassRuntimeAllowed() &&
      NETRIX_ENABLE_DEMO_AUTH_BYPASS === "true" &&
      Boolean(NETRIX_DEMO_AUTH_BYPASS_USER_ID),
    userId: NETRIX_DEMO_AUTH_BYPASS_USER_ID ?? null,
  };
}

function AuthNotice({
  email,
  error,
  sessionError,
  signedOut,
  state,
}: {
  email?: string;
  error?: string;
  sessionError: string | null;
  signedOut?: string;
  state?: string;
}) {
  const errorCode = error ?? sessionError;

  if (errorCode) {
    return (
      <div className="border border-[rgba(181,106,30,0.28)] bg-[rgba(181,106,30,0.10)] p-4">
        <StatusBadge tone="caution">auth attention</StatusBadge>
        <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
          {authErrorMessages[errorCode] ?? "The auth request could not be completed."}
        </p>
      </div>
    );
  }

  if (state === "email-sent" && email) {
    return (
      <div className="border border-[rgba(36,117,95,0.28)] bg-[var(--color-accent-soft)] p-4">
        <StatusBadge tone="ready">verification sent</StatusBadge>
        <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
          Check {email} for a Supabase sign-in link. The link will return you to NeTrix after verification.
        </p>
      </div>
    );
  }

  if (signedOut === "1") {
    return (
      <div className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4">
        <StatusBadge>signed out</StatusBadge>
        <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
          Your local browser session has been cleared.
        </p>
      </div>
    );
  }

  return null;
}

function EmailSignInForm({ disabled, nextRoute }: { disabled: boolean; nextRoute: string }) {
  return (
    <form action={requestEmailSignInAction} className="space-y-4 border border-[var(--color-line)] bg-white p-5">
      <input name="next" type="hidden" value={nextRoute} />
      <label className="block space-y-2 text-sm font-semibold text-[var(--color-ink)]">
        Campus email
        <input
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="student@nottingham.edu.cn"
          required
          disabled={disabled}
        />
      </label>
      <PendingSubmitButton
        disabled={disabled}
        icon="mail"
        label={disabled ? "Auth config required" : "Send verification link"}
        pendingLabel="Sending link..."
        className="inline-flex h-10 items-center gap-2 bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
      />
      {disabled ? (
        <p className="text-xs leading-6 text-[var(--color-muted)]">
          Configure Supabase URL and anon key before requesting campus email links.
        </p>
      ) : null}
    </form>
  );
}

function SignedInPanel({
  emailVerified,
  nextRoute,
  userEmail,
}: {
  emailVerified: boolean;
  nextRoute: string;
  userEmail: string;
}) {
  return (
    <div className="space-y-4 border border-[var(--color-line)] bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="ready">signed in</StatusBadge>
        <StatusBadge tone={emailVerified ? "ready" : "caution"}>
          {emailVerified ? "campus email verified" : "email verification pending"}
        </StatusBadge>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--color-ink)]">{userEmail}</h2>
        <p className="text-sm leading-7 text-[var(--color-muted)]">
          Continue into your academic profile, or sign out to test another campus email.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={nextRoute}
          className="inline-flex h-10 items-center gap-2 bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[rgba(29,107,87,0.9)]"
        >
          <ShieldCheck size={16} aria-hidden="true" />
          Continue
        </Link>
        <form action={signOutAction}>
          <PendingSubmitButton
            icon="log-out"
            label="Sign out"
            pendingLabel="Signing out..."
            className="inline-flex h-10 items-center gap-2 border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          />
        </form>
      </div>
    </div>
  );
}

function DemoBypassPanel({ enabled, userId }: { enabled: boolean; userId: string | null }) {
  if (!enabled) {
    return null;
  }

  return (
    <div className="border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4">
      <StatusBadge>local/E2E demo bypass</StatusBadge>
      <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
        Demo auth bypass is active only for local development or Playwright E2E. Current demo user: {userId}.
      </p>
    </div>
  );
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [query, sessionResult] = await Promise.all([searchParams, getAuthSessionSummary()]);
  const nextRoute = sanitizeAuthNextRoute(query.next);
  const demoBypass = getDemoBypassStatus();

  return (
    <PageFrame
      eyebrow="Campus auth"
      title="Sign In With UNNC Email"
      description="Use a verified campus email session before posting, completing a profile, receiving recommendations, or messaging accepted academic connections."
    >
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge tone={sessionResult.session ? "ready" : "caution"}>
          {sessionResult.session ? "session available" : "signed out"}
        </StatusBadge>
        <StatusBadge>Supabase email link</StatusBadge>
        <StatusBadge>@nottingham.edu.cn</StatusBadge>
      </div>

      <AuthNotice
        email={query.email}
        error={query.error}
        sessionError={sessionResult.errorCode}
        signedOut={query.signed_out}
        state={query.state}
      />

      {sessionResult.session ? (
        <SignedInPanel
          emailVerified={sessionResult.session.emailVerified}
          nextRoute={nextRoute}
          userEmail={sessionResult.session.email}
        />
      ) : (
        <EmailSignInForm disabled={sessionResult.errorCode === "supabase-env-missing"} nextRoute={nextRoute} />
      )}

      <DemoBypassPanel enabled={demoBypass.enabled} userId={demoBypass.userId} />
    </PageFrame>
  );
}
