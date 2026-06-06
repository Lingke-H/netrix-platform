import { z } from "zod";

export const resourceOriginSchema = z.enum(["campus-resource", "student-resource", "promoted-post"]);
export const resourceCurationStatusSchema = z.enum(["seeded", "featured", "archived"]);

export const resourceItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(8).max(320),
  modules: z.array(z.string().trim().min(1).max(80)).max(8),
  tags: z.array(z.string().trim().min(1).max(48)).max(8),
  url: z.string().url().nullable(),
  origin: resourceOriginSchema,
  curationStatus: resourceCurationStatusSchema,
  sourcePostId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

export type ResourceOrigin = z.infer<typeof resourceOriginSchema>;
export type ResourceCurationStatus = z.infer<typeof resourceCurationStatusSchema>;
export type ResourceItem = z.infer<typeof resourceItemSchema>;
