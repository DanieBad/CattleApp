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

  -- Only the Basic plan gets a 30-day free trial.
  -- Intermediate and Large go straight to 'active' (payment pending).
  IF p_plan_id = 'basic' THEN
    v_status     := 'trialing';
    v_trial_ends := NOW() + INTERVAL '30 days';
  ELSE
    v_status     := 'active';
    v_trial_ends := NOW();  -- No trial period
  END IF;

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
  ON CONFLICT (user_id) DO NOTHING;  -- Idempotent
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.provision_subscription(UUID, TEXT) TO authenticated;
