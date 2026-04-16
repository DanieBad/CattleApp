-- Migration: Robust Support Request Trigger
-- This migration updates the trigger function to handle missing settings and edge cases gracefully.

-- 1. Redefine the function with better error handling and configuration check
CREATE OR REPLACE FUNCTION public.handle_support_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key text;
  -- The target project reference ID for the online version
  -- In local development, you should set app.settings.service_role_key in your DB
  project_ref text := 'hpddjhajklbgxcqgbvzc';
BEGIN
  -- 1. Attempt to get the service role key from the database settings.
  -- Pro-tip: You can set this with: 
  -- docker exec -it supabase_db_CattleApp psql -U postgres -c "ALTER DATABASE postgres SET \"app.settings.service_role_key\" = 'your-key';"
  SELECT setting INTO service_role_key 
  FROM pg_settings 
  WHERE name = 'app.settings.service_role_key'
  UNION ALL SELECT '' LIMIT 1;

  -- 2. Only attempt to notify if we have a service role key configured.
  -- This prevents errors in local development where the key might not be set.
  IF service_role_key IS NOT NULL AND service_role_key <> '' THEN
    PERFORM
      net.http_post(
        url:='https://' || project_ref || '.supabase.co/functions/v1/send-support-request',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body:=jsonb_build_object('record', row_to_json(NEW)),
        timeout_milliseconds:=5000
      );
  ELSE
    -- Log a notice that we're skipping the email notification part.
    -- This won't block the actual record insertion.
    RAISE NOTICE 'Support notification skipped: app.settings.service_role_key is not set.';
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- CRITICAL: We catch all exceptions to ensure the main record insertion NEVER fails
    -- even if the notification system (pg_net/Edge Functions) has an issue.
    RAISE WARNING 'Support request notification failed but record was saved: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
