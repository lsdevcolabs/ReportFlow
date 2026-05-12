# ReportFlow — Full Product Requirements Document
### Version 1.0 | For AI-Assisted Development

---

## ⚠️ BEFORE YOU READ: PRD CONTEXT

This document is written for an **AI coding assistant** (Cursor, Claude Code, Copilot, etc.) to understand the full product and build it correctly. Every section is intentionally detailed. Do not skip sections.

**Product:** ReportFlow — Client Reporting Automation SaaS  
**Builder:** Solo indie developer (India-based)  
**Stack:** Zero-cost to launch, scales to paid when revenue arrives  
**Goal:** Ship a working MVP in 10–14 days  

---

## PART 1 — PRODUCT OVERVIEW

### 1.1 What This Product Is

ReportFlow is a **web-based SaaS tool** that helps freelancers and small digital marketing agencies generate clean, professional client reports automatically — instead of manually copying numbers from Google Analytics, Meta Ads, or other tools into Google Sheets every week.

**One-sentence pitch:**  
*"Connect your marketing data, click Generate, send a branded report to your client in 2 minutes."*

### 1.2 Core Problem Being Solved

Freelancers and agencies currently:
1. Log into 3–5 different platforms (GA4, Meta Ads, Search Console, etc.)
2. Copy numbers manually into a Google Sheet or Slides template
3. Take screenshots of graphs
4. Format everything to look presentable
5. Export as PDF and email to client

This takes **2–5 hours per client per week**. For an agency with 10 clients, that's a full working day lost to admin work every single week.

### 1.3 MVP Scope (What We Build First)

**MVP does NOT include live API integrations** (Google Analytics, Meta Ads API). Those are Phase 2. The MVP validates the core workflow with:

- Manual data entry (user types in numbers)
- CSV file upload
- Auto-generated visual report with charts
- Shareable public link
- PDF export
- White-label branding (logo + color)
- Subscription-gated features via Lemon Squeezy

This is intentional. Live integrations slow down launch by weeks. Validate the workflow first, add live data pull in Phase 2.

---

## PART 2 — TARGET USERS

### 2.1 Primary Users

**Freelance Digital Marketers**
- SEO consultants
- Google/Meta Ads managers
- Social media managers
- Content marketers
- They work with 3–15 clients simultaneously
- Pain: Creating reports is unpaid work that eats into billing hours

**Small Digital Agencies (1–10 employees)**
- Handle 10–50 client accounts
- Have existing reporting workflows but they're manual
- Will pay for tools that save account manager time
- Decision maker is often the founder or head of operations

### 2.2 Secondary Users (Phase 2)

- Indie hackers managing their own project metrics
- Marketing VAs who create reports for their clients
- Consultants presenting performance to stakeholders

### 2.3 What Users Pay For (Psychology)

Users do NOT pay for features. They pay for:
- **Time saved** ("This saves me 3 hours per client")
- **Professional image** ("My reports look better than competitors'")
- **Client retention** ("Clients who receive regular reports churn less")

This should inform all copy on the landing page and pricing page.

---

## PART 3 — COMPLETE TECH STACK

### 3.1 Full Stack Breakdown

| Layer | Tool | Why | Free Tier Limit |
|---|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | SSR, SEO, API routes, full-stack | Unlimited |
| Hosting & Deployment | Vercel | Auto-deploy from GitHub, serverless | 100GB bandwidth/month |
| Database | Neon (PostgreSQL) | Serverless Postgres, branching | 0.5GB storage, 1 project |
| Auth | Clerk | OAuth + email auth, user sessions | 10,000 MAU |
| Email | Resend | Transactional email, OTP | 3,000 emails/month |
| Error Tracking | Sentry | Crash reports, stack traces | 5,000 errors/month |
| Analytics | PostHog | Event tracking, funnels, retention | 1M events/month |
| Payments | Lemon Squeezy | MoR, handles tax, subscriptions | 5% + fees |
| UI Components | shadcn/ui + Tailwind CSS | Accessible, customizable components | Free |
| Charts | Recharts | React chart library | Free |
| PDF Generation | Puppeteer (serverless) OR react-pdf | Generate PDF from report view | Free |
| CSV Parsing | Papa Parse | Browser-side CSV parsing | Free |
| ORM | Drizzle ORM | Type-safe SQL for Neon | Free |
| File Storage (logos) | Vercel Blob OR Cloudinary free | Store uploaded client logos | 1GB free |
| Validation | Zod | Runtime type validation | Free |

### 3.2 Why These Specific Choices

**Neon over MongoDB Atlas:**  
Our data is relational (users → clients → reports). PostgreSQL with foreign keys and joins is the right choice. MongoDB is good for unstructured data; we have structured data.

**Drizzle ORM over Prisma:**  
Drizzle works natively in Vercel Edge Runtime without issues. Prisma has cold-start and edge compatibility problems in serverless environments.

**Lemon Squeezy over Stripe/Razorpay:**  
As an individual Indian developer:
- Lemon Squeezy acts as Merchant of Record — they handle VAT, GST, international tax compliance for you
- No business registration required to start
- Supports global USD payments natively
- Subscription management is built-in
- Downside: ~5% fee (worth it at early stage to avoid compliance headache)
- Migrate to Stripe when monthly revenue exceeds $2,000

**react-pdf over Puppeteer:**  
Puppeteer requires a Chrome binary which can't run in Vercel serverless functions (memory limit). Use `@react-pdf/renderer` which generates PDFs purely in JavaScript — works in serverless.

---

## PART 4 — PROJECT FOLDER STRUCTURE

```
reportflow/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (Clerk handles these)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx            # Dashboard shell (sidebar + header)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard overview
│   │   ├── clients/
│   │   │   ├── page.tsx          # List all clients
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create new client
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Single client detail
│   │   ├── reports/
│   │   │   ├── page.tsx          # List all reports
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Report builder
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Report detail/edit
│   │   │       └── preview/
│   │   │           └── page.tsx  # Report preview before share
│   │   ├── settings/
│   │   │   └── page.tsx          # Account + billing settings
│   │   └── upgrade/
│   │       └── page.tsx          # Pricing/upgrade page
│   ├── r/
│   │   └── [shareToken]/
│   │       └── page.tsx          # PUBLIC shareable report (no auth)
│   ├── api/
│   │   ├── clients/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE
│   │   ├── reports/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PUT, DELETE
│   │   │       └── pdf/
│   │   │           └── route.ts  # POST → returns PDF blob
│   │   ├── upload/
│   │   │   └── route.ts          # POST → upload CSV, returns parsed data
│   │   ├── upload-logo/
│   │   │   └── route.ts          # POST → upload client logo to Vercel Blob
│   │   └── webhooks/
│   │       └── lemonsqueezy/
│   │           └── route.ts      # POST → handle LS subscription events
│   ├── layout.tsx                # Root layout (ClerkProvider, PostHog)
│   └── page.tsx                  # Landing page (public)
├── components/
│   ├── ui/                       # shadcn/ui generated components
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── StatsCard.tsx
│   ├── clients/
│   │   ├── ClientCard.tsx
│   │   └── ClientForm.tsx
│   ├── reports/
│   │   ├── ReportBuilder.tsx     # Main report builder UI
│   │   ├── MetricInput.tsx       # Individual metric input row
│   │   ├── CSVUploader.tsx       # CSV drag-and-drop upload
│   │   ├── ReportPreview.tsx     # Live preview while building
│   │   ├── ReportCard.tsx        # Report list item
│   │   └── charts/
│   │       ├── TrafficChart.tsx  # Line/bar chart for traffic
│   │       └── MetricsGrid.tsx   # KPI summary boxes
│   ├── report-view/              # Used in both preview and public share page
│   │   ├── PublicReport.tsx      # Full report render component
│   │   ├── ReportHeader.tsx      # Logo, client name, date range
│   │   ├── KPISection.tsx        # Highlight metrics
│   │   └── ChartSection.tsx      # Charts section
│   └── shared/
│       ├── PlanBadge.tsx
│       ├── UpgradePrompt.tsx     # Shown when free tier limit hit
│       └── LoadingSpinner.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts              # Drizzle client init
│   │   └── schema.ts             # All table definitions
│   ├── auth.ts                   # Clerk auth helpers
│   ├── lemon.ts                  # Lemon Squeezy API helpers
│   ├── plans.ts                  # Plan limits and feature gates
│   ├── csv-parser.ts             # CSV parsing logic
│   ├── pdf-generator.ts          # @react-pdf/renderer setup
│   └── utils.ts                  # General utility functions
├── hooks/
│   ├── use-plan.ts               # Hook to get current user plan
│   └── use-report-builder.ts     # State management for report builder
├── middleware.ts                 # Clerk auth middleware (protect routes)
├── drizzle.config.ts             # Drizzle ORM config
├── .env.local                    # Environment variables (see below)
└── package.json
```

---

## PART 5 — ENVIRONMENT VARIABLES

Create a `.env.local` file with these variables. **Never commit this file.**

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon Database (PostgreSQL)
DATABASE_URL=postgresql://...@...neon.tech/reportflow?sslmode=require

# Resend (Email)
RESEND_API_KEY=re_...

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Lemon Squeezy (Payments)
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_VARIANT_STARTER=...   # Product variant ID for Starter plan
LEMONSQUEEZY_VARIANT_PRO=...       # Product variant ID for Pro plan

# Vercel Blob (File storage for logos)
BLOB_READ_WRITE_TOKEN=...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Change to production URL on deploy
```

---

## PART 6 — DATABASE SCHEMA

File: `lib/db/schema.ts`

```typescript
import { pgTable, text, timestamp, jsonb, integer, boolean, varchar } from 'drizzle-orm/pg-core';

// Users table — synced from Clerk via webhook or on first login
export const users = pgTable('users', {
  id: text('id').primaryKey(),                    // Clerk user ID (e.g., "user_2abc...")
  email: text('email').notNull().unique(),
  name: text('name'),
  plan: text('plan').notNull().default('free'),   // 'free' | 'starter' | 'pro'
  lsCustomerId: text('ls_customer_id'),           // Lemon Squeezy customer ID
  lsSubscriptionId: text('ls_subscription_id'),  // Lemon Squeezy subscription ID
  subscriptionStatus: text('subscription_status').default('inactive'), // 'active' | 'past_due' | 'cancelled' | 'inactive'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Clients table — each user manages multiple clients
export const clients = pgTable('clients', {
  id: text('id').primaryKey(),                    // nanoid() generated
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),                           // Client's email (optional, for sending reports)
  website: text('website'),
  industry: text('industry'),
  logoUrl: text('logo_url'),                      // Stored in Vercel Blob
  brandColor: varchar('brand_color', { length: 7 }).default('#2563EB'), // Hex color for white-label
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Reports table — one report per client per reporting period
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),                    // nanoid() generated
  clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),                 // e.g., "April 2025 Marketing Report"
  dateRangeStart: timestamp('date_range_start').notNull(),
  dateRangeEnd: timestamp('date_range_end').notNull(),
  
  // Report data stored as JSON — flexible structure
  metricsData: jsonb('metrics_data').notNull().default('{}'),
  // Structure of metricsData:
  // {
  //   summary: { sessions: number, conversions: number, revenue: number, ... },
  //   channelBreakdown: [{ channel: string, sessions: number, percentage: number }],
  //   weeklyTrend: [{ week: string, sessions: number, conversions: number }],
  //   customMetrics: [{ label: string, value: string, change: string, changeType: 'positive'|'negative'|'neutral' }],
  //   notes: string  (editor notes / summary text)
  // }
  
  shareToken: text('share_token').unique(),       // Random token for public URL (e.g., /r/abc123xyz)
  isPublic: boolean('is_public').default(false),  // Must be true for share link to work
  
  status: text('status').default('draft'),        // 'draft' | 'published'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Plan limits reference (not a DB table, but defined here for reference)
// Free:    max 1 client, max 3 reports total, no white-label, no PDF export
// Starter: max 5 clients, unlimited reports, no white-label, PDF export ✅
// Pro:     unlimited clients, unlimited reports, white-label ✅, PDF export ✅, custom notes ✅
```

**Database migrations:**  
Use `drizzle-kit push` during development. Run `drizzle-kit generate` + `drizzle-kit migrate` for production.

---

## PART 7 — PLAN LIMITS & FEATURE GATING

File: `lib/plans.ts`

```typescript
export type Plan = 'free' | 'starter' | 'pro';

export const PLAN_LIMITS = {
  free: {
    maxClients: 1,
    maxReports: 3,          // Total, not per month
    whiteLabel: false,
    pdfExport: false,
    shareableLinks: true,   // Public share always available
    customNotes: false,
  },
  starter: {
    maxClients: 5,
    maxReports: Infinity,
    whiteLabel: false,
    pdfExport: true,
    shareableLinks: true,
    customNotes: true,
  },
  pro: {
    maxClients: Infinity,
    maxReports: Infinity,
    whiteLabel: true,
    pdfExport: true,
    shareableLinks: true,
    customNotes: true,
  },
} as const;

export function canPerformAction(plan: Plan, action: keyof typeof PLAN_LIMITS['free']) {
  return PLAN_LIMITS[plan][action];
}

// Pricing (USD) — displayed on pricing page
export const PRICING = {
  starter: { monthly: 9, annual: 79 },
  pro: { monthly: 29, annual: 249 },
};
```

**Enforcement:** Check plan limits in BOTH:
1. API routes (server-side) — before writing to DB
2. UI (client-side) — to show upgrade prompts early

Never rely only on UI gating. Always enforce on the server.

---

## PART 8 — API ROUTES SPECIFICATION

### 8.1 Client Routes

**`GET /api/clients`**
- Auth: Required (Clerk)
- Returns: All clients belonging to the current user
- Response: `{ clients: Client[] }`

**`POST /api/clients`**
- Auth: Required
- Body: `{ name: string, email?: string, website?: string, industry?: string }`
- Checks: User's plan limit (maxClients). If at limit, return `403` with `{ error: 'PLAN_LIMIT_REACHED', upgradeUrl: '/upgrade' }`
- Returns: Created client object
- Side effect: Send welcome email to client (optional, if client email provided) via Resend

**`GET /api/clients/[id]`**
- Auth: Required. Verify `userId` on the client matches current user (prevent IDOR attacks)
- Returns: Single client + their reports

**`PUT /api/clients/[id]`**
- Auth: Required + ownership check
- Body: Partial client fields
- Returns: Updated client

**`DELETE /api/clients/[id]`**
- Auth: Required + ownership check
- Cascades: Deletes all reports for this client (handled by DB cascade)
- Returns: `{ success: true }`

### 8.2 Report Routes

**`GET /api/reports`**
- Auth: Required
- Query params: `?clientId=xxx` (optional filter)
- Returns: All reports for user (or filtered by client)

**`POST /api/reports`**
- Auth: Required
- Body:
```typescript
{
  clientId: string,
  title: string,
  dateRangeStart: string,   // ISO date string
  dateRangeEnd: string,
  metricsData: {
    summary: {
      sessions: number,
      conversions: number,
      revenue?: number,
      bounceRate?: number,
    },
    channelBreakdown: Array<{
      channel: string,
      sessions: number,
      percentage: number
    }>,
    weeklyTrend: Array<{
      week: string,
      sessions: number,
      conversions: number
    }>,
    customMetrics: Array<{
      label: string,
      value: string,
      change: string,
      changeType: 'positive' | 'negative' | 'neutral'
    }>,
    notes: string
  }
}
```
- Checks: User's plan maxReports limit
- Auto-generates: `shareToken` (nanoid 10 chars), sets `status: 'draft'`
- Returns: Created report with `shareToken`

**`PUT /api/reports/[id]`**
- Auth: Required + ownership check
- Can update all fields including `isPublic` (to enable/disable share link)
- Returns: Updated report

**`DELETE /api/reports/[id]`**

**`POST /api/reports/[id]/pdf`**
- Auth: Required + ownership check + plan check (pdfExport)
- Generates PDF using `@react-pdf/renderer`
- Returns: PDF as binary response with `Content-Type: application/pdf`

### 8.3 Upload Routes

**`POST /api/upload`** (CSV parsing)
- Auth: Required
- Body: `multipart/form-data` with CSV file
- Parses CSV using Papa Parse server-side
- Returns: Structured JSON data matching metricsData shape (best-effort mapping)
- Error: If CSV columns don't match expected format, return the raw parsed rows and let the user map them

**`POST /api/upload-logo`**
- Auth: Required
- Body: `multipart/form-data` with image file (max 2MB)
- Validates: image/png, image/jpeg, image/webp only
- Uploads to Vercel Blob
- Returns: `{ url: string }` — store this in `clients.logoUrl`

### 8.4 Public Report Route (No Auth)

**`GET /r/[shareToken]`** — This is a Next.js PAGE, not an API route
- No authentication required
- Fetches report by `shareToken`
- Check: `isPublic === true` on the report, else return 404
- Renders: `PublicReport` component (clean, client-branded report view)
- This page should NOT show any ReportFlow branding if user is on Pro plan (white-label)
- Meta tags: Set og:title, og:description for link previews

### 8.5 Webhook Route

**`POST /api/webhooks/lemonsqueezy`**
- No auth (but MUST verify webhook signature using `LEMONSQUEEZY_WEBHOOK_SECRET`)
- Handles these events:
  - `subscription_created` → Update user plan + lsSubscriptionId + subscriptionStatus = 'active'
  - `subscription_updated` → Update plan if plan changed
  - `subscription_cancelled` → Set subscriptionStatus = 'cancelled', downgrade plan to 'free' at period end
  - `subscription_payment_failed` → Set subscriptionStatus = 'past_due'
  - `subscription_resumed` → Set subscriptionStatus = 'active'
- IMPORTANT: Always return `200 OK` quickly, even if processing fails, then process async. LemonSqueezy retries if it doesn't get 200.

---

## PART 9 — KEY COMPONENT SPECS

### 9.1 Report Builder (`components/reports/ReportBuilder.tsx`)

This is the most important component. It's a multi-step form with live preview.

**Layout:** Two-column on desktop (form left, preview right). Single column on mobile.

**Step 1 — Select Client**
- Dropdown of user's clients
- "Add new client" shortcut link
- Shows client logo (if set) and brand color preview

**Step 2 — Date Range**
- Date picker for start and end date
- Preset buttons: "Last 7 days", "Last 30 days", "Last month", "Last quarter"

**Step 3 — Enter Data**  
Three sub-tabs:
- **Manual Entry** — Form fields for each metric
- **CSV Upload** — Drag-and-drop CSV upload (auto-maps columns)
- **Quick Paste** — Textarea where user pastes raw numbers, AI parsing (Phase 2)

Manual entry fields:
```
Summary Metrics:
  - Total Sessions/Visits
  - Conversions (leads/sales)
  - Revenue (optional)
  - Bounce Rate % (optional)

Channel Breakdown (repeating rows):
  - Channel name (e.g., "Organic Search")
  - Sessions from this channel
  (Percentage auto-calculated)

Weekly Trend (4 rows by default, date auto-filled):
  - Week label
  - Sessions
  - Conversions

Custom KPIs (up to 5, Pro plan only unlimited):
  - Label (e.g., "Email CTR")
  - Value (e.g., "4.2%")
  - Change (e.g., "+0.8%")
  - Change type (positive/negative/neutral — affects color)

Notes / Insights (text area):
  - Freeform text for the report summary
  - Shown at top of report
```

**Step 4 — Preview & Share**
- Shows full ReportPreview component
- "Generate Share Link" button (copies `/r/[shareToken]` to clipboard)
- "Download PDF" button (plan-gated)
- "Publish Report" toggle (makes link live)

### 9.2 Public Report (`components/report-view/PublicReport.tsx`)

This is what the client SEES. Must look professional.

**Structure:**
1. **Header** — Client logo (or ReportFlow logo if free plan), Client name, Report title, Date range
2. **Summary Bar** — 4 big KPI numbers (Sessions, Conversions, Revenue, Bounce Rate)
3. **Custom KPIs** — If any added
4. **Channel Breakdown** — Horizontal bar chart showing traffic by source
5. **Weekly Trend** — Line chart (sessions + conversions over weeks)
6. **Notes Section** — Analyst's written summary
7. **Footer** — "Generated by ReportFlow" (hidden on Pro white-label)

**Design requirements:**
- Clean, minimal, professional
- Uses `brandColor` from client settings for accent colors
- Responsive (clients open this on mobile)
- No login required, no navigation, just the report

### 9.3 Sidebar Navigation

Pages in sidebar:
- Dashboard (overview stats)
- Clients
- Reports
- Settings
- Upgrade (highlighted if on free plan)

Show current plan badge in sidebar bottom.

---

## PART 10 — USER FLOWS (Step-by-Step)

### Flow 1: New User Onboarding
1. User lands on `/` (landing page)
2. Clicks "Get Started Free"
3. Clerk sign-up page (`/sign-up`)
4. After sign-up → redirected to `/dashboard`
5. Dashboard is empty — show onboarding prompt: "Create your first client to get started"
6. Resend sends welcome email ("Welcome to ReportFlow — here's how to create your first report")

### Flow 2: Creating a Report (Core Flow)
1. User clicks "New Report" from dashboard or reports page
2. Goes to `/reports/new`
3. Selects client (or creates one inline)
4. Selects date range
5. Enters metrics (manual or CSV)
6. Live preview updates in real-time as data is entered
7. Clicks "Save Report" → POST /api/reports → report saved as draft
8. Clicks "Publish" → isPublic = true
9. Clicks "Copy Share Link" → copies `https://app.reportflow.io/r/[shareToken]`
10. Shares link with client

### Flow 3: Upgrading Plan
1. Free user tries to add 2nd client → sees UpgradePrompt modal
2. Clicks "Upgrade" → goes to `/upgrade` (pricing page)
3. Clicks "Start Starter" → POST to Lemon Squeezy checkout URL
4. Redirected to Lemon Squeezy hosted checkout
5. Payment successful → LS webhook fires to `/api/webhooks/lemonsqueezy`
6. Webhook updates user's plan in DB to 'starter'
7. User redirected back to app → plan is now active

### Flow 4: Client Views Report
1. Freelancer sends client the URL: `https://app.reportflow.io/r/xK9mN2pQ`
2. Client opens URL (no login needed)
3. Sees professional branded report with their logo and brand colors
4. Can view on mobile/desktop
5. (Future: Client can leave comments)

---

## PART 11 — LANDING PAGE STRUCTURE

The landing page (`app/page.tsx`) should convert visitors to sign-ups. Structure:

**Section 1 — Hero**
- Headline: "Stop Wasting Hours on Client Reports"
- Sub-headline: "ReportFlow automatically generates beautiful, branded reports your clients will love — in minutes, not hours."
- CTA: "Start Free — No Credit Card Needed"
- Hero visual: Screenshot/mockup of a generated report

**Section 2 — Problem Agitation**
- "Does this sound familiar?" → list of pain points (copying screenshots, formatting sheets, etc.)

**Section 3 — How It Works**
- 3 steps: Connect Data → Generate Report → Share with Client

**Section 4 — Features**
- White-label reports
- Shareable links
- PDF export
- Charts and KPIs
- CSV import

**Section 5 — Pricing**
- 3-tier pricing table (Free / Starter / Pro)
- Annual discount shown

**Section 6 — Social Proof (Phase 2)**
- Testimonials after first users

**Section 7 — CTA**
- "Join free today"

---

## PART 12 — AUTHENTICATION SETUP (Clerk)

Install: `npm install @clerk/nextjs`

**`middleware.ts`** (root level):
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/clients(.*)',
  '/reports(.*)',
  '/settings(.*)',
  '/upgrade(.*)',
  '/api/clients(.*)',
  '/api/reports(.*)',
  '/api/upload(.*)',
  '/api/upload-logo(.*)',
]);

// Public routes: '/', '/r/(.*)', '/api/webhooks/(.*)', '/sign-in', '/sign-up'

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**Getting user in API routes:**
```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });
  // userId is the Clerk user ID — same as users.id in DB
}
```

**Sync user to DB:**  
On first protected page load, check if user exists in DB. If not, create them.
Create a helper: `lib/auth.ts` → `ensureUserExists(clerkUserId, email, name)`

---

## PART 13 — PAYMENT INTEGRATION (Lemon Squeezy)

### 13.1 Setup Steps
1. Create account at lemonsqueezy.com
2. Create a Store
3. Create 2 Products: "Starter Plan" and "Pro Plan"
4. For each product, create variants (monthly + annual pricing)
5. Note down Variant IDs → put in `.env.local`
6. Set webhook URL in LS dashboard: `https://yourapp.com/api/webhooks/lemonsqueezy`
7. Enable events: subscription_created, subscription_updated, subscription_cancelled, subscription_payment_failed, subscription_resumed

### 13.2 Creating Checkout Session

```typescript
// lib/lemon.ts
export async function createCheckoutUrl(variantId: string, userEmail: string, userId: string) {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { userId },         // Passed back in webhook
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });
  const data = await response.json();
  return data.data.attributes.url;
}
```

### 13.3 Webhook Handling (Critical)

```typescript
// app/api/webhooks/lemonsqueezy/route.ts
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('X-Signature');
  
  // ALWAYS verify signature first
  const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  const digest = hmac.update(rawBody).digest('hex');
  if (digest !== signature) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = JSON.parse(rawBody);
  const eventName = event.meta.event_name;
  const userId = event.meta.custom_data?.userId;
  const subscriptionId = event.data?.id;
  const customerId = event.data?.attributes?.customer_id?.toString();
  
  // Determine plan from variant ID
  const variantId = event.data?.attributes?.variant_id?.toString();
  let plan = 'free';
  if (variantId === process.env.LEMONSQUEEZY_VARIANT_STARTER) plan = 'starter';
  if (variantId === process.env.LEMONSQUEEZY_VARIANT_PRO) plan = 'pro';

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      await db.update(users).set({
        plan,
        lsCustomerId: customerId,
        lsSubscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
      break;
      
    case 'subscription_cancelled':
      // Don't downgrade immediately — downgrade at period end
      await db.update(users).set({ subscriptionStatus: 'cancelled', updatedAt: new Date() })
        .where(eq(users.id, userId));
      break;
      
    case 'subscription_payment_failed':
      await db.update(users).set({ subscriptionStatus: 'past_due', updatedAt: new Date() })
        .where(eq(users.id, userId));
      break;
      
    case 'subscription_resumed':
      await db.update(users).set({ subscriptionStatus: 'active', updatedAt: new Date() })
        .where(eq(users.id, userId));
      break;
  }
  
  return new Response('OK', { status: 200 });
}
```

---

## PART 14 — PDF GENERATION

Use `@react-pdf/renderer`. It renders React components to PDF in Node.js without needing a browser.

```typescript
// lib/pdf-generator.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// Create React PDF component from report data
// Then in API route:
export async function generateReportPDF(report: Report, client: Client) {
  const doc = <ReportPDFDocument report={report} client={client} />;
  const buffer = await renderToBuffer(doc);
  return buffer;
}

// In /api/reports/[id]/pdf/route.ts:
const pdfBuffer = await generateReportPDF(report, client);
return new Response(pdfBuffer, {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${report.title}.pdf"`,
  },
});
```

---

## PART 15 — ERROR HANDLING STANDARD

All API routes must follow this pattern:

```typescript
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    
    // Validate request body with Zod
    const body = await req.json();
    const parsed = CreateClientSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'VALIDATION_ERROR', details: parsed.error.issues }, { status: 400 });
    }
    
    // Business logic here...
    
    return Response.json({ data: result }, { status: 201 });
    
  } catch (error) {
    console.error('[POST /api/clients]', error);
    // Sentry will auto-capture this
    return Response.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
```

---

## PART 16 — ANALYTICS EVENTS (PostHog)

Track these events to understand user behavior:

```typescript
// Client-side event tracking (in components)
posthog.capture('report_created', { plan: user.plan, clientId })
posthog.capture('report_shared', { reportId })
posthog.capture('pdf_downloaded', { plan: user.plan })
posthog.capture('upgrade_clicked', { from: user.plan, location: 'sidebar' | 'feature_gate' })
posthog.capture('client_created', { plan: user.plan })
posthog.capture('csv_uploaded', {})
posthog.capture('share_link_copied', { reportId })
```

Set user properties on sign-up:
```typescript
posthog.identify(userId, { email, plan: 'free', createdAt: new Date().toISOString() })
```

---

## PART 17 — SECURITY CHECKLIST

Before deploying, verify:

- [ ] All API routes check `userId` from Clerk auth, not from request body
- [ ] All DB queries filter by `userId` (no IDOR vulnerabilities)
- [ ] File uploads validate MIME type and size (max 2MB for logos)
- [ ] Webhook signature verified before processing
- [ ] `.env.local` is in `.gitignore`
- [ ] Public report route (`/r/[shareToken]`) returns 404 if `isPublic === false`
- [ ] No sensitive data logged to console in production
- [ ] Rate limiting on API routes (use Vercel's built-in or upstash/ratelimit)

---

## PART 18 — DEVELOPMENT TIMELINE

| Day | Task |
|-----|------|
| 1 | Setup Next.js project, Clerk auth, Drizzle + Neon DB, deploy skeleton to Vercel |
| 2 | Database schema + migrations, landing page (basic), middleware |
| 3 | Client CRUD (API routes + UI pages) |
| 4 | Report builder UI (manual entry form + live preview) |
| 5 | Report data storage + chart components (Recharts) |
| 6 | Shareable public report page (`/r/[shareToken]`) |
| 7 | CSV upload + parsing |
| 8 | Lemon Squeezy payment integration + webhooks |
| 9 | Plan gating, upgrade prompts, PDF export |
| 10 | Error tracking (Sentry), analytics (PostHog), email (Resend) |
| 11 | White-label (Pro plan) — logo upload, brand colors |
| 12 | UI polish, mobile responsive, loading states |
| 13 | Testing + bug fixes |
| 14 | Deploy production, set env vars, final check |

---

## PART 19 — PHASE 2 FEATURES (After Validation)

Build these ONLY after you have paying users:

1. **Google Analytics 4 Integration** — OAuth → pull real GA4 data
2. **Meta Ads Integration** — Facebook Marketing API
3. **Google Search Console** — Pull keyword + impressions data
4. **Scheduled Reports** — Auto-generate + email report weekly/monthly (use Vercel Cron)
5. **AI Insights** — Auto-generate written summary from metrics (Claude API)
6. **Client Portal** — Clients get their own login to view all reports
7. **Team Collaboration** — Multiple users per workspace
8. **Report Templates** — Save and reuse report structures

---

## PART 20 — KNOWN CONSTRAINTS & GOTCHAS

1. **Vercel Serverless Timeout:** Functions have a 10-second timeout on the free/hobby plan. PDF generation can be slow for large reports. Consider using the `maxDuration` config or streaming response.

2. **Neon Cold Start:** First query after idle period may be slow (1–3s). Show loading states in UI.

3. **Clerk + Drizzle User Sync:** Clerk is the source of truth for authentication. Your DB `users` table is a local copy. Sync on first login using `ensureUserExists()` — don't use Clerk webhooks for this at MVP stage.

4. **CSV Mapping:** Users export CSV from different tools with different column names. Don't try to auto-map everything. Show a column mapping UI if auto-detection fails.

5. **Lemon Squeezy Webhook Delays:** Webhooks can arrive delayed (up to a few minutes). After payment, redirect user to dashboard with a "Your plan is being activated..." message and poll the API every 5 seconds for up to 60 seconds.

6. **White-Label PDF:** Brand colors in PDFs require explicit color injection into `@react-pdf/renderer` styles — CSS variables don't work in PDF rendering context.

---

*PRD Version 1.0 — Built for AI-assisted development with Claude Code / Cursor*
