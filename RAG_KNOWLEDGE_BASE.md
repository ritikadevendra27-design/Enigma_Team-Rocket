# ♻️ GreenLoop: Smart Circular Economy & Waste Exchange Platform
## Official RAG (Retrieval-Augmented Generation) Knowledge Base Document
**Hackathon:** CSI Enigma 5.0 | **Team:** Team Rocket  
**Domain:** Industrial Symbiosis, Circular Economy, B2B Waste Exchange, Automated Material Matching & Carbon Accounting

---

## 📌 CHUNK 001: Platform Identity & Core Mission
- **System Name:** GreenLoop (Smart Circular Economy & Waste Exchange Platform)
- **Primary Objective:** Connect industrial waste generators (manufacturing plants, colleges, fabricators, commercial facilities) with verified recycling partners and upcyclers to divert industrial byproducts from landfills into circular supply chains.
- **Key Capabilities:**
  1. Real-time material listings with verified physical specifications and conditions.
  2. 100% rule-based transparent Smart Matching Engine (scoring compatibility between supply and buyer requirements).
  3. End-to-end 4-stage transaction workflow (REQUESTED, ACCEPTED, REJECTED, COMPLETED).
  4. Instant carbon footprint accounting: computes landfill diversion (kg), CO2e emissions avoided, and energy conserved.
  5. Multi-role access control for Generators, Buyers, and Platform Admins backed by Row-Level Security (RLS).

---

## 📌 CHUNK 002: System Architecture & Tech Stack
- **Frontend Layer:** React 18, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend & Database:** Supabase (PostgreSQL 15), Supabase Auth, Supabase Storage for material imagery.
- **Security & Integrity:** PostgreSQL Row-Level Security (RLS) policies enforcing ownership validation, automated timestamps via triggers (`handle_new_user`, `set_updated_at`).
- **Core Entities:**
  - `PROFILES`: Linked 1:1 with `auth.users`, storing role (`generator`, `buyer`, `admin`), organization name, email, and geographic location.
  - `LISTINGS`: Material lots offered by generators with quantity, unit, condition, and status.
  - `REQUIREMENTS`: Standing procurement specifications posted by buyers (material, quantity bounds, acceptable grades, location).
  - `EXCHANGE_REQUESTS`: Formal transaction bids between buyers and listings.

---

## 📌 CHUNK 003: Database Schema Specification

### 1. `public.profiles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, FK -> `auth.users(id)` ON DELETE CASCADE | Unique user identifier |
| `name` | TEXT | NOT NULL | Organization or facility name |
| `email` | TEXT | NOT NULL | Contact email address |
| `role` | TEXT | CHECK IN ('generator', 'buyer', 'admin') | Access control role |
| `location` | TEXT | NULLABLE | Physical hub/city/industrial zone |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account registration timestamp |

### 2. `public.listings`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique listing ID |
| `owner_id` | UUID | FK -> `profiles(id)` ON DELETE CASCADE | Seller profile ID |
| `material_type`| TEXT | CHECK IN ('Plastic/PET', 'Paper/Cardboard', 'Glass', 'Metal', 'Textile/Cotton', 'Organic/Food Waste', 'Electronic Waste') | Standardized category |
| `quantity` | NUMERIC | CHECK (quantity > 0) | Quantity available |
| `unit` | TEXT | NOT NULL ('kg', 'tons', 'units') | Measurement unit |
| `condition` | TEXT | CHECK IN ('Excellent', 'Good', 'Fair', 'Poor') | Physical grade |
| `description` | TEXT | NULLABLE | Flake size, moisture, handling info |
| `image_url` | TEXT | NULLABLE | Supabase storage public URL |
| `location` | TEXT | NOT NULL | Facility location |
| `status` | TEXT | CHECK IN ('OPEN', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'CLOSED') | Transaction status |

### 3. `public.requirements`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique requirement ID |
| `buyer_id` | UUID | FK -> `profiles(id)` ON DELETE CASCADE | Procurement buyer profile ID |
| `material_type`| TEXT | CHECK IN ('Plastic/PET', 'Paper/Cardboard', 'Glass', 'Metal', 'Textile/Cotton', 'Organic/Food Waste', 'Electronic Waste') | Desired waste category |
| `min_quantity` | NUMERIC | CHECK (min_quantity >= 0) | Minimum acceptable volume |
| `max_quantity` | NUMERIC | CHECK (max_quantity >= min_quantity) | Batch ceiling capacity |
| `acceptable_condition` | TEXT[] | DEFAULT ARRAY['Excellent', 'Good'] | Array of acceptable grades |
| `location` | TEXT | NULLABLE | Destination facility |
| `active` | BOOLEAN | DEFAULT TRUE | Whether demand is actively seeking supply |

### 4. `public.exchange_requests`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Transaction request ID |
| `listing_id` | UUID | FK -> `listings(id)` ON DELETE CASCADE | Targeted listing |
| `requester_id`| UUID | FK -> `profiles(id)` ON DELETE CASCADE | Buyer placing request |
| `status` | TEXT | CHECK IN ('REQUESTED', 'ACCEPTED', 'REJECTED', 'COMPLETED') | State machine status |
| `message` | TEXT | NULLABLE | Logistics proposal or terms |

---

## 📌 CHUNK 004: 100% Rule-Based Smart Matching Engine
The Smart Matching Engine computes real-time compatibility between an open listing and active buyer requirements without opaque neural networks.

$$\text{Final Compatibility Score} = \text{Material (40\%)} + \text{Quantity (20\%)} + \text{Location (20\%)} + \text{Condition (10\%)} + \text{Availability (10\%)}$$

### Detailed Sub-Score Breakdown:
1. **Material Compatibility (40 Points Max):**
   - Exact normalized string match (`listing.material_type == requirement.material_type`): **40 pts**
   - Mismatch: **0 pts** (Immediate disqualification from top matching tier)
2. **Quantity Compatibility (20 Points Max):**
   - Quantity within buyer's requested bracket (`min_quantity <= listing.quantity <= max_quantity`): **20 pts**
   - Near-capacity range (within 70% of min or up to +30% above max): **12 to 18 pts**
   - Moderate fit (40% to 69% of min): **5 to 8 pts**
   - Drastic volume mismatch: **0 pts**
3. **Location & Proximity Compatibility (20 Points Max):**
   - Identical industrial zone / hub: **20 pts** (Est. ~1.2 km)
   - Same metropolitan district (e.g., both within Mumbai): **19 pts** (Est. ~4.8 km)
   - Adjacent industrial cluster (e.g., Mumbai to Thane or Navi Mumbai): **16 pts** (Est. ~22 km)
   - Shared logistics cluster tokens (e.g., "Zone", "Park", "Phase"): **15 pts** (Est. ~18 km)
   - Regional transit / Inter-district: **10 pts** (Est. ~85 km)
4. **Condition Compatibility (10 Points Max):**
   - Listed condition directly included in buyer's `acceptable_condition` array: **10 pts**
   - Adjacent grade tolerance (e.g., 'Fair' when buyer asks for 'Good'): **5 pts**
   - Non-compliant condition: **0 pts**
5. **Availability & Status (10 Points Max):**
   - Listing status is `OPEN` and buyer requirement is `active == true`: **10 pts**
   - Already claimed or paused: **0 pts**

---

## 📌 CHUNK 005: Verified Impact & Carbon Accounting Methodology
All impact statistics update deterministically when a listing transitions to `COMPLETED`.

### Formulas & Multipliers:
1. **Landfill Diversion (kg):**
   $$\text{Diversion (kg)} = \sum \text{quantity of all COMPLETED listings}$$
2. **CO2e Emissions Avoided (kg CO2e):**
   $$\text{CO2e Avoided} = \text{Diverted kg} \times 1.45 \text{ kg CO}_2\text{e/kg}$$
   *(Based on avoided virgin production and displaced incineration)*
3. **Energy Conserved (kWh):**
   $$\text{Energy Conserved} = \text{Diverted kg} \times 2.75 \text{ kWh/kg}$$
   *(Represents industrial process power savings from recycled feedstock)*
4. **Landfill Volume Diverted ($\text{m}^3$):**
   $$\text{Landfill Volume Saved} = \text{Diverted kg} \times 0.0035 \text{ m}^3\text{/kg}$$
5. **Category-Specific Emission Factors & Green Points (Platform Benchmarks):**
   - **Plastic / PET:** 10 Points/kg | 0.85 kg CO2e saved/kg
   - **Paper / Cardboard:** 6 Points/kg | 0.60 kg CO2e saved/kg
   - **Metal:** 12 Points/kg | 1.20 kg CO2e saved/kg
   - **Textile / Cotton:** 8 Points/kg | 1.50 kg CO2e saved/kg
   - **Glass:** 5 Points/kg | 0.30 kg CO2e saved/kg
   - **Electronic Waste:** 9 Points/kg | 0.90 kg CO2e saved/kg
   - **Organic / Food Waste:** 4 Points/kg | 0.40 kg CO2e saved/kg

---

## 📌 CHUNK 006: Transaction Lifecycle & State Transitions
1. **`OPEN` State:**
   - Generator creates a listing. Available in marketplace search and matching engine.
2. **`REQUESTED` State:**
   - Buyer clicks "Request Exchange". An `exchange_requests` record is created.
   - Listing status automatically mirrors to `REQUESTED` to avoid double-allocation.
3. **`ACCEPTED` State:**
   - Generator reviews the buyer's proposal and accepts.
   - Listing and exchange request are both locked into `ACCEPTED`. Logistics coordination begins.
4. **`COMPLETED` State:**
   - Upon physical verification of material handoff, either party marks the exchange complete.
   - The listing is irrevocably marked `COMPLETED`.
   - The weight is added to global and personal **Verified Impact Dashboards**.
5. **`REJECTED` / `CLOSED` State:**
   - Generator rejects a request. If no other active requests exist, listing status reverts back to `OPEN`.

---

## 📌 CHUNK 007: Standard Material Taxonomies & Quality Standards
- **Plastic / PET & HDPE:**
  - *Clean / Sorted:* Baled post-industrial bottles, clean preform regrind, moisture < 2%, no PVC contaminants.
  - *Regrind / Flake:* Washed flakes, optical sorting preferred, color separation (clear vs. mixed).
- **Paper / Cardboard (OCC):**
  - *OCC 11 Standard:* Corrugated cardboard shipping containers, baled, moisture < 12%, unsoiled by food oil.
- **Glass Cullet:**
  - Separated by color (Amber, Flint/Clear, Green), crushed to 15mm-25mm, zero ceramic or pyrex stones.
- **Metal Scrap:**
  - Aluminum: Alloy 6061 / 6063 clean extrusions and CNC cutoffs, degreased.
  - Copper: Bare bright #1 conductor bundles and clean stripped wire remnants.
- **Textile / Cotton:**
  - 100% post-industrial spinning waste, un-dyed selvedge cuttings, zero polyester blending.
- **Organic & Biomass:**
  - Spent brewer grain, bagasse, market vegetable trimmings for bio-methanation and composting.
- **Electronic Waste:**
  - Decommissioned PCBs, server motherboards, power supplies, compliant with WEEE / RoHS standards.

---

## 📌 CHUNK 008: Seed Data Snapshot (Current Live Marketplace)
### Active Listings:
1. `Plastic/PET` - 500 kg | Condition: Good | Location: Industrial Zone A, Mumbai | Status: OPEN | Owner: EcoPack Manufacturing
2. `Plastic/PET` - 1,200 kg | Condition: Excellent (HDPE Pellets) | Location: Industrial Zone A, Mumbai | Status: OPEN | Owner: EcoPack Manufacturing
3. `Paper/Cardboard` - 850 kg | Condition: Excellent (OCC 11) | Location: Industrial Zone A, Mumbai | Status: OPEN | Owner: EcoPack Manufacturing
4. `Glass` - 350 kg | Condition: Good (Cullet 15-25mm) | Location: Bhiwandi Logistics Hub, Thane | Status: OPEN | Owner: EcoPack Manufacturing
5. `Metal` - 420 kg | Condition: Good (Alloy 6061 Cutoffs) | Location: Tech Park, Bengaluru | Status: OPEN | Owner: Metro Electronics
6. `Metal` - 250 kg | Condition: Fair (Bare Copper #1) | Location: Tech Park, Bengaluru | Status: OPEN | Owner: Metro Electronics
7. `Textile/Cotton` - 600 kg | Condition: Good (100% Un-dyed) | Location: Surat Textile Corridor, Gujarat | Status: OPEN | Owner: EcoPack Manufacturing
8. `Organic/Food Waste` - 1,500 kg | Condition: Fair (Brewer Mash) | Location: Sector 18, Pune | Status: OPEN | Owner: GreenHarvest Agro
9. `Electronic Waste` - 180 units | Condition: Fair (Motherboards/PSU) | Location: Electronic City, Bengaluru | Status: OPEN | Owner: Metro Electronics
10. `Plastic/PET` - 750 kg | Condition: Excellent | Status: COMPLETED | Historical Diversion: 750 kg (1,087.5 kg CO2e avoided)

### Standing Buyer Demand Requirements:
1. **ReLoop Polymer Upcyclers:** `Plastic/PET` | Range: 300 - 700 kg | Grade: Good, Excellent | Location: Navi Mumbai Industrial Cluster (Matches 500 kg PET Listing at **95% compatibility**)
2. **ReLoop Polymer Upcyclers:** `Plastic/PET` | Range: 1,000 - 2,500 kg | Grade: Excellent | Location: Industrial Zone A, Mumbai
3. **Apex Fiber & Metal Recyclers:** `Paper/Cardboard` | Range: 500 - 1,200 kg | Grade: Good, Excellent | Location: Mumbai Metro Logistics Zone

---

## 📌 CHUNK 009: Frequently Asked Questions (RAG Q&A Pairs)

**Q1: How does the Smart Matching algorithm evaluate distance?**  
**A:** The platform checks geographic granularity: listings in the exact same industrial zone receive the maximum 20 points (~1.2 km). Locations within the same metropolitan city (e.g., Mumbai) score 19 points (~4.8 km). Adjacent industrial corridors (e.g., Mumbai to Thane or Navi Mumbai) receive 16 points (~22 km), shared logistical zones receive 15 points, and inter-district transfers receive 10 points (~85 km).

**Q2: What is the exact formula for CO2e avoidance?**  
**A:** For every kilogram of completed material exchange, the platform calculates $\text{kg} \times 1.45\text{ kg CO}_2\text{e}$ avoided compared to virgin extraction and incineration, supplemented by specific category weights (e.g., 0.85 for PET, 1.20 for Metal, 1.50 for Textile).

**Q3: Can a buyer request an exchange if their required quantity is slightly higher or lower than the listing?**  
**A:** Yes. The Smart Matching Engine applies a proportional score between 12 and 18 points if the quantity is within 70% of the minimum demand or up to 30% above the maximum capacity, enabling flexible spot-market negotiations.

**Q4: How does a user verify their circular impact?**  
**A:** Verified circular impact is aggregated strictly from listings that have successfully concluded the transaction state machine into `COMPLETED`. Draft or active `REQUESTED` items do not inflate environmental metrics.

**Q5: Who can manage listings and delete them?**  
**A:** PostgreSQL Row-Level Security (RLS) ensures that only authenticated profiles where `auth.uid() == owner_id` can edit or delete a listing, while platform administrators possess supervisory access.
