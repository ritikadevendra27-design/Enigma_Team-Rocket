import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env directly
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
        if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = val;
      }
    }
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEMO_USERS = [
  {
    email: 'ecopack.generator@circulareconomy.org',
    password: 'Password123!',
    name: 'EcoPack Manufacturing Ltd',
    role: 'generator',
    location: 'Industrial Zone A, Mumbai',
  },
  {
    email: 'metro.electronics@circulareconomy.org',
    password: 'Password123!',
    name: 'Metro Electronics Refurbishers',
    role: 'generator',
    location: 'Tech Park, Bengaluru',
  },
  {
    email: 'reloop.buyer@circulareconomy.org',
    password: 'Password123!',
    name: 'ReLoop Polymer Upcyclers',
    role: 'buyer',
    location: 'Navi Mumbai',
  },
  {
    email: 'apexfiber.buyer@circulareconomy.org',
    password: 'Password123!',
    name: 'Apex Fiber & Metal Recyclers',
    role: 'buyer',
    location: 'Tech Park, Bengaluru',
  },
];

const DEMO_LISTINGS = [
  {
    userEmail: 'ecopack.generator@circulareconomy.org',
    material_type: 'Plastic/PET',
    quantity: 500,
    unit: 'kg',
    condition: 'Good',
    description: 'Baled post-industrial clear PET flake scraps from bottle preform trimming. Clean, uncolored, and moisture-controlled.',
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    location: 'Industrial Zone A, Mumbai',
    status: 'OPEN',
  },
  {
    userEmail: 'ecopack.generator@circulareconomy.org',
    material_type: 'Paper/Cardboard',
    quantity: 850,
    unit: 'kg',
    condition: 'Excellent',
    description: 'Double-wall corrugated cardboard shipping boxes (OCC 11), compacted into high-density bales, moisture < 12%.',
    image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    location: 'Industrial Zone A, Mumbai',
    status: 'OPEN',
  },
  {
    userEmail: 'metro.electronics@circulareconomy.org',
    material_type: 'Metal',
    quantity: 420,
    unit: 'kg',
    condition: 'Good',
    description: 'Clean aluminum CNC extrusion cutoffs and sheet offcuts (Alloy 6061/6063). Degreased and dry.',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    location: 'Tech Park, Bengaluru',
    status: 'OPEN',
  },
  {
    userEmail: 'ecopack.generator@circulareconomy.org',
    material_type: 'Plastic/PET',
    quantity: 750,
    unit: 'kg',
    condition: 'Excellent',
    description: 'Historical completed circular batch for impact demonstration.',
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    location: 'Industrial Zone A, Mumbai',
    status: 'COMPLETED',
  },
];

const DEMO_REQUIREMENTS = [
  {
    buyerEmail: 'reloop.buyer@circulareconomy.org',
    material_type: 'Plastic/PET',
    min_quantity: 300,
    max_quantity: 700,
    acceptable_condition: ['Good', 'Excellent'],
    location: 'Navi Mumbai',
    active: true,
  },
  {
    buyerEmail: 'reloop.buyer@circulareconomy.org',
    material_type: 'Plastic/PET',
    min_quantity: 800,
    max_quantity: 2000,
    acceptable_condition: ['Excellent'],
    location: 'Industrial Zone A, Mumbai',
    active: true,
  },
  {
    buyerEmail: 'apexfiber.buyer@circulareconomy.org',
    material_type: 'Paper/Cardboard',
    min_quantity: 400,
    max_quantity: 1200,
    acceptable_condition: ['Good', 'Excellent'],
    location: 'Mumbai Metro Logistics Zone',
    active: true,
  },
  {
    buyerEmail: 'apexfiber.buyer@circulareconomy.org',
    material_type: 'Metal',
    min_quantity: 200,
    max_quantity: 600,
    acceptable_condition: ['Good', 'Fair', 'Excellent'],
    location: 'Tech Park, Bengaluru',
    active: true,
  },
];

async function seed() {
  console.log('🌱 Starting Full Circular Platform Seeding...');
  const userMap = {};

  // 1. Users
  for (const user of DEMO_USERS) {
    let { data: authData } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (!authData?.user) {
      const { data: signUpData } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: { name: user.name, role: user.role, location: user.location },
        },
      });
      authData = signUpData;
    }

    if (authData?.user) {
      userMap[user.email] = authData.user.id;
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      });
      console.log(`✅ User profile: ${user.name} (${user.role})`);
    }
  }

  // 2. Listings
  console.log('\n📦 Seeding Listings...');
  const listingMap = {};
  for (const item of DEMO_LISTINGS) {
    const ownerId = userMap[item.userEmail];
    if (!ownerId) continue;

    const { data } = await supabase.from('listings').insert({
      owner_id: ownerId,
      material_type: item.material_type,
      quantity: item.quantity,
      unit: item.unit,
      condition: item.condition,
      description: item.description,
      image_url: item.image_url,
      location: item.location,
      status: item.status,
    }).select().single();

    if (data) {
      listingMap[`${item.material_type}-${item.quantity}`] = data.id;
      console.log(`✅ Listing: ${data.material_type} (${data.quantity} ${data.unit}) - Status: ${data.status}`);
    }
  }

  // 3. Buyer Requirements
  console.log('\n🎯 Seeding Buyer Requirements...');
  for (const req of DEMO_REQUIREMENTS) {
    const buyerId = userMap[req.buyerEmail];
    if (!buyerId) continue;

    const { data } = await supabase.from('requirements').insert({
      buyer_id: buyerId,
      material_type: req.material_type,
      min_quantity: req.min_quantity,
      max_quantity: req.max_quantity,
      acceptable_condition: req.acceptable_condition,
      location: req.location,
      active: req.active,
    }).select().single();

    if (data) {
      console.log(`✅ Requirement: ${data.material_type} (${data.min_quantity}–${data.max_quantity} kg) for ${req.buyerEmail}`);
    }
  }

  console.log('\n🎉 All Seed data populated successfully!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
