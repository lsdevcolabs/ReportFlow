/**
 * Built-in report templates for common report types.
 * Templates are purely frontend configuration — nothing stored in the DB.
 * They pre-fill the metrics form with relevant fields and custom KPIs.
 */

export interface TemplateCustomMetric {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export interface TemplateChannelBreakdown {
  channel: string;
  sessions: number;
}

export interface TemplateMetricsConfig {
  // Which standard metric tabs to show/pre-fill
  trafficFields: string[];
  conversionFields: string[];
  paidAdsFields: string[];
  audienceFields: string[];
  // Pre-labeled custom KPIs
  customMetrics: TemplateCustomMetric[];
  // Pre-labeled channel breakdown rows
  channelBreakdown: TemplateChannelBreakdown[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  metricsConfig: TemplateMetricsConfig;
}

export const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  general: {
    id: "general",
    name: "General Marketing Report",
    description: "A blank template. Customize everything yourself.",
    icon: "📈",
    metricsConfig: {
      trafficFields: ["organicTraffic", "paidTraffic"],
      conversionFields: ["conversions", "revenue"],
      paidAdsFields: ["adSpend", "roas"],
      audienceFields: [],
      customMetrics: [],
      channelBreakdown: [
        { channel: "Organic Search", sessions: 0 },
        { channel: "Paid Search", sessions: 0 },
      ],
    },
  },
  seo: {
    id: "seo",
    name: "SEO Report",
    description:
      "Organic traffic, keyword rankings, backlinks, and search visibility.",
    icon: "🔍",
    metricsConfig: {
      trafficFields: ["organicTraffic", "previousPeriodOrganic"],
      conversionFields: ["conversions", "bounceRate"],
      paidAdsFields: [],
      audienceFields: [],
      customMetrics: [
        {
          label: "Keyword Rankings (Top 10)",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Domain Authority",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Backlinks Earned",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Pages Indexed",
          value: "",
          change: "",
          changeType: "neutral",
        },
      ],
      channelBreakdown: [
        { channel: "Organic Search", sessions: 0 },
        { channel: "Direct", sessions: 0 },
        { channel: "Referral", sessions: 0 },
      ],
    },
  },
  paidAds: {
    id: "paidAds",
    name: "Paid Ads Report",
    description:
      "Ad spend, ROAS, CTR, impressions, and campaign performance.",
    icon: "💰",
    metricsConfig: {
      trafficFields: ["paidTraffic", "organicTraffic"],
      conversionFields: ["conversions", "revenue"],
      paidAdsFields: ["adSpend", "roas", "impressions", "clicks", "ctr"],
      audienceFields: [],
      customMetrics: [
        {
          label: "Cost Per Lead (CPL)",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Cost Per Click (CPC)",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Conversion Rate",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Quality Score Avg",
          value: "",
          change: "",
          changeType: "neutral",
        },
      ],
      channelBreakdown: [
        { channel: "Google Ads", sessions: 0 },
        { channel: "Meta Ads", sessions: 0 },
        { channel: "Other Paid", sessions: 0 },
      ],
    },
  },
  socialMedia: {
    id: "socialMedia",
    name: "Social Media Report",
    description:
      "Followers, reach, engagement, and content performance.",
    icon: "📱",
    metricsConfig: {
      trafficFields: ["organicTraffic"],
      conversionFields: ["conversions"],
      paidAdsFields: ["adSpend"],
      audienceFields: [],
      customMetrics: [
        {
          label: "Total Followers",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Follower Growth",
          value: "",
          change: "",
          changeType: "positive",
        },
        {
          label: "Average Reach per Post",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Engagement Rate (%)",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Posts Published",
          value: "",
          change: "",
          changeType: "neutral",
        },
        {
          label: "Profile Visits",
          value: "",
          change: "",
          changeType: "neutral",
        },
      ],
      channelBreakdown: [
        { channel: "Instagram", sessions: 0 },
        { channel: "Facebook", sessions: 0 },
        { channel: "LinkedIn", sessions: 0 },
        { channel: "TikTok", sessions: 0 },
      ],
    },
  },
};

/**
 * Get a template by ID. Returns the 'general' template if not found.
 */
export function getTemplate(templateId: string): ReportTemplate {
  return REPORT_TEMPLATES[templateId] || REPORT_TEMPLATES.general;
}

/**
 * Get all available templates as an array.
 */
export function getAllTemplates(): ReportTemplate[] {
  return Object.values(REPORT_TEMPLATES);
}
