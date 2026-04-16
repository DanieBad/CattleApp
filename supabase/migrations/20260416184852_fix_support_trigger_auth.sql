-- Migration: Support Request Trigger Auth Fix
-- Updated: 2026-04-16
-- Description: Updates the notification trigger to use a custom shared secret 
-- that is verified by the Edge Function, bypassing the need for a service role key in DB settings.

CREATE OR REPLACE FUNCTION public.handle_support_request_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  -- Shared secret string synchronized with the Edge Function
  DB_SECRET text := '7f5e8a3d-9b4c-4e8a-9f2d-6b1a2c3d4e5f';
  -- The target project reference ID
  project_ref text := 'hpddjhajklbgxcqgbvzc';
BEGIN
  -- We now use a custom secret header (x-support-db-secret) to authenticate the request
  -- This ensures it works on remote WITHOUT needing to set custom database settings.
  PERFORM
    net.http_post(
      url:='https://' || project_ref || '.supabase.co/functions/v1/send-support-request',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'x-support-db-secret', DB_SECRET
      ),
      body:=jsonb_build_object('record', row_to_json(NEW)),
      timeout_milliseconds:=5000
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- CRITICAL: We catch all exceptions to ensure the main record insertion NEVER fails
    RAISE WARNING 'Support request notification triggered but POST failed: %', SQLERRM;
    RETURN NEW;
END;
$function$;
