# Quick Start: Real-Time Countdown Setup

Get your server-side real-time countdown working in 5 minutes!

## Prerequisites

- Supabase project (free tier works!)
- Node.js 18+ installed
- Environment variables configured

## Step 1: Configure Environment Variables

Create a `.env.local` file:

```bash
cp env.example .env.local
```

**Required variables:**
```env
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # ⚠️ REQUIRED!
```

Get these from: **Supabase Dashboard → Settings → API**

## Step 2: Apply Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option B: Manual via Dashboard

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy and run `supabase/migrations/20241031000001_auto_update_trial_status.sql`
3. Copy and run `supabase/migrations/20241031000002_setup_cron_job.sql`

**Note:** pg_cron is only available on Supabase Pro+ plans. If you're on the free tier, skip the cron migration and see "Step 4: Setup Cron Alternative" below.

## Step 3: Enable Real-Time

In Supabase Dashboard:

1. Go to **Database → Replication**
2. Find the `trials` table
3. Toggle it **ON**
4. Click **Save**

Or run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE trials;
```

## Step 4: Setup Cron (Choose One Method)

### Method 1: pg_cron (Pro+ Plans)

Already done if you ran the migrations! ✅

Verify:
```sql
SELECT * FROM cron.job;
```

### Method 2: Vercel Cron (Free!)

If deploying to Vercel:

1. ✅ `vercel.json` is already configured
2. Add `CRON_SECRET` to Vercel environment variables:
   ```bash
   vercel env add CRON_SECRET
   # Paste a random secret: openssl rand -base64 32
   ```
3. Deploy to Vercel
4. Done! Vercel will call `/api/cron/update-trials` every 5 minutes

### Method 3: GitHub Actions (Free!)

1. ✅ `.github/workflows/update-trial-statuses.yml` is already configured
2. Add secrets to your GitHub repo:
   - Go to **Settings → Secrets and variables → Actions**
   - Add `SUPABASE_URL`
   - Add `SUPABASE_SERVICE_ROLE_KEY`
3. Enable GitHub Actions in your repo
4. Done! Runs automatically every 5 minutes

### Method 4: Supabase Edge Function + External Cron

Deploy the Edge Function:
```bash
supabase functions deploy update-trial-statuses
```

Then use any of these free services to trigger it every 5 minutes:
- [cron-job.org](https://cron-job.org) (Free, easy setup)
- [EasyCron](https://www.easycron.com) (Free tier available)
- [UptimeRobot](https://uptimerobot.com) (Monitor + cron in one)

URL to call:
```
POST https://your-project-ref.supabase.co/functions/v1/update-trial-statuses
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

## Step 5: Start Your App

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` - you should see:
- Demo countdown (if no trials exist)
- **OR** Real trial countdown (if trials exist in database)

## Step 6: Test It Out

### Create a Test Trial

1. Go to `/admin` in your app
2. Click "Add Trial"
3. Fill in trial details:
   - Service: "Netflix"
   - Email: "test@example.com"
   - Card Last 4: "4242"
   - Expiry Date: Tomorrow
   - Cost: $19.99
4. Submit

### Verify Real-Time Updates

1. Open homepage → Should show Netflix countdown with "Live Trial" badge
2. Open another browser tab → Same countdown
3. Edit the trial expiry date → Both tabs update automatically!
4. Status changes automatically as time passes

## Verification Checklist

- [ ] Migrations applied successfully
- [ ] Real-time enabled on `trials` table
- [ ] Environment variables configured (including `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Cron job configured (one of the 4 methods)
- [ ] App running and showing countdown
- [ ] Created test trial and it appears on homepage
- [ ] Real-time updates working (edit trial → homepage updates)

## Troubleshooting

### "No active trials found" on homepage

- Create a trial with expiry date in the future
- Check that trial status is "active" or "expiring" (not "expired")

### Countdown not updating

- Clear browser cache
- Check browser console for errors
- Verify real-time is enabled: Supabase Dashboard → Database → Replication

### Status not calculating correctly

Run this in SQL Editor:
```sql
-- Test status calculation
SELECT 
  service_name,
  expires_at,
  status,
  calculate_trial_status(expires_at, notify_days_before, status) as correct_status
FROM trials;

-- Force update all statuses
SELECT batch_update_trial_statuses();
```

### Cron not working

**pg_cron:**
```sql
-- Check if job exists
SELECT * FROM cron.job;

-- Check recent runs
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 5;
```

**Vercel/GitHub Actions:**
- Check logs in Vercel Dashboard or GitHub Actions tab
- Verify secrets are set correctly
- Test endpoint manually: `curl https://your-app.vercel.app/api/cron/update-trials`

### Real-time not connecting

1. Check Supabase logs: Dashboard → Logs
2. Verify WebSocket connection in browser DevTools → Network → WS
3. Check if replication is enabled: Database → Replication
4. Ensure no browser extensions are blocking WebSockets

## What's Next?

✅ **Your countdown is live!** Here's what happens automatically:

1. **Client-side**: Countdown ticks every second
2. **Server-side**: Status updates every 5 minutes via cron
3. **Real-time**: All clients sync when any trial changes
4. **Database**: Triggers ensure status is always accurate

### Optional Enhancements

- Add email notifications (see REALTIME_COUNTDOWN_SETUP.md)
- Customize countdown appearance in `src/app/page.tsx`
- Adjust cron frequency (default: 5 minutes)
- Add SMS alerts for critical trials
- Create admin dashboard for monitoring

## Need Help?

1. Check the comprehensive guide: `REALTIME_COUNTDOWN_SETUP.md`
2. Review Supabase logs in Dashboard
3. Test functions manually in SQL Editor
4. Check browser console for client errors

## Architecture Overview

```
┌─────────────────┐
│   Landing Page  │ ← useClosestTrial hook
│   (Countdown)   │ ← Real-time subscription
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  /api/trials/   │
│   closest       │ ← Fetches closest expiring trial
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│           Supabase                  │
│  ┌──────────────────────────────┐  │
│  │  trials table                │  │
│  │  + triggers (auto-update)    │  │
│  │  + indexes (fast queries)    │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  pg_cron / Edge Function     │  │
│  │  (batch updates every 5min)  │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Real-time (WebSocket)       │  │
│  │  (instant sync on changes)   │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Key Components:**

1. **Database Triggers**: Auto-update status on every write
2. **Scheduled Updates**: Keep status fresh every 5 minutes
3. **Real-time Subscriptions**: Sync all clients instantly
4. **API Endpoint**: Serve countdown data to landing page
5. **React Hook**: Manage data fetching and subscriptions

## Success! 🎉

Your trial manager now has **server-side real-time countdown** that works even when users are offline!

- ✅ Accurate countdowns based on database time
- ✅ Automatic status updates
- ✅ Real-time synchronization across clients
- ✅ Works 24/7 without user interaction

