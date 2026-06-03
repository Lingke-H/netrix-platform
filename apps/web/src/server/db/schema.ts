import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const majorEnum = pgEnum("major", [
  "math",
  "computer-science",
  "eee",
  "fam",
  "ibe",
  "other",
]);

export const studyYearEnum = pgEnum("study_year", [
  "foundation",
  "year-1",
  "year-2",
  "year-3",
  "year-4",
  "postgraduate",
]);

export const profileVisibilityEnum = pgEnum("profile_visibility", ["campus", "connections", "private"]);
export const profileCompletionStatusEnum = pgEnum("profile_completion_status", [
  "not_started",
  "draft",
  "completed",
]);
export const academicPortraitStatusEnum = pgEnum("academic_portrait_status", [
  "not_requested",
  "draft",
  "generated",
  "confirmed",
  "failed",
]);
export const postTypeEnum = pgEnum("post_type", ["qa", "resource", "experience"]);
export const postVisibilityEnum = pgEnum("post_visibility", ["campus", "connections"]);
export const resourceOriginEnum = pgEnum("resource_origin", [
  "campus-resource",
  "student-resource",
  "promoted-post",
]);
export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "generated",
  "viewed",
  "dismissed",
  "requested",
  "connected",
]);
export const connectionRequestStatusEnum = pgEnum("connection_request_status", [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]);
export const connectionStatusEnum = pgEnum("connection_status", ["active", "archived"]);
export const messagePermissionStatusEnum = pgEnum("message_permission_status", ["locked", "available"]);
export const aiJobTypeEnum = pgEnum("ai_job_type", [
  "nickname",
  "profile-portrait",
  "recommendation-explanation",
]);
export const aiJobStatusEnum = pgEnum("ai_job_status", ["queued", "running", "succeeded", "failed"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    campusEmail: varchar("campus_email", { length: 255 }).notNull(),
    campusEmailVerified: boolean("campus_email_verified").notNull().default(false),
    campusEmailVerifiedAt: timestamp("campus_email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    campusEmailUnique: uniqueIndex("users_campus_email_unique").on(table.campusEmail),
  }),
);

export const academicProfiles = pgTable(
  "academic_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nickname: varchar("nickname", { length: 40 }).notNull(),
    major: majorEnum("major").notNull(),
    year: studyYearEnum("year").notNull(),
    modules: jsonb("modules").$type<string[]>().notNull().default([]),
    interests: jsonb("interests").$type<string[]>().notNull().default([]),
    skillsOffered: jsonb("skills_offered").$type<string[]>().notNull().default([]),
    helpNeeded: jsonb("help_needed").$type<string[]>().notNull().default([]),
    collaborationPreferences: jsonb("collaboration_preferences").$type<string[]>().notNull().default([]),
    visibility: profileVisibilityEnum("visibility").notNull().default("campus"),
    completionStatus: profileCompletionStatusEnum("completion_status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdUnique: uniqueIndex("academic_profiles_user_id_unique").on(table.userId),
    majorIndex: index("academic_profiles_major_idx").on(table.major),
  }),
);

export const academicPortraits = pgTable(
  "academic_portraits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    summary: text("summary"),
    currentFocus: jsonb("current_focus").$type<string[]>().notNull().default([]),
    collaborationStyle: text("collaboration_style"),
    strengths: jsonb("strengths").$type<string[]>().notNull().default([]),
    suggestedTopics: jsonb("suggested_topics").$type<string[]>().notNull().default([]),
    status: academicPortraitStatusEnum("status").notNull().default("not_requested"),
    promptVersion: varchar("prompt_version", { length: 80 }),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdUnique: uniqueIndex("academic_portraits_user_id_unique").on(table.userId),
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: postTypeEnum("type").notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    content: text("content").notNull(),
    moduleCode: varchar("module_code", { length: 24 }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    visibility: postVisibilityEnum("visibility").notNull().default("campus"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    authorIndex: index("posts_author_user_id_idx").on(table.authorUserId),
    typeIndex: index("posts_type_idx").on(table.type),
  }),
);

export const resourceItems = pgTable(
  "resource_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourcePostId: uuid("source_post_id").references(() => posts.id, { onDelete: "set null" }),
    title: varchar("title", { length: 120 }).notNull(),
    summary: varchar("summary", { length: 320 }).notNull(),
    moduleCode: varchar("module_code", { length: 24 }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    url: text("url"),
    origin: resourceOriginEnum("origin").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sourcePostIndex: index("resource_items_source_post_id_idx").on(table.sourcePostId),
  }),
);

export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recommendedUserId: uuid("recommended_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    explanationSummary: varchar("explanation_summary", { length: 320 }).notNull(),
    sharedSignals: jsonb("shared_signals").$type<string[]>().notNull().default([]),
    complementarySignals: jsonb("complementary_signals").$type<string[]>().notNull().default([]),
    conversationStarter: varchar("conversation_starter", { length: 200 }).notNull(),
    scoreSummary: jsonb("score_summary").$type<Record<string, number | string | boolean | null>>().notNull().default({}),
    signalSnapshot: jsonb("signal_snapshot")
      .$type<Record<string, string | number | boolean | string[] | null>>()
      .notNull()
      .default({}),
    promptVersion: varchar("prompt_version", { length: 80 }).notNull(),
    status: recommendationStatusEnum("status").notNull().default("generated"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIndex: index("recommendations_user_id_idx").on(table.userId),
    recommendedUserIndex: index("recommendations_recommended_user_id_idx").on(table.recommendedUserId),
  }),
);

export const connectionRequests = pgTable(
  "connection_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterUserId: uuid("requester_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientUserId: uuid("recipient_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recommendationId: uuid("recommendation_id").references(() => recommendations.id, {
      onDelete: "set null",
    }),
    messagePreview: varchar("message_preview", { length: 240 }),
    status: connectionRequestStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => ({
    requesterIndex: index("connection_requests_requester_user_id_idx").on(table.requesterUserId),
    recipientIndex: index("connection_requests_recipient_user_id_idx").on(table.recipientUserId),
  }),
);

export const connections = pgTable(
  "connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAId: uuid("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: uuid("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestId: uuid("request_id")
      .notNull()
      .references(() => connectionRequests.id, { onDelete: "cascade" }),
    status: connectionStatusEnum("status").notNull().default("active"),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    requestIdUnique: uniqueIndex("connections_request_id_unique").on(table.requestId),
  }),
);

export const messageThreads = pgTable(
  "message_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    connectionId: uuid("connection_id")
      .notNull()
      .references(() => connections.id, { onDelete: "cascade" }),
    permissionStatus: messagePermissionStatusEnum("permission_status").notNull().default("available"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    connectionIdUnique: uniqueIndex("message_threads_connection_id_unique").on(table.connectionId),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => messageThreads.id, { onDelete: "cascade" }),
    senderUserId: uuid("sender_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    threadIndex: index("messages_thread_id_idx").on(table.threadId),
  }),
);

export const aiJobs = pgTable(
  "ai_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: aiJobTypeEnum("type").notNull(),
    status: aiJobStatusEnum("status").notNull().default("queued"),
    promptVersion: varchar("prompt_version", { length: 80 }).notNull(),
    inputSummary: text("input_summary").notNull(),
    outputSummary: text("output_summary"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    userIndex: index("ai_jobs_user_id_idx").on(table.userId),
  }),
);

export const eventLogs = pgTable(
  "event_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    objectType: varchar("object_type", { length: 80 }).notNull(),
    objectId: varchar("object_id", { length: 80 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, string | number | boolean | null>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    eventTypeIndex: index("event_logs_event_type_idx").on(table.eventType),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type AcademicProfileRow = typeof academicProfiles.$inferSelect;
export type AcademicPortraitRow = typeof academicPortraits.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type ResourceItemRow = typeof resourceItems.$inferSelect;
export type RecommendationRow = typeof recommendations.$inferSelect;
export type ConnectionRequestRow = typeof connectionRequests.$inferSelect;
export type ConnectionRow = typeof connections.$inferSelect;
export type MessageThreadRow = typeof messageThreads.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
export type AiJobRow = typeof aiJobs.$inferSelect;
export type EventLogRow = typeof eventLogs.$inferSelect;
