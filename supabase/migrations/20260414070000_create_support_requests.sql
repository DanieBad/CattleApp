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

-- 4. Function to call the Edge Function
CREATE OR REPLACE FUNCTION public.handle_support_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url:='https://hpddjhajklbgxcqgbvzc.supabase.co/functions/v1/send-support-request',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', (SELECT 'Bearer ' || value FROM (SELECT setting as value FROM pg_settings WHERE name = 'app.settings.service_role_key' UNION ALL SELECT '' LIMIT 1) s WHERE value <> '' LIMIT 1)
      ),
      body:=jsonb_build_object('record', row_to_json(NEW)),
      timeout_milliseconds:=5000
    );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to call support request email function: %', SQLERRM;
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
