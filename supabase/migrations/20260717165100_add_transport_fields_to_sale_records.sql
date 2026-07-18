-- Migration to add buyer, driver, and vehicle fields for transport documents
ALTER TABLE "public"."sale_records" 
  ADD COLUMN IF NOT EXISTS "buyer_full_name" text,
  ADD COLUMN IF NOT EXISTS "buyer_id_number" text,
  ADD COLUMN IF NOT EXISTS "buyer_address" text,
  ADD COLUMN IF NOT EXISTS "buyer_contact_number" text,
  ADD COLUMN IF NOT EXISTS "driver_full_name" text,
  ADD COLUMN IF NOT EXISTS "driver_id_number" text,
  ADD COLUMN IF NOT EXISTS "driver_address" text,
  ADD COLUMN IF NOT EXISTS "driver_contact_number" text,
  ADD COLUMN IF NOT EXISTS "vehicle_registration" text,
  ADD COLUMN IF NOT EXISTS "vehicle_model" text,
  ADD COLUMN IF NOT EXISTS "vehicle_make" text,
  ADD COLUMN IF NOT EXISTS "destination_address" text,
  ADD COLUMN IF NOT EXISTS "movement_from" text,
  ADD COLUMN IF NOT EXISTS "declaration_signature_url" text,
  ADD COLUMN IF NOT EXISTS "declaration_pdf_url" text;
