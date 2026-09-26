-- ==============================================================================
-- SMART CIRCULAR ECONOMY & WASTE EXCHANGE PLATFORM
-- Unified Supabase PostgreSQL Schema (One-Click Setup)
-- Backend Developer 1 (Profiles, Listings, Storage) + Backend Developer 2 (Requirements, Matching, Requests)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP EXISTING OBJECTS (SAFE RESET ORDER)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.exchange_requests CASCADE;
DROP TABLE IF EXISTS public.requirements CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================================================
-- 3. PROFILES TABLE
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

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 4. LISTINGS TABLE
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

CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_material_type ON public.listings(material_type);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- ==============================================================================
-- 5. REQUIREMENTS TABLE (Buyer Demand Specs)
-- ==============================================================================
CREATE TABLE public.requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
    min_quantity NUMERIC NOT NULL CHECK (min_quantity >= 0),
    max_quantity NUMERIC NOT NULL CHECK (max_quantity >= min_quantity),
    acceptable_condition TEXT[] NOT NULL DEFAULT ARRAY['Excellent', 'Good'],
    location TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requirements_buyer_id ON public.requirements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_requirements_material_type ON public.requirements(material_type);
CREATE INDEX IF NOT EXISTS idx_requirements_active ON public.requirements(active);

-- ==============================================================================
-- 6. EXCHANGE_REQUESTS TABLE (Material Transaction Requests)
-- ==============================================================================
CREATE TABLE public.exchange_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (
        status IN ('REQUESTED', 'ACCEPTED', 'REJECTED', 'COMPLETED')
    ),
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_requests_listing_id ON public.exchange_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester_id ON public.exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON public.exchange_requests(status);

-- ==============================================================================
-- 7. AUTOMATED SYNC TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_location TEXT;
BEGIN
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE TRIGGER update_requirements_modtime
    BEFORE UPDATE ON public.requirements
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_exchange_requests_modtime
    BEFORE UPDATE ON public.exchange_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Authenticated users can read profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Listings Policies
CREATE POLICY "View open or own listings"
    ON public.listings FOR SELECT
    TO authenticated
    USING (
        status = 'OPEN' 
        OR owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Create own listings"
    ON public.listings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Update own listings"
    ON public.listings FOR UPDATE
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

CREATE POLICY "Delete own listings"
    ON public.listings FOR DELETE
    TO authenticated
    USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Requirements Policies
CREATE POLICY "Authenticated users can view active requirements"
    ON public.requirements FOR SELECT
    TO authenticated
    USING (active = TRUE OR buyer_id = auth.uid());

CREATE POLICY "Buyers can create own requirements"
    ON public.requirements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own requirements"
    ON public.requirements FOR UPDATE
    TO authenticated
    USING (auth.uid() = buyer_id)
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can delete own requirements"
    ON public.requirements FOR DELETE
    TO authenticated
    USING (auth.uid() = buyer_id);

-- Exchange Requests Policies
CREATE POLICY "Requesters and Listing Owners can view requests"
    ON public.exchange_requests FOR SELECT
    TO authenticated
    USING (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = exchange_requests.listing_id
            AND listings.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create exchange requests"
    ON public.exchange_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Listing Owners and Requesters can update request status"
    ON public.exchange_requests FOR UPDATE
    TO authenticated
    USING (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = exchange_requests.listing_id
            AND listings.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = exchange_requests.listing_id
            AND listings.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ==============================================================================
-- 9. STORAGE BUCKET CONFIGURATION (listing-images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

CREATE POLICY "Public Read Access on listing-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated Upload to listing-images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'listing-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Authenticated Delete own listing-images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'listing-images' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
