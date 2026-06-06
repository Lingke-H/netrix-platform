import { createServerClient } from "@supabase/ssr";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { getClientEnv, getServerEnv } from "@/lib/env";
import { authConfig } from "@/server/auth/config";
import { createDb, type DbClient } from "@/server/db/client";
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
      | "APP_USER_PROVISIONING_FAILED",
  ) {
    super(message);
    this.name = "AuthSessionError";
  }
}

type AppUserSessionRow = {
  email: string;
  emailDomain: string;
  id: string;
  role: UserRole;
  verifiedAt: Date | null;
};

type CampusEmailIdentity = {
  email: string;
  emailDomain: string;
};

function getEmailDomain(normalizedEmail: string) {
  return normalizedEmail.split("@").at(1) ?? "";
}

export function isAllowedCampusEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return authConfig.allowedEmailSuffixes.some((suffix) => normalizedEmail.endsWith(suffix));
}

export function getCampusEmailIdentity(email: string): CampusEmailIdentity | null {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isAllowedCampusEmail(normalizedEmail)) {
    return null;
  }

  return {
    email: normalizedEmail,
    emailDomain: getEmailDomain(normalizedEmail),
  };
}

export function getAuthEmailVerifiedAt(authUser: Pick<SupabaseUser, "email_confirmed_at">) {
  if (!authUser.email_confirmed_at) {
    return null;
  }

  const verifiedAt = new Date(authUser.email_confirmed_at);

  return Number.isNaN(verifiedAt.getTime()) ? null : verifiedAt;
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

async function upsertAppUserForAuthUser(
  db: DbClient,
  input: CampusEmailIdentity & {
    authUserId: string;
    verifiedAt: Date | null;
  },
) {
  const now = new Date();
  const [appUser] = await db
    .insert(users)
    .values({
      authUserId: input.authUserId,
      email: input.email,
      emailDomain: input.emailDomain,
      verifiedAt: input.verifiedAt,
    })
    .onConflictDoUpdate({
      target: users.authUserId,
      set: {
        email: input.email,
        emailDomain: input.emailDomain,
        updatedAt: now,
        verifiedAt: input.verifiedAt,
      },
    })
    .returning({
      email: users.email,
      emailDomain: users.emailDomain,
      id: users.id,
      role: users.role,
      verifiedAt: users.verifiedAt,
    });

  if (!appUser) {
    throw new AuthSessionError(
      "Unable to provision the NeTrix user row for the authenticated Supabase user.",
      "APP_USER_PROVISIONING_FAILED",
    );
  }

  return appUser;
}

export function buildCurrentUserSession(authUser: Pick<SupabaseUser, "id">, appUser: AppUserSessionRow) {
  return {
    authUserId: authUser.id,
    email: appUser.email,
    emailDomain: appUser.emailDomain || getEmailDomain(appUser.email),
    emailVerified: Boolean(appUser.verifiedAt),
    role: appUser.role,
    userId: appUser.id,
    verifiedAt: appUser.verifiedAt?.toISOString() ?? null,
  } satisfies CurrentUserSession;
}

async function getDemoBypassCurrentUser(): Promise<CurrentUserSession | null> {
  const { NETRIX_DEMO_AUTH_BYPASS_USER_ID, NETRIX_ENABLE_DEMO_AUTH_BYPASS } = getServerEnv();

  if (
    process.env.NODE_ENV === "production" ||
    NETRIX_ENABLE_DEMO_AUTH_BYPASS !== "true" ||
    !NETRIX_DEMO_AUTH_BYPASS_USER_ID
  ) {
    return null;
  }

  const db = createDb();
  const [appUser] = await db
    .select({
      authUserId: users.authUserId,
      email: users.email,
      emailDomain: users.emailDomain,
      id: users.id,
      role: users.role,
      verifiedAt: users.verifiedAt,
    })
    .from(users)
    .where(eq(users.id, NETRIX_DEMO_AUTH_BYPASS_USER_ID))
    .limit(1);

  if (!appUser) {
    throw new AuthSessionError("The configured demo auth bypass user does not exist.", "APP_USER_PROVISIONING_FAILED");
  }

  return buildCurrentUserSession({ id: appUser.authUserId }, appUser);
}

export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  const demoSession = await getDemoBypassCurrentUser();

  if (demoSession) {
    return demoSession;
  }

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

  const campusEmail = getCampusEmailIdentity(authUser.email);

  if (!campusEmail) {
    throw new AuthSessionError("Only approved UNNC campus email addresses are allowed.", "EMAIL_DOMAIN_NOT_ALLOWED");
  }

  const db = createDb();
  const appUser = await upsertAppUserForAuthUser(db, {
    authUserId: authUser.id,
    email: campusEmail.email,
    emailDomain: campusEmail.emailDomain,
    verifiedAt: getAuthEmailVerifiedAt(authUser),
  });

  return buildCurrentUserSession(authUser, appUser);
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
