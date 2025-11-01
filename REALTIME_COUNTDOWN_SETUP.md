# Real-Time Server-Side Countdown Setup

This document explains how the real-time countdown system works and how to deploy it.

## Overview

The Trial Manager now features **server-side real-time countdown** that works even when users are inactive. The system automatically updates trial statuses and displays the closest expiring trial on the landing page.

## How It Works

### 1. Database-Level Status Management

**Location**: `supabase/migrations/20241031000001_auto_update_trial_status.sql`

- **Automatic Status Calculation**: Database function `calculate_trial_status()` determines trial status based on `expires_at` and `notify_days_before`
- **Trigger-Based Updates**: Every INSERT/UPDATE on the `trials` table automatically recalculates status
- **View for Closest Trial**: `closest_expiring_trial` view provides quick access to the soonest expiring trial
- **Optimized Indexes**: Indexes on `status` and `expires_at` for fast queries

### 2. Scheduled Status Updates

**Location**: `supabase/migrations/20241031000002_setup_cron_job.sql`

- Uses **pg_cron** extension to run batch updates every 5 minutes
- Ensures all trial statuses stay current without client interaction
- Can be adjusted to run hourly or every 15 minutes based on needs

**Alternative**: `supabase/functions/update-trial-statuses/index.ts`
- Edge Function that can be triggered by external cron services (e.g., GitHub Actions, Vercel Cron, Cloudflare Workers)
- Useful if pg_cron is not available in your Supabase plan

### 3. API Endpoint

**Location**: `src/app/api/trials/closest/route.ts`

- `GET /api/trials/closest` returns the trial closest to expiring
- Public endpoint (no auth required) for landing page
- Returns trial data with calculated `secondsUntilExpiry`

### 4. Real-Time Hook

**Location**: `src/hooks/useClosestTrial.ts`

- Custom React hook that fetches closest trial
- Subscribes to Supabase real-time changes on `trials` table
- Auto-refetches when any trial is created, updated, or deleted
- Fallback polling every 60 seconds to ensure freshness

### 5. Landing Page Integration

**Location**: `src/app/page.tsx`

- Displays real trial data when available
- Falls back to demo countdown if no trials exist
- Shows service name, cost, and time remaining
- Visual indicator for real vs. demo trials

## Deployment Steps

### Step 1: Apply Database Migrations

```bash
# If using Supabase CLI
supabase db push

# Or run migrations manually in Supabase Dashboard > SQL Editor
```

Run these migrations in order:
1. `20241031000001_auto_update_trial_status.sql` - Creates functions and triggers
2. `20241031000002_setup_cron_job.sql` - Sets up pg_cron scheduling

### Step 2: Enable pg_cron (if available)

pg_cron is available on:
- Supabase Pro plan and above
- Self-hosted Supabase instances

If pg_cron is not available, see "Alternative: Edge Function Cron" below.

### Step 3: Enable Real-Time on Trials Table

In Supabase Dashboard:
1. Go to **Database** > **Replication**
2. Enable replication for the `trials` table
3. Select all events: INSERT, UPDATE, DELETE

Or via SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE trials;
```

### Step 4: Deploy the Application

```bash
npm run build
npm run start
# or deploy to Vercel/Netlify
```

### Step 5: Verify Real-Time Functionality

1. Create a trial in your app
2. Check the landing page - it should show the trial countdown
3. Update the trial's expiry date
4. Landing page should update automatically within seconds

## Alternative: Edge Function Cron

If pg_cron is not available, deploy the Edge Function and trigger it externally:

### Deploy Edge Function

```bash
# Deploy the function
supabase functions deploy update-trial-statuses

# Set required secrets
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Setup External Cron

**Option A: Vercel Cron** (if deployed on Vercel)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/update-trials",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Create `src/app/api/cron/update-trials/route.ts`:
```typescript
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-trial-statuses`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  const data = await response.json();
  return Response.json(data);
}
```

**Option B: GitHub Actions**

Create `.github/workflows/update-trials.yml`:
```yaml
name: Update Trial Statuses
on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/update-trial-statuses" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

**Option C: External Cron Services**
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- Setup to call your Edge Function URL every 5 minutes

## How Status Updates Work

### Status Logic

```
if status == 'cancelled':
  return 'cancelled'
else if expires_at < now:
  return 'expired'
else if days_until_expiry <= notify_days_before:
  return 'expiring'
else:
  return 'active'
```

### Update Frequency

- **On Write**: Every INSERT/UPDATE triggers automatic recalculation
- **Scheduled**: Every 5 minutes via pg_cron or Edge Function
- **On Read**: Status is derived server-side, always accurate

## Real-Time Features

### What Updates in Real-Time?

1. **Landing Page Countdown**: Updates when any trial changes
2. **Trial Dashboard**: Shows current status for all trials
3. **Trial Details**: Individual trial status and countdown

### How Real-Time Works?

1. Client subscribes to `trials` table via Supabase Realtime
2. Any database change triggers WebSocket event
3. Client receives event and refetches data
4. UI updates automatically with new countdown/status

## Monitoring

### Check Cron Job Status

```sql
-- View scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### Monitor Trial Status Distribution

```sql
-- Count trials by status
SELECT status, COUNT(*) 
FROM trials 
GROUP BY status;

-- Find trials that need status update
SELECT id, service_name, expires_at, status
FROM trials
WHERE status != calculate_trial_status(expires_at, notify_days_before, status);
```

### Test Status Calculation

```sql
-- Test the status calculation function
SELECT 
  id,
  service_name,
  expires_at,
  status as current_status,
  calculate_trial_status(expires_at, notify_days_before, status) as calculated_status
FROM trials
WHERE status != 'cancelled'
LIMIT 10;
```

## Troubleshooting

### Landing Page Shows Demo Instead of Real Trial

**Check:**
1. Is there at least one active/expiring trial in the database?
2. Is the trial's `expires_at` in the future?
3. Check browser console for API errors
4. Verify `/api/trials/closest` returns data

### Trials Not Updating

**Check:**
1. Is pg_cron enabled? Run: `SELECT * FROM cron.job;`
2. Is real-time enabled on trials table?
3. Check Supabase Dashboard > Database > Replication
4. Look for errors in Supabase logs

### Real-Time Not Working

**Check:**
1. Real-time enabled in Supabase project settings
2. Replication enabled for `trials` table
3. No browser extensions blocking WebSockets
4. Check browser console for connection errors

### Status Not Calculating Correctly

**Check:**
1. Verify trigger is active: `\d+ trials` (in psql)
2. Test function manually: `SELECT batch_update_trial_statuses();`
3. Check for NULL values in `expires_at` or `notify_days_before`

## Performance Considerations

### Database Indexes

Indexes are automatically created by the migration:
- `idx_trials_status_expires` - for status + expiry queries
- `idx_trials_user_id` - for user-specific queries

### Cron Job Frequency

Adjust based on your needs:
- **Every 5 minutes**: Most accurate, slightly higher load
- **Every 15 minutes**: Balanced approach (recommended)
- **Every hour**: Minimal load, less accurate between runs

To change frequency, modify the cron schedule in the migration.

### Real-Time Connections

Each client creates one WebSocket connection for real-time updates. Supabase handles connection pooling automatically.

## Security Notes

1. **Public Closest Trial Endpoint**: The `/api/trials/closest` endpoint is public and shows trial data. If you need privacy, add authentication.
2. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
3. **RLS Policies**: Consider adding Row Level Security policies if needed

## Next Steps

1. Add email notifications when trials are about to expire
2. Create admin dashboard to monitor cron job status
3. Add analytics to track trial expiry patterns
4. Implement SMS notifications for critical trials
5. Add webhook support for external integrations

## Support

For issues or questions:
1. Check Supabase logs in Dashboard
2. Review this documentation
3. Test functions manually in SQL Editor
4. Check browser console for client-side errors

