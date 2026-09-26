-- ==============================================================================
-- SMART CIRCULAR ECONOMY & WASTE EXCHANGE PLATFORM
-- Migration 02: Buyer Requirements & Exchange Requests Schema (Developer 2 / Pratush)
-- ==============================================================================

-- 1. TABLE: REQUIREMENTS (Buyer Material Sourcing Criteria)
CREATE TABLE IF NOT EXISTS public.requirements (
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

-- 2. TABLE: EXCHANGE_REQUESTS (Circular Material Transaction Flow)
CREATE TABLE IF NOT EXISTS public.exchange_requests (
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

-- 3. AUTOMATIC MODTIME TRIGGERS
CREATE TRIGGER update_requirements_modtime
    BEFORE UPDATE ON public.requirements
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_exchange_requests_modtime
    BEFORE UPDATE ON public.exchange_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- REQUIREMENTS RLS
-- ------------------------------------------------------------------------------

-- Authenticated users can view active requirements (needed for Matching Engine & listings discovery)
CREATE POLICY "Authenticated users can view active requirements"
    ON public.requirements FOR SELECT
    TO authenticated
    USING (active = TRUE OR buyer_id = auth.uid());

-- Buyers can insert their own requirements
CREATE POLICY "Buyers can create own requirements"
    ON public.requirements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own requirements
CREATE POLICY "Buyers can update own requirements"
    ON public.requirements FOR UPDATE
    TO authenticated
    USING (auth.uid() = buyer_id)
    WITH CHECK (auth.uid() = buyer_id);

-- Buyers can delete their own requirements
CREATE POLICY "Buyers can delete own requirements"
    ON public.requirements FOR DELETE
    TO authenticated
    USING (auth.uid() = buyer_id);

-- ------------------------------------------------------------------------------
-- EXCHANGE REQUESTS RLS
-- ------------------------------------------------------------------------------

-- Requesters can view their own requests, AND Listing Owners can view requests for their listings
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

-- Authenticated buyers/users can create exchange requests
CREATE POLICY "Authenticated users can create exchange requests"
    ON public.exchange_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

-- Listing Owners and Requesters can update request status according to workflow rules
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
