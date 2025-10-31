-- Migration: Auto-update trial status based on expiry dates
-- This ensures status is always accurate server-side, even when users are inactive

-- Create a function to calculate status based on expiry date
CREATE OR REPLACE FUNCTION calculate_trial_status(
  expires_at_param TIMESTAMPTZ,
  notify_days_before_param INT,
  current_status_param TEXT
)
RETURNS TEXT AS $$
DECLARE
  days_until_expiry INT;
BEGIN
  -- If already cancelled, keep it cancelled
  IF current_status_param = 'cancelled' THEN
    RETURN 'cancelled';
  END IF;

  -- Calculate days until expiry
  days_until_expiry := EXTRACT(DAY FROM (expires_at_param - NOW()));

  -- Determine status based on days remaining
  IF days_until_expiry < 0 THEN
    RETURN 'expired';
  ELSIF days_until_expiry <= notify_days_before_param THEN
    RETURN 'expiring';
  ELSE
    RETURN 'active';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to update trial status before reading
CREATE OR REPLACE FUNCTION update_trial_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on current time and expiry
  NEW.status := calculate_trial_status(
    NEW.expires_at,
    NEW.notify_days_before,
    NEW.status
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update status on INSERT and UPDATE
DROP TRIGGER IF EXISTS trials_status_update_trigger ON trials;
CREATE TRIGGER trials_status_update_trigger
  BEFORE INSERT OR UPDATE ON trials
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_status();

-- Create a function to batch update all trial statuses
CREATE OR REPLACE FUNCTION batch_update_trial_statuses()
RETURNS void AS $$
BEGIN
  UPDATE trials
  SET status = calculate_trial_status(
    expires_at,
    notify_days_before,
    status
  ),
  updated_at = NOW()
  WHERE status != 'cancelled'
    AND status != calculate_trial_status(expires_at, notify_days_before, status);
END;
$$ LANGUAGE plpgsql;

-- Create a database view for getting closest expiring trial
CREATE OR REPLACE VIEW closest_expiring_trial AS
SELECT 
  id,
  service_name,
  email,
  card_last4,
  started_at,
  expires_at,
  status,
  cancel_url,
  notify_days_before,
  category,
  cost,
  notes,
  alerts,
  created_at,
  updated_at,
  user_id,
  EXTRACT(EPOCH FROM (expires_at - NOW())) as seconds_until_expiry
FROM trials
WHERE status IN ('active', 'expiring')
  AND expires_at > NOW()
ORDER BY expires_at ASC
LIMIT 1;

-- Create an index to optimize status queries
CREATE INDEX IF NOT EXISTS idx_trials_status_expires 
  ON trials(status, expires_at) 
  WHERE status IN ('active', 'expiring');

-- Create an index for user trials
CREATE INDEX IF NOT EXISTS idx_trials_user_id 
  ON trials(user_id);

-- Grant necessary permissions
GRANT SELECT ON closest_expiring_trial TO anon, authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION calculate_trial_status IS 'Calculates trial status based on expiry date and notify days';
COMMENT ON FUNCTION update_trial_status IS 'Trigger function to auto-update trial status on write';
COMMENT ON FUNCTION batch_update_trial_statuses IS 'Batch update all trial statuses (can be run via cron or Edge Function)';
COMMENT ON VIEW closest_expiring_trial IS 'Returns the trial closest to expiring across all users';

