-- Migration: Remove Waitlist Workflow
-- Created at: 2026-04-14

-- 1. Drop trigger if it exists (though table drop usually handles this)
DROP TRIGGER IF EXISTS on_waitlist_signup ON public.waitlist;

-- 2. Drop functions
DROP FUNCTION IF EXISTS public.get_admin_waitlist();
DROP FUNCTION IF EXISTS public.handle_new_waitlist_signup();

-- 3. Drop table
DROP TABLE IF EXISTS public.waitlist CASCADE;
