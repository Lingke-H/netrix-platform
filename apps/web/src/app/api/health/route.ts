import { NextResponse } from "next/server";

import { getDeploymentHealthReport } from "@/server/deployment/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const report = await getDeploymentHealthReport();
  const httpStatus = report.status === "error" ? 503 : 200;

  return NextResponse.json(report, {
    headers: {
      "Cache-Control": "no-store",
    },
    status: httpStatus,
  });
}
