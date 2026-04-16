-- Migration: Recover Missing Users and Automate Profile Creation
-- This migration ensures every user has a farm profile and subscription.

-- 1. Drop existing functions to allow changing parameter names or return types
DROP FUNCTION IF EXISTS public.provision_subscription(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_admin_user_overview();

-- 2. Redefine provision_subscription with absolute safety
CREATE OR REPLACE FUNCTION public.provision_subscription(
  p_user_id UUID,
  p_plan_id TEXT DEFAULT 'basic'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status_val       TEXT;
  v_trial_ends_val   TIMESTAMPTZ;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plan_definitions pd WHERE pd.id = p_plan_id) THEN
    RAISE EXCEPTION 'invalid_plan_id: Plan "%" does not exist.', p_plan_id;
  END IF;

  v_status_val     := 'trialing';
  v_trial_ends_val := NOW() + INTERVAL '180 days';

  INSERT INTO public.subscriptions (user_id, plan_id, status, trial_ends_at, activated_at)
  VALUES (p_user_id, p_plan_id, v_status_val, v_trial_ends_val, NOW())
  ON CONFLICT (user_id) DO UPDATE 
  SET 
    plan_id = EXCLUDED.plan_id,
    status = EXCLUDED.status,
    trial_ends_at = EXCLUDED.trial_ends_at,
    updated_at = NOW();
END;
$$;

-- 3. Create a trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.farm_settings (user_id, farm_name, district)
  VALUES (NEW.id, 'My Sample Farm', NULL)
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM public.provision_subscription(NEW.id, 'basic');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Profile/Subscription creation failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 5. Backfill missing farm_settings
INSERT INTO public.farm_settings (user_id, farm_name)
SELECT au.id, 'My Sample Farm'
FROM auth.users au
WHERE au.id NOT IN (SELECT fs.user_id FROM public.farm_settings fs)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Backfill missing subscriptions
INSERT INTO public.subscriptions (user_id, plan_id, status, trial_ends_at, activated_at)
SELECT u.id, 'basic', 'trialing', NOW() + INTERVAL '180 days', NOW()
FROM auth.users u
WHERE u.id NOT IN (SELECT s.user_id FROM public.subscriptions s)
ON CONFLICT (user_id) DO NOTHING;

-- 7. Update get_admin_user_overview with robust verification
CREATE OR REPLACE FUNCTION public.get_admin_user_overview()
RETURNS TABLE (
  o_user_id         UUID,
  o_email           TEXT,
  o_display_name    TEXT,
  o_joined_at       TIMESTAMPTZ,
  o_last_sign_in    TIMESTAMPTZ,
  o_plan_id         TEXT,
  o_plan_name       TEXT,
  o_sub_status      TEXT,
  o_trial_ends_at   TIMESTAMPTZ,
  o_activated_at    TIMESTAMPTZ,
  o_animal_count    BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- RELIABLE ADMIN CHECK
  IF (auth.jwt() ->> 'email') != 'djb.rsa@gmail.com' THEN
    RAISE EXCEPTION 'access_denied: Admin only';
  END IF;

  RETURN QUERY
  SELECT
    usr.id                                    AS o_user_id,
    usr.email::TEXT                           AS o_email,
    (usr.raw_user_meta_data ->> 'display_name')::TEXT AS o_display_name,
    usr.created_at                            AS o_joined_at,
    usr.last_sign_in_at                       AS o_last_sign_in,
    COALESCE(s_s.plan_id, 'none')::TEXT       AS o_plan_id,
    COALESCE(pd_p.name,  'No plan')::TEXT     AS o_plan_name,
    COALESCE(s_s.status, 'no_subscription')::TEXT AS o_sub_status,
    s_s.trial_ends_at,
    s_s.activated_at,
    COUNT(a_a.id)::BIGINT                     AS o_animal_count
  FROM (
    -- Exclude 'status' from auth.users to avoid ambiguity in GROUP BY
    SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data FROM auth.users
  ) usr
  LEFT JOIN public.subscriptions s_s   ON s_s.user_id = usr.id
  LEFT JOIN public.plan_definitions pd_p ON pd_p.id = s_s.plan_id
  LEFT JOIN public.animals a_a         ON a_a.user_id = usr.id
  GROUP BY
    usr.id, usr.email, usr.raw_user_meta_data,
    usr.created_at, usr.last_sign_in_at,
    s_s.plan_id, pd_p.name, s_s.status,
    s_s.trial_ends_at, s_s.activated_at
  ORDER BY usr.created_at DESC;
END;
$$;
