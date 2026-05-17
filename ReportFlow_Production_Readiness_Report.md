# ReportFlow — Full Production Readiness & Feature Implementation Report
### Version 2.0 | Pre-Launch Deep Analysis
**Date:** May 2026 | **Prepared for:** ReportFlow Developer
**Purpose:** Complete implementation guide for AI-assisted development. Every feature is described with full detail — UI flow, database changes, API routes, component structure, edge cases, and plan gating. Implement everything in this document before public launch.

---

## TABLE OF CONTENTS

1. [Current State Audit — What's Built vs. What's Missing](#section-1)
2. [Critical Bugs & Issues Found](#section-2)
3. [Market Research — What Users Are Actually Demanding](#section-3)
4. [Competitor Analysis — Feature Gaps vs. Top Tools](#section-4)
5. [Missing Features — Full Implementation Specs](#section-5)
6. [PDF Export Fix — Detailed Spec](#section-6)
7. [Landing Page Issues](#section-7)
8. [Go-To-Market Readiness](#section-8)
9. [Implementation Priority Table](#section-9)

---

## SECTION 1 — Current State Audit {#section-1}

### What's Working Well ✅

| Screen | Status | Notes |
|--------|--------|-------|
| Dashboard with stats cards | ✅ Complete | Total Clients, Reports, Shared Reports, Monthly — all correct |
| Sidebar navigation | ✅ Complete | Dashboard / Clients / Reports / Settings / Upgrade |
| Current plan badge in sidebar | ✅ Complete | Shows "Current Plan: Free" |
| Getting Started onboarding flow | ✅ Complete | 3-step guide on empty dashboard |
| Reports list page | ✅ Complete | Published/Draft badges, date ranges, search bar |
| Report plan limit counter | ✅ Complete | "2/3 reports" visible — free plan enforcement working |
| Report detail page | ✅ Complete | PDF button, Copy Link, View Public, toggle, Edit, Delete |
| Report builder — metric tabs | ✅ Complete | Traffic / Conversions / Paid Ads / Audience |
| Previous period comparison inputs | ✅ Complete | "+91.7% vs prev" renders correctly |
| Channel Breakdown chart | ✅ Complete | Bar chart visible in report detail page |
| Settings page | ✅ Complete | Account, Plan & Billing, Agency Profile, White-Label sections |
| Pricing / Upgrade page | ✅ Complete | Free / Starter / Pro tiers, correct feature lists |
| CSV import | ✅ Complete | Import CSV button in Metrics Data section |
| Public share link | ✅ Working | Share link generates and renders correctly |
| PDF export | ✅ Working | PDF downloads successfully (percentage bug needs fixing) |

### What's Missing or Incomplete ❌

| Feature | Status | Priority |
|---------|--------|----------|
| Email delivery of reports to client | ❌ Not built | HIGH |
| Report templates (built-in) | ❌ Not built | HIGH |
| Duplicate report feature | ❌ Not built | HIGH |
| AI-generated executive summary | ❌ Not built | HIGH |
| Report view tracking (did client open it?) | ❌ Not built | MEDIUM |
| Scheduled report reminders | ❌ Not built | MEDIUM |
| Client comments on public report | ❌ Not built | MEDIUM |
| Annual pricing toggle on upgrade page | ❌ Missing | MEDIUM |
| Dynamic OG meta tags on public report | ❌ Missing | MEDIUM |
| Mobile responsiveness of public report | ❓ Needs verification | HIGH |
| Rate limiting on API routes | ❓ Unknown | HIGH (security) |
| Google Analytics 4 integration | ❌ Not built | Phase 2 |
| Meta Ads integration | ❌ Not built | Phase 2 |
| Client portal (client login) | ❌ Not built | Phase 2 |
| Custom domain for share links | ❌ Not built | Phase 2 |

---

## SECTION 2 — Critical Bugs & Issues Found {#section-2}

### BUG 1 — PDF Channel Breakdown Shows "0%" for All Channels (HIGH)
**Source:** Q2 2026 Performance Report PDF (reviewed)
**Issue:** The Channel Breakdown table shows:
- Organic: 4,563 sessions — **0%**
- Paid: 7,896 sessions — **0%**

The percentage column is always zero. The formula `(channel_sessions / total_sessions * 100)` is either dividing by zero or running inside `@react-pdf/renderer` where dynamic JS calculations don't execute correctly.

**Fix (detailed):**
In `app/api/reports/[id]/pdf/route.ts`, before calling `generateReportPDF()`, add this data transformation:
```typescript
const totalSessions = (report.metricsData.summary?.organicTraffic || 0) +
                      (report.metricsData.summary?.paidTraffic || 0);

const channelBreakdown = [
  {
    channel: 'Organic',
    sessions: report.metricsData.summary?.organicTraffic || 0,
    percentage: totalSessions > 0
      ? Math.round(((report.metricsData.summary?.organicTraffic || 0) / totalSessions) * 100)
      : 0
  },
  {
    channel: 'Paid',
    sessions: report.metricsData.summary?.paidTraffic || 0,
    percentage: totalSessions > 0
      ? Math.round(((report.metricsData.summary?.paidTraffic || 0) / totalSessions) * 100)
      : 0
  }
];
// Pass channelBreakdown to the PDF component as a prop
```
Inside the PDF component (`lib/pdf-generator.ts`), render the percentage as a pre-computed string: `{channel.percentage}%` — never compute inside the component.

### BUG 2 — PDF Footer Has No Styling (LOW)
**Source:** Same PDF
**Issue:** Footer reads `Generated with ReportFlow reportflow-two.vercel.app` with no visual separation — looks like debug text.
**Fix:** In the PDF document component, add a styled footer using `@react-pdf/renderer`:
```typescript
<View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 20, paddingTop: 8 }}>
  <Text style={{ fontSize: 8, color: '#9CA3AF', textAlign: 'right' }}>
    Generated with ReportFlow · reportflow.io
  </Text>
</View>
```

### BUG 3 — "Executive Summary & Notes" Placed Inside Traffic Tab (MEDIUM)
**Source:** Metrics Data form screenshots
**Issue:** The Executive Summary textarea appears at the bottom of the Traffic tab. Users who switch to Conversions or Paid Ads tabs don't see it at all. It looks like it's only for traffic notes.
**Fix:** In `components/reports/ReportBuilder.tsx`, move the Executive Summary `<textarea>` and its label completely outside the tab panel. It should be a separate `<section>` rendered below the tab component, always visible, with its own card/box styling, clear label "Executive Summary & Notes", and helper text "This paragraph appears at the top of your client's report."

### BUG 4 — Dodo Payments Webhook Needs Verification (CRITICAL — payments)
**Note:** The project has migrated from Lemon Squeezy to Dodo Payments. Verify the following before launch:
- Dodo Payments webhook endpoint at `app/api/webhooks/dodopayments/route.ts` is created
- Webhook signature verification is implemented (use Dodo's HMAC secret)
- Events handled: `subscription.created`, `subscription.updated`, `subscription.cancelled`, `payment.failed`, `subscription.resumed`
- User's `plan` field in DB is correctly updated on each event
- After upgrade, the user is redirected back to dashboard with a success message
- Test the full flow: click Upgrade → complete payment → confirm plan updates in DB → confirm UI reflects new plan

### BUG 5 — Copyright Year in Landing Page Footer is 2025 (LOW)
**Fix:** In `app/page.tsx` footer, replace hardcoded `© 2025` with:
```tsx
© {new Date().getFullYear()} ReportFlow
```

### BUG 6 — Dynamic OG Meta Tags Missing on Public Report Page (MEDIUM)
**Issue:** When a freelancer pastes the report link in Slack, WhatsApp, or email, the preview card shows the generic ReportFlow site description instead of the report title and client name. This looks unprofessional.
**Fix:** In `app/r/[shareToken]/page.tsx`, add:
```typescript
export async function generateMetadata({ params }: { params: { shareToken: string } }) {
  const report = await getReportByShareToken(params.shareToken);
  if (!report || !report.isPublic) return { title: 'Report Not Found' };

  const dateRange = `${format(report.dateRangeStart, 'MMM d')} – ${format(report.dateRangeEnd, 'MMM d, yyyy')}`;

  return {
    title: `${report.title} | ${report.client.name}`,
    description: `${dateRange} · ${report.metricsData.summary?.sessions?.toLocaleString() ?? '–'} sessions`,
    openGraph: {
      title: report.title,
      description: `Client performance report for ${report.client.name} · ${dateRange}`,
      siteName: 'ReportFlow',
    },
  };
}
```

---

## SECTION 3 — Market Research: What Users Are Actually Demanding {#section-3}

Based on analysis of G2 reviews, Reddit discussions, competitor feature pages, and agency industry reports from 2025–2026:

### Pain Point #1 — "I need to SEND the report, not just share a link"
**Demand level: VERY HIGH**
The workflow after generating a report should end with the client receiving something — not the freelancer copying a URL and pasting it into Gmail manually. Every competitor (AgencyAnalytics, DashThis, Whatagraph) offers one-click email delivery. Without it, ReportFlow's "2 minutes" promise feels incomplete because the last step is still manual.

### Pain Point #2 — "I rebuild the same report every month from scratch"
**Demand level: HIGH**
Monthly and quarterly reports for the same client use identical structure — only the numbers change. There is no "Duplicate for next month" button. Every returning user has to create a new report from zero, re-enter the client, set new dates, and re-label custom KPIs. This is the single biggest friction point for user retention.

### Pain Point #3 — "Writing the summary paragraph takes 20 minutes"
**Demand level: HIGH**
The Executive Summary field requires the freelancer to write a professional paragraph from scratch. In practice, most users write a slightly different version of the same paragraph every month: "Traffic increased by X%... Paid ads performed well with a ROAS of Y... We recommend Z for next month." This is exactly what AI is good at — and competitors like AgencyAnalytics and Whatagraph are already marketing their "AI Summary" features heavily.

### Pain Point #4 — "I can't tell if my client even opened the report"
**Demand level: MEDIUM**
Freelancers send the link, then hear nothing. Did the client see it? Do they need a follow-up? Simple view tracking (number of views + last viewed timestamp) would answer this instantly and reduce the awkward "did you get my report?" emails.

### Pain Point #5 — "Setting up reports takes too long"
**Demand level: HIGH**
Agencies deal with different report types for different clients — SEO reports, Paid Ads reports, Social Media reports. Each has different fields, different custom KPIs, and different layouts. Built-in templates for these common report types would cut setup time from ~5 minutes to ~30 seconds.

### Pain Point #6 — "The tool is expensive as I scale"
**Demand level: VERY HIGH**
This is ReportFlow's biggest strategic advantage. AgencyAnalytics charges $79/month for 5 clients and scales to $649/month at 30 clients. ReportFlow's flat $29/month Pro plan for unlimited clients is a direct counter. This should be made explicit in marketing: "No per-client fees. Ever."

### Pain Point #7 — "Clients don't respond to link-only emails"
**Demand level: HIGH**
Research shows branded emails that show key metrics directly in the email body (3 KPI numbers visible without clicking) get significantly higher engagement than bare "here's your report link" emails. Clients glance at emails on mobile — the metric snapshot in the email itself is what gets their attention.

### Pain Point #8 — "I want to know if there's an issue before my client sees it"
**Demand level: MEDIUM**
Freelancers want to review and approve a report before the client gets it. The current flow already has Draft → Publish, which handles this, but there's no built-in "send for client review" concept that makes this obvious.

---

## SECTION 4 — Competitor Analysis {#section-4}

### Feature Comparison Matrix

| Feature | ReportFlow | AgencyAnalytics | DashThis | Whatagraph | Looker Studio |
|---------|-----------|-----------------|----------|------------|---------------|
| Entry Price | **$9/mo** | $59/mo | $42/mo | $229/mo | Free |
| Manual data entry | ✅ | ❌ | ❌ | ❌ | ❌ |
| CSV import | ✅ | ❌ | ✅ | ✅ | ✅ |
| Shareable link | ✅ | ✅ | ✅ | ✅ | ✅ |
| PDF export | ✅ | ✅ | ✅ | ✅ | ✅ |
| White-label | ✅ (Pro) | ✅ | ✅ | ✅ (Boost) | ❌ |
| Email delivery to client | ❌ | ✅ | ✅ | ✅ | ❌ |
| Scheduled reports | ❌ | ✅ | ✅ | ✅ | ❌ |
| Report templates | ❌ | ✅ | ✅ | ✅ | ✅ |
| AI-generated summary | ❌ | ✅ | ❌ | ✅ | ❌ |
| Duplicate report | ❌ | ✅ | ✅ | ✅ | ✅ |
| Report view tracking | ❌ | ❌ | ❌ | ❌ | Partial |
| Client comments | ❌ | ❌ | ❌ | ❌ | ❌ |
| Custom domain | ❌ | ❌ | ✅ (add-on) | ❌ | ❌ |
| GA4 integration | ❌ | ✅ | ✅ | ✅ | ✅ |
| Meta Ads integration | ❌ | ✅ | ✅ | ✅ | Partial |
| Per-client pricing | **No** | Yes ($12–24/client) | No | No | No |
| Flat pricing | **Yes** | No | Yes | Yes | Free |

### Key Competitive Insights

**ReportFlow's existing advantages:**
- Price — dramatically cheaper than every paid competitor
- Simplicity — manual entry is faster than API setup for small freelancers
- Flat pricing — no per-client tax as users grow
- No complex onboarding (no API key setup, no OAuth connections required at MVP)

**Current gaps vs competitors (all solvable):**
- No email delivery — this is the single most glaring missing feature
- No templates — second most impactful for new user activation
- No AI summary — being added by all major competitors right now
- No duplicate — creates friction for returning monthly users

**Counter-positioning opportunity:**
ReportFlow's flat $9/month and $29/month pricing is the clearest differentiator. At 10 clients, AgencyAnalytics costs $239/month (Agency plan). ReportFlow costs $29. That's a $210/month saving. This should be the centerpiece of the pricing page messaging.

---

## SECTION 5 — Missing Features: Full Implementation Specs {#section-5}

Each feature below is described with complete detail: what the user sees, what happens in the database, what API routes to build, which files to change, edge cases, and plan gating. An AI coding assistant should be able to implement each feature from these specs alone.

---

### FEATURE 1 — Duplicate Report ("Copy for Next Month")

#### Why This Feature Matters
Monthly reporting is 90% of the use case. Every freelancer sends the same structured report to the same client every month — only the numbers change. Currently there is no way to clone a report. The user must click "New Report", re-select the client, re-enter the date range, re-enter all custom KPI labels, and start from scratch. This creates friction that causes users to abandon after the first month.

#### User-Facing Flow
1. User is on the Reports list page (`/reports`). Each report card has a small "⋯" (three dots) menu icon in the top-right corner.
2. Clicking "⋯" opens a dropdown with: **Edit**, **Duplicate**, **Delete**.
3. User clicks **Duplicate**.
4. A loading spinner appears on the button for 1–2 seconds while the API runs.
5. User is automatically redirected to the new report's edit page (`/reports/[newId]/edit`).
6. The new report is pre-filled with:
   - Same client
   - Title incremented by one period: "Q2 2026 Performance Report" → "Q3 2026 Performance Report" (see title logic below)
   - Date range advanced by exactly one month: start + 1 month, end + 1 month
   - All metric field **labels** preserved (custom KPI names, channel names)
   - All metric **values cleared to zero / empty** (user enters new data)
   - Status: `draft`
   - New unique `shareToken` generated
   - `isPublic: false`
7. A toast notification appears: "Report duplicated! Enter the new period's data."

#### Title Auto-Increment Logic
Parse the title for common patterns and increment:
- "Q1 2026 ..." → "Q2 2026 ..."
- "Q4 2026 ..." → "Q1 2027 ..."
- "January 2026 ..." → "February 2026 ..."
- "December 2026 ..." → "January 2027 ..."
- "Week 12 ..." → "Week 13 ..."
- If no pattern matches: append " (Copy)" to the end

```typescript
function incrementReportTitle(title: string): string {
  // Quarter pattern
  const quarterMatch = title.match(/^Q([1-4])\s+(\d{4})/);
  if (quarterMatch) {
    let q = parseInt(quarterMatch[1]);
    let y = parseInt(quarterMatch[2]);
    if (q === 4) { q = 1; y++; } else { q++; }
    return title.replace(/^Q[1-4]\s+\d{4}/, `Q${q} ${y}`);
  }
  // Month pattern
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  for (let i = 0; i < months.length; i++) {
    if (title.startsWith(months[i])) {
      const yearMatch = title.match(/\d{4}/);
      if (yearMatch) {
        let y = parseInt(yearMatch[0]);
        let m = i;
        if (m === 11) { m = 0; y++; } else { m++; }
        return title.replace(`${months[i]} ${yearMatch[0]}`, `${months[m]} ${y}`);
      }
    }
  }
  // Fallback
  return title + ' (Copy)';
}
```

#### Database Changes
No schema changes needed. The duplicate operation creates a new row in the `reports` table with a new `id` (nanoid) and a new `shareToken` (nanoid).

#### API Route
**File:** `app/api/reports/[id]/duplicate/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { addMonths } from 'date-fns';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // Fetch the original report (ownership check included)
  const [original] = await db
    .select()
    .from(reports)
    .where(and(eq(reports.id, params.id), eq(reports.userId, userId)));

  if (!original) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });

  // Clear all metric values but keep structure/labels
  const clearedMetrics = clearMetricValues(original.metricsData);

  // Create the duplicate
  const newId = nanoid();
  const [newReport] = await db.insert(reports).values({
    id: newId,
    clientId: original.clientId,
    userId: original.userId,
    title: incrementReportTitle(original.title),
    dateRangeStart: addMonths(original.dateRangeStart, 1),
    dateRangeEnd: addMonths(original.dateRangeEnd, 1),
    metricsData: clearedMetrics,
    shareToken: nanoid(10),
    isPublic: false,
    status: 'draft',
  }).returning();

  return Response.json({ report: newReport }, { status: 201 });
}

// Zeros out all numeric values in metricsData but preserves structure
function clearMetricValues(metricsData: any) {
  return {
    ...metricsData,
    summary: Object.fromEntries(
      Object.entries(metricsData.summary || {}).map(([k, v]) =>
        typeof v === 'number' ? [k, 0] : [k, v]
      )
    ),
    channelBreakdown: (metricsData.channelBreakdown || []).map((ch: any) => ({
      ...ch, sessions: 0, percentage: 0
    })),
    weeklyTrend: (metricsData.weeklyTrend || []).map((w: any) => ({
      ...w, sessions: 0, conversions: 0
    })),
    customMetrics: (metricsData.customMetrics || []).map((m: any) => ({
      ...m, value: '', change: '', changeType: 'neutral'
    })),
    notes: '',
  };
}
```

#### Frontend Changes
**File:** `components/reports/ReportCard.tsx`

Add a three-dot dropdown menu to each report card. Use shadcn/ui `DropdownMenu`:
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy, Pencil, Trash } from 'lucide-react';

// Inside the card component:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => router.push(`/reports/${report.id}/edit`)}>
      <Pencil className="mr-2 h-4 w-4" /> Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
      <Copy className="mr-2 h-4 w-4" />
      {isDuplicating ? 'Duplicating...' : 'Duplicate'}
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
      <Trash className="mr-2 h-4 w-4" /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

The `handleDuplicate` function calls `POST /api/reports/[id]/duplicate` and on success redirects to the new report's edit page.

#### Plan Gating
Duplication counts toward the plan's `maxReports` limit. Before creating the duplicate, check the user's total report count. If at limit (e.g., 3 for free plan), return `403` with `{ error: 'PLAN_LIMIT_REACHED' }` and show the upgrade modal instead of redirecting.

---

### FEATURE 2 — Send Report to Client via Email

#### Why This Feature Matters
The full workflow of generating a client report is: enter data → preview → publish → **send to client**. Currently step 4 doesn't exist in the app. The freelancer must manually copy the link, open their email client, compose an email, paste the link, and send it. This is extra friction that undermines the "2 minutes" promise. Every competitor offers one-click email delivery. This is the highest-impact feature to add post-launch.

#### User-Facing Flow
1. User is on the report detail page (`/reports/[id]`). The report must be in `published` state (`isPublic: true`).
2. A **"Send to Client"** button appears in the top action bar, next to PDF, Copy Link, View Public.
3. Clicking it opens a modal dialog with the following fields:
   - **To:** pre-filled with `client.email` (editable text input). If client has no email, the field is blank with placeholder "Enter client email address".
   - **Subject:** pre-filled with `"Your [Report Title] is ready"` (editable).
   - **Message:** pre-filled with a template (editable textarea):
     ```
     Hi [Client Name],

     Your [Report Title] for [Date Range] is ready.

     Quick highlights from this period:
     • Sessions: [total_sessions]
     • Conversions: [conversions]
     • [Revenue or ROAS if exists]

     View your full report here: [link]

     [Agency Name / Freelancer Name]
     ```
   - All variables in brackets above are auto-filled from the report and settings data before the modal opens.
4. **"Send Report"** button at the bottom of modal.
5. On send: button shows loading state "Sending...".
6. On success: modal closes, toast notification: "Report sent to [email]!", and a "Last sent" timestamp is saved to the report in DB.
7. On error: show error message inside the modal, keep it open.

#### Behavior Rules
- The "Send to Client" button is **disabled and shows a tooltip** if the report is in `draft` status: "Publish the report first before sending."
- If the user is on the **Free plan**: clicking the button opens an upgrade prompt modal instead of the send modal. Message: "Email delivery is available on Starter and Pro plans. Upgrade to send reports directly to your clients."
- If `client.email` is empty: the To field is empty but the modal still opens (user can type the email manually).
- Sending the email does NOT automatically publish the report. If somehow the report is still draft, block the send.

#### Email Design (HTML email sent via Resend)
The email must look professional and branded. Use Resend's `@react-email/components` library to build the email template.

**Email structure:**
```
┌────────────────────────────────────────┐
│  [Agency Logo OR ReportFlow logo]      │
│  [Agency Name]                         │
├────────────────────────────────────────┤
│  [Report Title]                        │
│  [Client Name] · [Date Range]          │
├────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Sessions │ │Conversions│ │Revenue │ │
│  │  2,300   │ │    45    │ │  $500  │ │
│  │ +91.7%   │ │ +18.4%   │ │        │ │
│  └──────────┘ └──────────┘ └────────┘ │
├────────────────────────────────────────┤
│  [User's custom message]               │
├────────────────────────────────────────┤
│  [View Full Report →] (big CTA button) │
│  accent color = client.brandColor      │
├────────────────────────────────────────┤
│  Generated with ReportFlow (if Free/   │
│  Starter plan)                         │
│  OR hidden (if Pro + white-label)      │
└────────────────────────────────────────┘
```

The CTA button background color uses `client.brandColor` (default `#2563EB`).
On Pro plan with agency logo uploaded: use agency logo instead of ReportFlow logo.
On Pro plan: no "Generated with ReportFlow" footer.

#### Database Changes
Add two fields to the `reports` table in `lib/db/schema.ts`:
```typescript
lastSentAt: timestamp('last_sent_at'),
lastSentTo: text('last_sent_to'), // email address it was sent to
```

After sending, update these fields in the DB.

On the report detail page, show below the action bar: `Last sent: [relative time] to [email]` (e.g., "Last sent: 2 days ago to client@company.com"). If never sent: show nothing.

#### API Route
**File:** `app/api/reports/[id]/send/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { reports, clients, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';
import { ReportEmailTemplate } from '@/components/emails/ReportEmail';
import { canPerformAction } from '@/lib/plans';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // Check plan
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!canPerformAction(user.plan, 'emailDelivery')) {
    return Response.json({ error: 'PLAN_LIMIT_REACHED', upgradeUrl: '/upgrade' }, { status: 403 });
  }

  const body = await req.json();
  const { to, subject, message } = body;
  if (!to || !subject) {
    return Response.json({ error: 'VALIDATION_ERROR', details: 'to and subject are required' }, { status: 400 });
  }

  // Fetch report with client data
  const [report] = await db
    .select({ report: reports, client: clients })
    .from(reports)
    .leftJoin(clients, eq(reports.clientId, clients.id))
    .where(and(eq(reports.id, params.id), eq(reports.userId, userId)));

  if (!report) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (!report.report.isPublic) return Response.json({ error: 'REPORT_NOT_PUBLISHED' }, { status: 400 });

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${report.report.shareToken}`;

  // Send email via Resend
  const fromName = user.plan === 'pro' && user.agencyName ? user.agencyName : 'ReportFlow';
  const fromEmail = 'reports@reportflow.io'; // Must be a verified domain in Resend

  await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: [to],
    subject,
    react: ReportEmailTemplate({
      reportTitle: report.report.title,
      clientName: report.client?.name ?? '',
      dateRange: { start: report.report.dateRangeStart, end: report.report.dateRangeEnd },
      metrics: report.report.metricsData.summary,
      message,
      shareUrl,
      brandColor: report.client?.brandColor ?? '#2563EB',
      agencyLogoUrl: user.plan === 'pro' ? user.agencyLogoUrl : null,
      showBranding: user.plan !== 'pro',
    }),
  });

  // Update lastSentAt and lastSentTo in DB
  await db
    .update(reports)
    .set({ lastSentAt: new Date(), lastSentTo: to, updatedAt: new Date() })
    .where(eq(reports.id, params.id));

  return Response.json({ success: true });
}
```

#### Email Template Component
**File:** `components/emails/ReportEmail.tsx`
Use `@react-email/components`. Install: `npm install @react-email/components`.

Build the template using `<Html>`, `<Body>`, `<Section>`, `<Row>`, `<Column>`, `<Text>`, `<Button>`, `<Img>` from that library. All styles must be inline objects (no Tailwind inside email templates — email clients don't support it).

#### Plan Gating
Add `emailDelivery: boolean` to `PLAN_LIMITS` in `lib/plans.ts`:
```typescript
free: { emailDelivery: false, ... }
starter: { emailDelivery: true, ... }
pro: { emailDelivery: true, ... }
```

---

### FEATURE 3 — Report Templates (Built-In)

#### Why This Feature Matters
Different freelancers produce different report types: SEO consultants report on organic traffic and rankings, Paid Ads managers report on ROAS and ad spend, social media managers report on followers and engagement. Currently ReportFlow uses the same blank structure for all. Templates let a user pick their report type and have the correct fields pre-labeled and ready to fill — dramatically cutting setup time from ~5 minutes to ~30 seconds.

#### User-Facing Flow
1. User clicks "New Report" from the dashboard or reports page.
2. Instead of going directly to the builder, they land on a **Template Selection screen** (a new Step 0):
   - Page title: "Choose a Report Template"
   - Subtitle: "Pick a template that matches your service. You can customize everything after."
   - Four template cards in a 2×2 grid:
     ```
     ┌─────────────────┐  ┌─────────────────┐
     │ 📈 General      │  │ 🔍 SEO Report   │
     │ Marketing       │  │                 │
     │ Blank template  │  │ Organic traffic,│
     │ for any type    │  │ rankings, links │
     └─────────────────┘  └─────────────────┘
     ┌─────────────────┐  ┌─────────────────┐
     │ 💰 Paid Ads     │  │ 📱 Social Media │
     │ Report          │  │ Report          │
     │ Ad spend, ROAS, │  │ Followers,      │
     │ CTR, clicks     │  │ reach, posts    │
     └─────────────────┘  └─────────────────┘
     ```
3. User clicks a template card (it highlights with a blue border).
4. User clicks "Continue →" button.
5. They arrive at the normal report builder, but the metrics fields and custom KPIs are pre-configured for that template.

#### Template Definitions
Store templates as a static constant in `lib/templates.ts` (not in the DB):

```typescript
export const REPORT_TEMPLATES = {
  general: {
    id: 'general',
    name: 'General Marketing Report',
    description: 'A blank template. Customize everything yourself.',
    icon: '📈',
    metricsConfig: {
      trafficFields: ['organicTraffic', 'paidTraffic'],
      conversionFields: ['conversions', 'revenue'],
      paidAdsFields: ['adSpend', 'roas'],
      audienceFields: [],
      customMetrics: [],
      channelBreakdown: [
        { channel: 'Organic Search', sessions: 0 },
        { channel: 'Paid Search', sessions: 0 },
      ],
    },
  },
  seo: {
    id: 'seo',
    name: 'SEO Report',
    description: 'Organic traffic, keyword rankings, backlinks, and search visibility.',
    icon: '🔍',
    metricsConfig: {
      trafficFields: ['organicTraffic', 'previousPeriodOrganic'],
      conversionFields: ['conversions', 'bounceRate'],
      paidAdsFields: [], // Hide paid ads tab for SEO reports
      audienceFields: [],
      customMetrics: [
        { label: 'Keyword Rankings (Top 10)', value: '', change: '', changeType: 'neutral' },
        { label: 'Domain Authority', value: '', change: '', changeType: 'neutral' },
        { label: 'Backlinks Earned', value: '', change: '', changeType: 'neutral' },
        { label: 'Pages Indexed', value: '', change: '', changeType: 'neutral' },
      ],
      channelBreakdown: [
        { channel: 'Organic Search', sessions: 0 },
        { channel: 'Direct', sessions: 0 },
        { channel: 'Referral', sessions: 0 },
      ],
    },
  },
  paidAds: {
    id: 'paidAds',
    name: 'Paid Ads Report',
    description: 'Ad spend, ROAS, CTR, impressions, and campaign performance.',
    icon: '💰',
    metricsConfig: {
      trafficFields: ['paidTraffic', 'organicTraffic'],
      conversionFields: ['conversions', 'revenue'],
      paidAdsFields: ['adSpend', 'roas', 'impressions', 'clicks', 'ctr'],
      audienceFields: [],
      customMetrics: [
        { label: 'Cost Per Lead (CPL)', value: '', change: '', changeType: 'neutral' },
        { label: 'Cost Per Click (CPC)', value: '', change: '', changeType: 'neutral' },
        { label: 'Conversion Rate', value: '', change: '', changeType: 'neutral' },
        { label: 'Quality Score Avg', value: '', change: '', changeType: 'neutral' },
      ],
      channelBreakdown: [
        { channel: 'Google Ads', sessions: 0 },
        { channel: 'Meta Ads', sessions: 0 },
        { channel: 'Other Paid', sessions: 0 },
      ],
    },
  },
  socialMedia: {
    id: 'socialMedia',
    name: 'Social Media Report',
    description: 'Followers, reach, engagement, and content performance.',
    icon: '📱',
    metricsConfig: {
      trafficFields: ['organicTraffic'],
      conversionFields: ['conversions'],
      paidAdsFields: ['adSpend'],
      audienceFields: [],
      customMetrics: [
        { label: 'Total Followers', value: '', change: '', changeType: 'neutral' },
        { label: 'Follower Growth', value: '', change: '', changeType: 'positive' },
        { label: 'Average Reach per Post', value: '', change: '', changeType: 'neutral' },
        { label: 'Engagement Rate (%)', value: '', change: '', changeType: 'neutral' },
        { label: 'Posts Published', value: '', change: '', changeType: 'neutral' },
        { label: 'Profile Visits', value: '', change: '', changeType: 'neutral' },
      ],
      channelBreakdown: [
        { channel: 'Instagram', sessions: 0 },
        { channel: 'Facebook', sessions: 0 },
        { channel: 'LinkedIn', sessions: 0 },
        { channel: 'TikTok', sessions: 0 },
      ],
    },
  },
};
```

#### Implementation Details
- The template selection page is a new route: `app/(dashboard)/reports/new/page.tsx`
- The current report builder (if at `app/(dashboard)/reports/new/builder/page.tsx` or similar) now receives a `?template=seo` query param
- When the builder loads, it reads the `template` param and calls `applyTemplate(templateId)` to pre-fill the form state
- The template choice is stored in local state only (no DB column needed — the template just pre-fills values, and those values are saved normally when the user saves)
- There is a "Start from scratch" link on the template selection page that bypasses template selection and goes directly to the builder with the `general` template applied

#### Plan Gating
All 4 built-in templates are available on ALL plans including Free. Templates are a discovery/retention feature, not a monetization gate.

#### No Database Changes Required
Templates are purely frontend configuration. Nothing is stored in the DB about which template was used.

---

### FEATURE 4 — Report View Tracking

#### Why This Feature Matters
After a freelancer sends a report, they have no visibility into whether the client opened it. This leads to awkward follow-up emails ("Did you see the report I sent?"). Simple view tracking answers this instantly and gives the freelancer confidence about when to follow up.

#### User-Facing Flow
1. On the report detail page (within the dashboard), below the action bar, show a small info strip:
   - If never viewed: `👁 Not yet viewed`
   - If viewed once: `👁 Viewed 1 time · Last viewed [relative time, e.g. "2 hours ago"]`
   - If viewed multiple times: `👁 Viewed 5 times · Last viewed [relative time]`
2. This strip updates in real-time — if the freelancer has the page open, they can see it change after sharing the link (use polling every 30 seconds or SWR with refresh interval).
3. Hover tooltip on the eye icon: "This counts unique page loads of your public report link."

#### How View Tracking Works
Every time the public report page (`/r/[shareToken]`) is loaded by anyone (client or anyone with the link), a background API call fires to increment the view counter. This is a "fire and forget" — it does not block the report from loading.

**Important:** The view count should NOT increment when the freelancer themselves loads the report (to avoid self-views inflating the count). Since the public page has no auth, use a simple heuristic: if the user is logged in (check Clerk session server-side on the public route), do NOT increment the counter.

#### Database Changes
Add to the `reports` table in `lib/db/schema.ts`:
```typescript
viewCount: integer('view_count').default(0).notNull(),
lastViewedAt: timestamp('last_viewed_at'),
```

Run a migration after adding these columns.

#### API Route — Record a View
**File:** `app/api/reports/view/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: Request) {
  // If the viewer is logged in, don't count the view (prevents self-view)
  const { userId } = auth();
  if (userId) return Response.json({ skipped: true });

  const { shareToken } = await req.json();
  if (!shareToken) return Response.json({ error: 'Missing shareToken' }, { status: 400 });

  // Increment view count atomically
  await db
    .update(reports)
    .set({
      viewCount: sql`${reports.viewCount} + 1`,
      lastViewedAt: new Date(),
    })
    .where(eq(reports.shareToken, shareToken));

  return Response.json({ success: true });
}
```

#### Changes to Public Report Page
In `app/r/[shareToken]/page.tsx`, after the report is fetched and verified as public, add a client-side effect:

```typescript
// In the PublicReport client component (or a small child component):
useEffect(() => {
  fetch('/api/reports/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shareToken }),
  }).catch(() => {}); // Silently ignore errors — don't break the report page
}, [shareToken]);
```

#### Changes to Report Detail Page (Dashboard)
In `app/(dashboard)/reports/[id]/page.tsx`, fetch the report data using SWR with a 30-second refresh:
```typescript
const { data: report } = useSWR(`/api/reports/${id}`, fetcher, { refreshInterval: 30000 });
```

Display:
```tsx
<div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
  <Eye className="h-4 w-4" />
  {report.viewCount === 0
    ? 'Not yet viewed'
    : `Viewed ${report.viewCount} time${report.viewCount > 1 ? 's' : ''} · Last viewed ${formatDistanceToNow(report.lastViewedAt)} ago`
  }
</div>
```

#### Plan Gating
View tracking is available on ALL plans. It is a core trust feature, not a premium one.

---

### FEATURE 5 — AI-Generated Executive Summary

#### Why This Feature Matters
Writing the Executive Summary paragraph is the most cognitively demanding part of creating a report. It requires the freelancer to look at all the numbers, form a narrative, and write 3–5 professional sentences. For an agency with 10 clients, this is 30–50 minutes of writing per month. AI can do this instantly and correctly because the data is already in the system. This feature also creates a clear, visible reason to upgrade (it's Starter+ gated) and is a differentiator against basic tools.

#### User-Facing Flow
1. In the report builder, the Executive Summary textarea (moved to below all metric tabs per Bug 3 fix) has a button next to its label: **"✨ Generate with AI"** (small, secondary button style).
2. When the user clicks "Generate with AI":
   - The button enters a loading state: "Generating..." with a spinner.
   - The textarea shows a blinking cursor placeholder while generating.
   - After 2–4 seconds, the AI-written summary streams into the textarea character by character (streaming response).
3. The user can edit the generated text freely before saving the report.
4. If the user is on the **Free plan**: clicking the button shows an inline upgrade prompt below the textarea: "AI Summary is available on Starter ($9/mo) and Pro ($29/mo) plans. [Upgrade →]". Do NOT open a modal — show it inline to reduce friction.
5. The "Generate with AI" button is visually distinct: a small wand/sparkle icon, blue or purple text color, not filled — so it's clearly supplementary, not the main action.

#### What the AI Does
The AI receives the report's metric data as structured JSON and writes a professional 3–5 sentence marketing performance summary. It does not hallucinate — it only uses the numbers provided. The tone is positive and client-friendly (reports should make clients feel their money is being well spent).

**System Prompt (hardcoded in the API route):**
```
You are a professional digital marketing analyst writing an executive summary for a client performance report.

Rules:
- Write exactly 3-5 sentences.
- Use the specific numbers from the data provided. Do not invent or estimate any numbers.
- Tone: professional, positive, client-friendly. Focus on wins and growth.
- If a metric shows decline (negative % change), acknowledge it briefly and frame it constructively ("We are actively optimizing X to recover this").
- Do not use bullet points, headers, or markdown formatting.
- Output ONLY the summary paragraph — no preamble like "Here is your summary:".
- End the last sentence with a forward-looking statement about next steps or what to expect.
```

**User Message format:**
```
Here is the performance data for this report period:

Report Title: [title]
Date Range: [start] to [end]
Client: [client name]

TRAFFIC:
- Organic Traffic: [value] (previous period: [prev_value], change: [%])
- Paid Traffic: [value]
- Total Sessions: [value]

CONVERSIONS:
- Conversions: [value] (previous: [prev], change: [%])
- Revenue: [value]
- Bounce Rate: [value]

PAID ADS:
- Ad Spend: [value]
- ROAS: [value]
- CTR: [value]

CUSTOM METRICS:
[list each custom KPI label and value]

ANALYST NOTES (if any were already typed): [notes]

Write the executive summary now.
```

#### API Route
**File:** `app/api/reports/[id]/generate-summary/route.ts`

Uses Google Gemini with 3-key rotation + fallback. See `lib/gemini.ts` for the key rotation logic.

```typescript
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { reports, clients, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateWithGemini } from '@/lib/gemini';
import { canPerformAction } from '@/lib/plans';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!canPerformAction(user.plan, 'aiSummary')) {
    return Response.json({ error: 'PLAN_LIMIT_REACHED', upgradeUrl: '/upgrade' }, { status: 403 });
  }

  const [result] = await db
    .select({ report: reports, client: clients })
    .from(reports)
    .leftJoin(clients, eq(reports.clientId, clients.id))
    .where(and(eq(reports.id, params.id), eq(reports.userId, userId)));

  if (!result) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });

  const { report, client } = result;
  const m = report.metricsData;

  const prompt = buildPrompt(report, client, m);

  try {
    const summary = await generateWithGemini(prompt);
    return Response.json({ summary }, { status: 200 });
  } catch {
    return Response.json({ error: 'AI_UNAVAILABLE', message: 'Try again later.' }, { status: 503 });
  }
}
```

#### Frontend — JSON Response (no streaming)
```typescript
async function handleGenerateSummary() {
  setIsGenerating(true);
  setNotes('');

  const response = await fetch(`/api/reports/${reportId}/generate-summary`, { method: 'POST' });
  const data = await response.json();

  if (response.status === 403) { setShowUpgradePrompt(true); setIsGenerating(false); return; }
  if (response.status === 503 || !response.ok) { toast.error(data.message); setIsGenerating(false); return; }
  if (data.summary) setNotes(data.summary);

  setIsGenerating(false);
}
```

#### Plan Gating
`lib/plans.ts` already has `aiSummary` in its `PLAN_LIMITS`:
```typescript
free: { aiSummary: false, ... }
starter: { aiSummary: true, ... }
pro: { aiSummary: true, ... }
```

#### Environment Variables Needed
Add to `.env.local`:
```
GEMINI_API_KEY_1=your_key_1
GEMINI_API_KEY_2=your_key_2
GEMINI_API_KEY_3=your_key_3
```
Install SDK: `npm install @google/generative-ai`

---

### FEATURE 6 — Scheduled Report Reminders

#### Why This Feature Matters
Recurring monthly reports drive user retention better than any other feature. If a user creates a report in May, they need to be reminded to create the June report. Without reminders, users forget, skip a month, and eventually churn. This feature keeps ReportFlow top-of-mind and drives monthly return visits that convert to habit.

**MVP version (build now):** Reminder emails — the system emails the freelancer when it's time to create the next report. The freelancer still creates the report manually.

**Phase 2 version (later):** Auto-create a duplicate report on the reminder date and email the freelancer to fill in the data.

#### User-Facing Flow
1. On the report detail page, in a "Schedule" card section, the user sees:
   - A dropdown: **"Set reminder for next report"** with options:
     - None (default)
     - Weekly (remind me every 7 days)
     - Monthly (remind me on the same day next month)
     - Quarterly (remind me in 3 months)
   - When a frequency is selected, a "Next reminder" date is shown: "Next reminder: June 15, 2026"
   - A small info text: "We'll email you when it's time to create the next report."
2. The user can change or clear the schedule at any time.
3. On the scheduled date, the freelancer receives an email:
   - Subject: "Time to create your [Client Name] report for [Month]"
   - Body: "Your [Client Name] monthly performance report is due. [Create Report →]"
   - The "Create Report" button links to `/reports/new?duplicate=[originalReportId]` which pre-fills the builder as a duplicate.

#### Database Changes
Add to the `reports` table:
```typescript
reminderFrequency: text('reminder_frequency'), // 'none' | 'weekly' | 'monthly' | 'quarterly'
nextReminderAt: timestamp('next_reminder_at'),
```

#### API Route — Set Reminder
**File:** `app/api/reports/[id]/reminder/route.ts`

```typescript
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { frequency } = await req.json(); // 'none' | 'weekly' | 'monthly' | 'quarterly'

  let nextReminderAt: Date | null = null;
  if (frequency !== 'none') {
    const now = new Date();
    if (frequency === 'weekly') nextReminderAt = addDays(now, 7);
    if (frequency === 'monthly') nextReminderAt = addMonths(now, 1);
    if (frequency === 'quarterly') nextReminderAt = addMonths(now, 3);
  }

  await db
    .update(reports)
    .set({ reminderFrequency: frequency, nextReminderAt, updatedAt: new Date() })
    .where(and(eq(reports.id, params.id), eq(reports.userId, userId)));

  return Response.json({ success: true, nextReminderAt });
}
```

#### Vercel Cron Job
**File:** `app/api/cron/report-reminders/route.ts`

This route runs daily at 9am and sends reminder emails to any user whose `nextReminderAt` is today (or overdue).

```typescript
import { db } from '@/lib/db';
import { reports, users, clients } from '@/lib/db/schema';
import { Resend } from 'resend';
import { lte, isNotNull, and, ne } from 'drizzle-orm';
import { addDays, addMonths } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // Verify this is called by Vercel Cron (check CRON_SECRET header)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Find all reports with a due reminder
  const dueReports = await db
    .select({ report: reports, user: users, client: clients })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .leftJoin(clients, eq(reports.clientId, clients.id))
    .where(
      and(
        isNotNull(reports.nextReminderAt),
        ne(reports.reminderFrequency, 'none'),
        lte(reports.nextReminderAt, new Date())
      )
    );

  for (const { report, user, client } of dueReports) {
    // Send reminder email
    await resend.emails.send({
      from: 'ReportFlow <reminders@reportflow.io>',
      to: [user.email],
      subject: `Time to create your ${client?.name} report`,
      html: `
        <p>Hi ${user.name ?? 'there'},</p>
        <p>It's time to create the next performance report for <strong>${client?.name}</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reports/new?duplicate=${report.id}">Create Report →</a></p>
        <p>This is your ${report.reminderFrequency} reminder.</p>
        <p style="color: #9CA3AF; font-size: 12px;">
          To stop these reminders, open the report and set the schedule to "None".
        </p>
      `,
    });

    // Update nextReminderAt to the next cycle
    let nextReminderAt: Date | null = null;
    if (report.reminderFrequency === 'weekly') nextReminderAt = addDays(new Date(), 7);
    if (report.reminderFrequency === 'monthly') nextReminderAt = addMonths(new Date(), 1);
    if (report.reminderFrequency === 'quarterly') nextReminderAt = addMonths(new Date(), 3);

    await db
      .update(reports)
      .set({ nextReminderAt })
      .where(eq(reports.id, report.id));
  }

  return Response.json({ processed: dueReports.length });
}
```

**`vercel.json`** (create in project root):
```json
{
  "crons": [
    {
      "path": "/api/cron/report-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Add `CRON_SECRET=your_random_secret_here` to `.env.local`. This prevents unauthorized calls to the cron endpoint.

#### Plan Gating
Reminders are available on ALL plans. This is a retention feature that helps all users.

---

### FEATURE 7 — Client Comments on Public Report

#### Why This Feature Matters
Client engagement is the strongest signal that a report is valuable. If a client can leave a quick comment directly on the report page ("Looks great! What happened with traffic in week 3?"), the freelancer is notified, responds, and the relationship deepens. No competitor currently offers this. It's a genuine differentiator that turns a static report into a conversation.

#### User-Facing Flow — Client Side (Public Report Page)
1. At the very bottom of the public report page, below the Executive Summary, is a section: **"Leave a comment"**
2. Two fields:
   - **Name:** text input (required), placeholder "Your name"
   - **Comment:** textarea (required), placeholder "Leave a feedback or ask a question..."
3. A **"Send Comment"** button.
4. No login required for the client.
5. After submitting: a success message appears: "Your comment was sent. [Freelancer name] will be notified."
6. All previously submitted comments are shown above the comment form, in chronological order:
   ```
   ┌────────────────────────────────────────┐
   │ Sarah (client)          2 hours ago    │
   │ "Great results this month! What drove  │
   │  the traffic increase?"                │
   └────────────────────────────────────────┘
   ```
7. Basic spam protection: rate limit to 3 comments per IP per hour (use Upstash Rate Limit or store IP + timestamp and check before insert).

#### User-Facing Flow — Freelancer Side (Dashboard)
1. When a new comment is received, Resend sends an email to the freelancer:
   - Subject: "[Client Name] commented on your report"
   - Body: "[Name] said: '[Comment text]'. View the report: [link]"
2. On the report detail page in the dashboard, a "Comments" section shows all comments for that report, with a count badge on the section header.
3. The freelancer cannot reply through the app (Phase 2). For now, they reply via their own email.

#### Database Changes
Add a new `comments` table to `lib/db/schema.ts`:
```typescript
export const reportComments = pgTable('report_comments', {
  id: text('id').primaryKey(), // nanoid()
  reportId: text('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  ipAddress: text('ip_address'), // store anonymized (first 3 octets only: "192.168.1")
  createdAt: timestamp('created_at').defaultNow(),
});
```

#### API Routes

**`POST /api/comments`** — Submit a new comment (no auth required)
```typescript
// app/api/comments/route.ts
export async function POST(req: Request) {
  const { reportId, authorName, content } = await req.json();

  // Validate
  if (!reportId || !authorName?.trim() || !content?.trim()) {
    return Response.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  }
  if (content.length > 1000) {
    return Response.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 });
  }

  // Verify the report is public
  const [report] = await db
    .select({ report: reports, user: users })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .where(and(eq(reports.id, reportId), eq(reports.isPublic, true)));

  if (!report) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });

  // Get anonymized IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.split('.').slice(0, 3).join('.') ?? 'unknown';

  // TODO: Add rate limiting check here (max 3 comments per IP per hour)

  // Insert comment
  const [comment] = await db.insert(reportComments).values({
    id: nanoid(),
    reportId,
    authorName: authorName.trim(),
    content: content.trim(),
    ipAddress: ip,
  }).returning();

  // Send email notification to report owner
  await resend.emails.send({
    from: 'ReportFlow <notifications@reportflow.io>',
    to: [report.user.email],
    subject: `New comment on "${report.report.title}"`,
    html: `
      <p><strong>${authorName}</strong> commented on your report:</p>
      <blockquote style="border-left: 4px solid #E5E7EB; padding-left: 16px; color: #374151;">
        "${content}"
      </blockquote>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reports/${reportId}">View Report →</a></p>
    `,
  });

  return Response.json({ comment }, { status: 201 });
}
```

**`GET /api/comments?reportId=[id]`** — Fetch comments for a report (no auth, public)
```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get('reportId');

  const comments = await db
    .select({
      id: reportComments.id,
      authorName: reportComments.authorName,
      content: reportComments.content,
      createdAt: reportComments.createdAt,
    })
    .from(reportComments)
    .where(eq(reportComments.reportId, reportId!))
    .orderBy(reportComments.createdAt);

  return Response.json({ comments });
}
```

#### Plan Gating
Comments are available on ALL plans. This is a core engagement feature.

---

### FEATURE 8 — Annual Pricing Toggle on Upgrade Page

#### Why This Feature Matters
Annual billing is how SaaS products generate reliable cash flow and reduce churn. The PRD specifies annual pricing ($79/year for Starter, $249/year for Pro) but the upgrade page currently doesn't show it. Adding an annual toggle with "Save 30%" messaging directly increases revenue per user.

#### User-Facing Flow
1. On the `/upgrade` page, above the pricing cards, add a toggle switch:
   ```
   Monthly    [●──] Annual   Save 30% 🎉
   ```
2. When toggled to Annual, all prices on the cards update:
   - Starter: ~~$9/mo~~ → **$6.58/mo** (billed $79/yr)
   - Pro: ~~$29/mo~~ → **$20.75/mo** (billed $249/yr)
3. The "billed annually" amount is shown in small gray text below the main price.
4. The Dodo Payments checkout links to the correct annual product variant based on the toggle state.
5. Default state: Annual toggle (because it's better for business and highlighted with "Save 30%").

#### Implementation
Simple React state:
```tsx
const [isAnnual, setIsAnnual] = useState(true);

const pricing = {
  starter: { monthly: 9, annual: 79, monthlyFromAnnual: 6.58 },
  pro: { monthly: 29, annual: 249, monthlyFromAnnual: 20.75 },
};

// In the checkout button click handler:
const variantId = isAnnual
  ? process.env.NEXT_PUBLIC_DODO_VARIANT_STARTER_ANNUAL
  : process.env.NEXT_PUBLIC_DODO_VARIANT_STARTER_MONTHLY;
```

No backend changes needed — just frontend toggle + correct Dodo Payments variant ID mapping.

---

## SECTION 6 — PDF Export Fix — Detailed Spec {#section-6}

### Required PDF Structure After Fixes
```
Page 1:
  Header row:
    - Left: Client logo (if available) OR client name in large text
    - Right: Report title (bold, large)
    - Below: Agency name · Date range · "PUBLISHED" status badge (blue pill)

  KPI Grid (3 columns):
    - Sessions | Conversions | Revenue
    - Each shows: label (gray), value (black bold large), change % (green/red small)

  Channel Breakdown section:
    - Section label: "Channel Breakdown"
    - Table with columns: Channel | Sessions | % of Total
    - Percentages MUST be pre-computed server-side (see Bug 1 fix)
    - Last row: "Total | [sum] | 100%"

Page 2 (if any data exists beyond basic):
  Custom Metrics grid (2 columns):
    - Each cell shows: label (gray small) + value (black bold)

  Executive Summary section:
    - Section label: "Executive Summary"
    - The notes text block, styled as body text (12px, #374151)

  Footer (on EVERY page):
    - Thin gray top border
    - Right-aligned: "Generated with ReportFlow · reportflow.io"
    - Page number: "Page 1 of 2"
    - Gray color, 8px font size
    - NOT shown on Pro plan with white-label enabled
```

### Technical Implementation Notes
- All styles must be inline JavaScript objects (`{ fontSize: 12, color: '#374151' }`) — NO CSS variables, NO Tailwind, NO external CSS.
- Use `@react-pdf/renderer`'s `<Page>`, `<View>`, `<Text>`, `<Image>` components.
- For bar charts in PDF: render simple bars using `<View>` with fixed `width` proportional to the value (not a Recharts chart). Example:
  ```tsx
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
    <Text style={{ width: 100, fontSize: 10 }}>{channel.name}</Text>
    <View style={{
      height: 14,
      width: `${channel.percentage}%`,
      backgroundColor: brandColor,
      maxWidth: 200
    }} />
    <Text style={{ fontSize: 10, marginLeft: 8 }}>{channel.percentage}%</Text>
  </View>
  ```
- Install: `npm install @react-pdf/renderer`
- The PDF API route must set `export const runtime = 'nodejs'` (not edge) — `@react-pdf/renderer` does not work in Edge Runtime.

---

## SECTION 7 — Landing Page Issues {#section-7}

### Issue 1 — Fake Testimonials (HIGH PRIORITY)
The testimonials from "Sarah Chen" and "Marcus Johnson" are clearly placeholder names with no photos, companies, or verifiable source. Any experienced freelancer or agency owner will recognize these as AI-generated and immediately lose trust in the product.

**Fix options (choose one):**
- **Option A (recommended):** Remove the testimonials section entirely. Replace with a "Product Showcase" section showing a screenshot of a real generated report.
- **Option B:** Replace with honest early-adopter copy: "Be one of the first to try ReportFlow. Early users get 3 months of Pro free."
- **Option C:** Keep the section but use a placeholder format: "[Your testimonial here — join and share yours]"

Do NOT keep Sarah Chen and Marcus Johnson.

### Issue 2 — No Visual of the Product
The landing page describes the product in text only. The most powerful conversion element for a reporting tool is showing a beautiful example report. Add:
- A screenshot of the public report page (the `/r/[shareToken]` view) in the "How It Works" section
- If possible, an interactive demo link: "See a live example report →" linking to a real public demo report

### Issue 3 — Copyright Year
Footer shows `© 2025 ReportFlow`. Fix to dynamic year:
```tsx
© {new Date().getFullYear()} ReportFlow. All rights reserved.
```

### Issue 4 — Pricing Doesn't Anchor Against Competitors
The pricing section shows the prices but doesn't explain WHY they're a good deal. Add a callout:
```
💡 AgencyAnalytics charges $59/month for just 5 clients.
   ReportFlow Pro is $29/month for unlimited clients. No per-client fees. Ever.
```

### Issue 5 — No Privacy Policy or Terms of Service Pages
These pages are legally required before accepting payments and collecting user data (especially under GDPR for EU users).

**Create:**
- `app/privacy/page.tsx` — Basic privacy policy (can use a privacy policy generator like Termly or GetTerms)
- `app/terms/page.tsx` — Basic terms of service
- Link both in the footer

### Issue 6 — No Social Proof / User Count
Once you have even 1 real user, update the hero to say "Join [N] freelancers and agencies who...". Until then, remove the "thousands of marketers" language from the current CTA section (it's false).

---

## SECTION 8 — Go-To-Market Readiness {#section-8}

### Pre-Launch Technical Checklist

**Critical (must be done before any user signs up):**
- [ ] Fix PDF channel percentage bug (Section 2, Bug 1)
- [ ] Verify Dodo Payments webhook is live and correctly updating `users.plan` in DB
- [ ] Test the full upgrade flow: click Upgrade → Dodo checkout → payment → plan updates in DB → UI reflects new plan
- [ ] Add dynamic OG meta tags to public report page
- [ ] Fix copyright year in footer
- [ ] Remove fake testimonials from landing page
- [ ] Add privacy policy and terms of service pages
- [ ] Verify Resend is configured with a custom domain (not Gmail) so emails don't land in spam
- [ ] Rate limiting on API routes — at minimum on `/api/comments` (POST) and the AI summary route
- [ ] Verify plan limits are enforced server-side in ALL API routes, not just in the UI
- [ ] Add error boundaries to all pages so a crash in one component doesn't blank the whole page
- [ ] Verify IDOR protection: all DB queries that fetch a report check `userId` matches the logged-in user

**Important (done before promoting the product):**
- [ ] Implement Duplicate Report feature (Feature 1)
- [ ] Implement Send to Client email (Feature 2)
- [ ] Implement Report Templates (Feature 3)
- [ ] Add a real screenshot of a generated report to the landing page
- [ ] Record a 60-second demo video (Loom, free) and embed on landing page
- [ ] Set a custom domain (not `reportflow-two.vercel.app`) — e.g., `reportflow.io`
- [ ] Confirm PostHog is tracking key events: `report_created`, `report_shared`, `pdf_downloaded`, `upgrade_clicked`
- [ ] Add Sentry error tracking to catch production crashes

**Nice to have before launch:**
- [ ] Annual pricing toggle on upgrade page (Feature 8)
- [ ] View tracking on public report (Feature 4)
- [ ] AI-generated executive summary (Feature 5)

### Launch Channels (Ordered by Expected ROI)

1. **ProductHunt** — Prepare 60+ days in advance. Get a hunter. Submit Tuesday or Wednesday. Provide screenshots, a demo GIF, and the demo report link. Goal: Top 5 of the day.

2. **IndieHackers** — Post in "Show IH" with an honest build story. The community responds to transparency and specific numbers ("I built this in 14 days, here's what I learned").

3. **Reddit** — Post in r/freelance, r/SEO, r/PPC, r/Entrepreneur. Lead with the pain point, not the product. "I was spending 4 hours a week on client reports. I built a tool to cut that to 10 minutes."

4. **Twitter/X** — Before/after comparison post. Screenshot of a manual Google Sheets report vs a ReportFlow report. No caption needed — the visual speaks for itself.

5. **Freelancer Facebook Groups** — SEO Professionals (100K+ members), Freelance Digital Marketing (50K+), PPC Chat. A genuine post about the tool with a link to the demo report gets organic traction.

6. **Cold Outreach to Freelancers** — Find 50 SEO/PPC freelancers on Upwork with "$1k+ earned" badges. Send a short personal email offering 3 months of Pro free in exchange for 30 minutes of feedback.

### Pricing Recommendation
Current pricing ($9 Starter / $29 Pro) is correct for launch. Do not change it until you have 20+ paying users and understand the churn patterns. Once you have 5+ real testimonials, add them to the pricing section — social proof on the pricing page is the highest-leverage conversion element.

---

## SECTION 9 — Implementation Priority Table {#section-9}

Implement in this exact order. Each row includes exact files to create or modify.

| Priority | Feature | Files to Create/Modify | Effort |
|---------|---------|------------------------|--------|
| 🔴 P0 | Fix PDF channel % bug | `app/api/reports/[id]/pdf/route.ts`, `lib/pdf-generator.ts` | Low |
| 🔴 P0 | Fix PDF footer styling | `lib/pdf-generator.ts` | Trivial |
| 🔴 P0 | Move Executive Summary out of Traffic tab | `components/reports/ReportBuilder.tsx` | Low |
| 🔴 P0 | Verify Dodo Payments webhook + test full flow | `app/api/webhooks/dodopayments/route.ts` | Medium |
| 🔴 P0 | Remove fake testimonials from landing page | `app/page.tsx` | Trivial |
| 🔴 P0 | Fix copyright year in footer | `app/page.tsx` | Trivial |
| 🔴 P0 | Add Privacy Policy + Terms pages | `app/privacy/page.tsx`, `app/terms/page.tsx` | Low |
| 🟠 P1 | Dynamic OG meta tags on public report | `app/r/[shareToken]/page.tsx` | Low |
| 🟠 P1 | Duplicate Report feature | `app/api/reports/[id]/duplicate/route.ts`, `components/reports/ReportCard.tsx` | Medium |
| 🟠 P1 | Send Report to Client (email) | `app/api/reports/[id]/send/route.ts`, `components/emails/ReportEmail.tsx`, report detail page | High |
| 🟠 P1 | Report Templates (4 built-in) | `lib/templates.ts`, `app/(dashboard)/reports/new/page.tsx`, update builder | Medium |
| 🟠 P1 | AI-Generated Executive Summary | `app/api/reports/[id]/generate-summary/route.ts`, update `ReportBuilder.tsx` | Medium |
| 🟠 P1 | Annual pricing toggle | `app/(dashboard)/upgrade/page.tsx` | Low |
| 🟡 P2 | Report View Tracking | `app/api/reports/view/route.ts`, schema migration, `app/r/[shareToken]/page.tsx`, report detail page | Low |
| 🟡 P2 | Client Comments on public report | `lib/db/schema.ts` (new table), `app/api/comments/route.ts`, `PublicReport.tsx` | High |
| 🟡 P2 | Scheduled Report Reminders | `app/api/reports/[id]/reminder/route.ts`, `app/api/cron/report-reminders/route.ts`, `vercel.json`, schema | High |
| 🟡 P2 | Add product screenshot to landing page | `app/page.tsx` | Low |
| 🟡 P2 | Rate limiting on API routes | `middleware.ts` + Upstash setup | Medium |
| 🟢 P3 | PWA manifest (installable on mobile) | `app/manifest.ts`, `public/icons/` | Low |
| 🟢 P3 | Competitor pricing callout on landing page | `app/page.tsx` | Trivial |
| 🔵 P4 | Google Analytics 4 integration | `app/api/integrations/ga4/` (OAuth, data fetch) | Very High |
| 🔵 P4 | Meta Ads integration | `app/api/integrations/meta/` | Very High |
| 🔵 P4 | Client portal (separate client login) | Major — new auth flow, new pages | Very High |
| 🔵 P4 | Custom domain for share links | Vercel domain config + settings UI | High |
| 🔵 P4 | Save custom templates (user-created) | New `templates` DB table, settings UI | High |
| 🔵 P4 | Team members / multi-user workspace | New `teamMembers` DB table, invite flow | Very High |

---

## FINAL SUMMARY

### The 3 things that will most impact user activation (converting trial → habit):
1. **Duplicate Report** — removes the biggest friction for returning monthly users
2. **Report Templates** — cuts new report setup from 5 minutes to 30 seconds
3. **Send to Client email** — completes the workflow so the freelancer doesn't have to leave the app

### The 3 features that will drive paid upgrades:
1. **AI-Generated Executive Summary** (Starter/Pro) — clearly visible value, saves real time every month
2. **Send to Client email** (Starter/Pro) — core workflow completion gated behind payment
3. **Unlimited clients + flat pricing** (Pro) — explicit counter to AgencyAnalytics' per-client fees

### The single biggest market advantage:
ReportFlow's flat $9/$29 pricing for unlimited clients is the clearest differentiator in the market. At 10 clients, AgencyAnalytics costs $239/month. ReportFlow costs $29. Make this comparison explicit on the pricing page and in all marketing copy.

---

*Report Version 2.0 — Updated to reflect Dodo Payments integration and verified public report functionality.*
*Prepared for AI-assisted development. All file paths reference the ReportFlow Next.js App Router project structure.*
*Last updated: May 2026*
