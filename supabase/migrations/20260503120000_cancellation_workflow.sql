-- ============================================================
-- Subscription Cancellation Workflow
-- Adds cancellation grace-period tracking to the subscriptions
-- table and three RPCs to manage the lifecycle.
--
-- TESTING_MODE: All durations are in MINUTES.
-- To switch to production (days), search for TESTING_MODE and
-- change the intervals as noted in each comment.
-- ============================================================

-- ── 1. New columns ────────────────────────────────────────────

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancellation_ends_at  TIMESTAMPTZ,   -- access-end date (null = not cancelling)
  ADD COLUMN IF NOT EXISTS reminder_7_sent_at     TIMESTAMPTZ,   -- stamped when 7-min/day reminder sent
  ADD COLUMN IF NOT EXISTS reminder_1_sent_at     TIMESTAMPTZ;   -- stamped when 1-min/day reminder sent

-- cancelled_at already exists (tracks when user clicked cancel)

-- ── 2. RPC: cancel_subscription ───────────────────────────────
--
-- Called directly from the Billing page (authenticated user).
-- Sets the 30-minute (TESTING_MODE) grace window.
-- Status stays active/trialing — user retains full access until
-- cancellation_ends_at passes.
--
-- TODO: Stripe hook point — when payment integration is added,
-- call Stripe cancel_at_period_end = true here before the UPDATE.

CREATE OR REPLACE FUNCTION public.cancel_subscription(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Guard: subscription must exist
  IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'no_subscription: No subscription found for user %', p_user_id;
  END IF;

  -- Guard: must not already be in cancellation window
  IF EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
      AND cancellation_ends_at IS NOT NULL
      AND cancellation_ends_at > NOW()
  ) THEN
    RAISE EXCEPTION 'already_cancelling: Subscription is already pending cancellation';
  END IF;

  UPDATE public.subscriptions SET
    cancelled_at         = NOW(),
    cancellation_ends_at = NOW() + INTERVAL '30 minutes', -- TESTING_MODE: change to '30 days'
    reminder_7_sent_at   = NULL,  -- reset in case of previous cancellation cycle
    reminder_1_sent_at   = NULL,
    updated_at           = NOW()
  WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_subscription(UUID) TO authenticated;

-- ── 3. RPC: resume_subscription ───────────────────────────────
--
-- Clears the cancellation window, restoring full access.
-- Can be called any time before cancellation_ends_at passes.

CREATE OR REPLACE FUNCTION public.resume_subscription(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions SET
    cancelled_at         = NULL,
    cancellation_ends_at = NULL,
    reminder_7_sent_at   = NULL,
    reminder_1_sent_at   = NULL,
    updated_at           = NOW()
  WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resume_subscription(UUID) TO authenticated;

-- ── 4. RPC: process_expired_cancellations ─────────────────────
--
-- Finds subscriptions whose cancellation_ends_at has passed and
-- flips their status to 'cancelled'.
--
-- Returns the list of user_ids that were just deactivated so the
-- caller (Edge Function or client) can send deactivation emails.
--
-- Called from two places:
--   a) SubscriptionContext.tsx — client-side on every app load
--   b) process-cancellation-jobs Edge Function — via cron-job.org

CREATE OR REPLACE FUNCTION public.process_expired_cancellations()
RETURNS TABLE(deactivated_user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.subscriptions SET
    status     = 'cancelled',
    updated_at = NOW()
  WHERE cancellation_ends_at IS NOT NULL
    AND cancellation_ends_at <= NOW()
    AND status NOT IN ('cancelled', 'grace_period')
  RETURNING user_id AS deactivated_user_id;
END;
$$;

-- Accessible to both authenticated users (client-side call) and
-- service_role (Edge Function call)
GRANT EXECUTE ON FUNCTION public.process_expired_cancellations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_expired_cancellations() TO service_role;
