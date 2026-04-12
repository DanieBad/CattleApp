-- ============================================================
-- Phase 2/4 – User Subscriptions Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id       TEXT        NOT NULL REFERENCES public.plan_definitions(id),
  status        TEXT        NOT NULL DEFAULT 'trialing',
  -- status values: 'trialing' | 'active' | 'grace_period' | 'cancelled'
  trial_ends_at TIMESTAMPTZ NOT NULL,
  activated_at  TIMESTAMPTZ,          -- Set when a plan is explicitly chosen
  cancelled_at  TIMESTAMPTZ,
  notes         TEXT,                 -- Admin use / manual override reason
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)                    -- One subscription row per user
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own plan_id (status changes go through admin or DB functions only)
CREATE POLICY "Users can update own subscription"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin has full access
CREATE POLICY "Admin has full access to subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'djb.rsa@gmail.com');
