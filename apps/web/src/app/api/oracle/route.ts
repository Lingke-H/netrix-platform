import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const postId = typeof body.postId === "string" ? body.postId : "local-post";

  return NextResponse.json({
    comment: {
      id: `oracle-${Date.now()}`,
      postId,
      authorName: "Oracle",
      content:
        "Start by making the hidden assumptions explicit, then test the two or three assumptions that would most change your conclusion. Treat the AI answer as a draft: the final trust should come from peer correction and evidence.",
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
    },
  });
}

