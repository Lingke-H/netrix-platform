import { createServerClient } from "@supabase/ssr";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { getClientEnv } from "@/lib/env";
import { authConfig } from "@/server/auth/config";
import { createDb } from "@/server/db/client";
import { users } from "@/server/db/schema";

type UserRole = "student" | "admin" | "service";

export type CurrentUserSession = {
  userId: string;
  authUserId: string;
  email: string;
  emailDomain: string;
  emailVerified: boolean;
  role: UserRole;
  verifiedAt: string | null;
};

export class AuthSessionError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SUPABASE_ENV_MISSING"
      | "SESSION_MISSING"
      | "EMAIL_MISSING"
      | "EMAIL_DOMAIN_NOT_ALLOWED"
      | "EMAIL_NOT_VERIFIED"
      | "APP_USER_MISSING",
  ) {
    super(message);
    this.name = "AuthSessionError";
  }
}

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@").at(1) ?? "";
}

export function isAllowedCampusEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return authConfig.allowedEmailSuffixes.some((suffix) => normalizedEmail.endsWith(suffix));
}

async function createSupabaseSessionClient() {
  const { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } = getClientEnv();

  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new AuthSessionError(
      "Supabase public URL and anon key are required before resolving auth sessions.",
      "SUPABASE_ENV_MISSING",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write refreshed cookies; middleware or actions can.
        }
      },
    },
  });
}

export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  const supabase = await createSupabaseSessionClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  if (!authUser.email) {
    throw new AuthSessionError("Authenticated Supabase user is missing an email address.", "EMAIL_MISSING");
  }

  if (!isAllowedCampusEmail(authUser.email)) {
    throw new AuthSessionError("Only approved UNNC campus email addresses are allowed.", "EMAIL_DOMAIN_NOT_ALLOWED");
  }

  const db = createDb();
  const [appUser] = await db
    .select({
      email: users.email,
      emailDomain: users.emailDomain,
      id: users.id,
      role: users.role,
      verifiedAt: users.verifiedAt,
    })
    .from(users)
    .where(eq(users.authUserId, authUser.id))
    .limit(1);

  if (!appUser) {
    throw new AuthSessionError("Authenticated Supabase user has no matching NeTrix user row.", "APP_USER_MISSING");
  }

  return {
    authUserId: authUser.id,
    email: appUser.email,
    emailDomain: appUser.emailDomain || getEmailDomain(appUser.email),
    emailVerified: Boolean(authUser.email_confirmed_at && appUser.verifiedAt),
    role: appUser.role,
    userId: appUser.id,
    verifiedAt: appUser.verifiedAt?.toISOString() ?? null,
  };
}

export async function requireCurrentUser(): Promise<CurrentUserSession> {
  const session = await getCurrentUser();

  if (!session) {
    throw new AuthSessionError("A signed-in Supabase session is required.", "SESSION_MISSING");
  }

  return session;
}

export async function requireVerifiedCampusUser(): Promise<CurrentUserSession> {
  const session = await requireCurrentUser();

  if (!session.emailVerified) {
    throw new AuthSessionError("A verified campus email session is required.", "EMAIL_NOT_VERIFIED");
  }

  return session;
}
