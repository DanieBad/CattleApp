-- Enable the net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to handle the trigger and call the Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url:='https://hpddjhajklbgxcqgbvzc.supabase.co/functions/v1/send-waitlist-email',
      headers:=jsonb_build_object('Content-Type', 'application/json'),
      body:=jsonb_build_object('record', row_to_json(NEW)),
      timeout_milliseconds:=5000
    );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If the network request fails, we still want the insert to succeed.
    -- Log the error but do not block the row insertion.
    RAISE NOTICE 'Failed to call email edge function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The actual trigger
DROP TRIGGER IF EXISTS on_waitlist_signup ON public.waitlist;
CREATE TRIGGER on_waitlist_signup
AFTER INSERT ON public.waitlist
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_waitlist_signup();
