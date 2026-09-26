-- ==============================================================================
-- SMART CIRCULAR ECONOMY & WASTE EXCHANGE PLATFORM
-- Unified Realistic Demo Seed Data (Developer 1 & Developer 2 / Pratush)
-- ==============================================================================

DO $$
DECLARE
    gen1_id UUID := '11111111-1111-4111-8111-111111111111'::UUID;
    gen2_id UUID := '22222222-2222-4222-8222-222222222222'::UUID;
    gen3_id UUID := '33333333-3333-4333-8333-333333333333'::UUID;
    buyer1_id UUID := '44444444-4444-4444-8444-444444444444'::UUID;
    buyer2_id UUID := '66666666-6666-4666-8666-666666666666'::UUID;
    admin1_id UUID := '55555555-5555-4555-8555-555555555555'::UUID;
    
    pet_listing_id UUID := '77777777-7777-4777-8777-777777777777'::UUID;
    completed_listing_id UUID := '88888888-8888-4888-8888-888888888888'::UUID;
BEGIN
    -- 1. Insert Demo Auth Users (Supabase Auth schema compatible)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES
        (gen1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'generator1@circulareconomy.org', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"name":"EcoPack Manufacturing","role":"generator","location":"Industrial Zone A, Mumbai"}', NOW(), NOW()),
        (gen2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'generator2@circulareconomy.org', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Metro Electronics Refurbishers","role":"generator","location":"Tech Park, Bengaluru"}', NOW(), NOW()),
        (gen3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'generator3@circulareconomy.org', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"name":"GreenHarvest Agro Processing","role":"generator","location":"Sector 18, Pune"}', NOW(), NOW()),
        (buyer1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'buyer1@circulareconomy.org', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"name":"ReLoop Polymer Upcyclers","role":"buyer","location":"Navi Mumbai"}', NOW(), NOW()),
        (buyer2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'buyer2@circulareconomy.org', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Apex Fiber & Metal Recyclers","role":"buyer","location":"Tech Park, Bengaluru"}', NOW(), NOW()),
        (admin1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@circulareconomy.org', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{"name":"System Administrator","role":"admin","location":"Headquarters"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 2. Ensure Profiles Exist
    INSERT INTO public.profiles (id, name, email, role, location, created_at, updated_at)
    VALUES
        (gen1_id, 'EcoPack Manufacturing', 'generator1@circulareconomy.org', 'generator', 'Industrial Zone A, Mumbai', NOW(), NOW()),
        (gen2_id, 'Metro Electronics Refurbishers', 'generator2@circulareconomy.org', 'generator', 'Tech Park, Bengaluru', NOW(), NOW()),
        (gen3_id, 'GreenHarvest Agro Processing', 'generator3@circulareconomy.org', 'generator', 'Sector 18, Pune', NOW(), NOW()),
        (buyer1_id, 'ReLoop Polymer Upcyclers', 'buyer1@circulareconomy.org', 'buyer', 'Navi Mumbai', NOW(), NOW()),
        (buyer2_id, 'Apex Fiber & Metal Recyclers', 'buyer2@circulareconomy.org', 'buyer', 'Tech Park, Bengaluru', NOW(), NOW()),
        (admin1_id, 'System Administrator', 'admin@circulareconomy.org', 'admin', 'Headquarters', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        location = EXCLUDED.location;

    -- 3. Realistic Demo Listings
    DELETE FROM public.listings WHERE owner_id IN (gen1_id, gen2_id, gen3_id);

    INSERT INTO public.listings (id, owner_id, material_type, quantity, unit, condition, description, image_url, location, status, created_at)
    VALUES
        -- Sample 500 kg PET Listing (Matching Showcase)
        (
            pet_listing_id,
            gen1_id,
            'Plastic/PET',
            500.0,
            'kg',
            'Good',
            'Baled post-industrial clear PET flake scraps from bottle preform trimming. Clean, uncolored, and moisture-controlled.',
            'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
            'Industrial Zone A, Mumbai',
            'OPEN',
            NOW() - INTERVAL '2 hours'
        ),
        (
            gen1_id,
            'Plastic/PET',
            1200.0,
            'kg',
            'Excellent',
            'Sorted high-density polyethylene (HDPE) pellets and clean shredded regrind ready for extrusion.',
            'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
            'Industrial Zone A, Mumbai',
            'OPEN',
            NOW() - INTERVAL '5 hours'
        ),
        (
            gen1_id,
            'Paper/Cardboard',
            850.0,
            'kg',
            'Excellent',
            'Double-wall corrugated cardboard shipping boxes (OCC 11), compacted into high-density bales, moisture < 12%.',
            'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
            'Industrial Zone A, Mumbai',
            'OPEN',
            NOW() - INTERVAL '1 day'
        ),
        (
            gen1_id,
            'Glass',
            350.0,
            'kg',
            'Good',
            'Sorted amber and clear cullet glass from food packaging lines, free of ceramic contaminants, crushed to 15mm-25mm.',
            'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=800&q=80',
            'Bhiwandi Logistics Hub, Thane',
            'OPEN',
            NOW() - INTERVAL '12 hours'
        ),
        (
            gen2_id,
            'Metal',
            420.0,
            'kg',
            'Good',
            'Clean aluminum CNC extrusion cutoffs and sheet offcuts (Alloy 6061/6063). Degreased and dry.',
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
            'Tech Park, Bengaluru',
            'OPEN',
            NOW() - INTERVAL '6 hours'
        ),
        (
            gen2_id,
            'Metal',
            250.0,
            'kg',
            'Fair',
            'Mixed copper wire stripping remnants (insulated and bare #1 copper conductor bundles).',
            'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80',
            'Tech Park, Bengaluru',
            'OPEN',
            NOW() - INTERVAL '18 hours'
        ),
        (
            gen1_id,
            'Textile/Cotton',
            600.0,
            'kg',
            'Good',
            '100% organic un-dyed cotton fabric cuttings and spinning waste from garment assembly line.',
            'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
            'Surat Textile Corridor, Gujarat',
            'OPEN',
            NOW() - INTERVAL '2 days'
        ),
        (
            gen3_id,
            'Organic/Food Waste',
            1500.0,
            'kg',
            'Fair',
            'Spent brewer grain and sugarcane bagasse mash suitable for biogas production or composting feedstock.',
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
            'Sector 18, Pune',
            'OPEN',
            NOW() - INTERVAL '3 hours'
        ),
        (
            gen2_id,
            'Electronic Waste',
            180.0,
            'units',
            'Fair',
            'Decommissioned server motherboards, power supplies, and RAM modules for component recovery and precious metal reclamation.',
            'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80',
            'Electronic City, Bengaluru',
            'OPEN',
            NOW() - INTERVAL '4 hours'
        ),
        -- Completed historical exchange for verified circular metrics
        (
            completed_listing_id,
            gen1_id,
            'Plastic/PET',
            750.0,
            'kg',
            'Excellent',
            'Completed exchange of clean optical-grade polycarbonate and clear PET flakes.',
            'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
            'Industrial Zone A, Mumbai',
            'COMPLETED',
            NOW() - INTERVAL '3 days'
        );

    -- 4. Demo Buyer Requirements (For Smart Matching Engine)
    DELETE FROM public.requirements WHERE buyer_id IN (buyer1_id, buyer2_id);

    INSERT INTO public.requirements (buyer_id, material_type, min_quantity, max_quantity, acceptable_condition, location, active, created_at)
    VALUES
        -- Buyer 1: High compatibility with 500 kg PET Listing (Expected Match ~95%)
        (
            buyer1_id,
            'Plastic/PET',
            300.0,
            700.0,
            ARRAY['Good', 'Excellent'],
            'Navi Mumbai Industrial Cluster',
            TRUE,
            NOW() - INTERVAL '1 day'
        ),
        -- Buyer 1: Additional Polymer demand
        (
            buyer1_id,
            'Plastic/PET',
            1000.0,
            2500.0,
            ARRAY['Excellent'],
            'Industrial Zone A, Mumbai',
            TRUE,
            NOW() - INTERVAL '2 days'
        ),
        -- Buyer 2: Paper & Cardboard demand
        (
            buyer2_id,
            'Paper/Cardboard',
            500.0,
            1200.0,
            ARRAY['Good', 'Excellent'],
            'Mumbai Metro Logistics Zone',
            TRUE,
            NOW() - INTERVAL '6 hours'
        ),
        -- Buyer 2: Metal / Aluminum demand
        (
            buyer2_id,
            'Metal',
            200.0,
            800.0,
            ARRAY['Good', 'Fair', 'Excellent'],
            'Tech Park, Bengaluru',
            TRUE,
            NOW() - INTERVAL '12 hours'
        ),
        -- Buyer 2: Glass demand
        (
            buyer2_id,
            'Glass',
            200.0,
            800.0,
            ARRAY['Good', 'Fair'],
            'Bhiwandi Logistics Hub, Thane',
            TRUE,
            NOW() - INTERVAL '18 hours'
        );

    -- 5. Demo Completed Exchange Request (Contributing to Impact Metrics)
    DELETE FROM public.exchange_requests WHERE listing_id IN (pet_listing_id, completed_listing_id);

    INSERT INTO public.exchange_requests (listing_id, requester_id, status, message, created_at, updated_at)
    VALUES
        (
            completed_listing_id,
            buyer1_id,
            'COMPLETED',
            'Full batch received and verified for circular compounding.',
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '1 day'
        );

END $$;
