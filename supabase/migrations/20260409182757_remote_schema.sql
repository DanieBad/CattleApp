


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."process_fmd_quarantines"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.animals 
  SET is_quarantined = false 
  WHERE is_quarantined = true 
  AND quarantine_end_date <= CURRENT_DATE;
END;
$$;


ALTER FUNCTION "public"."process_fmd_quarantines"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."animals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tag_number" "text" NOT NULL,
    "name" "text",
    "breed" "text" NOT NULL,
    "sex" "text" NOT NULL,
    "date_of_birth" "date" NOT NULL,
    "status" "text" NOT NULL,
    "sire_id" "uuid",
    "dam_id" "uuid",
    "weight" numeric,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "eid_number" "text",
    "is_quarantined" boolean DEFAULT false,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "current_camp_id" "uuid",
    "horn_status" "text",
    "species" "text" DEFAULT 'Cattle'::"text",
    "brand" "text",
    "origin_gln" "text",
    "previous_owner_tag" "text",
    "previous_owner_brand" "text",
    "arrival_date" "date",
    "purchase_price" numeric(10,2),
    "sold_price" numeric(10,2),
    "quarantine_start_date" "date",
    "quarantine_end_date" "date"
);


ALTER TABLE "public"."animals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."biosecurity_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "movement_id" "uuid",
    "health_declaration_date" timestamp with time zone,
    "vehicle_disinfection_date" timestamp with time zone,
    "disinfection_certificate_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "synced_at" timestamp with time zone
);


ALTER TABLE "public"."biosecurity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."camps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" "text" NOT NULL,
    "size_hectares" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."camps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."farm_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "farm_name" "text",
    "district" "text",
    "default_cattle_breed" "text",
    "default_sheep_breed" "text",
    "gs1_company_prefix" "text",
    "legal_entity_gln" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "gln_certificate_url" "text",
    "brand_certificate_url" "text",
    "audio_used_bytes" bigint DEFAULT 0
);


ALTER TABLE "public"."farm_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "animal_id" "uuid",
    "treatment_type" "text" NOT NULL,
    "medication" "text",
    "dosage" "text",
    "date_administered" "date" DEFAULT CURRENT_DATE NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."health_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "animal_id" "uuid",
    "note_text" "text" NOT NULL,
    "date_recorded" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "audio_url" "text",
    "audio_size_bytes" bigint,
    "audio_duration_seconds" integer
);


ALTER TABLE "public"."journal_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."movement_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "animal_id" "uuid" NOT NULL,
    "movement_date" "date" NOT NULL,
    "origin" "text" NOT NULL,
    "destination" "text" NOT NULL,
    "permit_number" "text",
    "vehicle_registration" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "permit_issue_date" "date",
    "permit_expiry_date" "date",
    "permit_pdf_url" "text",
    "origin_gps" "text",
    "destination_gps" "text",
    "origin_gln" "text",
    "destination_gln" "text",
    "gps_source" "text" DEFAULT 'Manual'::"text"
);


ALTER TABLE "public"."movement_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weight_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "animal_id" "uuid",
    "weight_kg" numeric NOT NULL,
    "date_recorded" "date" DEFAULT CURRENT_DATE NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."weight_logs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."animals"
    ADD CONSTRAINT "animals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."biosecurity_logs"
    ADD CONSTRAINT "biosecurity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."camps"
    ADD CONSTRAINT "camps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."farm_settings"
    ADD CONSTRAINT "farm_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."farm_settings"
    ADD CONSTRAINT "farm_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."health_logs"
    ADD CONSTRAINT "health_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_logs"
    ADD CONSTRAINT "journal_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."movement_log"
    ADD CONSTRAINT "movement_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weight_logs"
    ADD CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."animals"
    ADD CONSTRAINT "animals_current_camp_id_fkey" FOREIGN KEY ("current_camp_id") REFERENCES "public"."camps"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."animals"
    ADD CONSTRAINT "animals_dam_id_fkey" FOREIGN KEY ("dam_id") REFERENCES "public"."animals"("id");



ALTER TABLE ONLY "public"."animals"
    ADD CONSTRAINT "animals_sire_id_fkey" FOREIGN KEY ("sire_id") REFERENCES "public"."animals"("id");



ALTER TABLE ONLY "public"."biosecurity_logs"
    ADD CONSTRAINT "biosecurity_logs_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "public"."movement_log"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."farm_settings"
    ADD CONSTRAINT "farm_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."health_logs"
    ADD CONSTRAINT "health_logs_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_logs"
    ADD CONSTRAINT "journal_logs_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."movement_log"
    ADD CONSTRAINT "movement_log_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weight_logs"
    ADD CONSTRAINT "weight_logs_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can view all farm settings" ON "public"."farm_settings" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = 'djb.rsa@gmail.com'::"text"));



CREATE POLICY "Enable all for users" ON "public"."movement_log" USING (true);



CREATE POLICY "Users access own animals" ON "public"."animals" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users access own camps" ON "public"."camps" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users access own health" ON "public"."health_logs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users access own movement" ON "public"."movement_log" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users access own weights" ON "public"."weight_logs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own farm settings" ON "public"."farm_settings" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."animals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."camps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."farm_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."movement_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weight_logs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."process_fmd_quarantines"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_fmd_quarantines"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_fmd_quarantines"() TO "service_role";
























GRANT ALL ON TABLE "public"."animals" TO "anon";
GRANT ALL ON TABLE "public"."animals" TO "authenticated";
GRANT ALL ON TABLE "public"."animals" TO "service_role";



GRANT ALL ON TABLE "public"."biosecurity_logs" TO "anon";
GRANT ALL ON TABLE "public"."biosecurity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."biosecurity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."camps" TO "anon";
GRANT ALL ON TABLE "public"."camps" TO "authenticated";
GRANT ALL ON TABLE "public"."camps" TO "service_role";



GRANT ALL ON TABLE "public"."farm_settings" TO "anon";
GRANT ALL ON TABLE "public"."farm_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."farm_settings" TO "service_role";



GRANT ALL ON TABLE "public"."health_logs" TO "anon";
GRANT ALL ON TABLE "public"."health_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."health_logs" TO "service_role";



GRANT ALL ON TABLE "public"."journal_logs" TO "anon";
GRANT ALL ON TABLE "public"."journal_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."journal_logs" TO "service_role";



GRANT ALL ON TABLE "public"."movement_log" TO "anon";
GRANT ALL ON TABLE "public"."movement_log" TO "authenticated";
GRANT ALL ON TABLE "public"."movement_log" TO "service_role";



GRANT ALL ON TABLE "public"."weight_logs" TO "anon";
GRANT ALL ON TABLE "public"."weight_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."weight_logs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Authenticated users can delete their audio notes"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'audio_notes'::text));



  create policy "Authenticated users can upload audio notes"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'audio_notes'::text));



  create policy "Authenticated users can view their audio notes"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'audio_notes'::text));



