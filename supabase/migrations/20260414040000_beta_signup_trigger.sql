-- Migration: Add Beta Welcome Email Trigger for new users
-- Created at: 2026-04-14

-- 1. Function to handle the trigger and call the "send-beta-welcome-email" Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_user_beta_welcome()
RETURNS TRIGGER AS $$
BEGIN
  -- We use pg_net to call the Edge Function asynchronously
  PERFORM
    net.http_post(
      url:='https://hpddjhajklbgxcqgbvzc.supabase.co/functions/v1/send-beta-welcome-email',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', (SELECT 'Bearer ' || value FROM (SELECT setting as value FROM pg_settings WHERE name = 'app.settings.service_role_key' UNION ALL SELECT '' LIMIT 1) s WHERE value <> '' LIMIT 1) -- Optional: add auth if needed
      ),
      body:=jsonb_build_object('record', row_to_json(NEW)),
      timeout_milliseconds:=5000
    );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: Log notice but don't block user creation
    RAISE NOTICE 'Failed to call beta welcome email function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. The trigger on auth.users
-- Note: Must be AFTER INSERT to ensure the user record exists
DROP TRIGGER IF EXISTS on_auth_user_created_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_welcome
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_beta_welcome();
