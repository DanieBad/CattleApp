-- 1. Enable RLS on both tables
ALTER TABLE "public"."biosecurity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."journal_logs" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy for biosecurity_logs
-- Only allow access if the user owns the parent movement_log
CREATE POLICY "Users access own biosecurity_logs" 
ON "public"."biosecurity_logs"
USING (
  EXISTS (
    SELECT 1 FROM "public"."movement_log" 
    WHERE "movement_log"."id" = "biosecurity_logs"."movement_id" 
    AND "movement_log"."user_id" = auth.uid()
  )
);

-- 3. Create Policy for journal_logs
-- Only allow access if the user owns the parent animal
CREATE POLICY "Users access own journal_logs" 
ON "public"."journal_logs"
USING (
  EXISTS (
    SELECT 1 FROM "public"."animals" 
    WHERE "animals"."id" = "journal_logs"."animal_id" 
    AND "animals"."user_id" = auth.uid()
  )
);
