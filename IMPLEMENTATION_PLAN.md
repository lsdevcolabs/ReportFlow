# ReportFlow Implementation Plan
## Converting from Vite+React to Next.js 14 App Router

**Version:** 2.0
**Last Updated:** 2026-05-08
**PRD Reference:** ReportFlow_PRD.md
**Goal:** 100% PRD Compliance

---

## Overview

The current implementation uses Vite + React + wouter. The PRD requires Next.js 14 with App Router. This is a significant architectural change that requires:

1. **Migrating the entire frontend** from Vite to Next.js
2. **Implementing missing features** identified in PRD compliance report
3. **Setting up all required integrations** (Neon, Clerk, Lemon Squeezy, etc.)

---

## Phase 1: Project Setup ✅ COMPLETED

### 1.1 Next.js 14 Project ✅ COMPLETED
- Created Next.js 14 project with TypeScript
- Configured Tailwind CSS and PostCSS
- Set up shadcn/ui components (Button, Input, Card, Dialog, etc.)
- Created app router folder structure

### 1.2 Environment & Config ✅ COMPLETED
- Created .env.local template (all PRD-required env vars)
- Created .env.example for public variables
- Configured tsconfig.json paths (@/* alias)
- Created vercel.json for deployment config

---

## Phase 2: Database & Schema ✅ COMPLETED

### 2.1 Database Schema ✅ COMPLETED
- Created schema using nanoid() for IDs
- Added all required fields from PRD
- Set up foreign key relationships (users → clients → reports)
- Implemented lazy DB initialization (Proxy pattern)

### 2.2 Drizzle Configuration ✅ COMPLETED
- Configured drizzle.config.ts
- Set up npm scripts for migrations (db:generate, db:push, db:studio)

### 2.3 DB Helpers & Auth ✅ COMPLETED
- Created lib/db/index.ts (DB client)
- Created lib/auth.ts with ensureUserExists, getUserById, updateUserPlan
- Created lib/plans.ts with PLAN_LIMITS, PRICING

---

## Phase 3: Authentication ✅ COMPLETED

### 3.1 Clerk Setup ✅ COMPLETED
- Installed @clerk/nextjs v4.31.8 (Next.js 14 compatible)
- Created ClerkProvider in layout.tsx
- Created middleware.ts for route protection
- Protected all dashboard routes

### 3.2 Auth Pages ✅ COMPLETED
- Created (auth)/sign-in/page.tsx
- Created (auth)/sign-up/page.tsx

---

## Phase 4: Core UI Pages ✅ COMPLETED

### 4.1 Dashboard Layout ✅ COMPLETED
- Created (dashboard)/layout.tsx with sidebar
- Created Sidebar component in components/layout/sidebar.tsx
- Created Header component (placeholder)
- Navigation links: Dashboard, Clients, Reports, Settings, Upgrade

### 4.2 Landing Page ✅ COMPLETED
- Created app/page.tsx with hero, features, pricing
- Added CTA section
- Added "How It Works" section

### 4.3 Main Dashboard ✅ COMPLETED
- Stats cards: Total Clients, Total Reports, Reports This Month, Shared Reports
- "New Report" button
- Getting Started guide

### 4.4 Settings Page ✅ COMPLETED
- Account Profile section
- Billing & Plan section with upgrade buttons
- Agency Profile section
- White-labeling section with color picker

### 4.5 Upgrade Page ✅ COMPLETED
- 3-tier pricing table (Free/Starter/Pro)
- FAQ section
- Checkout button handlers with API integration

---

## Phase 5: Clients Module ✅ COMPLETED

### 5.1 Clients List ✅ COMPLETED
- Created (dashboard)/clients/page.tsx (server component)
- Created clients-client.tsx (client component)
- Search functionality
- Client cards with brand color, industry, email
- "Add Client" button with plan limit check
- PlanLimitBadge component

### 5.2 Client Detail ✅ COMPLETED
- Client information display
- Brand settings (color, logo)
- Reports list with publish status
- Edit/Delete actions with API

### 5.3 Client Form ✅ COMPLETED
- Created components/clients/client-form.tsx
- Fields: name, email, website, industry
- Brand color picker
- Logo upload area (uses upload-logo API)

### 5.4 Clients API ✅ COMPLETED
- GET /api/clients - List user's clients (auth-protected)
- POST /api/clients - Create client (with plan limit check)
- GET /api/clients/[id] - Get single client
- PUT /api/clients/[id] - Update client
- DELETE /api/clients/[id] - Delete client
- Lazy DB initialization to avoid build-time errors

---

## Phase 6: Reports Module ✅ COMPLETED

### 6.1 Reports List ✅ COMPLETED
- Created (dashboard)/reports/page.tsx (server component)
- Created reports-client.tsx (client component)
- Search and status filter (all/published/draft)
- Report cards grid with brand colors

### 6.2 Report Builder ✅ COMPLETED
- Created (dashboard)/reports/new/page.tsx with Suspense
- Client selection dropdown
- Date range picker
- Manual metrics entry (tabs for different metric types)
- Live preview panel
- Publish/share toggle

### 6.3 Report Detail ✅ COMPLETED
- Created (dashboard)/reports/[id]/page.tsx
- KPI cards with charts (Recharts)
- Publish/unpublish toggle with API
- PDF download button with API
- Copy share link functionality
- Delete with AlertDialog

### 6.4 Reports API ✅ COMPLETED
- GET /api/reports - List user's reports
- POST /api/reports - Create report (with plan limit check)
- GET /api/reports/[id] - Get report with client info
- PUT /api/reports/[id] - Update report
- DELETE /api/reports/[id] - Delete report
- nanoid() shareToken on create

---

## Phase 7: Public Report View ✅ COMPLETED

### 7.1 Public Page Route ✅ COMPLETED
- Created app/r/[shareToken]/page.tsx
- No authentication required
- Checks isPublic flag before rendering
- Loading and error states

### 7.2 Public Report Component ✅ COMPLETED
- ReportHeader (logo, client name, dates)
- KPISection (sessions, conversions, revenue)
- ChartSection (channel breakdown, weekly trend)
- Custom Metrics section
- Notes section
- ReportFlow footer with CTA

### 7.3 Charts ✅ COMPLETED
- BarChart for channel breakdown (Recharts)
- Weekly trend chart
- Brand colors from client settings

### 7.4 Public Reports API ✅ COMPLETED
- GET /api/reports/public/[shareToken] - Returns report if isPublic=true

---

## Phase 8: CSV & Upload Features ✅ COMPLETED

### 8.1 CSV Upload ✅ COMPLETED
- POST /api/upload route
- Papa Parse CSV parsing
- Maps to metricsData structure (summary, channels, weekly, custom)
- Handles summary rows, channel breakdowns, weekly trends

### 8.2 Logo Upload ✅ COMPLETED
- POST /api/upload-logo route
- @vercel/blob for storage
- Validates image type (png/jpg/webp)
- 2MB max size enforcement
- Returns URL and updates client record

---

## Phase 9: PDF Generation ✅ COMPLETED

### 9.1 PDF Endpoint ✅ COMPLETED
- POST /api/reports/[id]/pdf route
- @react-pdf/renderer for PDF generation
- ReportPDFDocument component
- Client brand colors embedded
- PDF as binary response

### 9.2 PDF Features ✅ COMPLETED
- KPIs section (sessions, conversions, revenue)
- Channel breakdown table
- Custom metrics grid
- Notes with styled box
- Header/footer
- Plan-gated to Starter/Pro only

---

## Phase 10: Payments & Webhooks ✅ COMPLETED

### 10.1 Lemon Squeezy Setup ✅ COMPLETED
- lib/lemon.ts helpers
- createCheckoutUrl function
- Variant IDs from environment variables

### 10.2 Webhook Handler ✅ COMPLETED
- POST /api/webhooks/lemonsqueezy route
- HMAC signature verification
- Handles: subscription_created, subscription_updated
- Handles: subscription_cancelled, subscription_expired, subscription_resumed
- Updates user plan in database

### 10.3 Checkout Flow ✅ COMPLETED
- POST /api/checkout route
- Upgrade buttons in upgrade-client.tsx
- Checkout redirect to Lemon Squeezy
- custom_data with user_id for webhook correlation

---

## Phase 11: Plan Limits & Gating ✅ COMPLETED

### 11.1 Plan Limits ✅ COMPLETED
- lib/plans.ts with PLAN_LIMITS (free/starter/pro)
- lib/plan-limits.ts with check functions
- canPerformAction, getMaxClients, getMaxReports
- PRICING defined

### 11.2 Server-Side Gating ✅ COMPLETED
- Client creation gated in POST /api/clients
- Report creation gated in POST /api/reports
- PDF export gated in POST /api/reports/[id]/pdf
- Returns 403 with upgradeUrl when limit exceeded

### 11.3 Client-Side Gating ✅ COMPLETED
- components/ui/upgrade-prompt.tsx
- UpgradePrompt component with Dialog
- PlanLimitBadge component
- FeatureGate component
- Shows modal on limit hit

---

## Phase 12: Integrations ✅ COMPLETED

### 12.1 Resend Email ✅ COMPLETED
- lib/email.ts with sendEmail, sendWelcomeEmail, sendUpgradeConfirmation
- Resend SDK installed

### 12.2 PostHog Analytics ✅ COMPLETED
- lib/analytics.ts with PostHog client
- trackEvent, trackPageView
- trackUserSignedUp, trackClientCreated, trackReportCreated
- trackReportShared, trackPlanUpgraded, trackPdfExported

### 12.3 Sentry Error Tracking ✅ COMPLETED
- sentry.client.config.ts and sentry.server.config.ts
- lib/sentry.ts with initialization
- withSentryConfig in next.config
- lib/instrumentation.ts for cleanup

---

## Phase 13: Testing & Deployment (Pending)

### 13.1 Testing
- [ ] Test all user flows
- [ ] Test plan limit enforcement
- [ ] Test public report sharing
- [ ] Test CSV upload parsing
- [ ] Test PDF generation

### 13.2 Deployment Prep
- [ ] Verify all env vars set
- [ ] Run production build (`cd app && pnpm build`)
- [ ] Test locally with production build

### 13.3 Production Deploy
- [ ] Deploy to Vercel
- [ ] Run database migrations (`pnpm db:push`)
- [ ] Test production endpoints

---

## Technical Notes

### ID Generation ✅ FIXED
- PRD specifies nanoid() for IDs
- Schema now uses `text("id").primaryKey().default(nanoid(10))`

### Metrics Data Structure ✅ FIXED
- PRD specifies metricsData JSON structure:
```json
{
  "summary": { "sessions": number, "conversions": number, "revenue": number, ... },
  "channelBreakdown": [{ "channel": string, "sessions": number, "percentage": number }],
  "weeklyTrend": [{ "week": string, "sessions": number, "conversions": number }],
  "customMetrics": [{ "label": string, "value": string, "change": string, "changeType": "positive"|"negative"|"neutral" }],
  "notes": string
}
```
- Implemented in report-pdf.tsx and public report page

### Payment Flow ✅ IMPLEMENTED
- PRD specifies Lemon Squeezy
- Full webhook flow implemented
- Plan upgrades/downgrades handled

---

## Dependencies Installed

```bash
# Core
next@14 react react-dom typescript

# Auth
@clerk/nextjs@4.31.8

# Database
drizzle-orm @neondatabase/serverless
drizzle-kit

# UI
tailwindcss @tailwindcss/postcss
@radix-ui/react-* (shadcn components)
recharts lucide-react

# Utilities
nanoid zod date-fns clsx tailwind-merge
papaparse @types/papaparse

# PDF
@react-pdf/renderer

# Storage
@vercel/blob

# Email
resend

# Analytics
posthog-node

# Error Tracking
@sentry/nextjs
```

---

## Environment Variables Required

```
# Database
DATABASE_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Payments (Lemon Squeezy)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_STARTER_VARIANT_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Error Tracking (Sentry)
SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Route Structure

```
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── (dashboard)/
│   ├── layout.tsx
│   ├── dashboard/
│   ├── clients/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── reports/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── settings/
│   └── upgrade/
├── r/[shareToken]/  (public)
├── api/
│   ├── clients/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── reports/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   ├── [id]/pdf/route.ts
│   │   └── public/[shareToken]/route.ts
│   ├── upload/
│   ├── upload-logo/
│   ├── checkout/
│   └── webhooks/lemonsqueezy/
├── layout.tsx
└── page.tsx  (landing)
```

---

## Completed Implementation Checklist

- [x] Initialize Next.js 14 project
- [x] Configure Drizzle ORM + Neon
- [x] Set up Clerk authentication
- [x] Create database schema
- [x] Build landing page
- [x] Build dashboard pages
- [x] Build clients CRUD
- [x] Build reports CRUD
- [x] Build report builder component
- [x] Build public report view
- [x] Implement CSV upload
- [x] Implement logo upload
- [x] Implement PDF generation
- [x] Implement Lemon Squeezy
- [x] Implement webhooks
- [x] Add Resend emails
- [x] Add PostHog analytics
- [x] Add Sentry error tracking
- [ ] Final testing & deployment (pending)

---

*End of Implementation Plan - Updated 2026-05-08*