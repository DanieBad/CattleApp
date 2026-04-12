-- ============================================================
-- Buy/Sell traceability tables
-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."sale_records" (
  "id"                    uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  "user_id"               uuid DEFAULT auth.uid(),
  "transaction_type"      text NOT NULL,          -- 'Buy' or 'Sell'
  "party_name"            text,                   -- Name / Company Name
  "farm_name"             text,
  "party_gln"             text,                   -- Legal Entity GLN
  "gln_certificate_url"   text,                   -- Supabase Storage URL (optional)
  "gps_coordinates"       text,                   -- Origin or Destination GPS
  "permit_number"         text,
  "permit_url"            text,                   -- Supabase Storage URL (optional)
  "transaction_date"      date,                   -- Arrival date (Buy) or Leaving farm (Sell)
  "notes"                 text,
  "created_at"            timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "sale_records_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."sale_records" OWNER TO "postgres";
ALTER TABLE "public"."sale_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own sale_records"
  ON "public"."sale_records"
  USING (auth.uid() = user_id);

GRANT ALL ON TABLE "public"."sale_records" TO anon;
GRANT ALL ON TABLE "public"."sale_records" TO authenticated;
GRANT ALL ON TABLE "public"."sale_records" TO service_role;


-- ============================================================

CREATE TABLE IF NOT EXISTS "public"."animal_sale_links" (
  "id"              uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  "sale_record_id"  uuid REFERENCES "public"."sale_records"("id") ON DELETE CASCADE,
  "animal_id"       uuid REFERENCES "public"."animals"("id") ON DELETE CASCADE,
  "sale_price"      numeric(10,2),   -- Per-animal selling price (null for Buy)
  "created_at"      timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "animal_sale_links_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."animal_sale_links" OWNER TO "postgres";
ALTER TABLE "public"."animal_sale_links" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own animal_sale_links"
  ON "public"."animal_sale_links"
  USING (
    EXISTS (
      SELECT 1 FROM "public"."sale_records" sr
      WHERE sr.id = sale_record_id AND sr.user_id = auth.uid()
    )
  );

GRANT ALL ON TABLE "public"."animal_sale_links" TO anon;
GRANT ALL ON TABLE "public"."animal_sale_links" TO authenticated;
GRANT ALL ON TABLE "public"."animal_sale_links" TO service_role;


-- ============================================================
-- Supabase Storage: trade-documents bucket policies
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-documents', 'trade-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload trade docs"
  ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trade-documents');

CREATE POLICY "Authenticated users can read trade docs"
  ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated
  USING (bucket_id = 'trade-documents');

CREATE POLICY "Authenticated users can delete trade docs"
  ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated
  USING (bucket_id = 'trade-documents');
