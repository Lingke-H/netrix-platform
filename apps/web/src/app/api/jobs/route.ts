import { NextResponse } from "next/server";

import { getCurrentUserJob, listCurrentUserJobs } from "@/server/ai/job-service";
import { resolveProtectedPageData } from "@/server/auth/redirects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  const data = await resolveProtectedPageData("/api/jobs", async () => {
    if (jobId) {
      const job = await getCurrentUserJob(jobId);

      return { job };
    }

    const jobs = await listCurrentUserJobs();

    return { jobs };
  });

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
