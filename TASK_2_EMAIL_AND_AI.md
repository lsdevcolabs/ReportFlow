# TASK 2 — Email Delivery & AI Summary
### Assigned to: Agent 2
### Priority: 🟠 P1 (Revenue-Driving Features)
### Reference: `ReportFlow_Production_Readiness_Report.md` — Section 5 (Features 2, 5)

---

## Overview

This task covers the two premium features that are gated behind Starter/Pro plans and are the primary drivers of paid upgrades. Both require external service integrations: **Resend** for email delivery and **Anthropic API** for AI-generated summaries. These features are revenue-critical and should feel polished and professional.

---

## Task Checklist

- [ ] **Feature 2: Send Report to Client via Email**
- [ ] **Feature 5: AI-Generated Executive Summary**
- [ ] **Update `lib/plans.ts` with new plan gates**

---

## FEATURE 2 — Send Report to Client via Email

### What to Build
A "Send to Client" button on the report detail page that opens a modal with pre-filled email fields (to, subject, message with key metrics). Sends a beautifully branded HTML email to the client via Resend with inline KPI numbers and a CTA button to view the full report.

### Files to Create
- `app/src/app/api/reports/[id]/send/route.ts` — POST route to send the email
- `app/src/components/emails/ReportEmail.tsx` — React Email template component

### Files to Modify
- `app/src/lib/db/schema.ts` — Add `lastSentAt` and `lastSentTo` columns to reports table
- `app/src/lib/plans.ts` — Add `emailDelivery` to plan limits
- Report detail page component — Add "Send to Client" button + modal
- Run a DB migration after schema change

### Database Changes
Add to `reports` table in `lib/db/schema.ts`:
```typescript
lastSentAt: timestamp('last_sent_at'),
lastSentTo: text('last_sent_to'), // email address it was last sent to
```

Run migration: `npx drizzle-kit generate` then `npx drizzle-kit push`

### API Route (`app/api/reports/[id]/send/route.ts`)

1. Authenticate via Clerk
2. Check plan gating — Free plan users get `403` with `{ error: 'PLAN_LIMIT_REACHED', upgradeUrl: '/upgrade' }`
3. Validate request body: `to` (email), `subject`, `message` — all required
4. Fetch report + client data, verify ownership
5. Verify report is published (`isPublic: true`), otherwise return `400` with `REPORT_NOT_PUBLISHED`
6. Build the share URL: `${NEXT_PUBLIC_APP_URL}/r/${report.shareToken}`
7. Determine `fromName`: if Pro plan + agency name → use agency name, else → "ReportFlow"
8. Send email via Resend using the React Email template
9. Update `lastSentAt` and `lastSentTo` in the DB
10. Return `{ success: true }`

### Email Template (`components/emails/ReportEmail.tsx`)

Install: `npm install @react-email/components`

Build using `@react-email/components`: `<Html>`, `<Body>`, `<Section>`, `<Row>`, `<Column>`, `<Text>`, `<Button>`, `<Img>`

**Email layout:**
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

**Rules:**
- All styles must be inline objects (no Tailwind in email templates)
- CTA button background = `client.brandColor` (default `#2563EB`)
- Pro plan + agency logo → use agency logo, not ReportFlow logo
- Pro plan → hide "Generated with ReportFlow" footer

### Frontend — Send Modal

On the report detail page:
1. **"Send to Client"** button appears in the action bar (next to PDF, Copy Link, View Public)
2. Button is **disabled with tooltip** if report is in `draft` status: "Publish the report first before sending"
3. On **Free plan**: clicking opens an upgrade prompt modal instead
4. Modal fields:
   - **To:** pre-filled with `client.email` (editable)
   - **Subject:** pre-filled with `"Your [Report Title] is ready"` (editable)
   - **Message:** pre-filled with template including client name, date range, key metrics, share link
5. "Send Report" button with loading state "Sending..."
6. On success: close modal, show toast "Report sent to [email]!"
7. On error: show error message inside modal, keep open
8. Below action bar, show: `Last sent: [relative time] to [email]` (if ever sent)

### Plan Gating
Add to `lib/plans.ts`:
```typescript
free: { emailDelivery: false, ... }
starter: { emailDelivery: true, ... }
pro: { emailDelivery: true, ... }
```

### Environment Variables Needed
```
RESEND_API_KEY=re_...
```
Resend must be configured with a verified domain (e.g., `reportflow.io`) so emails don't land in spam.

---

## FEATURE 5 — AI-Generated Executive Summary

### What to Build
A "✨ Generate with AI" button next to the Executive Summary textarea in the report builder. When clicked, it sends the report's metric data to Google Gemini and populates a professional 3-5 sentence summary in the textarea.

### Files to Create
- `app/src/app/api/reports/[id]/generate-summary/route.ts` — POST route that streams AI response

### Files to Modify
- `app/src/components/reports/ReportBuilder.tsx` — Add "Generate with AI" button + streaming handler
- `app/src/lib/plans.ts` — Add `aiSummary` to plan limits

### API Route (`app/api/reports/[id]/generate-summary/route.ts`)

Install: `npm install @google/generative-ai`

1. Authenticate via Clerk
2. Check plan gating — Free plan users get `403`
3. Fetch report + client data, verify ownership
4. Build the user message with ALL metric data (traffic, conversions, paid ads, custom KPIs)
5. Call Gemini (`gemini-2.0-flash-lite`) with 3-key rotation + fallback
6. Return JSON `{ summary: "..." }` — no streaming needed

### Frontend — JSON Response (no streaming)

```typescript
async function handleGenerateSummary() {
  setIsGenerating(true);
  setNotes(''); // Clear existing text

  const response = await fetch(`/api/reports/${reportId}/generate-summary`, { method: 'POST' });
  const data = await response.json();

  if (response.status === 403) {
    setShowUpgradePrompt(true);
    setIsGenerating(false);
    return;
  }

  if (response.status === 503 || !response.ok) {
    toast.error(data.message ?? 'AI generation failed. Please try again.');
    setIsGenerating(false);
    return;
  }

  if (data.summary) {
    setNotes(data.summary);
  }

  setIsGenerating(false);
}
```

**UI Details:**
- Button: "✨ Generate with AI" — small, secondary style (wand/sparkle icon, blue/purple text, not filled)
- Loading state: "Generating..." with spinner
- Textarea populated with full summary when ready
- User can freely edit the generated text after completion
- On Free plan: show inline upgrade prompt below textarea (NOT a modal)
  - Text: "AI Summary is available on Starter ($9/mo) and Pro ($29/mo) plans. [Upgrade →]"

### Plan Gating
Add to `lib/plans.ts`:
```typescript
free: { aiSummary: false, ... }
starter: { aiSummary: true, ... }
pro: { aiSummary: true, ... }
```

### Environment Variables Needed
```
GEMINI_API_KEY_1=your_key_1
GEMINI_API_KEY_2=your_key_2
GEMINI_API_KEY_3=your_key_3
```

---

## Combined Plan Gate Updates (`lib/plans.ts`)

Add both new capabilities to the `PLAN_LIMITS` object:

```typescript
export const PLAN_LIMITS = {
  free: {
    // ...existing limits...
    emailDelivery: false,
    aiSummary: false,
  },
  starter: {
    // ...existing limits...
    emailDelivery: true,
    aiSummary: true,
  },
  pro: {
    // ...existing limits...
    emailDelivery: true,
    aiSummary: true,
  },
};
```

Ensure `canPerformAction(plan, action)` function handles both new action types.

---

## Verification Plan
1. **Email Delivery**:
   - Test Free plan → should show upgrade modal
   - Test Starter/Pro → open modal, verify pre-filled fields
   - Send a test email → verify it arrives with branded HTML, inline KPIs, CTA button
   - Check DB → `lastSentAt` and `lastSentTo` updated
   - Test with draft report → should be blocked
2. **AI Summary**:
   - Test Free plan → should show inline upgrade prompt
   - Test Starter/Pro → click Generate → verify text populates textarea
   - Verify generated text uses actual numbers from the report
   - Verify text can be edited after generation

---

## Dependencies
- `resend` npm package
- `@react-email/components` npm package
- `@google/generative-ai` npm package
- `date-fns` (already installed)

---

*Reference the full spec in `ReportFlow_Production_Readiness_Report.md` Section 5, Features 2 & 5 for complete details.*
