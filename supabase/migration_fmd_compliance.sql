-- Migration for 2026 FMD Compliance
-- This script must be run manually via the Supabase SQL editor.

-- 1. FMD Movement Data Updates
ALTER TABLE public.movement_log 
ADD COLUMN IF NOT EXISTS permit_issue_date DATE NULL,
ADD COLUMN IF NOT EXISTS permit_expiry_date DATE NULL,
ADD COLUMN IF NOT EXISTS permit_pdf_url TEXT NULL,
ADD COLUMN IF NOT EXISTS origin_gps TEXT NULL,
ADD COLUMN IF NOT EXISTS destination_gps TEXT NULL,
ADD COLUMN IF NOT EXISTS origin_gln TEXT NULL,
ADD COLUMN IF NOT EXISTS destination_gln TEXT NULL,
ADD COLUMN IF NOT EXISTS gps_source TEXT NULL DEFAULT 'Manual';

-- 2. New Table: Biosecurity Logs
CREATE TABLE IF NOT EXISTS public.biosecurity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_id UUID REFERENCES public.movement_log(id) ON DELETE CASCADE,
    health_declaration_date TIMESTAMPTZ NULL,
    vehicle_disinfection_date TIMESTAMPTZ NULL,
    disinfection_certificate_url TEXT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

-- 3. Quarantine Tracking
ALTER TABLE public.animals
ADD COLUMN IF NOT EXISTS quarantine_start_date DATE NULL,
ADD COLUMN IF NOT EXISTS quarantine_end_date DATE NULL;

-- 4. Quarantine Processing stored procedure
CREATE OR REPLACE FUNCTION process_fmd_quarantines()
RETURNS void AS $$
BEGIN
  UPDATE public.animals 
  SET is_quarantined = false 
  WHERE is_quarantined = true 
  AND quarantine_end_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 5. Schedule via pg_cron (if extension enabled)
-- Ensure your search_path in supabase includes 'cron' if you execute this
SELECT cron.schedule('fmd_quarantine_check', '0 0 * * *', 'SELECT process_fmd_quarantines()');
