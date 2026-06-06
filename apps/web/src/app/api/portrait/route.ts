import { NextResponse } from "next/server";

import { getCurrentUserPortrait } from "@/server/ai/portrait-service";
import { resolveProtectedPageData } from "@/server/auth/redirects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const data = await resolveProtectedPageData("/api/portrait", async () => {
    const portrait = await getCurrentUserPortrait();

    return { portrait };
  });

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
