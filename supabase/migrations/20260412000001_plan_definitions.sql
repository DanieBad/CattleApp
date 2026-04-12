-- ============================================================
-- Phase 1/4 – Plan Definitions (static reference data)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.plan_definitions (
  id            TEXT PRIMARY KEY,       -- 'basic' | 'intermediate' | 'large' | 'commercial'
  name          TEXT NOT NULL,
  animal_limit  INTEGER NOT NULL,       -- 999999 = effectively unlimited (commercial)
  price_zar     NUMERIC(10,2),
  price_usd     NUMERIC(10,2),
  is_self_serve BOOLEAN DEFAULT TRUE    -- FALSE for commercial (contact sales only)
);

INSERT INTO public.plan_definitions (id, name, animal_limit, price_zar, price_usd, is_self_serve)
VALUES
  ('basic',        'Basic',        100,    75.00,  5.00, TRUE),
  ('intermediate', 'Intermediate', 500,   150.00, 10.00, TRUE),
  ('large',        'Large',        1000,  300.00, 20.00, TRUE),
  ('commercial',   'Commercial',   999999,  NULL,   NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

-- RLS: all authenticated users can read plans (needed for sign-up flow)
ALTER TABLE public.plan_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read plan definitions"
  ON public.plan_definitions
  FOR SELECT
  TO authenticated
  USING (true);
