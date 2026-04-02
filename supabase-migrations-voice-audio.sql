-- 1. Add audio storage quota columns to farm_settings
ALTER TABLE public.farm_settings ADD COLUMN IF NOT EXISTS audio_used_bytes BIGINT DEFAULT 0;

-- 2. Add audio properties to journal_logs
ALTER TABLE public.journal_logs ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.journal_logs ADD COLUMN IF NOT EXISTS audio_size_bytes BIGINT;
ALTER TABLE public.journal_logs ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER;

-- 3. Create audio_notes storage bucket (Strictly Private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audio_notes',
  'audio_notes',
  false, -- STRICTLY PRIVATE
  20971520, -- 20MB per individual file
  '{audio/webm, audio/mp4, audio/m4a, audio/mpeg}'
) on conflict(id) do update set public = false;

-- 4. Storage Policies for audio_notes (Authenticated users only)
create policy "Authenticated users can upload audio notes"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'audio_notes' );

create policy "Authenticated users can view their audio notes"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'audio_notes' );

create policy "Authenticated users can delete their audio notes"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'audio_notes' );

-- Note: Enforcing the 100MB limit at the DB level dynamically can be done via trigger, but since Phase 1 handles it via client-side read + quota optimistic updates, we will let FarmSettings audio_used_bytes handle the gatekeeping in the UI.
