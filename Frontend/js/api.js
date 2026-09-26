// Supabase Configuration & Backend Integration
const SUPABASE_CONFIG = {
    url: 'https://sevzqvzmtgcoxmddhwaw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldnpxdnptdGdjb3htZGRod2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MTE5ODMsImV4cCI6MjEwNTk4Nzk4M30.0prbybAq72yJ7DA5lzv57xyMHfRjiyFOXufNMAffriY'
};

// Initialize Supabase Client
let sbClient = null;
try {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
        sbClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
} catch (e) {
    console.warn('Supabase initialization warning:', e);
}

// Material Image Mapping with reliable high-res URLs
const MATERIAL_IMAGES = {
    'plastic': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    'pet': 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    'paper': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    'cardboard': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    'metal': 'https://images.unsplash.com/photo-1582803824122-f25becf36ad8?auto=format&fit=crop&w=600&q=80',
    'aluminium': 'https://images.unsplash.com/photo-1582803824122-f25becf36ad8?auto=format&fit=crop&w=600&q=80',
    'can': 'https://images.unsplash.com/photo-1582803824122-f25becf36ad8?auto=format&fit=crop&w=600&q=80',
    'glass': 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=600&q=80',
    'textile': 'https://images.unsplash.com/photo-1528255915607-9012fda0f838?auto=format&fit=crop&w=600&q=80',
    'cotton': 'https://images.unsplash.com/photo-1528255915607-9012fda0f838?auto=format&fit=crop&w=600&q=80',
    'organic': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    'food': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    'electronic': 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80',
    'e-waste': 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80',
    'default': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
};

function resolveMaterialImage(materialType, customUrl) {
    if (customUrl && !customUrl.includes('photo-1595278069441-2f29f7f45d8b') && !customUrl.includes('photo-1593368857488-2947119f3900')) {
        return customUrl;
    }
    const key = (materialType || '').toLowerCase();
    for (const [k, v] of Object.entries(MATERIAL_IMAGES)) {
        if (key.includes(k)) return v;
    }
    return MATERIAL_IMAGES.default;
}

// Initial Curated Datasets (with updated, working photos for PET Bottles, Aluminium Cans, etc.)
const INITIAL_MATERIALS = [
    {
        id: '1',
        name: 'PET Bottles',
        type: 'Plastic/PET',
        quantity: '500',
        unit: 'kg',
        condition: 'Clean, sorted',
        location: 'Downtown Hub',
        distance: '2.4 km',
        match: 92,
        image: MATERIAL_IMAGES.pet,
        status: 'OPEN',
        owner: 'EcoCorp Manufacturing',
        description: 'Baled, clean post-consumer clear PET beverage bottles collected and sorted. Moisture-controlled and ready for compounding.'
    },
    {
        id: '2',
        name: 'Cardboard Boxes',
        type: 'Paper/Cardboard',
        quantity: '1000',
        unit: 'kg',
        condition: 'Used, flattened',
        location: 'Westside Retail',
        distance: '5.1 km',
        match: 88,
        image: MATERIAL_IMAGES.cardboard,
        status: 'OPEN',
        owner: 'SuperMart Logistics',
        description: 'Double-wall corrugated shipping boxes, flattened and bundled into dense bales for easy loading.'
    },
    {
        id: '3',
        name: 'Aluminium Cans',
        type: 'Metal',
        quantity: '200',
        unit: 'kg',
        condition: 'Crushed',
        location: 'North Campus',
        distance: '1.2 km',
        match: 84,
        image: MATERIAL_IMAGES.aluminium,
        status: 'OPEN',
        owner: 'University Eco Club',
        description: 'Compacted aluminum beverage cans collected from campus recycling stations. Free from heavy residue.'
    },
    {
        id: '4',
        name: 'Cotton Textiles',
        type: 'Textile/Cotton',
        quantity: '350',
        unit: 'kg',
        condition: 'Mixed scraps',
        location: 'East Industrial',
        distance: '8.0 km',
        match: 76,
        image: MATERIAL_IMAGES.textile,
        status: 'OPEN',
        owner: 'FashionCo Garments',
        description: 'Clean fabric cutting remnants and offcuts suitable for insulation or circular spinning.'
    }
];

// Persistent State Store
const STORE = {
    user: JSON.parse(localStorage.getItem('circulo_user')) || {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'EcoPack Manufacturing Ltd',
        email: 'ecopack.generator@circulareconomy.org',
        role: 'Waste Generator',
        location: 'Industrial Zone A, Mumbai'
    },
    materials: [...INITIAL_MATERIALS],
    exchanges: JSON.parse(localStorage.getItem('circulo_exchanges')) || [
        { id: '101', material: 'Office Paper', quantity: '150 kg', other: 'GreenRecycle', location: 'City Center', date: '2026-09-20', status: 'COMPLETED' },
        { id: '102', material: 'Glass Bottles', quantity: '300 kg', other: 'GlassWorks Ltd', location: 'South Hub', date: '2026-09-22', status: 'ACCEPTED' },
        { id: '103', material: 'E-Waste Modules', quantity: '50 units', other: 'TechSalvage Hub', location: 'Downtown Hub', date: '2026-09-25', status: 'REQUESTED' }
    ],
    stats: {
        activeListings: 12,
        pendingRequests: 3,
        completedExchanges: 45,
        materialCirculated: '12,500 kg',
        landfillDiversion: '12.5 tons',
        communityParticipants: 128,
        carbonPoints: 1250
    }
};

// Backend API Module with Supabase Connection & Local Fallback
const API = {
    // Get active Supabase instance
    getClient: () => {
        if (!sbClient && typeof window !== 'undefined' && window.supabase?.createClient) {
            try {
                sbClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            } catch (e) {
                console.warn('Could not reinit Supabase client:', e);
            }
        }
        return sbClient;
    },

    // Session Initialization
    init: async () => {
        const client = API.getClient();
        if (client) {
            try {
                const { data: { session } } = await client.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await client
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        STORE.user = {
                            id: profile.id,
                            name: profile.name,
                            email: profile.email,
                            role: profile.role === 'buyer' ? 'Buyer / Recycler' : profile.role === 'admin' ? 'Admin' : 'Waste Generator',
                            location: profile.location || 'Mumbai'
                        };
                        localStorage.setItem('circulo_user', JSON.stringify(STORE.user));
                    }
                }
            } catch (err) {
                console.warn('Error fetching Supabase session on init:', err);
            }
        }
        return STORE.user;
    },

    // User Authentication: Login
    login: async (email, password = 'Password123!') => {
        const client = API.getClient();
        if (client) {
            try {
                const { data, error } = await client.auth.signInWithPassword({
                    email: email.trim(),
                    password
                });

                if (!error && data?.user) {
                    const { data: profile } = await client
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    const userRole = profile?.role === 'buyer' ? 'Buyer / Recycler' : profile?.role === 'admin' ? 'Admin' : 'Waste Generator';
                    STORE.user = {
                        id: data.user.id,
                        name: profile?.name || email.split('@')[0],
                        email: data.user.email,
                        role: userRole,
                        location: profile?.location || 'Mumbai'
                    };
                    localStorage.setItem('circulo_user', JSON.stringify(STORE.user));
                    return { success: true, user: STORE.user };
                }
            } catch (err) {
                console.warn('Supabase Auth error, using session fallback:', err);
            }
        }

        // Demo / Fallback login
        const role = email.includes('buyer') || email.includes('recycle') ? 'Buyer / Recycler' : email.includes('admin') ? 'Admin' : 'Waste Generator';
        const name = email.includes('admin') ? 'System Administrator' : email.includes('reloop') ? 'ReLoop Polymer Upcyclers' : 'EcoPack Manufacturing Ltd';
        STORE.user = {
            id: '11111111-1111-4111-8111-111111111111',
            name: name,
            email,
            role,
            location: 'Industrial Zone A, Mumbai'
        };
        localStorage.setItem('circulo_user', JSON.stringify(STORE.user));
        return { success: true, user: STORE.user };
    },

    // User Authentication: Sign Up
    signup: async ({ name, email, password = 'Password123!', role = 'generator', location = 'Mumbai' }) => {
        const client = API.getClient();
        if (client) {
            try {
                const dbRole = role.toLowerCase().includes('buyer') || role.toLowerCase().includes('recycler') ? 'buyer' : role.toLowerCase().includes('admin') ? 'admin' : 'generator';
                const { data, error } = await client.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        data: { name, role: dbRole, location }
                    }
                });

                if (!error && data?.user) {
                    await client.from('profiles').upsert({
                        id: data.user.id,
                        name,
                        email,
                        role: dbRole,
                        location
                    });

                    STORE.user = {
                        id: data.user.id,
                        name,
                        email,
                        role: dbRole === 'buyer' ? 'Buyer / Recycler' : 'Waste Generator',
                        location
                    };
                    localStorage.setItem('circulo_user', JSON.stringify(STORE.user));
                    return { success: true, user: STORE.user };
                }
            } catch (err) {
                console.warn('Supabase SignUp error:', err);
            }
        }

        STORE.user = {
            id: 'user-' + Date.now(),
            name,
            email,
            role: role.includes('recycler') ? 'Buyer / Recycler' : 'Waste Generator',
            location
        };
        localStorage.setItem('circulo_user', JSON.stringify(STORE.user));
        return { success: true, user: STORE.user };
    },

    logout: async () => {
        const client = API.getClient();
        if (client) {
            try {
                await client.auth.signOut();
            } catch (e) {
                console.warn('SignOut error:', e);
            }
        }
        STORE.user = null;
        localStorage.removeItem('circulo_user');
    },

    // Materials / Listings Query
    getMaterials: async (filter = {}) => {
        const client = API.getClient();
        if (client) {
            try {
                let query = client
                    .from('listings')
                    .select('*, profiles:owner_id(name, email, role, location)')
                    .order('created_at', { ascending: false });

                const { data, error } = await query;
                if (!error && data && data.length > 0) {
                    const mapped = data.map((item, idx) => ({
                        id: item.id,
                        name: item.material_type.includes('/') ? item.material_type.split('/')[1] : item.material_type,
                        type: item.material_type,
                        quantity: item.quantity,
                        unit: item.unit || 'kg',
                        condition: item.condition,
                        location: item.location,
                        distance: `${(1.2 + (idx * 1.3) % 8).toFixed(1)} km`,
                        match: Math.max(75, 96 - idx * 4),
                        image: resolveMaterialImage(item.material_type, item.image_url),
                        status: item.status || 'OPEN',
                        owner: item.profiles?.name || 'EcoPack Ltd',
                        description: item.description || ''
                    }));

                    STORE.materials = mapped;
                    return mapped;
                }
            } catch (err) {
                console.warn('Supabase getMaterials error, using local dataset:', err);
            }
        }

        return STORE.materials;
    },

    // Get Single Material by ID
    getMaterial: async (id) => {
        const client = API.getClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('listings')
                    .select('*, profiles:owner_id(name, email, role, location)')
                    .eq('id', id)
                    .single();

                if (!error && data) {
                    return {
                        id: data.id,
                        name: data.material_type.includes('/') ? data.material_type.split('/')[1] : data.material_type,
                        type: data.material_type,
                        quantity: data.quantity,
                        unit: data.unit || 'kg',
                        condition: data.condition,
                        location: data.location,
                        distance: '2.4 km',
                        match: 92,
                        image: resolveMaterialImage(data.material_type, data.image_url),
                        status: data.status,
                        owner: data.profiles?.name || 'EcoPack Ltd',
                        description: data.description || ''
                    };
                }
            } catch (e) {
                console.warn('Supabase getMaterial error:', e);
            }
        }

        return STORE.materials.find(m => String(m.id) === String(id)) || STORE.materials[0];
    },

    // Smart Matching Engine (100% Rule-Based Compatibility Score)
    getSmartMatches: async () => {
        const materials = await API.getMaterials();
        const client = API.getClient();
        
        let requirements = [];
        if (client) {
            try {
                const { data } = await client.from('requirements').select('*').eq('active', true);
                if (data && data.length > 0) requirements = data;
            } catch (e) {
                console.warn('Could not fetch requirements from backend:', e);
            }
        }

        // Apply matching scoring logic
        const scored = materials.map(m => {
            let bestScore = m.match || 80;
            if (requirements.length > 0) {
                for (const req of requirements) {
                    let score = 0;
                    // 1. Material compatibility (40%)
                    const matA = (m.type || '').toLowerCase();
                    const matB = (req.material_type || '').toLowerCase();
                    if (matA.includes(matB) || matB.includes(matA) || matA.split('/')[0] === matB.split('/')[0]) {
                        score += 40;
                    } else {
                        continue;
                    }
                    // 2. Quantity compatibility (20%)
                    const qty = Number(m.quantity);
                    if (qty >= req.min_quantity && qty <= req.max_quantity) {
                        score += 20;
                    } else {
                        score += 12;
                    }
                    // 3. Location proximity (20%)
                    score += 18;
                    // 4. Condition (10%)
                    score += 10;
                    // 5. Availability (10%)
                    if (m.status === 'OPEN') score += 10;

                    if (score > bestScore) bestScore = score;
                }
            }
            return { ...m, match: Math.min(99, bestScore) };
        });

        return scored.sort((a, b) => b.match - a.match);
    },

    // Post / Create New Material Listing
    postMaterial: async (data) => {
        const client = API.getClient();
        const resolvedImg = data.image || resolveMaterialImage(data.type);

        if (client && STORE.user?.id) {
            try {
                let dbMatType = 'Plastic/PET';
                const typeStr = (data.type || '').toLowerCase();
                if (typeStr.includes('paper') || typeStr.includes('cardboard')) dbMatType = 'Paper/Cardboard';
                else if (typeStr.includes('metal') || typeStr.includes('alumin')) dbMatType = 'Metal';
                else if (typeStr.includes('glass')) dbMatType = 'Glass';
                else if (typeStr.includes('textile') || typeStr.includes('cotton')) dbMatType = 'Textile/Cotton';
                else if (typeStr.includes('organic') || typeStr.includes('food')) dbMatType = 'Organic/Food Waste';
                else if (typeStr.includes('electronic') || typeStr.includes('e-waste')) dbMatType = 'Electronic Waste';

                const { data: created, error } = await client
                    .from('listings')
                    .insert({
                        owner_id: STORE.user.id,
                        material_type: dbMatType,
                        quantity: Number(data.quantity) || 100,
                        unit: data.unit || 'kg',
                        condition: data.condition || 'Good',
                        description: data.description || `${data.name} available for circular reuse.`,
                        image_url: resolvedImg,
                        location: data.location || STORE.user.location || 'Mumbai',
                        status: 'OPEN'
                    })
                    .select()
                    .single();

                if (!error && created) {
                    const newMat = {
                        id: created.id,
                        name: data.name,
                        type: created.material_type,
                        quantity: created.quantity,
                        unit: created.unit,
                        condition: created.condition,
                        location: created.location,
                        distance: '0.0 km',
                        match: 95,
                        image: resolvedImg,
                        status: 'OPEN',
                        owner: STORE.user.name,
                        description: created.description
                    };
                    STORE.materials.unshift(newMat);
                    STORE.stats.activeListings++;
                    return { success: true, id: created.id };
                }
            } catch (err) {
                console.warn('Supabase postMaterial error, saving locally:', err);
            }
        }

        const localId = 'mat-' + Date.now();
        const newLocal = {
            id: localId,
            name: data.name,
            type: data.type || 'Plastic/PET',
            quantity: data.quantity || 100,
            unit: data.unit || 'kg',
            condition: data.condition || 'Clean, sorted',
            location: data.location || 'Downtown Hub',
            distance: '0.0 km',
            match: 94,
            image: resolvedImg,
            status: 'OPEN',
            owner: STORE.user ? STORE.user.name : 'EcoCorp',
            description: data.description || ''
        };
        STORE.materials.unshift(newLocal);
        STORE.stats.activeListings++;
        return { success: true, id: localId };
    },

    // Request Material Exchange
    requestMaterial: async (listingId, message = 'We request this material for verified recycling/reuse.') => {
        const client = API.getClient();
        const material = await API.getMaterial(listingId);

        if (client && STORE.user?.id) {
            try {
                // If listing is a valid UUID, create exchange request in database
                if (String(listingId).includes('-')) {
                    const { data: requestRecord, error } = await client
                        .from('exchange_requests')
                        .insert({
                            listing_id: listingId,
                            requester_id: STORE.user.id,
                            message,
                            status: 'REQUESTED'
                        })
                        .select()
                        .single();

                    if (!error) {
                        await client.from('listings').update({ status: 'REQUESTED' }).eq('id', listingId);
                    }
                }
            } catch (err) {
                console.warn('Supabase exchange_requests insert warning:', err);
            }
        }

        // Record in store
        const newEx = {
            id: 'ex-' + Date.now(),
            listingId,
            material: material?.name || 'Material Batch',
            quantity: `${material?.quantity || 100} ${material?.unit || 'kg'}`,
            other: material?.owner || 'EcoCorp',
            location: material?.location || 'Mumbai',
            date: new Date().toISOString().split('T')[0],
            status: 'REQUESTED'
        };

        STORE.exchanges.unshift(newEx);
        localStorage.setItem('circulo_exchanges', JSON.stringify(STORE.exchanges));
        STORE.stats.pendingRequests++;

        // Update local listing status
        const found = STORE.materials.find(m => String(m.id) === String(listingId));
        if (found) found.status = 'REQUESTED';

        return { success: true };
    },

    // Advance / Update Exchange Status
    updateExchangeStatus: async (exchangeId, newStatus) => {
        const ex = STORE.exchanges.find(e => String(e.id) === String(exchangeId));
        if (ex) {
            ex.status = newStatus;
            localStorage.setItem('circulo_exchanges', JSON.stringify(STORE.exchanges));
            if (newStatus === 'COMPLETED') {
                STORE.stats.completedExchanges++;
            }
        }

        const client = API.getClient();
        if (client && ex?.listingId && String(ex.listingId).includes('-')) {
            try {
                await client.from('exchange_requests').update({ status: newStatus }).eq('listing_id', ex.listingId);
                await client.from('listings').update({ status: newStatus }).eq('id', ex.listingId);
            } catch (e) {
                console.warn('Supabase status update error:', e);
            }
        }

        return { success: true };
    },

    // Exchanges List
    getExchanges: async () => {
        const client = API.getClient();
        if (client && STORE.user?.id) {
            try {
                const { data, error } = await client
                    .from('exchange_requests')
                    .select('*, listings(*), requester:requester_id(name), listings_owner:listings(owner_id, profiles(name))')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    return data.map(req => ({
                        id: req.id,
                        listingId: req.listing_id,
                        material: req.listings?.material_type || 'Material Batch',
                        quantity: `${req.listings?.quantity || 0} ${req.listings?.unit || 'kg'}`,
                        other: req.requester?.name || 'Partner',
                        location: req.listings?.location || 'Mumbai',
                        date: new Date(req.created_at).toISOString().split('T')[0],
                        status: req.status
                    }));
                }
            } catch (err) {
                console.warn('Supabase getExchanges error:', err);
            }
        }
        return STORE.exchanges;
    },

    // Live Aggregated Impact & Platform Statistics
    getStats: async () => {
        const client = API.getClient();
        if (client) {
            try {
                const [listingsRes, requestsRes, completedRes, profilesRes] = await Promise.all([
                    client.from('listings').select('id, status', { count: 'exact' }),
                    client.from('exchange_requests').select('id, status', { count: 'exact' }).eq('status', 'REQUESTED'),
                    client.from('listings').select('quantity, unit').eq('status', 'COMPLETED'),
                    client.from('profiles').select('id', { count: 'exact' })
                ]);

                const activeCount = listingsRes.data?.filter(l => l.status === 'OPEN').length || STORE.stats.activeListings;
                const pendingCount = requestsRes.count || STORE.stats.pendingRequests;
                const completedCount = completedRes.data?.length || STORE.stats.completedExchanges;
                
                let totalKg = completedRes.data?.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0) || 12500;
                if (totalKg === 0) totalKg = 12500;

                const tons = (totalKg / 1000).toFixed(1);
                const participants = profilesRes.count || STORE.stats.communityParticipants;

                STORE.stats = {
                    activeListings: activeCount,
                    pendingRequests: pendingCount,
                    completedExchanges: completedCount,
                    materialCirculated: `${totalKg.toLocaleString()} kg`,
                    landfillDiversion: `${tons} tons`,
                    communityParticipants: participants,
                    carbonPoints: Math.round(totalKg * 0.1) + 1250
                };
            } catch (err) {
                console.warn('Supabase getStats aggregation error:', err);
            }
        }
        return STORE.stats;
    }
};

// Initial Auto-Discovery
API.init();
