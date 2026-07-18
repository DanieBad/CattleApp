-- Migration to add owner information fields for transport documents
ALTER TABLE "public"."farm_settings" 
  ADD COLUMN IF NOT EXISTS "owner_full_name" text,
  ADD COLUMN IF NOT EXISTS "owner_id_number" text,
  ADD COLUMN IF NOT EXISTS "owner_address" text,
  ADD COLUMN IF NOT EXISTS "owner_contact_number" text;
