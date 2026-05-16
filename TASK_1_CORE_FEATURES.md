# TASK 1 — Core Workflow Features
### Assigned to: Agent 1
### Priority: 🟠 P1 (High Impact)
### Reference: `ReportFlow_Production_Readiness_Report.md` — Section 5 (Features 1, 3, 8)

---

## Overview

This task covers the three features that most directly improve user activation and retention by removing friction from the core report workflow. These features require NO new external services (no Resend, no AI API keys) — they are purely backend logic + frontend UI.

---

## Task Checklist

- [ ] **Feature 1: Duplicate Report ("Copy for Next Month")**
- [ ] **Feature 3: Report Templates (4 Built-In)**
- [ ] **Feature 8: Annual Pricing Toggle on Upgrade Page**

---

## FEATURE 1 — Duplicate Report

### What to Build
A "Duplicate" action on each report card that clones a report for the next period — same client, same structure, values cleared to zero, dates advanced by 1 month, title auto-incremented.

### Files to Create
- `app/src/app/api/reports/[id]/duplicate/route.ts` — POST route to clone a report

### Files to Modify
- `app/src/components/reports/ReportCard.tsx` — Add three-dot (⋯) dropdown menu with Edit / Duplicate / Delete options
- `app/src/lib/plans.ts` — Ensure `maxReports` limit is checked before duplicating

### Implementation Details

#### API Route (`app/api/reports/[id]/duplicate/route.ts`)
1. Authenticate user via Clerk `auth()`
2. Fetch original report, verify ownership (`userId` match)
3. Check plan limit — count user's total reports vs `maxReports`. If at limit, return `403` with `{ error: 'PLAN_LIMIT_REACHED' }`
4. Clone the report with:
   - New `id` (nanoid)
   - New `shareToken` (nanoid(10))
   - `title` — auto-incremented using `incrementReportTitle()` (see logic below)
   - `dateRangeStart` and `dateRangeEnd` — advanced by 1 month (`addMonths` from `date-fns`)
   - `metricsData` — same structure but all numeric values zeroed, custom metric values cleared
   - `status: 'draft'`
   - `isPublic: false`
5. Return `201` with the new report

#### Title Auto-Increment Logic
```typescript
function incrementReportTitle(title: string): string {
  // Q1 2026 → Q2 2026, Q4 2026 → Q1 2027
  const quarterMatch = title.match(/^Q([1-4])\s+(\d{4})/);
  if (quarterMatch) {
    let q = parseInt(quarterMatch[1]);
    let y = parseInt(quarterMatch[2]);
    if (q === 4) { q = 1; y++; } else { q++; }
    return title.replace(/^Q[1-4]\s+\d{4}/, `Q${q} ${y}`);
  }
  // January 2026 → February 2026, December 2026 → January 2027
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
  return title + ' (Copy)';
}
```

#### Metric Value Clearing Function
```typescript
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

#### Frontend — Report Card Dropdown
- Use shadcn/ui `DropdownMenu` component
- Three-dot icon in top-right of each report card
- Options: Edit (navigates to edit page), Duplicate (calls API + redirects), Delete (existing behavior)
- Show loading spinner on Duplicate click
- On success: redirect to `/reports/[newId]/edit` and show toast "Report duplicated! Enter the new period's data."
- On 403 (plan limit): show upgrade modal

### Edge Cases
- Report with no metrics data — should still duplicate with empty structure
- Title with no recognizable date pattern — append " (Copy)"
- User at plan limit — must block server-side, not just client-side

---

## FEATURE 3 — Report Templates (4 Built-In)

### What to Build
A template selection screen (Step 0) before the report builder. Four templates: General, SEO, Paid Ads, Social Media. Each pre-fills the metrics form with relevant field labels and custom KPIs.

### Files to Create
- `app/src/lib/templates.ts` — Static template definitions (4 templates)
- `app/src/app/(dashboard)/reports/new/page.tsx` — Template selection page (if not already this route, adapt accordingly)

### Files to Modify
- Report builder page/component — Read `?template=` query param and apply template on load
- Any "New Report" buttons across the app — Ensure they link to template selection page first

### Implementation Details

#### Template Definitions (`lib/templates.ts`)
Define 4 template objects as a static constant `REPORT_TEMPLATES`:
1. **General Marketing Report** (📈) — Blank starter with basic traffic/conversion fields
2. **SEO Report** (🔍) — Organic traffic, keyword rankings, domain authority, backlinks, pages indexed
3. **Paid Ads Report** (💰) — Ad spend, ROAS, CTR, CPC, CPL, conversion rate, quality score
4. **Social Media Report** (📱) — Followers, growth, reach, engagement rate, posts published

Each template has: `id`, `name`, `description`, `icon`, and `metricsConfig` (which fields to show, pre-labeled custom KPIs, channel breakdown labels).

See full template definitions in Section 5, Feature 3 of `ReportFlow_Production_Readiness_Report.md` (lines 617–707).

#### Template Selection UI
- Page title: "Choose a Report Template"
- Subtitle: "Pick a template that matches your service. You can customize everything after."
- 2×2 grid of template cards, each showing icon, name, and description
- Click selects the card (blue border highlight)
- "Continue →" button navigates to the builder with `?template=[id]` param
- "Start from scratch" link bypasses and uses `general` template

#### Builder Integration
- On builder load, read `template` query param
- Call `applyTemplate(templateId)` to pre-fill form state with the template's `metricsConfig`
- Template choice is NOT stored in DB — it only pre-fills the form

### Plan Gating
ALL templates are available on ALL plans (including Free). Templates are a discovery/retention feature, not monetized.

### No Database Changes Required

---

## FEATURE 8 — Annual Pricing Toggle

### What to Build
A Monthly/Annual toggle switch on the `/upgrade` page that shows discounted annual prices with "Save 30%" messaging.

### Files to Modify
- `app/src/app/(dashboard)/upgrade/page.tsx` (or wherever the pricing page lives)

### Implementation Details
1. Add a toggle switch above pricing cards: `Monthly [toggle] Annual — Save 30% 🎉`
2. Default state: Annual (better for business)
3. When Annual is selected:
   - Starter: ~~$9/mo~~ → **$6.58/mo** (billed $79/yr)
   - Pro: ~~$29/mo~~ → **$20.75/mo** (billed $249/yr)
4. Show "billed annually" in small gray text below the main price
5. Checkout button must link to the correct Dodo Payments variant based on toggle state

```tsx
const [isAnnual, setIsAnnual] = useState(true);

const pricing = {
  starter: { monthly: 9, annual: 79, monthlyFromAnnual: 6.58 },
  pro: { monthly: 29, annual: 249, monthlyFromAnnual: 20.75 },
};

// In checkout handler:
const variantId = isAnnual
  ? process.env.NEXT_PUBLIC_DODO_VARIANT_STARTER_ANNUAL
  : process.env.NEXT_PUBLIC_DODO_VARIANT_STARTER_MONTHLY;
```

### Environment Variables Needed
```
NEXT_PUBLIC_DODO_VARIANT_STARTER_ANNUAL=<variant_id>
NEXT_PUBLIC_DODO_VARIANT_STARTER_MONTHLY=<variant_id>
NEXT_PUBLIC_DODO_VARIANT_PRO_ANNUAL=<variant_id>
NEXT_PUBLIC_DODO_VARIANT_PRO_MONTHLY=<variant_id>
```

### No Database Changes Required
This is purely a frontend change.

---

## Verification Plan
1. **Duplicate Report**: Create a report → Duplicate it → Verify new report has incremented title, advanced dates, same client, zeroed values, draft status
2. **Templates**: Click New Report → Verify template selection page appears → Pick SEO template → Verify builder has SEO-specific fields pre-filled
3. **Annual Toggle**: Visit /upgrade → Toggle between Monthly/Annual → Verify prices update correctly → Click checkout → Verify correct Dodo variant is used

---

## Dependencies
- `date-fns` (already installed)
- `nanoid` (already installed)
- shadcn/ui `DropdownMenu` component (may need to install if not already present)

---

*Reference the full spec in `ReportFlow_Production_Readiness_Report.md` for any additional detail.*
