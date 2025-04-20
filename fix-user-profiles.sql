-- Drop existing table if it exists to ensure a clean start
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create user_profiles table with the correct structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('provider', 'recipient', 'admin')),
    avatar_url TEXT,
    phone_number TEXT,
    location JSONB,
    bio TEXT,
    date_of_birth DATE,
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Public user_profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public user_profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own user_profile" ON public.user_profiles;
CREATE POLICY "Users can update own user_profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Sample data will need to be inserted with user IDs that exist in auth.users
-- You can replace these UUIDs with actual user IDs from your auth.users table

-- To check existing users you can run:
-- SELECT id, email FROM auth.users;

-- Then insert profiles for existing users only 