-- Update provision_subscription to protect existing plan_id on conflict
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

  INSERT INTO public.subscriptions (user_id, plan_id, status, trial_ends_at, activated_at)
  VALUES (p_user_id, p_plan_id, v_status, v_trial_ends, NOW())
  ON CONFLICT (user_id) DO UPDATE 
  SET 
    -- Only update plan_id if it's currently null or if the caller explicitly provided a non-basic plan
    plan_id = CASE 
      WHEN subscriptions.plan_id IS NULL OR p_plan_id != 'basic' THEN EXCLUDED.plan_id 
      ELSE subscriptions.plan_id 
    END,
    status = CASE 
      WHEN status = 'trialing' AND p_plan_id = 'basic' THEN EXCLUDED.status
      ELSE subscriptions.status
    END,
    trial_ends_at = GREATEST(subscriptions.trial_ends_at, EXCLUDED.trial_ends_at),
    updated_at = NOW();
END;
$$;
