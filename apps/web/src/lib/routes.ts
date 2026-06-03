export const primaryRoutes = [
  { href: "/feed", label: "Feed" },
  { href: "/library", label: "Library" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/connections", label: "Connections" },
  { href: "/me", label: "Me" },
] as const;

export const scaffoldRoutes = [
  "/auth",
  "/onboarding",
  "/feed",
  "/posts/new",
  "/posts/[id]",
  "/library",
  "/me",
  "/profiles/[id]",
  "/recommendations",
  "/connections",
  "/messages/[threadId]",
] as const;
