-- Add status column to waitlist
BEGIN;

ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Drop function if exists to avoid signature mismatch
DROP FUNCTION IF EXISTS get_admin_waitlist();

-- Re-create function with the new column
CREATE OR REPLACE FUNCTION get_admin_waitlist()
RETURNS TABLE (
  id UUID,
  email TEXT,
  primary_focus TEXT,
  herd_size TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.email, w.primary_focus, w.herd_size, w.status, w.created_at
  FROM public.waitlist w
  ORDER BY w.created_at DESC;
END;
$$;

COMMIT;
