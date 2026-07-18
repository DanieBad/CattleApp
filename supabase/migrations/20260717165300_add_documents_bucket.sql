-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the documents bucket
CREATE POLICY "Allow authenticated uploads to documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated updates to documents" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Allow public read access to documents" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated deletes to documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documents');
