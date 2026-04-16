-- Migration: Create support_requests table and trigger for email notifications
-- Created at: 2026-04-14

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.support_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
    type text NOT NULL CHECK (type IN ('Support', 'Bug', 'Feature')),
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'Open',
    priority text DEFAULT 'Medium',
    created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can insert their own requests"
ON public.support_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.support_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.support_requests FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'djb.rsa@gmail.com');

-- 4. Function to call the Edge Function with better error handling and configuration check
CREATE OR REPLACE FUNCTION public.handle_support_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key text;
  -- The target project reference ID for the online version
  project_ref text := 'hpddjhajklbgxcqgbvzc';
BEGIN
  -- 1. Attempt to get the service role key from the database settings.
  -- This allows us to avoid hardcoding the key in the function itself.
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
    -- This won't block the insert.
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

-- 5. The trigger
DROP TRIGGER IF EXISTS on_support_request_created ON public.support_requests;
CREATE TRIGGER on_support_request_created
AFTER INSERT ON public.support_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_support_request_notification();

-- 6. Permissions
GRANT ALL ON TABLE public.support_requests TO postgres;
GRANT ALL ON TABLE public.support_requests TO anon;
GRANT ALL ON TABLE public.support_requests TO authenticated;
GRANT ALL ON TABLE public.support_requests TO service_role;
