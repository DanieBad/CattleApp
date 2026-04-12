-- ============================================================
-- Admin RPC Functions
-- All functions are SECURITY DEFINER and enforce admin-only access
-- via auth.email() check before returning any data.
-- ============================================================

-- ── 1. Full admin overview: users + subscriptions + animal count ──────────
CREATE OR REPLACE FUNCTION public.get_admin_user_overview()
RETURNS TABLE (
  user_id         UUID,
  email           TEXT,
  display_name    TEXT,
  joined_at       TIMESTAMPTZ,
  last_sign_in    TIMESTAMPTZ,
  plan_id         TEXT,
  plan_name       TEXT,
  sub_status      TEXT,
  trial_ends_at   TIMESTAMPTZ,
  activated_at    TIMESTAMPTZ,
  animal_count    BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Admin-only guard
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'djb.rsa@gmail.com' THEN
    RAISE EXCEPTION 'access_denied: Admin only';
  END IF;

  RETURN QUERY
  SELECT
    u.id                                    AS user_id,
    u.email::TEXT                           AS email,
    (u.raw_user_meta_data ->> 'display_name')::TEXT AS display_name,
    u.created_at                            AS joined_at,
    u.last_sign_in_at                       AS last_sign_in,
    COALESCE(s.plan_id, 'none')::TEXT       AS plan_id,
    COALESCE(pd.name,  'No plan')::TEXT     AS plan_name,
    COALESCE(s.status, 'no_subscription')::TEXT AS sub_status,
    s.trial_ends_at,
    s.activated_at,
    COUNT(a.id)::BIGINT                     AS animal_count
  FROM auth.users u
  LEFT JOIN public.subscriptions s   ON s.user_id = u.id
  LEFT JOIN public.plan_definitions pd ON pd.id = s.plan_id
  LEFT JOIN public.animals a         ON a.user_id = u.id
  GROUP BY
    u.id, u.email, u.raw_user_meta_data,
    u.created_at, u.last_sign_in_at,
    s.plan_id, pd.name, s.status,
    s.trial_ends_at, s.activated_at
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_user_overview() TO authenticated;

-- ── 2. Waitlist entries ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_admin_waitlist()
RETURNS TABLE (
  id            UUID,
  email         TEXT,
  primary_focus TEXT,
  created_at    TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'djb.rsa@gmail.com' THEN
    RAISE EXCEPTION 'access_denied: Admin only';
  END IF;

  RETURN QUERY
  SELECT w.id, w.email, w.primary_focus, w.created_at
  FROM public.waitlist w
  ORDER BY w.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_waitlist() TO authenticated;

-- ── 3. Admin subscription override ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_update_subscription(
  p_user_id       UUID,
  p_plan_id       TEXT,
  p_status        TEXT,
  p_trial_ends_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'djb.rsa@gmail.com' THEN
    RAISE EXCEPTION 'access_denied: Admin only';
  END IF;

  -- Validate plan exists
  IF NOT EXISTS (SELECT 1 FROM public.plan_definitions WHERE id = p_plan_id) THEN
    RAISE EXCEPTION 'invalid_plan: Plan "%" does not exist', p_plan_id;
  END IF;

  -- Validate status
  IF p_status NOT IN ('trialing', 'active', 'grace_period', 'cancelled') THEN
    RAISE EXCEPTION 'invalid_status: "%" is not a valid subscription status', p_status;
  END IF;

  UPDATE public.subscriptions
  SET
    plan_id       = p_plan_id,
    status        = p_status,
    trial_ends_at = COALESCE(p_trial_ends_at, trial_ends_at),
    updated_at    = NOW()
  WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_subscription(UUID, TEXT, TEXT, TIMESTAMPTZ) TO authenticated;
