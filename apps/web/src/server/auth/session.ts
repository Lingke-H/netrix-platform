export type CurrentUserSession = {
  userId: string;
  campusEmail: string;
  emailVerified: boolean;
};

export function requireCurrentUser(): never {
  throw new Error("Auth session resolution will be implemented in the data-auth baseline.");
}
