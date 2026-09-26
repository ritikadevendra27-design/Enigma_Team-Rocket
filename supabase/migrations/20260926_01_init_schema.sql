-- ==============================================================================
-- SMART CIRCULAR ECONOMY & WASTE EXCHANGE PLATFORM
-- Supabase PostgreSQL Schema & Security Foundation (Backend Developer 1)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP EXISTING OBJECTS (FOR CLEAN MIGRATION RUNS)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. ENUMS / TYPES (OPTIONAL / CONSTRAINTS USED FOR MAXIMUM COMPATIBILITY)
-- Allowed Roles: 'generator', 'buyer', 'admin'
-- Allowed Material Types: 'Plastic/PET', 'Paper/Cardboard', 'Glass', 'Metal', 'Textile/Cotton', 'Organic/Food Waste', 'Electronic Waste'
-- Allowed Conditions: 'Excellent', 'Good', 'Fair', 'Poor'
-- Allowed Statuses: 'OPEN', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'CLOSED'

-- ==============================================================================
-- 4. TABLE: PROFILES
-- ==============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('generator', 'buyer', 'admin')),
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 5. TABLE: LISTINGS
-- ==============================================================================
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL CHECK (
        material_type IN (
            'Plastic/PET',
            'Paper/Cardboard',
            'Glass',
            'Metal',
            'Textile/Cotton',
            'Organic/Food Waste',
            'Electronic Waste'
        )
    ),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor')),
    description TEXT,
    image_url TEXT,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (
        status IN ('OPEN', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'CLOSED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performant filtering (Material Type, Location, Status, Owner)
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_material_type ON public.listings(material_type);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- ==============================================================================
-- 6. AUTOMATED TRIGGER: SYNC SUPABASE AUTH USER TO PROFILES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_location TEXT;
BEGIN
    -- Extract metadata from Auth signup payload with fallbacks
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'generator');
    IF user_role NOT IN ('generator', 'buyer', 'admin') THEN
        user_role := 'generator';
    END IF;

    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_location := NEW.raw_user_meta_data->>'location';

    INSERT INTO public.profiles (id, name, email, role, location, created_at, updated_at)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        user_role,
        user_location,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        location = EXCLUDED.location,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fired whenever a new user signs up in auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_listings_modtime
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 2. Authenticated users can view basic public profile of listing owners (Name, Location, Role)
CREATE POLICY "Authenticated users can view seller profiles for listings"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Users can insert their own profile (in case trigger fallback is needed)
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- LISTINGS POLICIES
-- ------------------------------------------------------------------------------

-- 1. Authenticated users can view OPEN listings, or their own listings (any status)
CREATE POLICY "Authenticated users can view open or own listings"
    ON public.listings
    FOR SELECT
    TO authenticated
    USING (
        status = 'OPEN' 
        OR owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 2. Authenticated users can create listings (must set owner_id to their auth uid)
CREATE POLICY "Authenticated users can create listings"
    ON public.listings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- 3. Users can update only their own listings
CREATE POLICY "Users can update own listings"
    ON public.listings
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4. Users can delete only their own listings
CREATE POLICY "Users can delete own listings"
    ON public.listings
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ==============================================================================
-- 8. SUPABASE STORAGE BUCKET & POLICIES (listing-images)
-- ==============================================================================

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    TRUE,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Storage Policies
CREATE POLICY "Public Read Access on listing-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated Users can Upload to listing-images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'listing-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can Update/Delete their own listing images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'listing-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can Delete their own listing images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'listing-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
