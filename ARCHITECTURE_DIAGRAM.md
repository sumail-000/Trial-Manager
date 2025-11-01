# Real-Time Countdown Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐                    ┌─────────────────────┐       │
│  │  Landing Page    │                    │  Dashboard/Admin    │       │
│  │  (page.tsx)      │                    │                     │       │
│  └────────┬─────────┘                    └──────────┬──────────┘       │
│           │                                          │                   │
│           │ useClosestTrial()                       │ useTrials()       │
│           │                                          │                   │
│  ┌────────▼──────────────────────────────────────────▼──────────┐      │
│  │              React Hooks + Real-Time                          │      │
│  │  • useClosestTrial - Fetches closest trial                   │      │
│  │  • useCountdown - Client-side timer tick                     │      │
│  │  • Supabase Realtime - WebSocket subscription                │      │
│  └────────┬──────────────────────────────────────────┬──────────┘      │
│           │                                           │                  │
└───────────┼───────────────────────────────────────────┼──────────────────┘
            │                                           │
            │ HTTP/REST                                 │ WebSocket
            │                                           │
┌───────────▼───────────────────────────────────────────▼──────────────────┐
│                           API LAYER                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────┐   ┌──────────────────┐   ┌─────────────────┐ │
│  │ /api/trials/closest │   │ /api/trials      │   │ /api/cron/...   │ │
│  │ • Get closest trial │   │ • CRUD operations│   │ • Trigger cron  │ │
│  └──────────┬──────────┘   └────────┬─────────┘   └────────┬────────┘ │
│             │                       │                        │          │
│             └───────────────────────┼────────────────────────┘          │
│                                     │                                    │
└─────────────────────────────────────┼────────────────────────────────────┘
                                      │
                                      │ SQL Queries
                                      │
┌─────────────────────────────────────▼────────────────────────────────────┐
│                         DATABASE LAYER (Supabase)                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      trials TABLE                                 │  │
│  │  • id, service_name, email, card_last4                           │  │
│  │  • started_at, expires_at, status, cost                          │  │
│  │  • notify_days_before, category, notes                           │  │
│  └────────┬─────────────────────────────────────────────┬───────────┘  │
│           │                                              │               │
│           │ TRIGGER: trials_status_update_trigger        │               │
│           │ (runs on INSERT/UPDATE)                      │               │
│           │                                              │               │
│  ┌────────▼──────────────────────────────┐   ┌──────────▼──────────┐   │
│  │  calculate_trial_status()             │   │  INDEXES             │   │
│  │  • Determines status from expiry      │   │  • status, expires   │   │
│  │  • active / expiring / expired        │   │  • user_id           │   │
│  └───────────────────────────────────────┘   └─────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              closest_expiring_trial VIEW                          │  │
│  │  • Pre-optimized query for closest trial                         │  │
│  │  • Includes seconds_until_expiry calculation                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           batch_update_trial_statuses()                           │  │
│  │  • Updates all trial statuses in one go                          │  │
│  │  • Called by cron jobs every 5 minutes                           │  │
│  └────────┬─────────────────────────────────────────────────────────┘  │
│           │                                                              │
│           │ Called by cron                                               │
│           │                                                              │
└───────────┼──────────────────────────────────────────────────────────────┘
            │
            │
┌───────────▼──────────────────────────────────────────────────────────────┐
│                      CRON/SCHEDULER LAYER                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Choose ONE of these options:                                            │
│                                                                           │
│  ┌────────────────────┐  ┌───────────────────┐  ┌──────────────────┐  │
│  │   pg_cron          │  │   Vercel Cron     │  │  GitHub Actions  │  │
│  │   (Pro+ only)      │  │   (Free)          │  │  (Free)          │  │
│  │                    │  │                   │  │                  │  │
│  │ • Native to PG     │  │ • Calls API       │  │ • Calls Edge Fn  │  │
│  │ • Runs SQL directly│  │   endpoint        │  │ • Workflow       │  │
│  │ • Most reliable    │  │ • Integrated      │  │ • Any host       │  │
│  └────────────────────┘  └───────────────────┘  └──────────────────┘  │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │   Edge Function + External Cron                                  │   │
│  │   (Free, most flexible)                                          │   │
│  │                                                                   │   │
│  │   • Deploy to Supabase Functions                                │   │
│  │   • Trigger from cron-job.org, EasyCron, etc.                   │   │
│  │   • Works with any setup                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ⏰ Runs every 5 minutes to keep all statuses fresh                     │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Initial Page Load

```
User → Landing Page
         │
         ├─→ useClosestTrial()
         │     │
         │     ├─→ GET /api/trials/closest
         │     │     │
         │     │     ├─→ Supabase Query
         │     │     │     │
         │     │     │     ├─→ SELECT * FROM trials
         │     │     │     │    WHERE status IN ('active', 'expiring')
         │     │     │     │    ORDER BY expires_at ASC
         │     │     │     │    LIMIT 1
         │     │     │     │
         │     │     │     └─→ Calculate seconds_until_expiry
         │     │     │
         │     │     └─→ Return trial data
         │     │
         │     └─→ Setup WebSocket subscription
         │
         └─→ useCountdown(expiresAt)
               │
               └─→ Tick every second (client-side)
```

### 2. Real-Time Update Flow

```
User A edits trial → Admin panel
                       │
                       └─→ POST /api/trials/[id]
                             │
                             └─→ Supabase UPDATE trials
                                   │
                                   ├─→ TRIGGER fires
                                   │     │
                                   │     └─→ calculate_trial_status()
                                   │           │
                                   │           └─→ Update status field
                                   │
                                   └─→ Real-time broadcast
                                         │
                                         ├─→ User A's browser (WebSocket)
                                         │     │
                                         │     └─→ refetch /api/trials/closest
                                         │           │
                                         │           └─→ Update UI
                                         │
                                         ├─→ User B's browser (WebSocket)
                                         │     │
                                         │     └─→ refetch /api/trials/closest
                                         │           │
                                         │           └─→ Update UI
                                         │
                                         └─→ ... all connected clients
```

### 3. Scheduled Update Flow (Every 5 minutes)

```
Cron Trigger
  │
  ├─→ [pg_cron]
  │     │
  │     └─→ SELECT batch_update_trial_statuses()
  │
  ├─→ [Vercel Cron]
  │     │
  │     └─→ GET /api/cron/update-trials
  │           │
  │           └─→ POST Supabase Edge Function
  │
  ├─→ [GitHub Actions]
  │     │
  │     └─→ POST Supabase Edge Function
  │
  └─→ [External Service]
        │
        └─→ POST Supabase Edge Function

Any of above →
  │
  └─→ batch_update_trial_statuses()
        │
        ├─→ UPDATE trials SET status = calculate_trial_status(...)
        │    WHERE status != calculated_status
        │
        └─→ Real-time broadcast for updated trials
              │
              └─→ All connected clients receive updates
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Components                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   src/app/page.tsx   │  Landing page
│   • useClosestTrial  │  Fetches closest trial
│   • useCountdown     │  Renders countdown
│   • TimerDisplay     │  Shows timer UI
└──────────┬───────────┘
           │
           │ imports
           │
┌──────────▼──────────────────────────────────┐
│  src/hooks/useClosestTrial.ts               │
│  • Fetches /api/trials/closest              │
│  • Subscribes to Supabase real-time         │
│  • Auto-refetch on changes                  │
│  • Fallback polling every 60s               │
└──────────┬──────────────────────────────────┘
           │
           │ uses
           │
┌──────────▼──────────────────────────────────┐
│  src/lib/supabase/client.ts                 │
│  • Browser Supabase client                  │
│  • Real-time WebSocket connection           │
└─────────────────────────────────────────────┘


┌──────────────────────────────────────────┐
│  src/components/ui/timer-display.tsx     │
│  • Visual countdown component            │
│  • Status colors (active/warning/critical)│
│  • Progress bar animation                │
└──────────────────────────────────────────┘
```

## Database Schema

```sql
┌─────────────────────────────────────────────────────────┐
│                     trials                              │
├─────────────────────────────────────────────────────────┤
│  id                 UUID PRIMARY KEY                    │
│  service_name       TEXT NOT NULL                       │
│  email              TEXT NOT NULL                       │
│  card_last4         TEXT NOT NULL                       │
│  started_at         TIMESTAMPTZ NOT NULL                │
│  expires_at         TIMESTAMPTZ NOT NULL                │
│  status             TEXT (active/expiring/expired/...)  │
│  cancel_url         TEXT                                │
│  notify_days_before INT DEFAULT 3                       │
│  category           TEXT NOT NULL                       │
│  cost               NUMERIC NOT NULL                    │
│  notes              TEXT                                │
│  alerts             JSONB                               │
│  created_at         TIMESTAMPTZ DEFAULT NOW()           │
│  updated_at         TIMESTAMPTZ DEFAULT NOW()           │
│  user_id            UUID                                │
└─────────────────────────────────────────────────────────┘
        │
        │ Triggers
        │
        ├─→ trials_status_update_trigger (BEFORE INSERT OR UPDATE)
        │     └─→ update_trial_status()
        │           └─→ calculate_trial_status()
        │
        │ Indexes
        │
        ├─→ idx_trials_status_expires ON (status, expires_at)
        └─→ idx_trials_user_id ON (user_id)
```

## Real-Time Subscription

```
┌─────────────────────────────────────────────────────────────┐
│              Supabase Real-Time Architecture                │
└─────────────────────────────────────────────────────────────┘

Client Browser
  │
  └─→ WebSocket Connection
        │
        ├─→ Subscribe to channel: "trials-changes"
        │     │
        │     └─→ Listen for: INSERT, UPDATE, DELETE
        │
        └─→ On event received:
              │
              ├─→ Payload contains changed row data
              │
              └─→ Trigger refetch:
                    │
                    └─→ GET /api/trials/closest
                          │
                          └─→ Update UI with new data

Event Types:
  • INSERT - New trial created
  • UPDATE - Trial modified (including status changes)
  • DELETE - Trial removed

Event Payload:
  {
    event: "UPDATE",
    schema: "public",
    table: "trials",
    old: { ... },      // Old row data
    new: { ... },      // New row data
    commit_timestamp: "2024-10-31T..."
  }
```

## Status State Machine

```
┌─────────────────────────────────────────────────────────┐
│              Trial Status State Machine                 │
└─────────────────────────────────────────────────────────┘

        [Trial Created]
               │
               ▼
         ┌──────────┐
         │  ACTIVE  │  (expires_at > now + notify_days_before)
         └────┬─────┘
              │
              │ Time passes or notify_days_before reached
              │
              ▼
        ┌───────────┐
        │ EXPIRING  │  (now + notify_days_before >= expires_at > now)
        └────┬──────┘
             │
             │ Time passes, expires_at reached
             │
             ▼
        ┌──────────┐
        │ EXPIRED  │  (expires_at <= now)
        └──────────┘

        [Any State]
             │
             │ User cancels manually
             │
             ▼
        ┌───────────┐
        │ CANCELLED │  (permanent, doesn't auto-update)
        └───────────┘

Status Calculation Logic:
  if status == 'cancelled':
    return 'cancelled'  // Never changes
  else if expires_at < now:
    return 'expired'
  else if days_until_expiry <= notify_days_before:
    return 'expiring'
  else:
    return 'active'
```

## Cron Execution Flow

```
┌──────────────────────────────────────────────────────────┐
│              Cron Job Execution (Every 5 min)            │
└──────────────────────────────────────────────────────────┘

Timer: */5 * * * * (Every 5 minutes)
  │
  └─→ Execute: batch_update_trial_statuses()
        │
        ├─→ FOR EACH trial WHERE status != 'cancelled':
        │     │
        │     ├─→ Calculate new status
        │     │     │
        │     │     └─→ calculate_trial_status(
        │     │           expires_at,
        │     │           notify_days_before,
        │     │           current_status
        │     │         )
        │     │
        │     ├─→ IF new_status != current_status:
        │     │     │
        │     │     ├─→ UPDATE trials SET status = new_status
        │     │     │
        │     │     └─→ Broadcast real-time event
        │     │           │
        │     │           └─→ All clients receive update
        │     │
        │     └─→ ELSE: Skip (no change needed)
        │
        └─→ Return: count of updated trials

Result:
  • All statuses accurate
  • Expired trials marked
  • Expiring trials flagged
  • Clients notified
```

## Security Flow

```
┌────────────────────────────────────────────────────────┐
│                  Security Layers                       │
└────────────────────────────────────────────────────────┘

1. API Endpoints
   │
   ├─→ /api/trials/closest (PUBLIC)
   │   └─→ No auth required
   │       └─→ Returns trials across all users
   │           (for landing page demo)
   │
   ├─→ /api/trials (AUTHENTICATED)
   │   └─→ Requires valid session
   │       └─→ Returns only user's trials
   │
   └─→ /api/cron/update-trials (PROTECTED)
       └─→ Requires CRON_SECRET header
           └─→ Bearer token authentication

2. Database Access
   │
   ├─→ Client queries (ANON_KEY)
   │   └─→ Read-only access
   │       └─→ RLS policies (if configured)
   │
   └─→ Server queries (SERVICE_ROLE_KEY)
       └─→ Full access (admin)
           └─→ Never exposed to client

3. Real-Time Subscriptions
   │
   └─→ Uses ANON_KEY
       └─→ Broadcasts all changes
           └─→ Clients filter own data

Environment Variables:
  • NEXT_PUBLIC_SUPABASE_URL - Public (in client bundle)
  • NEXT_PUBLIC_SUPABASE_ANON_KEY - Public (in client bundle)
  • SUPABASE_SERVICE_ROLE_KEY - PRIVATE (server only)
  • CRON_SECRET - PRIVATE (server only)
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   Deployment Options                         │
└──────────────────────────────────────────────────────────────┘

Option 1: Vercel + Supabase Pro
┌─────────────┐
│   Vercel    │  Hosting
│   • Web app │  → vercel.json configures cron
│   • API     │  → Calls /api/cron/update-trials every 5min
│   • Cron    │
└──────┬──────┘
       │
       └─→ Supabase Pro
             │ Database
             │ Real-time
             └ pg_cron

Option 2: Any Host + Supabase Free + GitHub Actions
┌─────────────┐
│  Any Host   │  Netlify, Cloudflare, etc.
│   • Web app │
│   • API     │
└─────────────┘
       │
       ├─→ Supabase Free
       │     │ Database
       │     │ Real-time
       │     └ Edge Functions
       │
       └─→ GitHub Actions
             └ Runs every 5min
               └ Calls Edge Function

Option 3: Self-Hosted + Supabase
┌─────────────┐
│  Your VPS   │
│   • Next.js │
│   • Nginx   │
└──────┬──────┘
       │
       └─→ Supabase (any plan)
             │ Database
             │ Real-time
             └ Custom cron (crontab)
```

This architecture ensures:
- ✅ Real-time countdown updates
- ✅ Server-side status management
- ✅ Scalability across multiple clients
- ✅ Reliability with multiple cron options
- ✅ Production-ready security
- ✅ Works 24/7 without user interaction

