import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  logoData: z.string().optional().nullable(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// Flexible schema — accepts any JSON structure for metricsData
// Template-specific data is validated client-side, stored as JSONB
export const MetricsDataSchema = z.record(z.unknown()).optional();

export const CreateReportSchema = z.object({
  clientId: z.string().min(1, "clientId is required"),
  title: z.string().min(1, "title is required").max(300),
  templateType: z.enum(["general", "seo", "paidAds", "socialMedia"]).optional(),
  dateRangeStart: z.string().datetime().or(z.string().min(1)),
  dateRangeEnd: z.string().datetime().or(z.string().min(1)),
  metricsData: MetricsDataSchema,
  isPublic: z.boolean().optional(),
});

export const UpdateReportSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  templateType: z.enum(["general", "seo", "paidAds", "socialMedia"]).optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  metricsData: MetricsDataSchema,
  isPublic: z.boolean().optional(),
  shareToken: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});
