# ReportFlow - Service Setup Guide

## Overview

This guide walks you through setting up all external services required to deploy ReportFlow. Each service is free to start and only costs money when you have paid customers.

------------------------------------------------------------------------------

## 1. Clerk Authentication (clerk.com)

Clerk handles user sign-up, sign-in, and session management.

### Step 1.1: Create Clerk Account
1. Go to [clerk.com](https://clerk.com) and click **Sign up**
2. Use GitHub, Google, or email to create account
3. Verify your email if required

### Step 1.2: Create a New Application
1. Click **+ Add application**
2. Name it `ReportFlow`
3. Select **Base** for the package (free tier is sufficient)
4. Click **Create application**

### Step 1.3: Copy Your API Keys
1. In the Clerk dashboard, go to **API Keys** (left sidebar)
2. You'll see two keys:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

3. Copy the **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy the **Secret key** → `CLERK_SECRET_KEY`

### Step 1.4: Configure Redirect URLs
1. Go to **Redirects** (left sidebar)
2. Click **Add URL**
3. Add these URLs:
   ```
   http://localhost:3000/sign-in
   http://localhost:3000/sign-up
   http://localhost:3000/dashboard
   ```
4. For production later, add:
   ```
   https://your-app.vercel.app/sign-in
   https://your-app.vercel.app/sign-up
   https://your-app.vercel.app/dashboard
   ```

### Step 1.5: Update .env.local
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_real_key_here
CLERK_SECRET_KEY=sk_test_real_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

------------------------------------------------------------------------------

## 2. Neon Database (neon.tech)

Neon is a serverless PostgreSQL database. Free tier includes 0.5 GB storage and 3 branches.

### Step 2.1: Create Neon Account
1. Go to [neon.tech](https://neon.tech) and click **Sign up**
2. Sign up with GitHub (recommended) or email
3. Verify email if required

### Step 2.2: Create a New Project
1. Click **New Project** (green button)
2. Configure:
   - **Project name:** `reportflow-db`
   - **Region:** Choose closest to your users (e.g., `US East`)
   - **Database name:** `reportflow`
   - **Username:** `reportflow_user` (or keep default)
3. Click **Create Project**

### Step 2.3: Copy Connection String
1. You'll see a connection string immediately:
   ```
   postgresql://username:password@ep-xxx-abc123.us-east-2.aws.neon.tech/reportflow
   ```
2. Copy this to your `.env.local`:
   ```bash
   DATABASE_URL=postgresql://username:password@ep-xxx-abc123.us-east-2.aws.neon.tech/reportflow
   ```

### Step 2.4: Connection String Format
The connection string format is:
```
postgresql://[username]:[password]@[host]/[database]
```

Example:
```
DATABASE_URL=postgresql://alex:Abc123@ep-silent-pond-123456.us-east-2.aws.neon.tech/reportflow
```

> **Note:** The password contains special characters. In `.env.local`, keep it as-is. If issues occur, URL-encode special characters.

------------------------------------------------------------------------------

## 3. Lemon Squeezy (lemonsqueezy.com)

Lemon Squeezy handles subscription payments. Free tier has 0% transaction fees on first $50k revenue.

### Step 3.1: Create Lemon Squeezy Account
1. Go to [lemonsqueezy.com](https://lemonsqueezy.com) and click **Sign up**
2. Sign up with GitHub (recommended) or email
3. Complete the onboarding (store name, etc.)

### Step 3.2: Create Two Products

#### Create Starter Plan ($9/month)
1. Go to **Products** → **New Product**
2. Fill in:
   - **Name:** Starter Plan
   - **Description:** For growing agencies
   - **Price:** $9.00 USD / month
   - **Status:** Published
3. Click **Save**

#### Create Pro Plan ($29/month)
1. Go to **Products** → **New Product**
2. Fill in:
   - **Name:** Pro Plan
   - **Description:** For established agencies
   - **Price:** $29.00 USD / month
   - **Status:** Published
3. Click **Save**

### Step 3.3: Get API Key
1. Go to **Settings** → **API**
2. Copy the **API key**:
   ```
   LEMONSQUEEZY_API_KEY=abc123_def456_ghi789
   ```

### Step 3.4: Get Variant IDs
1. Go to **Products**
2. Click on **Starter Plan**
3. Look at the URL: `https://app.lemonsqueezy.com/products/1234-5678/edit`
   - The last part (`1234-5678`) is the **variant ID**
4. Copy it:
   ```
   LEMONSQUEEZY_VARIANT_STARTER=1234-5678
   ```
5. Repeat for **Pro Plan**

### Step 3.5: Get Webhook Secret
1. Go to **Settings** → **Webhooks**
2. Click **Add webhook**
3. In **Payload URL**, enter:
   ```
   https://your-app.vercel.app/api/webhooks/lemonsqueezy
   ```
4. For now, use localhost: `http://localhost:3000/api/webhooks/lemonsqueezy`
5. Select **Event subscriptions**:
   - ✅ subscription_created
   - ✅ subscription_updated
   - ✅ subscription_cancelled
   - ✅ subscription_expired
   - ✅ subscription_resumed
6. Click **Create webhook**
7. Copy the **Signing secret**:
   ```
   LEMONSQUEEZY_WEBHOOK_SECRET=abc123...
   ```

### Step 3.6: Get Store ID
1. Go to **Settings** → **Stores**
2. Click on your store
3. Look at the URL: `https://app.lemonsqueezy.com/settings/stores/1234`
4. Copy the store ID:
   ```
   LEMONSQUEEZY_STORE_ID=1234
   ```

### Step 3.7: Update .env.local
```bash
LEMON_SQUEEZY_API_KEY=abc123_def456_ghi789
LEMON_SQUEEZY_WEBHOOK_SECRET=your_signing_secret_here
LEMON_SQUEEZY_STORE_ID=1234
LEMON_SQUEEZY_VARIANT_STARTER=1234-5678
LEMON_SQUEEZY_VARIANT_PRO=9012-3456
```

------------------------------------------------------------------------------

## 4. Vercel Blob (Vercel Dashboard)

Vercel Blob stores client logos and uploaded files. Free tier includes 1 GB storage.

### Step 4.1: Prerequisites
- Vercel account (create at [vercel.com](https://vercel.com))
- Vercel CLI installed: `npm i -g vercel`

### Step 4.2: Create Blob Store
1. Go to [vercel.com](https://vercel.com)
2. Create a new project (or select existing)
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Blob** → **Continue**
6. Name it `reportflow-blob`
7. Click **Create**

### Step 4.3: Copy Blob Token
1. In the Blob store dashboard, click **Read/Write Token**
2. Click **Create Token**
3. Name it `reportflow-token`
4. Copy the token:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_abc123...
   ```

### Step 4.4: Update .env.local
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_abc123...
```

------------------------------------------------------------------------------

## 5. Optional: PostHog Analytics (app.posthog.com)

Track user behavior and feature usage.

### Step 5.1: Create Account
1. Go to [app.posthog.com](https://app.posthog.com)
2. Sign up with GitHub or email
3. Create a new project: `ReportFlow`

### Step 5.2: Get API Key
1. Go to **Project Settings** → **Integrations** → **API Keys**
2. Copy your **PostHog Project API Key**:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### Step 5.3: Update .env.local
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

------------------------------------------------------------------------------

## 6. Optional: Resend Email (resend.com)

Send transactional emails (welcome, upgrade confirmation).

### Step 6.1: Create Account
1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub
3. Verify your domain (or use their test domain)

### Step 6.2: Get API Key
1. Go to **API Keys**
2. Click **Create API Key**
3. Name it `reportflow-api`
4. Copy the key:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
   ```

### Step 6.3: Update .env.local
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

> **Note:** Resend gives you 3,000 free emails on their free tier.

------------------------------------------------------------------------------

## 7. Optional: Sentry (sentry.io)

Error tracking and monitoring.

### Step 7.1: Create Account
1. Go to [sentry.io](https://sentry.io)
2. Sign up with GitHub
3. Create a new project: **Next.js**

### Step 7.2: Get DSN
1. In project settings, go to **Client Keys (DSN)**
2. Copy the DSN:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

### Step 7.3: Get Auth Token
1. Go to **Settings** → **Auth Tokens**
2. Click **Create Token**
3. Name it `reportflow-sentry`
4. Select scopes: `project:write`, `org:read`
5. Copy the token:
   ```
   SENTRY_AUTH_TOKEN=sntrys_xxx...
   ```

### Step 7.4: Update .env.local
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx...
```

------------------------------------------------------------------------------

## Complete .env.local Template

After completing all steps above, your `.env.local` should look like:

```bash
# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon Database (REQUIRED)
DATABASE_URL=postgresql://username:password@host/database

# Lemon Squeezy Payments (REQUIRED)
LEMON_SQUEEZY_API_KEY=abc123_def456
LEMON_SQUEEZY_WEBHOOK_SECRET=xyz789
LEMON_SQUEEZY_STORE_ID=1234
LEMON_SQUEEZY_VARIANT_STARTER=5678-9012
LEMON_SQUEEZY_VARIANT_PRO=3456-7890

# Vercel Blob (REQUIRED for logo uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_abc123

# Resend Email (Optional)
RESEND_API_KEY=re_xxxxxxxxxxxx

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

------------------------------------------------------------------------------

## Deployment Checklist

### Before You Deploy

- [ ] All `REQUIRED` services configured
- [ ] Clerk redirect URLs updated with production URL
- [ ] Lemon Squeezy webhook updated with production URL
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL

### Deployment Steps

1. **Update middleware for production:**
   When real Clerk keys are in place, update `src/middleware.ts`:
   ```typescript
   import { authMiddleware } from "@clerk/nextjs";
   export default authMiddleware({
     publicRoutes: ["/", "/sign-in", "/sign-up", "/r"],
   });
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure environment variables"
   git push
   ```

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables in Vercel dashboard
   - Deploy

4. **Run Database Migration:**
   ```bash
   cd app
   pnpm db:push
   ```

5. **Test Endpoints:**
   - Sign up as new user
   - Create a client
   - Create a report
   - Test CSV upload
   - Test PDF generation
   - Test public report sharing

------------------------------------------------------------------------------

## Quick Summary: Where to Find Each Key

| Service | Key Name | Location |
|---------|----------|----------|
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Dashboard → API Keys |
| Clerk | `CLERK_SECRET_KEY` | Dashboard → API Keys |
| Neon | `DATABASE_URL` | Dashboard → Connection Details |
| Lemon Squeezy | `LEMON_SQUEEZY_API_KEY` | Settings → API |
| Lemon Squeezy | `LEMON_SQUEEZY_STORE_ID` | Settings → Stores |
| Lemon Squeezy | `LEMON_SQUEEZY_VARIANT_STARTER` | Product page URL |
| Lemon Squeezy | `LEMON_SQUEEZY_VARIANT_PRO` | Product page URL |
| Lemon Squeezy | `LEMON_SQUEEZY_WEBHOOK_SECRET` | Settings → Webhooks |
| Vercel Blob | `BLOB_READ_WRITE_TOKEN` | Storage → Your Blob → Tokens |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY` | Project Settings → API Keys |
| Resend | `RESEND_API_KEY` | Dashboard → API Keys |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` | Project Settings → Client Keys |
| Sentry | `SENTRY_AUTH_TOKEN` | Settings → Auth Tokens |

------------------------------------------------------------------------------

*Document Version: 1.0*
*Last Updated: 2026-05-08*