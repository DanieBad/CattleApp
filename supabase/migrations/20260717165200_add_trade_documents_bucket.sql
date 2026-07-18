-- Create the trade-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trade-documents', 'trade-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trade-documents');

-- Allow authenticated users to update their files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'trade-documents');

-- Allow public read access (since it's a public bucket, or we can restrict to authenticated)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'trade-documents');
