-- ============================================================
-- Migration: Add ON DELETE CASCADE to all user-owned tables
-- Date: 2026-05-03
--
-- WHAT THIS DOES:
-- Ensures that when a user is deleted from auth.users (whether via
-- Supabase Studio, the admin_delete_user() RPC, or Retool), ALL of
-- their associated data is automatically removed — no orphaned rows.
--
-- TABLES AFFECTED:
--   1. farm_settings      — had FK, missing CASCADE
--   2. support_requests   — had FK, missing CASCADE
--   3. animals            — had bare user_id column, no FK at all
--   4. camps              — had bare user_id column, no FK at all
--   5. health_logs        — had bare user_id column, no FK at all
--   6. weight_logs        — had bare user_id column, no FK at all
--   7. movement_log       — had bare user_id column, no FK at all
--   8. sale_records       — had bare user_id column, no FK at all
--
-- TABLES ALREADY CORRECT (no changes needed):
--   - subscriptions            (REFERENCES auth.users ON DELETE CASCADE ✅)
--   - user_sheep_vet_products  (REFERENCES auth.users ON DELETE CASCADE ✅)
--
-- SAFE TO RUN:
--   - No data is moved, modified, or deleted by this migration itself.
--   - Postgres will validate all existing rows satisfy the new constraints.
--   - If a constraint fails, the migration aborts and rolls back cleanly.
-- ============================================================

-- ── 1. farm_settings ────────────────────────────────────────────────────────
-- Drop the existing FK (no cascade) and re-add it with CASCADE.
ALTER TABLE public.farm_settings
  DROP CONSTRAINT farm_settings_user_id_fkey,
  ADD CONSTRAINT farm_settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 2. support_requests ─────────────────────────────────────────────────────
-- Drop the existing FK (no cascade) and re-add it with CASCADE.
ALTER TABLE public.support_requests
  DROP CONSTRAINT support_requests_user_id_fkey,
  ADD CONSTRAINT support_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 3. animals ──────────────────────────────────────────────────────────────
-- user_id was a bare UUID with no FK at all. Add a proper FK with CASCADE.
-- When an animal is deleted, health_logs/weight_logs/movement_log already
-- cascade from animals (those FKs exist). So deleting the user will cascade
-- to animals, which then cascade to their child records automatically.
ALTER TABLE public.animals
  ADD CONSTRAINT animals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 4. camps ────────────────────────────────────────────────────────────────
-- user_id was a bare UUID with no FK at all. Add a proper FK with CASCADE.
ALTER TABLE public.camps
  ADD CONSTRAINT camps_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 5. health_logs ──────────────────────────────────────────────────────────
-- user_id was a bare UUID with no FK at all. Add a proper FK with CASCADE.
-- Note: health_logs already cascades from animals (animal_id FK exists).
-- This user_id FK is an additional safety net for any future direct deletes.
ALTER TABLE public.health_logs
  ADD CONSTRAINT health_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 6. weight_logs ──────────────────────────────────────────────────────────
ALTER TABLE public.weight_logs
  ADD CONSTRAINT weight_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 7. movement_log ─────────────────────────────────────────────────────────
ALTER TABLE public.movement_log
  ADD CONSTRAINT movement_log_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 8. sale_records ─────────────────────────────────────────────────────────
-- user_id was a bare UUID with no FK at all. Add a proper FK with CASCADE.
-- animal_sale_links already cascades from sale_records (sale_record_id FK exists).
ALTER TABLE public.sale_records
  ADD CONSTRAINT sale_records_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── Update admin_delete_user comment ────────────────────────────────────────
-- The function previously noted "we should have RLS or triggers to cleanup".
-- That is now handled automatically by the cascade constraints above.
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Admin-only guard
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) != 'djb.rsa@gmail.com' THEN
    RAISE EXCEPTION 'access_denied: Admin only';
  END IF;

  -- Deleting from auth.users cascades automatically to:
  --   subscriptions, farm_settings, support_requests, animals, camps,
  --   health_logs, weight_logs, movement_log, sale_records,
  --   user_sheep_vet_products
  -- Child records of animals (health_logs, weight_logs, movement_log,
  -- biosecurity_logs, journal_logs) are then cascaded from animals.
  -- animal_sale_links cascades from sale_records.
  -- This single DELETE is a complete, clean wipe of all user data.
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;
