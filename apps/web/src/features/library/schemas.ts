import { z } from "zod";

export const resourceOriginSchema = z.enum(["campus-resource", "student-resource", "promoted-post"]);

export const resourceItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(4).max(120),
  summary: z.string().trim().min(8).max(320),
  moduleCode: z.string().trim().min(1).max(24).nullable(),
  tags: z.array(z.string().trim().min(1).max(48)).max(8),
  url: z.string().url().nullable(),
  origin: resourceOriginSchema,
  sourcePostId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

export type ResourceOrigin = z.infer<typeof resourceOriginSchema>;
export type ResourceItem = z.infer<typeof resourceItemSchema>;
