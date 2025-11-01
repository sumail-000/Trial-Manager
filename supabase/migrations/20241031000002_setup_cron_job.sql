-- Migration: Setup pg_cron to automatically update trial statuses
-- This ensures trials are always up-to-date server-side

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Remove existing job if it exists
SELECT cron.unschedule('update-trial-statuses-job');

-- Schedule the batch update function to run every 5 minutes
-- This ensures trial statuses are always current
SELECT cron.schedule(
  'update-trial-statuses-job',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT batch_update_trial_statuses();
  $$
);

-- Alternative: Run every hour (less frequent, more efficient)
-- SELECT cron.schedule(
--   'update-trial-statuses-job',
--   '0 * * * *', -- Every hour at minute 0
--   $$
--   SELECT batch_update_trial_statuses();
--   $$
-- );

-- Alternative: Run every 15 minutes (balanced approach)
-- SELECT cron.schedule(
--   'update-trial-statuses-job',
--   '*/15 * * * *', -- Every 15 minutes
--   $$
--   SELECT batch_update_trial_statuses();
--   $$
-- );

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- Add comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - used to auto-update trial statuses';

