-- Update handle_new_user_beta_welcome to use correct pg_net arguments
-- The primary fix is renaming timeout_ms to timeout_milliseconds for pg_net v0.2
CREATE OR REPLACE FUNCTION public.handle_new_user_beta_welcome()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    PERFORM
      net.http_post(
        url:='https://hpddjhajklbgxcqgbvzc.supabase.co/functions/v1/send-beta-welcome-email',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:=jsonb_build_object('record', row_to_json(NEW)),
        timeout_milliseconds:=5000
      );
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: log the error to a notice but don't fail the transaction
    RAISE WARNING 'Welcome email trigger failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Admin function to delete a user (useful for resetting test accounts)
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Admin-only guard
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'djb.rsa@gmail.com' THEN
    RAISE EXCEPTION 'access_denied: Admin only';
  END IF;

  -- Deleting from auth.users will cascade to profiles (if setup) 
  -- and we should have RLS or triggers to cleanup other tables.
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
