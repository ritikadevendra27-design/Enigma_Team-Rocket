// Mock Data Store
const STORE = {
    user: JSON.parse(localStorage.getItem('circulo_user')) || null,
    materials: [
        { id: 1, name: 'PET Bottles', type: 'Plastic', quantity: '500', unit: 'kg', condition: 'Clean, sorted', location: 'Downtown Hub', distance: '2.4 km', match: 92, image: 'https://images.unsplash.com/photo-1595278069441-2f29f7f45d8b?auto=format&fit=crop&w=400&q=80', status: 'Available', owner: 'EcoCorp' },
        { id: 2, name: 'Cardboard Boxes', type: 'Paper', quantity: '1000', unit: 'kg', condition: 'Used, flattened', location: 'Westside Retail', distance: '5.1 km', match: 88, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80', status: 'Available', owner: 'SuperMart' },
        { id: 3, name: 'Aluminium Cans', type: 'Metal', quantity: '200', unit: 'kg', condition: 'Crushed', location: 'North Campus', distance: '1.2 km', match: 84, image: 'https://images.unsplash.com/photo-1593368857488-2947119f3900?auto=format&fit=crop&w=400&q=80', status: 'Available', owner: 'University' },
        { id: 4, name: 'Cotton Textiles', type: 'Textile', quantity: '350', unit: 'kg', condition: 'Mixed scraps', location: 'East Industrial', distance: '8.0 km', match: 76, image: 'https://images.unsplash.com/photo-1528255915607-9012fda0f838?auto=format&fit=crop&w=400&q=80', status: 'Available', owner: 'FashionCo' }
    ],
    exchanges: [
        { id: 101, material: 'Office Paper', quantity: '150 kg', other: 'GreenRecycle', location: 'City Center', date: '2023-10-12', status: 'COMPLETED' },
        { id: 102, material: 'Glass Bottles', quantity: '300 kg', other: 'GlassWorks', location: 'South Hub', date: '2023-10-15', status: 'ACCEPTED' },
        { id: 103, material: 'E-Waste', quantity: '50 kg', other: 'TechSalvage', location: 'Downtown Hub', date: '2023-10-18', status: 'REQUESTED' }
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

const API = {
    login: (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                STORE.user = { name: 'Alex Doe', email, role: 'Waste Generator', location: 'San Francisco, CA' };
                localStorage.setItem('circulo_user', JSON.stringify(STORE.user));
                resolve({ success: true, user: STORE.user });
            }, 500);
        });
    },
    logout: () => {
        STORE.user = null;
        localStorage.removeItem('circulo_user');
    },
    getMaterials: () => Promise.resolve(STORE.materials),
    getMaterial: (id) => Promise.resolve(STORE.materials.find(m => m.id == id)),
    getSmartMatches: () => {
        return Promise.resolve([...STORE.materials].sort((a, b) => b.match - a.match));
    },
    getExchanges: () => Promise.resolve(STORE.exchanges),
    getStats: () => Promise.resolve(STORE.stats),
    postMaterial: (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newId = STORE.materials.length + 1;
                STORE.materials.unshift({
                    ...data,
                    id: newId,
                    distance: '0 km',
                    match: Math.floor(Math.random() * 20) + 75,
                    status: 'Available',
                    owner: STORE.user.name,
                    image: data.image || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'
                });
                STORE.stats.activeListings++;
                resolve({ success: true, id: newId });
            }, 800);
        });
    },
    requestMaterial: (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const material = STORE.materials.find(m => m.id == id);
                STORE.exchanges.unshift({
                    id: Date.now(),
                    material: material.name,
                    quantity: `${material.quantity} ${material.unit}`,
                    other: material.owner,
                    location: material.location,
                    date: new Date().toISOString().split('T')[0],
                    status: 'REQUESTED'
                });
                resolve({ success: true });
            }, 500);
        });
    }
};
