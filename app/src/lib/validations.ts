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

export const MetricsDataSchema = z.object({
  summary: z.object({
    sessions: z.number().min(0),
    conversions: z.number().min(0),
    revenue: z.number().min(0).optional(),
    previousSessions: z.number().min(0).optional(),
    previousConversions: z.number().min(0).optional(),
  }).optional(),
  channelBreakdown: z.array(z.object({
    channel: z.string(),
    sessions: z.number().min(0),
    percentage: z.number().min(0).max(100).optional(),
  })).optional(),
  weeklyTrend: z.array(z.object({
    week: z.string(),
    sessions: z.number().min(0),
    conversions: z.number().min(0),
  })).optional(),
  customMetrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    change: z.string().optional(),
    changeType: z.enum(["positive", "negative", "neutral"]).optional(),
  })).optional(),
  notes: z.string().optional(),
});

export const CreateReportSchema = z.object({
  clientId: z.string().min(1, "clientId is required"),
  title: z.string().min(1, "title is required").max(300),
  dateRangeStart: z.string().datetime().or(z.string().min(1)),
  dateRangeEnd: z.string().datetime().or(z.string().min(1)),
  metricsData: MetricsDataSchema.optional(),
  isPublic: z.boolean().optional(),
});

export const UpdateReportSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  metricsData: MetricsDataSchema.optional(),
  isPublic: z.boolean().optional(),
  shareToken: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});
