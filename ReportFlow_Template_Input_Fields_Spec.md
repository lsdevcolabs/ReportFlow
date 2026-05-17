# ReportFlow — Report Template Input Fields Specification
### For AI Coder Implementation
**Date:** May 2026
**Purpose:** Define every input field, label, type, group, and helper text for each of the 4 report templates. The coder must replace the current generic input form with these template-specific forms. When a user selects a template and clicks Continue, the report builder must show exactly the fields listed for that template — no more, no less.

---

## HOW THE BUILDER SHOULD WORK (Architecture Note)

When the user selects a template in Step 1 and clicks "Continue", Step 2 (the report builder) renders **different tab sets and input fields** depending on which template was selected.

- Each template has its own set of **Section Tabs** (replacing the current generic Traffic / Conversions / Paid Ads / Audience tabs)
- Each tab contains its own specific input fields
- Field types: `number`, `text`, `percentage`, `currency`, `select-dropdown`, `textarea`, `toggle`
- Every numeric field that represents a current period metric must have a paired **"Previous Period"** field next to it so the app can calculate % change automatically
- The **"Executive Summary & Notes"** textarea is always the LAST section, shown below all tabs, always visible on all templates
- Fields marked `[OPTIONAL]` can be left blank — the public report just hides that section if empty
- Fields marked `[REQUIRED]` must be filled before the report can be published

---

## TEMPLATE 1 — GENERAL MARKETING REPORT 📈

**Use case:** Clients who receive a blended overview of all digital marketing activity — not specialized in one area. Good default for clients who don't need deep channel-specific data.

**Tab Structure:** Overview | Traffic | Conversions | Channels | Notes

---

### TAB 1 — Overview (KPI Summary)

These 4 fields appear as the hero KPI cards at the top of the public report.

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Total Website Sessions | number | — | ✅ Yes | ✅ Required | Total visits to the website this period |
| Total Conversions | number | — | ✅ Yes | ✅ Required | Total goal completions (leads, purchases, sign-ups) |
| Total Revenue / Value | number | $ | ✅ Yes | ❌ Optional | Revenue attributed to marketing this period |
| Overall Bounce Rate | number | % | ✅ Yes | ❌ Optional | % of visitors who left without interacting |

---

### TAB 2 — Traffic

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Organic Traffic (SEO) | number | sessions | ✅ Yes | ✅ Required | Visitors from search engines |
| Paid Traffic (Ads) | number | sessions | ✅ Yes | ❌ Optional | Visitors from paid ads |
| Direct Traffic | number | sessions | ✅ Yes | ❌ Optional | Visitors who typed the URL or used bookmarks |
| Referral Traffic | number | sessions | ✅ Yes | ❌ Optional | Visitors from other websites linking to yours |
| Social Traffic | number | sessions | ✅ Yes | ❌ Optional | Visitors from social media platforms |
| Email Traffic | number | sessions | ✅ Yes | ❌ Optional | Visitors from email campaigns |
| Average Session Duration | text | mm:ss | ❌ No | ❌ Optional | e.g. 2:34 — how long visitors stay on average |
| New vs Returning Users | text | % split | ❌ No | ❌ Optional | e.g. "72% New, 28% Returning" |

---

### TAB 3 — Conversions

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Leads / Form Submissions | number | — | ✅ Yes | ❌ Optional | Contact forms, demo requests, quote requests |
| E-commerce Transactions | number | — | ✅ Yes | ❌ Optional | Number of completed purchases |
| Revenue Generated | number | $ | ✅ Yes | ❌ Optional | Total sales value from all channels |
| Conversion Rate | number | % | ✅ Yes | ❌ Optional | (Conversions ÷ Sessions) × 100 |
| Cost Per Conversion | number | $ | ✅ Yes | ❌ Optional | Total spend ÷ Total conversions |
| Top Converting Page | text | URL or page name | ❌ No | ❌ Optional | e.g. "/contact" or "Homepage" |

---

### TAB 4 — Channels

This tab defines the Channel Breakdown bar chart shown in the public report.

**UI:** A dynamic list where the user can add up to 6 channel rows. Each row has:
- Channel Name (text dropdown with presets + "Custom" option): Organic Search, Paid Search, Direct, Social Media, Email, Referral, Display Ads, Other
- Sessions (number input)

The app auto-calculates the % of total for each channel.

| Pre-filled Channel Options | Notes |
|---|---|
| Organic Search | Pre-added by default |
| Paid Search | Pre-added by default |
| Direct | User adds if needed |
| Social Media | User adds if needed |
| Email | User adds if needed |
| Referral | User adds if needed |

---

### TAB 5 — Notes (Always Visible Below All Tabs)

| Field Label | Input Type | Helper Text |
|---|---|---|
| Executive Summary & Notes | textarea (large) | Write a 3–5 sentence summary of this period's performance. Use the "✨ Generate with AI" button to auto-write this. |
| Highlights / Key Wins | textarea (medium) | [OPTIONAL] List the top 2–3 achievements this period |
| Recommendations for Next Period | textarea (medium) | [OPTIONAL] What actions will you take next? |

---

---

## TEMPLATE 2 — SEO REPORT 🔍

**Use case:** SEO consultants and agencies reporting on organic search performance. Covers traffic, keyword rankings, technical health, and backlinks. This is the most common monthly report type for SEO freelancers.

**Tab Structure:** Traffic & Visibility | Keyword Rankings | Technical Health | Backlinks | Notes

---

### TAB 1 — Traffic & Visibility

These feed the KPI hero cards at the top of the public report.

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Organic Sessions | number | sessions | ✅ Yes | ✅ Required | Visitors from Google, Bing, and other search engines |
| Google Impressions | number | — | ✅ Yes | ❌ Optional | How many times the site appeared in search results (from GSC) |
| Google Clicks | number | — | ✅ Yes | ❌ Optional | Clicks from Google Search Console |
| Average Position | number | position | ✅ Yes | ❌ Optional | Average ranking position across all tracked keywords (e.g. 14.3). Lower is better. |
| Click-Through Rate (CTR) | number | % | ✅ Yes | ❌ Optional | Clicks ÷ Impressions from Google Search Console |
| Organic Conversions | number | — | ✅ Yes | ❌ Optional | Conversions/goals completed by organic visitors |
| Organic Revenue | number | $ | ✅ Yes | ❌ Optional | Revenue attributed to organic traffic |
| Bounce Rate (Organic) | number | % | ✅ Yes | ❌ Optional | % of organic visitors who left without interacting |
| Pages per Session | number | — | ✅ Yes | ❌ Optional | Average number of pages viewed per organic visit |
| Avg. Session Duration | text | mm:ss | ❌ No | ❌ Optional | e.g. "2:47" |
| New Organic Users | number | — | ✅ Yes | ❌ Optional | First-time visitors from organic search |

---

### TAB 2 — Keyword Rankings

**UI:** A dynamic table where the user can add up to 20 keyword rows. Each row has these columns:

| Column | Input Type | Notes |
|---|---|---|
| Keyword | text | The target keyword being tracked |
| Current Position | number | Ranking this period (1–100+) |
| Previous Position | number | Ranking last period — app auto-calculates change (↑↓) |
| Search Volume | number | Monthly searches (optional, helps client context) |
| URL Ranking | text | Which page is ranking for this keyword |
| Status | select | Choices: Improved / Declined / Stable / New Entry / Lost |

**Plus these summary fields above the table:**

| Field Label | Input Type | Unit | Previous Period Field? | Required? |
|---|---|---|---|---|
| Keywords in Top 3 | number | — | ✅ Yes | ❌ Optional |
| Keywords in Top 10 | number | — | ✅ Yes | ❌ Optional |
| Keywords in Top 50 | number | — | ✅ Yes | ❌ Optional |
| Total Keywords Tracked | number | — | ❌ No | ❌ Optional |
| New Keywords Ranking | number | — | ❌ No | ❌ Optional |
| Keywords Lost from Rankings | number | — | ❌ No | ❌ Optional |

---

### TAB 3 — Technical Health

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Core Web Vitals — LCP | text | seconds | ❌ No | ❌ Optional | Largest Contentful Paint. Good = under 2.5s |
| Core Web Vitals — CLS | text | score | ❌ No | ❌ Optional | Cumulative Layout Shift. Good = under 0.1 |
| Core Web Vitals — INP | text | ms | ❌ No | ❌ Optional | Interaction to Next Paint. Good = under 200ms |
| Pages Indexed by Google | number | — | ✅ Yes | ❌ Optional | From Google Search Console → Index Coverage |
| Crawl Errors Fixed | number | — | ❌ No | ❌ Optional | 404s, redirect errors, etc. resolved this period |
| Site Speed Score (Mobile) | number | /100 | ✅ Yes | ❌ Optional | Google PageSpeed Insights score for mobile |
| Site Speed Score (Desktop) | number | /100 | ✅ Yes | ❌ Optional | Google PageSpeed Insights score for desktop |
| Broken Links Fixed | number | — | ❌ No | ❌ Optional | Internal or external broken links resolved |
| Structured Data Issues | number | — | ✅ Yes | ❌ Optional | Schema markup errors from GSC |
| Mobile Usability Issues | number | — | ✅ Yes | ❌ Optional | Issues from Google Search Console |

---

### TAB 4 — Backlinks & Authority

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Total Backlinks | number | — | ✅ Yes | ❌ Optional | Total number of backlinks to the site |
| New Backlinks Earned | number | — | ✅ Yes | ❌ Optional | Backlinks gained this period |
| Referring Domains | number | — | ✅ Yes | ❌ Optional | Unique domains linking to the site |
| Domain Authority (Moz) | number | /100 | ✅ Yes | ❌ Optional | Moz Domain Authority score |
| Domain Rating (Ahrefs) | number | /100 | ✅ Yes | ❌ Optional | Ahrefs Domain Rating score |
| Lost Backlinks | number | — | ✅ Yes | ❌ Optional | Backlinks lost this period |
| Spam Score | number | % | ✅ Yes | ❌ Optional | Moz spam score — lower is better |
| Top New Referring Domain | text | domain name | ❌ No | ❌ Optional | e.g. "forbes.com" — best link earned this period |

---

### TAB 5 — Notes (Always Visible Below All Tabs)

| Field Label | Input Type | Helper Text |
|---|---|---|
| Executive Summary & Notes | textarea (large) | Summarize the period's SEO performance in 3–5 sentences. Use "✨ Generate with AI" for auto-writing. |
| Key Wins This Period | textarea (medium) | [OPTIONAL] e.g. "Ranked #1 for [keyword], Earned link from [domain]" |
| Issues / Observations | textarea (medium) | [OPTIONAL] Any drops, issues, or anomalies noticed |
| Action Plan for Next Period | textarea (medium) | [OPTIONAL] What you'll focus on next month |

---

---

## TEMPLATE 3 — PAID ADS REPORT 💰

**Use case:** PPC managers and paid media agencies reporting on Google Ads, Meta Ads (Facebook/Instagram), or other ad platforms. Covers spend efficiency, conversion data, and campaign-level performance.

**Tab Structure:** Overview | Google Ads | Meta Ads | Campaign Performance | Notes

---

### TAB 1 — Overview (All Platforms Combined)

These are the blended KPI hero cards across ALL ad platforms combined.

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Total Ad Spend | number | $ | ✅ Yes | ✅ Required | Combined spend across all ad platforms this period |
| Total Conversions | number | — | ✅ Yes | ✅ Required | Total leads, purchases, or goals completed from ads |
| Overall ROAS | number | x | ✅ Yes | ❌ Optional | Revenue ÷ Ad Spend. e.g. 4.5 means $4.50 returned per $1 spent |
| Overall CPA (Cost Per Action) | number | $ | ✅ Yes | ❌ Optional | Total Spend ÷ Total Conversions |
| Total Revenue from Ads | number | $ | ✅ Yes | ❌ Optional | Total revenue directly attributed to paid ads |
| Total Impressions | number | — | ✅ Yes | ❌ Optional | Combined impressions across all platforms |
| Total Clicks | number | — | ✅ Yes | ❌ Optional | Combined clicks across all platforms |
| Blended CTR | number | % | ✅ Yes | ❌ Optional | Total Clicks ÷ Total Impressions × 100 |
| Budget Utilized | number | % | ❌ No | ❌ Optional | How much of the allocated budget was spent. e.g. 94% |

---

### TAB 2 — Google Ads

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Google Ads Spend | number | $ | ✅ Yes | ❌ Optional | Total spend on Google Ads this period |
| Impressions | number | — | ✅ Yes | ❌ Optional | Times ads were shown on Google |
| Clicks | number | — | ✅ Yes | ❌ Optional | Clicks on Google Ads |
| CTR | number | % | ✅ Yes | ❌ Optional | Clicks ÷ Impressions |
| Average CPC | number | $ | ✅ Yes | ❌ Optional | Average Cost Per Click on Google |
| Conversions (Google) | number | — | ✅ Yes | ❌ Optional | Conversions tracked in Google Ads |
| Conversion Rate | number | % | ✅ Yes | ❌ Optional | Conversions ÷ Clicks × 100 |
| Cost Per Conversion | number | $ | ✅ Yes | ❌ Optional | Google Ads Spend ÷ Google Conversions |
| ROAS (Google) | number | x | ✅ Yes | ❌ Optional | Google revenue ÷ Google spend |
| Impression Share | number | % | ✅ Yes | ❌ Optional | % of eligible impressions the ads actually received |
| Quality Score (Avg.) | number | /10 | ✅ Yes | ❌ Optional | Average Quality Score across active keywords |
| Search Impression Share Lost (Budget) | number | % | ❌ No | ❌ Optional | % of impressions lost due to budget constraints |

---

### TAB 3 — Meta Ads (Facebook & Instagram)

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Meta Ads Spend | number | $ | ✅ Yes | ❌ Optional | Total spend on Facebook/Instagram ads |
| Reach | number | — | ✅ Yes | ❌ Optional | Unique people who saw the ads |
| Impressions | number | — | ✅ Yes | ❌ Optional | Total times ads were shown (includes repeat views) |
| Frequency | number | x | ✅ Yes | ❌ Optional | Impressions ÷ Reach — how often same person saw the ad |
| Clicks (All) | number | — | ✅ Yes | ❌ Optional | All clicks on the ad (including likes, shares) |
| Link Clicks | number | — | ✅ Yes | ❌ Optional | Clicks specifically on the ad's URL |
| CTR (Link) | number | % | ✅ Yes | ❌ Optional | Link Clicks ÷ Impressions |
| Cost Per Click (CPC) | number | $ | ✅ Yes | ❌ Optional | Meta Spend ÷ Link Clicks |
| Conversions (Meta) | number | — | ✅ Yes | ❌ Optional | Purchases, leads, etc. tracked via Meta Pixel |
| Cost Per Result | number | $ | ✅ Yes | ❌ Optional | Meta Spend ÷ Conversions |
| ROAS (Meta) | number | x | ✅ Yes | ❌ Optional | Meta revenue ÷ Meta spend |
| CPM (Cost Per 1000 Impressions) | number | $ | ✅ Yes | ❌ Optional | (Meta Spend ÷ Impressions) × 1000 |

---

### TAB 4 — Campaign Performance

**UI:** A dynamic table where the user can add up to 10 campaign rows. Each row has these columns:

| Column | Input Type | Notes |
|---|---|---|
| Campaign Name | text | Name of the campaign |
| Platform | select | Google Ads / Meta Ads / LinkedIn Ads / TikTok Ads / Other |
| Spend | number ($) | Budget used by this campaign |
| Impressions | number | Impressions for this campaign |
| Clicks | number | Clicks for this campaign |
| Conversions | number | Conversions from this campaign |
| CPA | number ($) | Cost per conversion — auto-calculated if spend + conversions filled |
| ROAS | number (x) | Return on Ad Spend for this campaign |
| Status | select | Active / Paused / Completed / Testing |

**Note for coder:** If CPA and ROAS inputs are left blank, auto-calculate them from the Spend and Conversions columns. Show the auto-calculated value in gray — if user types a value, use that instead.

---

### TAB 5 — Notes (Always Visible Below All Tabs)

| Field Label | Input Type | Helper Text |
|---|---|---|
| Executive Summary & Notes | textarea (large) | Summarize ad performance in 3–5 sentences. Use "✨ Generate with AI" to auto-write. |
| Top Performing Campaign | text | [OPTIONAL] Name of the best campaign this period and why |
| Budget Recommendation | textarea (medium) | [OPTIONAL] Any budget shifts or recommendations for next period |
| Creative Notes | textarea (medium) | [OPTIONAL] Notes on ad creative performance — what worked, what didn't |

---

---

## TEMPLATE 4 — SOCIAL MEDIA REPORT 📱

**Use case:** Social media managers reporting on organic social performance across platforms (Instagram, Facebook, LinkedIn, TikTok, X/Twitter). Covers audience growth, engagement, content performance, and website traffic from social.

**Tab Structure:** Overview | Platform Metrics | Content Performance | Audience & Growth | Notes

---

### TAB 1 — Overview (All Platforms Combined)

These KPI hero cards show the blended performance across all social platforms.

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Total Followers (All Platforms) | number | — | ✅ Yes | ✅ Required | Combined follower/subscriber count across all channels |
| Total Reach | number | — | ✅ Yes | ✅ Required | Total unique people reached across all platforms |
| Total Impressions | number | — | ✅ Yes | ❌ Optional | Total times content was displayed (includes repeats) |
| Total Engagements | number | — | ✅ Yes | ❌ Optional | Likes + Comments + Shares + Saves combined |
| Overall Engagement Rate | number | % | ✅ Yes | ❌ Optional | (Total Engagements ÷ Total Reach) × 100 |
| Posts Published | number | — | ✅ Yes | ❌ Optional | Total pieces of content published this period |
| Website Clicks from Social | number | — | ✅ Yes | ❌ Optional | Visits to the website originating from social media |
| New Followers Gained | number | — | ✅ Yes | ❌ Optional | Net new followers across all platforms |

---

### TAB 2 — Platform Metrics

This tab has a **sub-section per platform**. The user toggles on only the platforms they manage for this client. Available platforms:

**Instagram:**
| Field Label | Input Type | Unit | Previous Period Field? |
|---|---|---|---|
| Followers | number | — | ✅ Yes |
| New Followers | number | — | ✅ Yes |
| Reach | number | — | ✅ Yes |
| Impressions | number | — | ✅ Yes |
| Profile Visits | number | — | ✅ Yes |
| Posts Published | number | — | ✅ Yes |
| Stories Published | number | — | ✅ Yes |
| Reels Published | number | — | ✅ Yes |
| Likes | number | — | ✅ Yes |
| Comments | number | — | ✅ Yes |
| Shares | number | — | ✅ Yes |
| Saves | number | — | ✅ Yes |
| Engagement Rate | number | % | ✅ Yes |
| Website Link Clicks | number | — | ✅ Yes |

**Facebook:**
| Field Label | Input Type | Unit | Previous Period Field? |
|---|---|---|---|
| Page Likes / Followers | number | — | ✅ Yes |
| New Followers | number | — | ✅ Yes |
| Post Reach | number | — | ✅ Yes |
| Post Impressions | number | — | ✅ Yes |
| Reactions | number | — | ✅ Yes |
| Comments | number | — | ✅ Yes |
| Shares | number | — | ✅ Yes |
| Link Clicks | number | — | ✅ Yes |
| Page Views | number | — | ✅ Yes |
| Engagement Rate | number | % | ✅ Yes |
| Posts Published | number | — | ✅ Yes |

**LinkedIn:**
| Field Label | Input Type | Unit | Previous Period Field? |
|---|---|---|---|
| Followers | number | — | ✅ Yes |
| New Followers | number | — | ✅ Yes |
| Post Impressions | number | — | ✅ Yes |
| Unique Visitors | number | — | ✅ Yes |
| Reactions | number | — | ✅ Yes |
| Comments | number | — | ✅ Yes |
| Reposts | number | — | ✅ Yes |
| Engagement Rate | number | % | ✅ Yes |
| Click-Through Rate | number | % | ✅ Yes |
| Posts Published | number | — | ✅ Yes |

**TikTok:**
| Field Label | Input Type | Unit | Previous Period Field? |
|---|---|---|---|
| Followers | number | — | ✅ Yes |
| New Followers | number | — | ✅ Yes |
| Video Views | number | — | ✅ Yes |
| Profile Views | number | — | ✅ Yes |
| Likes | number | — | ✅ Yes |
| Comments | number | — | ✅ Yes |
| Shares | number | — | ✅ Yes |
| Average Watch Time | text | seconds | ✅ Yes |
| Videos Published | number | — | ✅ Yes |
| Engagement Rate | number | % | ✅ Yes |

**X / Twitter:**
| Field Label | Input Type | Unit | Previous Period Field? |
|---|---|---|---|
| Followers | number | — | ✅ Yes |
| New Followers | number | — | ✅ Yes |
| Impressions | number | — | ✅ Yes |
| Engagements | number | — | ✅ Yes |
| Engagement Rate | number | % | ✅ Yes |
| Link Clicks | number | — | ✅ Yes |
| Retweets / Reposts | number | — | ✅ Yes |
| Tweets Published | number | — | ✅ Yes |

**YouTube:** *(optional platform)*
| Field Label | Input Type | Unit | Previous Period Field? |
|---|---|---|---|
| Subscribers | number | — | ✅ Yes |
| New Subscribers | number | — | ✅ Yes |
| Views | number | — | ✅ Yes |
| Watch Time | number | hours | ✅ Yes |
| Avg. View Duration | text | mm:ss | ❌ No |
| Impressions | number | — | ✅ Yes |
| Click-Through Rate | number | % | ✅ Yes |
| Videos Published | number | — | ✅ Yes |

**UI Behavior for Platform Section:**
- Show a row of platform toggle chips at the top: `[Instagram ✓] [Facebook] [LinkedIn] [TikTok] [X/Twitter] [YouTube]`
- Only the toggled-on platforms expand their fields
- Default: Instagram toggled on only
- Platforms not toggled are completely hidden (no empty fields shown)

---

### TAB 3 — Content Performance

**UI:** A dynamic table where the user can add their top-performing posts, up to 10 rows.

| Column | Input Type | Notes |
|---|---|---|
| Post Description | text | Short description of the post or its topic |
| Platform | select | Instagram / Facebook / LinkedIn / TikTok / X / YouTube |
| Content Type | select | Image / Video / Reel / Story / Carousel / Text / Blog Link |
| Reach | number | How many people saw this post |
| Engagements | number | Total likes + comments + shares + saves |
| Engagement Rate | number (%) | Auto-calculate from Engagements ÷ Reach if both filled |
| Link Clicks | number | Clicks to website from this post (if applicable) |

**Plus these summary fields above the table:**

| Field Label | Input Type | Unit | Required? | Helper Text |
|---|---|---|---|---|
| Best Performing Content Type | select | Image / Video / Reel / Story / Carousel / Text | ❌ Optional | What format drove the most engagement this period? |
| Total Video Views | number | — | ❌ Optional | Combined views on all video content published |
| Video Completion Rate | number | % | ❌ Optional | Average % of video watched by viewers |
| Best Day to Post (discovered) | text | — | ❌ Optional | e.g. "Tuesdays at 7pm" |

---

### TAB 4 — Audience & Growth

| Field Label | Input Type | Unit | Previous Period Field? | Required? | Helper Text |
|---|---|---|---|---|---|
| Total Audience Size | number | — | ✅ Yes | ✅ Required | Combined followers/subscribers across all platforms |
| Net Follower Growth | number | — | ✅ Yes | ❌ Optional | Gained minus lost followers — can be negative |
| Follower Growth Rate | number | % | ✅ Yes | ❌ Optional | (New Followers ÷ Followers at Start of Period) × 100 |
| Top Audience Age Group | text | — | ❌ No | ❌ Optional | e.g. "25–34 years old" |
| Top Audience Gender | text | — | ❌ No | ❌ Optional | e.g. "64% Female" |
| Top Audience Country | text | — | ❌ No | ❌ Optional | e.g. "United States (48%)" |
| Top Audience City | text | — | ❌ No | ❌ Optional | e.g. "New York" |
| Website Traffic from Social | number | sessions | ✅ Yes | ❌ Optional | Sessions arriving from social media (from GA4) |
| Social-Attributed Conversions | number | — | ✅ Yes | ❌ Optional | Leads or purchases originating from social media |

---

### TAB 5 — Notes (Always Visible Below All Tabs)

| Field Label | Input Type | Helper Text |
|---|---|---|
| Executive Summary & Notes | textarea (large) | Summarize the social media period in 3–5 sentences. Use "✨ Generate with AI" to auto-write. |
| Top Performing Content Highlight | textarea (medium) | [OPTIONAL] Describe the best post/campaign this period and why it worked |
| Growth Observations | textarea (medium) | [OPTIONAL] Key observations about audience growth or drops |
| Content Strategy for Next Period | textarea (medium) | [OPTIONAL] What content themes or formats you'll focus on next |

---

---

## GLOBAL RULES THAT APPLY TO ALL TEMPLATES

### Previous Period Field UI
For every field that has a "Previous Period" companion, show them side by side:
```
┌──────────────────────┐  ┌──────────────────────┐
│ Organic Sessions     │  │ Previous Period       │
│ [  1,500          ]  │  │ [  1,200           ]  │
└──────────────────────┘  └──────────────────────┘
                               ↑ Auto-shows: +25.0% ▲
```
The % change badge appears below the "Previous Period" field once both fields have values. Green for positive, red for negative, gray for zero.

### Field Validation Rules
- Number fields: only accept numeric input, no letters. Commas are accepted and auto-stripped before saving.
- Currency fields ($): strip the $ sign before saving. Store as raw number.
- Percentage fields (%): strip the % sign before saving. Store as raw number.
- Negative values: allowed only for "Net Follower Growth" and similar delta fields.
- Required fields: show red border and error message if user tries to publish without them.

### Saving Behavior
- Auto-save every 30 seconds (no explicit save button needed for drafts)
- "Publish" button at the top of the builder saves + sets `isPublic: true` + generates public URL
- "Save Draft" button saves without publishing

### What the Public Report Shows
When the public report renders, it reads which template was used and renders the correct sections. For example:
- General Report: shows Traffic channel breakdown + 4 KPI cards
- SEO Report: shows Keyword Rankings table + technical health scores + backlinks
- Paid Ads Report: shows Google Ads vs Meta Ads comparison + campaign table
- Social Media Report: shows per-platform follower counts + engagement metrics + content table

Any field left blank (no value entered) is simply hidden in the public report — no empty boxes or "N/A" text shown to the client.

### Template Stored in DB
When a report is saved, store the template type in the `reports` table:
```typescript
templateType: text('template_type').default('general'), 
// values: 'general' | 'seo' | 'paidAds' | 'socialMedia'
```
This tells the public report page which layout and sections to render.

---

## IMPLEMENTATION NOTES FOR AI CODER

1. **Do NOT use one generic form for all templates.** Each template renders a completely different set of tabs and fields. Use a `templateType` prop to conditionally render the correct form.

2. **Store all metrics in a single `metricsData` JSON column** in the `reports` table (already exists). The JSON structure just needs to be extended to hold the template-specific fields. Use the templateType to know which keys to expect when rendering.

3. **The Channel Breakdown chart** (bar chart on the public report) for General and Paid Ads templates is populated from the "Channels" tab dynamic list. For SEO it shows organic vs. direct vs. referral traffic. For Social Media it shows followers by platform.

4. **Platform toggle for Social Media template:** Store which platforms are enabled as a boolean map in metricsData: `{ platforms: { instagram: true, facebook: false, linkedin: true, ... } }`

5. **Campaign Performance table (Paid Ads) and Content Performance table (Social) and Keyword Rankings table (SEO):** Store as arrays in metricsData JSON. Max 20 rows per table.

6. **Auto-calculation:** CPA = Spend ÷ Conversions. ROAS = Revenue ÷ Spend. Engagement Rate = Engagements ÷ Reach × 100. These can be auto-calculated in the UI in real-time as the user types — but also store the user's manually entered value if they override the calculation.

7. **"✨ Generate with AI" button** on the Executive Summary field sends all the currently-filled metrics data to the AI summary API. The prompt should include the template type so the AI knows whether to summarize SEO metrics, ad spend, or social performance.

---

*Specification complete. Last updated: May 2026.*
