-- ============================================================
-- Phase 4/4 – Animal Limit Enforcement Trigger
-- Fires BEFORE every INSERT on public.animals
-- This is the server-side last line of defence (cannot be bypassed by the client)
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_animal_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_plan_id  TEXT;
  v_status   TEXT;
  v_limit    INTEGER;
  v_count    INTEGER;
BEGIN
  -- Look up the user's current subscription and plan limit
  SELECT s.plan_id, s.status, p.animal_limit
    INTO v_plan_id, v_status, v_limit
    FROM public.subscriptions s
    JOIN public.plan_definitions p ON p.id = s.plan_id
   WHERE s.user_id = NEW.user_id;

  -- No subscription row at all — block the insert
  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription_not_found: No subscription found for this user. Please select a plan.';
  END IF;

  -- Grace period or cancelled — read-only mode
  IF v_status IN ('grace_period', 'cancelled') THEN
    RAISE EXCEPTION 'subscription_expired: Your trial has ended. Please select a plan to continue adding animals.';
  END IF;

  -- Count current ACTIVE animals for this user
  SELECT COUNT(*)
    INTO v_count
    FROM public.animals
   WHERE user_id = NEW.user_id
     AND status = 'Active';

  -- Enforce the limit
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'animal_limit_reached: % of % animals used on the % plan. Please upgrade to add more.',
      v_count, v_limit, v_plan_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if re-running migration
DROP TRIGGER IF EXISTS enforce_animal_limit ON public.animals;

CREATE TRIGGER enforce_animal_limit
  BEFORE INSERT ON public.animals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_animal_limit();
