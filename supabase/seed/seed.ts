import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import postgres from "postgres";

import {
  academicProfiles,
  connectionRequests,
  connections,
  messageThreads,
  messages,
  posts,
  recommendations,
  users,
} from "../../apps/web/src/server/db/schema";

const seedDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(seedDir, "../..");

config({ path: path.join(repoRoot, "apps/web/.env.local"), override: false });
config({ path: path.join(repoRoot, "apps/web/.env"), override: false });

export const demoDataIds = {
  acceptedConnection: "10000000-0000-4000-8000-000000000401",
  acceptedRequest: "10000000-0000-4000-8000-000000000301",
  currentAuthUser: "10000000-0000-4000-8000-000000000101",
  currentUser: "10000000-0000-4000-8000-000000000001",
  messageFromCurrentUser: "10000000-0000-4000-8000-000000000601",
  messageFromPeer: "10000000-0000-4000-8000-000000000602",
  peerAuthUser: "10000000-0000-4000-8000-000000000102",
  peerUser: "10000000-0000-4000-8000-000000000002",
  postExperience: "10000000-0000-4000-8000-000000000203",
  postQuestion: "10000000-0000-4000-8000-000000000201",
  postResource: "10000000-0000-4000-8000-000000000202",
  recommendation: "10000000-0000-4000-8000-000000000501",
  studyPartnerAuthUser: "10000000-0000-4000-8000-000000000103",
  studyPartnerUser: "10000000-0000-4000-8000-000000000003",
  thread: "10000000-0000-4000-8000-000000000701",
} as const;

const now = new Date("2026-02-01T08:00:00.000Z");

export async function seedDemoData(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required before seeding NeTrix demo data.");
  }

  const queryClient = postgres(databaseUrl, { prepare: false });
  const db = drizzle(queryClient);

  try {
    await db.delete(messages).where(inArray(messages.threadId, [demoDataIds.thread]));
    await db.delete(messageThreads).where(inArray(messageThreads.id, [demoDataIds.thread]));
    await db.delete(connections).where(inArray(connections.id, [demoDataIds.acceptedConnection]));
    await db.delete(connectionRequests).where(inArray(connectionRequests.id, [demoDataIds.acceptedRequest]));
    await db.delete(recommendations).where(inArray(recommendations.id, [demoDataIds.recommendation]));
    await db
      .delete(posts)
      .where(inArray(posts.id, [demoDataIds.postQuestion, demoDataIds.postResource, demoDataIds.postExperience]));
    await db
      .delete(academicProfiles)
      .where(inArray(academicProfiles.userId, [demoDataIds.currentUser, demoDataIds.peerUser, demoDataIds.studyPartnerUser]));
    await db
      .delete(users)
      .where(inArray(users.id, [demoDataIds.currentUser, demoDataIds.peerUser, demoDataIds.studyPartnerUser]));

    await db.insert(users).values([
      {
        authUserId: demoDataIds.currentAuthUser,
        createdAt: now,
        email: "lina.demo@nottingham.edu.cn",
        emailDomain: "nottingham.edu.cn",
        id: demoDataIds.currentUser,
        role: "student",
        updatedAt: now,
        verifiedAt: now,
      },
      {
        authUserId: demoDataIds.peerAuthUser,
        createdAt: now,
        email: "arun.demo@nottingham.edu.cn",
        emailDomain: "nottingham.edu.cn",
        id: demoDataIds.peerUser,
        role: "student",
        updatedAt: now,
        verifiedAt: now,
      },
      {
        authUserId: demoDataIds.studyPartnerAuthUser,
        createdAt: now,
        email: "maya.demo@nottingham.edu.cn",
        emailDomain: "nottingham.edu.cn",
        id: demoDataIds.studyPartnerUser,
        role: "student",
        updatedAt: now,
        verifiedAt: now,
      },
    ]);

    await db.insert(academicProfiles).values([
      {
        collaborationPreference: ["pair study", "project teammate"],
        completionStatus: "recommendation_ready",
        createdAt: now,
        helpNeeded: ["TypeScript debugging", "algorithm tracing"],
        helpOffered: ["React component structure", "coursework planning"],
        id: "10000000-0000-4000-8000-000000000111",
        interests: ["debugging React coursework", "algorithm visualisation"],
        major: "computer-science",
        modules: ["COMP1048", "MATH1031"],
        nickname: "Lina Compiler Mapper",
        skills: ["TypeScript", "React", "Git"],
        updatedAt: now,
        userId: demoDataIds.currentUser,
        visibility: "campus",
        year: "year-2",
      },
      {
        collaborationPreference: ["pair study", "whiteboard sessions"],
        completionStatus: "recommendation_ready",
        createdAt: now,
        helpNeeded: ["React component structure"],
        helpOffered: ["TypeScript debugging", "algorithm tracing"],
        id: "10000000-0000-4000-8000-000000000112",
        interests: ["algorithm visualisation", "coursework systems"],
        major: "computer-science",
        modules: ["COMP1048", "COMP2046"],
        nickname: "Arun Algorithm Partner",
        skills: ["TypeScript", "testing", "data structures"],
        updatedAt: now,
        userId: demoDataIds.peerUser,
        visibility: "campus",
        year: "year-2",
      },
      {
        collaborationPreference: ["lab prep", "concept review"],
        completionStatus: "basic_complete",
        createdAt: now,
        helpNeeded: ["React component structure"],
        helpOffered: ["signals lab prep", "calculus revision"],
        id: "10000000-0000-4000-8000-000000000113",
        interests: ["signals labs", "study planning"],
        major: "eee",
        modules: ["ELEC2043", "MATH1031"],
        nickname: "Maya Signal Tutor",
        skills: ["MATLAB", "signal analysis"],
        updatedAt: now,
        userId: demoDataIds.studyPartnerUser,
        visibility: "campus",
        year: "year-2",
      },
    ]);

    await db.insert(posts).values([
      {
        authorId: demoDataIds.currentUser,
        body: "I keep creating loops when React state updates from derived COMP1048 data. What debugging pattern has worked for you?",
        createdAt: new Date("2026-02-01T08:10:00.000Z"),
        id: demoDataIds.postQuestion,
        modules: ["COMP1048"],
        status: "published",
        tags: ["react", "debugging"],
        title: "How are people debugging COMP1048 React state loops?",
        type: "question",
        updatedAt: new Date("2026-02-01T08:10:00.000Z"),
        visibility: "campus",
      },
      {
        authorId: demoDataIds.peerUser,
        body: "A short checklist for narrowing TypeScript errors before asking for help: reproduce, isolate props, inspect union types, and add one focused test.",
        createdAt: new Date("2026-02-01T08:20:00.000Z"),
        id: demoDataIds.postResource,
        modules: ["COMP1048"],
        status: "published",
        tags: ["typescript", "coursework"],
        title: "TypeScript narrowing checklist for coursework bugs",
        type: "resource",
        updatedAt: new Date("2026-02-01T08:20:00.000Z"),
        visibility: "campus",
      },
      {
        authorId: demoDataIds.studyPartnerUser,
        body: "Before ELEC2043 labs, I map each signal transform to a small sketch and one MATLAB check. It made debugging much calmer.",
        createdAt: new Date("2026-02-01T08:30:00.000Z"),
        id: demoDataIds.postExperience,
        modules: ["ELEC2043"],
        status: "published",
        tags: ["lab-prep", "signals"],
        title: "What helped me prepare for ELEC2043 signals labs",
        type: "experience",
        updatedAt: new Date("2026-02-01T08:30:00.000Z"),
        visibility: "campus",
      },
    ]);

    await db.insert(recommendations).values({
      complementarySignals: ["Candidate can help with: TypeScript debugging", "Viewer can help with: React component structure"],
      conversationStarter: "Ask Arun how they isolate TypeScript errors in COMP1048 React coursework.",
      createdAt: new Date("2026-02-01T08:40:00.000Z"),
      explanationSummary:
        "Arun is recommended because you share COMP1048 and algorithm visualisation, with complementary TypeScript and React support.",
      id: demoDataIds.recommendation,
      llmModel: "mock-recommendation-explainer",
      llmProvider: "mock",
      promptVersion: "recommendation-explanation.v1",
      recommendedUserId: demoDataIds.peerUser,
      recipientUserId: demoDataIds.currentUser,
      scoreSummary: {
        helpComplementarity: 8,
        interestOverlap: 2,
        moduleOverlap: 3,
        total: 13,
      },
      sharedSignals: ["Shared module: COMP1048", "Shared interest: algorithm visualisation"],
      signalSnapshot: {
        candidateUserId: demoDataIds.peerUser,
        candidateVisibility: "campus",
        completionStatus: "recommendation_ready",
        profileVisibility: "campus",
        promptVersion: "recommendation-explanation.v1",
      },
      status: "active",
      updatedAt: new Date("2026-02-01T08:40:00.000Z"),
    });

    await db.insert(connectionRequests).values({
      createdAt: new Date("2026-02-01T08:45:00.000Z"),
      id: demoDataIds.acceptedRequest,
      message: "Could we compare ELEC2043 signal prep notes before the next lab?",
      recipientId: demoDataIds.currentUser,
      requesterId: demoDataIds.studyPartnerUser,
      respondedAt: new Date("2026-02-01T08:50:00.000Z"),
      status: "accepted",
    });

    await db.insert(connections).values({
      createdAt: new Date("2026-02-01T08:50:00.000Z"),
      id: demoDataIds.acceptedConnection,
      requestId: demoDataIds.acceptedRequest,
      status: "active",
      userAId: demoDataIds.studyPartnerUser,
      userBId: demoDataIds.currentUser,
    });

    await db.insert(messageThreads).values({
      connectionId: demoDataIds.acceptedConnection,
      createdAt: new Date("2026-02-01T08:51:00.000Z"),
      id: demoDataIds.thread,
      lastMessageAt: new Date("2026-02-01T08:55:00.000Z"),
      permissionStatus: "available",
    });

    await db.insert(messages).values([
      {
        body: "I can share my ELEC2043 signal sketch template before the lab.",
        createdAt: new Date("2026-02-01T08:52:00.000Z"),
        id: demoDataIds.messageFromPeer,
        senderId: demoDataIds.studyPartnerUser,
        threadId: demoDataIds.thread,
      },
      {
        body: "Great, I can bring my MATH1031 revision notes in return.",
        createdAt: new Date("2026-02-01T08:55:00.000Z"),
        id: demoDataIds.messageFromCurrentUser,
        senderId: demoDataIds.currentUser,
        threadId: demoDataIds.thread,
      },
    ]);
  } finally {
    await queryClient.end();
  }
}

async function main() {
  await seedDemoData();
  console.log(`Seeded NeTrix demo loop for ${demoDataIds.currentUser}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
