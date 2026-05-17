/**
 * Report template configurations.
 * Each template defines its own tabs, fields, and dynamic tables.
 * The builder form renders different UI based on the selected template.
 */

// ─── Field Definition Types ───

export interface TemplateField {
  key: string;
  label: string;
  type: "number" | "text" | "percentage" | "currency" | "select" | "textarea";
  unit?: string;
  required?: boolean;
  helperText?: string;
  hasPreviousPeriod?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DynamicTableColumn {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  autoCalculate?: "cpa" | "roas" | "engagementRate";
}

export interface DynamicTableConfig {
  columns: DynamicTableColumn[];
  maxRows: number;
  storageKey: string;
  summaryFields?: TemplateField[];
}

export interface PlatformConfig {
  id: string;
  label: string;
  fields: TemplateField[];
}

export interface TemplateTab {
  id: string;
  label: string;
  fields?: TemplateField[];
  dynamicTable?: DynamicTableConfig;
  platformToggle?: {
    platforms: PlatformConfig[];
    defaultEnabled: string[];
  };
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  tabs: TemplateTab[];
  defaultChannels?: { name: string }[];
}

export type TemplateType = "general" | "seo" | "paidAds" | "socialMedia";

// ─── Helper to create previous period key ───

function prevKey(key: string): string {
  return `prev_${key}`;
}

// ─── TEMPLATE 1: General Marketing Report ───

const generalTemplate: TemplateConfig = {
  id: "general",
  name: "General Marketing Report",
  description: "A blended overview of all digital marketing activity. Good default for clients who don't need deep channel-specific data.",
  icon: "📈",
  tabs: [
    {
      id: "overview",
      label: "Overview",
      fields: [
        { key: "totalSessions", label: "Total Website Sessions", type: "number", required: true, helperText: "Total visits to the website this period", hasPreviousPeriod: true },
        { key: "totalConversions", label: "Total Conversions", type: "number", required: true, helperText: "Total goal completions (leads, purchases, sign-ups)", hasPreviousPeriod: true },
        { key: "totalRevenue", label: "Total Revenue / Value", type: "currency", helperText: "Revenue attributed to marketing this period", hasPreviousPeriod: true },
        { key: "bounceRate", label: "Overall Bounce Rate", type: "percentage", helperText: "% of visitors who left without interacting", hasPreviousPeriod: true },
      ],
    },
    {
      id: "traffic",
      label: "Traffic",
      fields: [
        { key: "organicTraffic", label: "Organic Traffic (SEO)", type: "number", unit: "sessions", required: true, helperText: "Visitors from search engines", hasPreviousPeriod: true },
        { key: "paidTraffic", label: "Paid Traffic (Ads)", type: "number", unit: "sessions", helperText: "Visitors from paid ads", hasPreviousPeriod: true },
        { key: "directTraffic", label: "Direct Traffic", type: "number", unit: "sessions", helperText: "Visitors who typed the URL or used bookmarks", hasPreviousPeriod: true },
        { key: "referralTraffic", label: "Referral Traffic", type: "number", unit: "sessions", helperText: "Visitors from other websites linking to yours", hasPreviousPeriod: true },
        { key: "socialTraffic", label: "Social Traffic", type: "number", unit: "sessions", helperText: "Visitors from social media platforms", hasPreviousPeriod: true },
        { key: "emailTraffic", label: "Email Traffic", type: "number", unit: "sessions", helperText: "Visitors from email campaigns", hasPreviousPeriod: true },
        { key: "avgSessionDuration", label: "Average Session Duration", type: "text", unit: "mm:ss", placeholder: "e.g. 2:34", helperText: "How long visitors stay on average" },
        { key: "newVsReturning", label: "New vs Returning Users", type: "text", unit: "% split", placeholder: 'e.g. "72% New, 28% Returning"', helperText: "Breakdown of new vs returning visitors" },
      ],
    },
    {
      id: "conversions",
      label: "Conversions",
      fields: [
        { key: "leads", label: "Leads / Form Submissions", type: "number", helperText: "Contact forms, demo requests, quote requests", hasPreviousPeriod: true },
        { key: "ecommerceTransactions", label: "E-commerce Transactions", type: "number", helperText: "Number of completed purchases", hasPreviousPeriod: true },
        { key: "revenueGenerated", label: "Revenue Generated", type: "currency", helperText: "Total sales value from all channels", hasPreviousPeriod: true },
        { key: "conversionRate", label: "Conversion Rate", type: "percentage", helperText: "(Conversions / Sessions) x 100", hasPreviousPeriod: true },
        { key: "costPerConversion", label: "Cost Per Conversion", type: "currency", helperText: "Total spend / Total conversions", hasPreviousPeriod: true },
        { key: "topConvertingPage", label: "Top Converting Page", type: "text", placeholder: 'e.g. "/contact" or "Homepage"', helperText: "URL or page name" },
      ],
    },
    {
      id: "channels",
      label: "Channels",
      dynamicTable: {
        storageKey: "channels",
        maxRows: 6,
        columns: [
          { key: "name", label: "Channel Name", type: "select", options: ["Organic Search", "Paid Search", "Direct", "Social Media", "Email", "Referral", "Display Ads", "Other"] },
          { key: "sessions", label: "Sessions", type: "number" },
        ],
      },
    },
    {
      id: "notes",
      label: "Notes",
      fields: [
        { key: "executiveSummary", label: "Executive Summary & Notes", type: "textarea", helperText: 'Write a 3-5 sentence summary of this period\'s performance. Use the "Generate with AI" button to auto-write this.' },
        { key: "highlights", label: "Highlights / Key Wins", type: "textarea", helperText: "[OPTIONAL] List the top 2-3 achievements this period" },
        { key: "recommendations", label: "Recommendations for Next Period", type: "textarea", helperText: "[OPTIONAL] What actions will you take next?" },
      ],
    },
  ],
  defaultChannels: [
    { name: "Organic Search" },
    { name: "Paid Search" },
  ],
};

// ─── TEMPLATE 2: SEO Report ───

const seoTemplate: TemplateConfig = {
  id: "seo",
  name: "SEO Report",
  description: "Organic search performance covering traffic, keyword rankings, technical health, and backlinks.",
  icon: "🔍",
  tabs: [
    {
      id: "trafficVisibility",
      label: "Traffic & Visibility",
      fields: [
        { key: "organicSessions", label: "Organic Sessions", type: "number", unit: "sessions", required: true, helperText: "Visitors from Google, Bing, and other search engines", hasPreviousPeriod: true },
        { key: "googleImpressions", label: "Google Impressions", type: "number", helperText: "How many times the site appeared in search results (from GSC)", hasPreviousPeriod: true },
        { key: "googleClicks", label: "Google Clicks", type: "number", helperText: "Clicks from Google Search Console", hasPreviousPeriod: true },
        { key: "avgPosition", label: "Average Position", type: "number", unit: "position", helperText: "Average ranking position across all tracked keywords (e.g. 14.3). Lower is better.", hasPreviousPeriod: true },
        { key: "ctr", label: "Click-Through Rate (CTR)", type: "percentage", helperText: "Clicks / Impressions from Google Search Console", hasPreviousPeriod: true },
        { key: "organicConversions", label: "Organic Conversions", type: "number", helperText: "Conversions/goals completed by organic visitors", hasPreviousPeriod: true },
        { key: "organicRevenue", label: "Organic Revenue", type: "currency", helperText: "Revenue attributed to organic traffic", hasPreviousPeriod: true },
        { key: "organicBounceRate", label: "Bounce Rate (Organic)", type: "percentage", helperText: "% of organic visitors who left without interacting", hasPreviousPeriod: true },
        { key: "pagesPerSession", label: "Pages per Session", type: "number", helperText: "Average number of pages viewed per organic visit", hasPreviousPeriod: true },
        { key: "avgSessionDuration", label: "Avg. Session Duration", type: "text", unit: "mm:ss", placeholder: 'e.g. "2:47"', helperText: "Average time on site for organic visitors" },
        { key: "newOrganicUsers", label: "New Organic Users", type: "number", helperText: "First-time visitors from organic search", hasPreviousPeriod: true },
      ],
    },
    {
      id: "keywordRankings",
      label: "Keyword Rankings",
      fields: [
        { key: "keywordsTop3", label: "Keywords in Top 3", type: "number", hasPreviousPeriod: true },
        { key: "keywordsTop10", label: "Keywords in Top 10", type: "number", hasPreviousPeriod: true },
        { key: "keywordsTop50", label: "Keywords in Top 50", type: "number", hasPreviousPeriod: true },
        { key: "totalKeywordsTracked", label: "Total Keywords Tracked", type: "number" },
        { key: "newKeywordsRanking", label: "New Keywords Ranking", type: "number" },
        { key: "keywordsLost", label: "Keywords Lost from Rankings", type: "number" },
      ],
      dynamicTable: {
        storageKey: "keywordRows",
        maxRows: 20,
        columns: [
          { key: "keyword", label: "Keyword", type: "text" },
          { key: "currentPosition", label: "Current Position", type: "number" },
          { key: "previousPosition", label: "Previous Position", type: "number" },
          { key: "searchVolume", label: "Search Volume", type: "number" },
          { key: "urlRanking", label: "URL Ranking", type: "text" },
          { key: "status", label: "Status", type: "select", options: ["Improved", "Declined", "Stable", "New Entry", "Lost"] },
        ],
      },
    },
    {
      id: "technicalHealth",
      label: "Technical Health",
      fields: [
        { key: "lcp", label: "Core Web Vitals - LCP", type: "text", unit: "seconds", placeholder: "e.g. 2.1", helperText: "Largest Contentful Paint. Good = under 2.5s" },
        { key: "cls", label: "Core Web Vitals - CLS", type: "text", unit: "score", placeholder: "e.g. 0.05", helperText: "Cumulative Layout Shift. Good = under 0.1" },
        { key: "inp", label: "Core Web Vitals - INP", type: "text", unit: "ms", placeholder: "e.g. 150", helperText: "Interaction to Next Paint. Good = under 200ms" },
        { key: "pagesIndexed", label: "Pages Indexed by Google", type: "number", helperText: "From Google Search Console > Index Coverage", hasPreviousPeriod: true },
        { key: "crawlErrorsFixed", label: "Crawl Errors Fixed", type: "number", helperText: "404s, redirect errors, etc. resolved this period" },
        { key: "speedMobile", label: "Site Speed Score (Mobile)", type: "number", unit: "/100", helperText: "Google PageSpeed Insights score for mobile", hasPreviousPeriod: true },
        { key: "speedDesktop", label: "Site Speed Score (Desktop)", type: "number", unit: "/100", helperText: "Google PageSpeed Insights score for desktop", hasPreviousPeriod: true },
        { key: "brokenLinksFixed", label: "Broken Links Fixed", type: "number", helperText: "Internal or external broken links resolved" },
        { key: "structuredDataIssues", label: "Structured Data Issues", type: "number", helperText: "Schema markup errors from GSC", hasPreviousPeriod: true },
        { key: "mobileUsabilityIssues", label: "Mobile Usability Issues", type: "number", helperText: "Issues from Google Search Console", hasPreviousPeriod: true },
      ],
    },
    {
      id: "backlinks",
      label: "Backlinks & Authority",
      fields: [
        { key: "totalBacklinks", label: "Total Backlinks", type: "number", helperText: "Total number of backlinks to the site", hasPreviousPeriod: true },
        { key: "newBacklinks", label: "New Backlinks Earned", type: "number", helperText: "Backlinks gained this period", hasPreviousPeriod: true },
        { key: "referringDomains", label: "Referring Domains", type: "number", helperText: "Unique domains linking to the site", hasPreviousPeriod: true },
        { key: "domainAuthority", label: "Domain Authority (Moz)", type: "number", unit: "/100", helperText: "Moz Domain Authority score", hasPreviousPeriod: true },
        { key: "domainRating", label: "Domain Rating (Ahrefs)", type: "number", unit: "/100", helperText: "Ahrefs Domain Rating score", hasPreviousPeriod: true },
        { key: "lostBacklinks", label: "Lost Backlinks", type: "number", helperText: "Backlinks lost this period", hasPreviousPeriod: true },
        { key: "spamScore", label: "Spam Score", type: "percentage", helperText: "Moz spam score - lower is better", hasPreviousPeriod: true },
        { key: "topNewReferringDomain", label: "Top New Referring Domain", type: "text", placeholder: 'e.g. "forbes.com"', helperText: "Best link earned this period" },
      ],
    },
    {
      id: "notes",
      label: "Notes",
      fields: [
        { key: "executiveSummary", label: "Executive Summary & Notes", type: "textarea", helperText: 'Summarize the period\'s SEO performance in 3-5 sentences. Use "Generate with AI" for auto-writing.' },
        { key: "keyWins", label: "Key Wins This Period", type: "textarea", helperText: '[OPTIONAL] e.g. "Ranked #1 for [keyword], Earned link from [domain]"' },
        { key: "issues", label: "Issues / Observations", type: "textarea", helperText: "[OPTIONAL] Any drops, issues, or anomalies noticed" },
        { key: "actionPlan", label: "Action Plan for Next Period", type: "textarea", helperText: "[OPTIONAL] What you'll focus on next month" },
      ],
    },
  ],
};

// ─── TEMPLATE 3: Paid Ads Report ───

const paidAdsTemplate: TemplateConfig = {
  id: "paidAds",
  name: "Paid Ads Report",
  description: "Ad spend, ROAS, CTR, and campaign performance across Google Ads, Meta Ads, and other platforms.",
  icon: "💰",
  tabs: [
    {
      id: "overview",
      label: "Overview",
      fields: [
        { key: "totalAdSpend", label: "Total Ad Spend", type: "currency", required: true, helperText: "Combined spend across all ad platforms this period", hasPreviousPeriod: true },
        { key: "totalConversions", label: "Total Conversions", type: "number", required: true, helperText: "Total leads, purchases, or goals completed from ads", hasPreviousPeriod: true },
        { key: "overallRoas", label: "Overall ROAS", type: "number", unit: "x", helperText: "Revenue / Ad Spend. e.g. 4.5 means $4.50 returned per $1 spent", hasPreviousPeriod: true },
        { key: "overallCpa", label: "Overall CPA (Cost Per Action)", type: "currency", helperText: "Total Spend / Total Conversions", hasPreviousPeriod: true },
        { key: "totalRevenue", label: "Total Revenue from Ads", type: "currency", helperText: "Total revenue directly attributed to paid ads", hasPreviousPeriod: true },
        { key: "totalImpressions", label: "Total Impressions", type: "number", helperText: "Combined impressions across all platforms", hasPreviousPeriod: true },
        { key: "totalClicks", label: "Total Clicks", type: "number", helperText: "Combined clicks across all platforms", hasPreviousPeriod: true },
        { key: "blendedCtr", label: "Blended CTR", type: "percentage", helperText: "Total Clicks / Total Impressions x 100", hasPreviousPeriod: true },
        { key: "budgetUtilized", label: "Budget Utilized", type: "percentage", helperText: "How much of the allocated budget was spent. e.g. 94%" },
      ],
    },
    {
      id: "googleAds",
      label: "Google Ads",
      fields: [
        { key: "googleSpend", label: "Google Ads Spend", type: "currency", helperText: "Total spend on Google Ads this period", hasPreviousPeriod: true },
        { key: "googleImpressions", label: "Impressions", type: "number", helperText: "Times ads were shown on Google", hasPreviousPeriod: true },
        { key: "googleClicks", label: "Clicks", type: "number", helperText: "Clicks on Google Ads", hasPreviousPeriod: true },
        { key: "googleCtr", label: "CTR", type: "percentage", helperText: "Clicks / Impressions", hasPreviousPeriod: true },
        { key: "googleCpc", label: "Average CPC", type: "currency", helperText: "Average Cost Per Click on Google", hasPreviousPeriod: true },
        { key: "googleConversions", label: "Conversions (Google)", type: "number", helperText: "Conversions tracked in Google Ads", hasPreviousPeriod: true },
        { key: "googleConversionRate", label: "Conversion Rate", type: "percentage", helperText: "Conversions / Clicks x 100", hasPreviousPeriod: true },
        { key: "googleCostPerConv", label: "Cost Per Conversion", type: "currency", helperText: "Google Ads Spend / Google Conversions", hasPreviousPeriod: true },
        { key: "googleRoas", label: "ROAS (Google)", type: "number", unit: "x", helperText: "Google revenue / Google spend", hasPreviousPeriod: true },
        { key: "googleImpressionShare", label: "Impression Share", type: "percentage", helperText: "% of eligible impressions the ads actually received", hasPreviousPeriod: true },
        { key: "googleQualityScore", label: "Quality Score (Avg.)", type: "number", unit: "/10", helperText: "Average Quality Score across active keywords", hasPreviousPeriod: true },
        { key: "googleShareLostBudget", label: "Search Impression Share Lost (Budget)", type: "percentage", helperText: "% of impressions lost due to budget constraints" },
      ],
    },
    {
      id: "metaAds",
      label: "Meta Ads",
      fields: [
        { key: "metaSpend", label: "Meta Ads Spend", type: "currency", helperText: "Total spend on Facebook/Instagram ads", hasPreviousPeriod: true },
        { key: "metaReach", label: "Reach", type: "number", helperText: "Unique people who saw the ads", hasPreviousPeriod: true },
        { key: "metaImpressions", label: "Impressions", type: "number", helperText: "Total times ads were shown (includes repeat views)", hasPreviousPeriod: true },
        { key: "metaFrequency", label: "Frequency", type: "number", unit: "x", helperText: "Impressions / Reach - how often same person saw the ad", hasPreviousPeriod: true },
        { key: "metaClicks", label: "Clicks (All)", type: "number", helperText: "All clicks on the ad (including likes, shares)", hasPreviousPeriod: true },
        { key: "metaLinkClicks", label: "Link Clicks", type: "number", helperText: "Clicks specifically on the ad's URL", hasPreviousPeriod: true },
        { key: "metaCtr", label: "CTR (Link)", type: "percentage", helperText: "Link Clicks / Impressions", hasPreviousPeriod: true },
        { key: "metaCpc", label: "Cost Per Click (CPC)", type: "currency", helperText: "Meta Spend / Link Clicks", hasPreviousPeriod: true },
        { key: "metaConversions", label: "Conversions (Meta)", type: "number", helperText: "Purchases, leads, etc. tracked via Meta Pixel", hasPreviousPeriod: true },
        { key: "metaCostPerResult", label: "Cost Per Result", type: "currency", helperText: "Meta Spend / Conversions", hasPreviousPeriod: true },
        { key: "metaRoas", label: "ROAS (Meta)", type: "number", unit: "x", helperText: "Meta revenue / Meta spend", hasPreviousPeriod: true },
        { key: "metaCpm", label: "CPM (Cost Per 1000 Impressions)", type: "currency", helperText: "(Meta Spend / Impressions) x 1000", hasPreviousPeriod: true },
      ],
    },
    {
      id: "campaigns",
      label: "Campaign Performance",
      dynamicTable: {
        storageKey: "campaignRows",
        maxRows: 10,
        columns: [
          { key: "campaignName", label: "Campaign Name", type: "text" },
          { key: "platform", label: "Platform", type: "select", options: ["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads", "Other"] },
          { key: "spend", label: "Spend ($)", type: "number" },
          { key: "impressions", label: "Impressions", type: "number" },
          { key: "clicks", label: "Clicks", type: "number" },
          { key: "conversions", label: "Conversions", type: "number" },
          { key: "cpa", label: "CPA ($)", type: "number", autoCalculate: "cpa" },
          { key: "roas", label: "ROAS (x)", type: "number", autoCalculate: "roas" },
          { key: "status", label: "Status", type: "select", options: ["Active", "Paused", "Completed", "Testing"] },
        ],
      },
    },
    {
      id: "notes",
      label: "Notes",
      fields: [
        { key: "executiveSummary", label: "Executive Summary & Notes", type: "textarea", helperText: 'Summarize ad performance in 3-5 sentences. Use "Generate with AI" to auto-write.' },
        { key: "topCampaign", label: "Top Performing Campaign", type: "text", helperText: "[OPTIONAL] Name of the best campaign this period and why" },
        { key: "budgetRecommendation", label: "Budget Recommendation", type: "textarea", helperText: "[OPTIONAL] Any budget shifts or recommendations for next period" },
        { key: "creativeNotes", label: "Creative Notes", type: "textarea", helperText: "[OPTIONAL] Notes on ad creative performance - what worked, what didn't" },
      ],
    },
  ],
};

// ─── TEMPLATE 4: Social Media Report ───

const socialMediaTemplate: TemplateConfig = {
  id: "socialMedia",
  name: "Social Media Report",
  description: "Followers, reach, engagement, and content performance across social platforms.",
  icon: "📱",
  tabs: [
    {
      id: "overview",
      label: "Overview",
      fields: [
        { key: "totalFollowers", label: "Total Followers (All Platforms)", type: "number", required: true, helperText: "Combined follower/subscriber count across all channels", hasPreviousPeriod: true },
        { key: "totalReach", label: "Total Reach", type: "number", required: true, helperText: "Total unique people reached across all platforms", hasPreviousPeriod: true },
        { key: "totalImpressions", label: "Total Impressions", type: "number", helperText: "Total times content was displayed (includes repeats)", hasPreviousPeriod: true },
        { key: "totalEngagements", label: "Total Engagements", type: "number", helperText: "Likes + Comments + Shares + Saves combined", hasPreviousPeriod: true },
        { key: "engagementRate", label: "Overall Engagement Rate", type: "percentage", helperText: "(Total Engagements / Total Reach) x 100", hasPreviousPeriod: true },
        { key: "postsPublished", label: "Posts Published", type: "number", helperText: "Total pieces of content published this period", hasPreviousPeriod: true },
        { key: "websiteClicks", label: "Website Clicks from Social", type: "number", helperText: "Visits to the website originating from social media", hasPreviousPeriod: true },
        { key: "newFollowers", label: "New Followers Gained", type: "number", helperText: "Net new followers across all platforms", hasPreviousPeriod: true },
      ],
    },
    {
      id: "platformMetrics",
      label: "Platform Metrics",
      platformToggle: {
        defaultEnabled: ["instagram"],
        platforms: [
          {
            id: "instagram",
            label: "Instagram",
            fields: [
              { key: "igFollowers", label: "Followers", type: "number", hasPreviousPeriod: true },
              { key: "igNewFollowers", label: "New Followers", type: "number", hasPreviousPeriod: true },
              { key: "igReach", label: "Reach", type: "number", hasPreviousPeriod: true },
              { key: "igImpressions", label: "Impressions", type: "number", hasPreviousPeriod: true },
              { key: "igProfileVisits", label: "Profile Visits", type: "number", hasPreviousPeriod: true },
              { key: "igPostsPublished", label: "Posts Published", type: "number", hasPreviousPeriod: true },
              { key: "igStoriesPublished", label: "Stories Published", type: "number", hasPreviousPeriod: true },
              { key: "igReelsPublished", label: "Reels Published", type: "number", hasPreviousPeriod: true },
              { key: "igLikes", label: "Likes", type: "number", hasPreviousPeriod: true },
              { key: "igComments", label: "Comments", type: "number", hasPreviousPeriod: true },
              { key: "igShares", label: "Shares", type: "number", hasPreviousPeriod: true },
              { key: "igSaves", label: "Saves", type: "number", hasPreviousPeriod: true },
              { key: "igEngagementRate", label: "Engagement Rate", type: "percentage", hasPreviousPeriod: true },
              { key: "igLinkClicks", label: "Website Link Clicks", type: "number", hasPreviousPeriod: true },
            ],
          },
          {
            id: "facebook",
            label: "Facebook",
            fields: [
              { key: "fbPageLikesFollowers", label: "Page Likes / Followers", type: "number", hasPreviousPeriod: true },
              { key: "fbNewFollowers", label: "New Followers", type: "number", hasPreviousPeriod: true },
              { key: "fbPostReach", label: "Post Reach", type: "number", hasPreviousPeriod: true },
              { key: "fbPostImpressions", label: "Post Impressions", type: "number", hasPreviousPeriod: true },
              { key: "fbReactions", label: "Reactions", type: "number", hasPreviousPeriod: true },
              { key: "fbComments", label: "Comments", type: "number", hasPreviousPeriod: true },
              { key: "fbShares", label: "Shares", type: "number", hasPreviousPeriod: true },
              { key: "fbLinkClicks", label: "Link Clicks", type: "number", hasPreviousPeriod: true },
              { key: "fbPageViews", label: "Page Views", type: "number", hasPreviousPeriod: true },
              { key: "fbEngagementRate", label: "Engagement Rate", type: "percentage", hasPreviousPeriod: true },
              { key: "fbPostsPublished", label: "Posts Published", type: "number", hasPreviousPeriod: true },
            ],
          },
          {
            id: "linkedin",
            label: "LinkedIn",
            fields: [
              { key: "liFollowers", label: "Followers", type: "number", hasPreviousPeriod: true },
              { key: "liNewFollowers", label: "New Followers", type: "number", hasPreviousPeriod: true },
              { key: "liPostImpressions", label: "Post Impressions", type: "number", hasPreviousPeriod: true },
              { key: "liUniqueVisitors", label: "Unique Visitors", type: "number", hasPreviousPeriod: true },
              { key: "liReactions", label: "Reactions", type: "number", hasPreviousPeriod: true },
              { key: "liComments", label: "Comments", type: "number", hasPreviousPeriod: true },
              { key: "liReposts", label: "Reposts", type: "number", hasPreviousPeriod: true },
              { key: "liEngagementRate", label: "Engagement Rate", type: "percentage", hasPreviousPeriod: true },
              { key: "liCtr", label: "Click-Through Rate", type: "percentage", hasPreviousPeriod: true },
              { key: "liPostsPublished", label: "Posts Published", type: "number", hasPreviousPeriod: true },
            ],
          },
          {
            id: "tikTok",
            label: "TikTok",
            fields: [
              { key: "ttFollowers", label: "Followers", type: "number", hasPreviousPeriod: true },
              { key: "ttNewFollowers", label: "New Followers", type: "number", hasPreviousPeriod: true },
              { key: "ttVideoViews", label: "Video Views", type: "number", hasPreviousPeriod: true },
              { key: "ttProfileViews", label: "Profile Views", type: "number", hasPreviousPeriod: true },
              { key: "ttLikes", label: "Likes", type: "number", hasPreviousPeriod: true },
              { key: "ttComments", label: "Comments", type: "number", hasPreviousPeriod: true },
              { key: "ttShares", label: "Shares", type: "number", hasPreviousPeriod: true },
              { key: "ttAvgWatchTime", label: "Average Watch Time", type: "text", unit: "seconds", hasPreviousPeriod: true },
              { key: "ttVideosPublished", label: "Videos Published", type: "number", hasPreviousPeriod: true },
              { key: "ttEngagementRate", label: "Engagement Rate", type: "percentage", hasPreviousPeriod: true },
            ],
          },
          {
            id: "xTwitter",
            label: "X / Twitter",
            fields: [
              { key: "xFollowers", label: "Followers", type: "number", hasPreviousPeriod: true },
              { key: "xNewFollowers", label: "New Followers", type: "number", hasPreviousPeriod: true },
              { key: "xImpressions", label: "Impressions", type: "number", hasPreviousPeriod: true },
              { key: "xEngagements", label: "Engagements", type: "number", hasPreviousPeriod: true },
              { key: "xEngagementRate", label: "Engagement Rate", type: "percentage", hasPreviousPeriod: true },
              { key: "xLinkClicks", label: "Link Clicks", type: "number", hasPreviousPeriod: true },
              { key: "xRetweets", label: "Retweets / Reposts", type: "number", hasPreviousPeriod: true },
              { key: "xTweetsPublished", label: "Tweets Published", type: "number", hasPreviousPeriod: true },
            ],
          },
          {
            id: "youtube",
            label: "YouTube",
            fields: [
              { key: "ytSubscribers", label: "Subscribers", type: "number", hasPreviousPeriod: true },
              { key: "ytNewSubscribers", label: "New Subscribers", type: "number", hasPreviousPeriod: true },
              { key: "ytViews", label: "Views", type: "number", hasPreviousPeriod: true },
              { key: "ytWatchTime", label: "Watch Time", type: "number", unit: "hours", hasPreviousPeriod: true },
              { key: "ytAvgViewDuration", label: "Avg. View Duration", type: "text", unit: "mm:ss" },
              { key: "ytImpressions", label: "Impressions", type: "number", hasPreviousPeriod: true },
              { key: "ytCtr", label: "Click-Through Rate", type: "percentage", hasPreviousPeriod: true },
              { key: "ytVideosPublished", label: "Videos Published", type: "number", hasPreviousPeriod: true },
            ],
          },
        ],
      },
    },
    {
      id: "contentPerformance",
      label: "Content Performance",
      fields: [
        { key: "bestContentType", label: "Best Performing Content Type", type: "select", options: ["Image", "Video", "Reel", "Story", "Carousel", "Text"], helperText: "What format drove the most engagement this period?" },
        { key: "totalVideoViews", label: "Total Video Views", type: "number", helperText: "Combined views on all video content published" },
        { key: "videoCompletionRate", label: "Video Completion Rate", type: "percentage", helperText: "Average % of video watched by viewers" },
        { key: "bestDayToPost", label: "Best Day to Post (discovered)", type: "text", placeholder: 'e.g. "Tuesdays at 7pm"', helperText: "Best performing day/time" },
      ],
      dynamicTable: {
        storageKey: "contentRows",
        maxRows: 10,
        columns: [
          { key: "postDescription", label: "Post Description", type: "text" },
          { key: "platform", label: "Platform", type: "select", options: ["Instagram", "Facebook", "LinkedIn", "TikTok", "X", "YouTube"] },
          { key: "contentType", label: "Content Type", type: "select", options: ["Image", "Video", "Reel", "Story", "Carousel", "Text", "Blog Link"] },
          { key: "reach", label: "Reach", type: "number" },
          { key: "engagements", label: "Engagements", type: "number" },
          { key: "engagementRate", label: "Engagement Rate (%)", type: "number", autoCalculate: "engagementRate" },
          { key: "linkClicks", label: "Link Clicks", type: "number" },
        ],
      },
    },
    {
      id: "audienceGrowth",
      label: "Audience & Growth",
      fields: [
        { key: "totalAudienceSize", label: "Total Audience Size", type: "number", required: true, helperText: "Combined followers/subscribers across all platforms", hasPreviousPeriod: true },
        { key: "netFollowerGrowth", label: "Net Follower Growth", type: "number", helperText: "Gained minus lost followers - can be negative", hasPreviousPeriod: true },
        { key: "followerGrowthRate", label: "Follower Growth Rate", type: "percentage", helperText: "(New Followers / Followers at Start of Period) x 100", hasPreviousPeriod: true },
        { key: "topAgeGroup", label: "Top Audience Age Group", type: "text", placeholder: 'e.g. "25-34 years old"', helperText: "Most common age demographic" },
        { key: "topGender", label: "Top Audience Gender", type: "text", placeholder: 'e.g. "64% Female"', helperText: "Gender breakdown" },
        { key: "topCountry", label: "Top Audience Country", type: "text", placeholder: 'e.g. "United States (48%)"', helperText: "Top country by audience" },
        { key: "topCity", label: "Top Audience City", type: "text", placeholder: 'e.g. "New York"', helperText: "Top city by audience" },
        { key: "websiteTrafficFromSocial", label: "Website Traffic from Social", type: "number", unit: "sessions", helperText: "Sessions arriving from social media (from GA4)", hasPreviousPeriod: true },
        { key: "socialConversions", label: "Social-Attributed Conversions", type: "number", helperText: "Leads or purchases originating from social media", hasPreviousPeriod: true },
      ],
    },
    {
      id: "notes",
      label: "Notes",
      fields: [
        { key: "executiveSummary", label: "Executive Summary & Notes", type: "textarea", helperText: 'Summarize the social media period in 3-5 sentences. Use "Generate with AI" to auto-write.' },
        { key: "topContentHighlight", label: "Top Performing Content Highlight", type: "textarea", helperText: "[OPTIONAL] Describe the best post/campaign this period and why it worked" },
        { key: "growthObservations", label: "Growth Observations", type: "textarea", helperText: "[OPTIONAL] Key observations about audience growth or drops" },
        { key: "contentStrategy", label: "Content Strategy for Next Period", type: "textarea", helperText: "[OPTIONAL] What content themes or formats you'll focus on next" },
      ],
    },
  ],
};

// ─── Template Registry ───

export const REPORT_TEMPLATES: Record<TemplateType, TemplateConfig> = {
  general: generalTemplate,
  seo: seoTemplate,
  paidAds: paidAdsTemplate,
  socialMedia: socialMediaTemplate,
};

export function getTemplate(templateId: string): TemplateConfig {
  return REPORT_TEMPLATES[templateId as TemplateType] || REPORT_TEMPLATES.general;
}

export function getAllTemplates(): TemplateConfig[] {
  return Object.values(REPORT_TEMPLATES);
}

// Backward-compatible type exports
export type ReportTemplate = TemplateConfig;
export type TemplateMetricsConfig = TemplateConfig;
