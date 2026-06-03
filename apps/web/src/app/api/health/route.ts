import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    app: "netrix-web",
    stage: "scaffold-baseline",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
