-- Migration: Robust Welcome Trigger and Beta Trials
-- Created at: 2026-04-14

-- 1. Ensure pg_net is available
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Update provision_subscription to grant 180-day Beta trials to ALL plans
CREATE OR REPLACE FUNCTION public.provision_subscription(
  p_user_id UUID,
  p_plan_id TEXT DEFAULT 'basic'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status       TEXT;
  v_trial_ends   TIMESTAMPTZ;
BEGIN
  -- Guard: ensure plan exists
  IF NOT EXISTS (SELECT 1 FROM public.plan_definitions WHERE id = p_plan_id) THEN
    RAISE EXCEPTION 'invalid_plan_id: Plan "%" does not exist.', p_plan_id;
  END IF;

  -- BETA MODE: All plans get a 180-day free trial during Beta
  v_status     := 'trialing';
  v_trial_ends := NOW() + INTERVAL '180 days';

  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    trial_ends_at,
    activated_at
  )
  VALUES (
    p_user_id,
    p_plan_id,
    v_status,
    v_trial_ends,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET 
    plan_id = EXCLUDED.plan_id,
    status = EXCLUDED.status,
    trial_ends_at = EXCLUDED.trial_ends_at,
    updated_at = NOW();
END;
$$;

-- 3. Robustify handle_new_user_beta_welcome trigger
-- Ensure automation failures don't block user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_beta_welcome()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    PERFORM
      net.http_post(
        url:='https://hpddjhajklbgxcqgbvzc.supabase.co/functions/v1/send-beta-welcome-email',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:=jsonb_build_object('record', row_to_json(NEW)),
        timeout_ms:=5000
      );
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: log the error to a notice but don't fail the transaction
    RAISE WARNING 'Welcome email trigger failed: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
