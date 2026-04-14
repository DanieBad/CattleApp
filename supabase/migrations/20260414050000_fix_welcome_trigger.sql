-- Migration: Fix and Simplify Beta Welcome Trigger
-- Created at: 2026-04-14

-- 1. Update the function to be simpler (no Auth headers needed as verify_jwt = false)
CREATE OR REPLACE FUNCTION public.handle_new_user_beta_welcome()
RETURNS TRIGGER AS $$
BEGIN
  -- We use net.http_post to call our Edge Function.
  -- Since we set verify_jwt = false for this function, we don't need the complex 
  -- service_role_key retrieval which can fail in trigger contexts.
  PERFORM
    net.http_post(
      url:='https://hpddjhajklbgxcqgbvzc.supabase.co/functions/v1/send-beta-welcome-email',
      headers:='{"Content-Type": "application/json"}'::jsonb,
      body:=jsonb_build_object('record', row_to_json(NEW)),
      timeout_ms:=5000
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure trigger is attached (it should be already, but we redefine to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_beta_welcome();
