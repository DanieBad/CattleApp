-- Create waitlist table for capturing early interest
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    primary_focus TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public to register (INSERT ONLY)
CREATE POLICY "Enable insert for everyone" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- Allow admins to view waitlist (SELECT)
-- Assuming admin email is djb.rsa@gmail.com based on App.tsx check
CREATE POLICY "Enable select for authenticated admins only" ON public.waitlist
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'djb.rsa@gmail.com'
    );
