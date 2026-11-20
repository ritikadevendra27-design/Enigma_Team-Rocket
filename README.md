# ♻️ GreenLoop — Smart Circular Economy & Industrial Waste Exchange Platform

> **Hackathon Project:** CSI Enigma 5.0 | **Team:** Team Rocket (Members: Krutika Chaskar, Pratyush Deshmukh, Ritika Devendra, Rohit Hazra)
> **Domain:** Circular Economy • B2B Industrial Waste Exchange • Algorithmic Matching • Carbon Accounting • RAG AI

---

## 📌 Project Summary (What is GreenLoop?)

**GreenLoop** is a B2B circular economy platform that connects industrial scrap generators (factories, workshops, fabrication labs) with verified recyclers and upcyclers. 

Instead of dumping high-grade manufacturing byproducts (plastics, scrap metal, corrugated cardboard, textiles, e-waste) into landfills, GreenLoop matches available scrap with buyer demand, tracks transactions through a formal workflow, and measures verified carbon savings.

---

## ❓ The Problem & Solution

* **The Problem:** Factories produce tons of recyclable byproducts every day, but have no quick way to find local recyclers with matching requirements. Traditional scrap dealers are fragmented, unverified, and lack transparency, leading to massive landfill dumping.
* **The Solution:** A unified digital exchange featuring deterministic matchmaking, verified quality grading, a secure transaction lifecycle, and real-time environmental impact calculations.

---

## ⚙️ How It Works (Step-by-Step Flow)

```
[ 1. Post Scrap ]        [ 2. Define Demand ]
Generators list byproducts   Buyers specify needed materials
(type, qty, grade, location) (min/max qty, acceptable grades)
             \                  /
              v                v
      [ 3. Smart Matching Engine (0–100%) ]
      Calculates compatibility across material,
      volume, proximity, and condition
                       |
                       v
     [ 4. 4-Stage Transaction Lifecycle ]
     OPEN  -->  REQUESTED  -->  ACCEPTED  -->  COMPLETED
                       |
                       v
     [ 5. Verified Carbon & Impact Hub ]
     Calculates Landfill Diversion (kg), CO₂e Avoided,
     and Energy Saved strictly from completed deals
```

---

## 🧠 Core Features & How They Were Built

### 1. 100% Rule-Based Smart Matching Engine
Rather than relying on unpredictable AI models for financial contracts, GreenLoop uses a **deterministic, weighted scoring formula**:
* **Material (40%):** Strict equality check on the material category.
* **Quantity (20%):** Full points if supply fits the buyer's volume window; scaled points if within $\pm 30\%$.
* **Location (20%):** Proximity matrix rewarding local industrial zones (~1.2 km) over distant regions.
* **Condition (10%):** Verifies if the material's physical grade (*Excellent*, *Good*, *Fair*) meets the buyer's specs.
* **Availability (10%):** Confirms the listing is open and the buyer's demand is active.
* *Output:* A numeric score (0–100%) plus an automatically generated plain-English explanation of the match.

### 2. 4-Stage Transaction State Machine
Guarantees transactional integrity:
$$\text{OPEN} \xrightarrow{\text{Buyer Requests}} \text{REQUESTED} \xrightarrow{\text{Generator Accepts}} \text{ACCEPTED} \xrightarrow{\text{Receipt Confirmed}} \text{COMPLETED}$$
* Automatically locks listings to prevent double-allocation.
* If a request is rejected, the listing safely reverts to `OPEN`.

### 3. Verified Environmental Impact & Carbon Accounting
Environmental metrics are calculated **strictly from completed physical batches** to prevent inflated sustainability numbers:
* **Landfill Diversion:** Direct sum of completed lot weights (kg).
* **$\text{CO}_2\text{e}$ Avoided:** $\text{Diverted kg} \times 1.45 \text{ kg CO}_2\text{e}$
* **Energy Conserved:** $\text{Diverted kg} \times 2.75 \text{ kWh}$
* **Green Points:** Category-specific ratings (e.g., 10 pts/kg for PET plastic, 12 pts/kg for metal).

### 4. AI & RAG (Retrieval-Augmented Generation) Intelligence
* Built a zero-dependency **TF-IDF vector retrieval engine** in both JavaScript and Python.
* Chunks structured domain knowledge (material specs, grading criteria, carbon factors, FAQs).
* Retrieves relevant context and synthesizes grounded answers without hallucinations, with optional hooks to Gemini 1.5 Flash.

### 5. Multi-Tenant Database Security (PostgreSQL RLS)
* Enforces PostgreSQL **Row-Level Security (RLS)** policies so users can only modify their own listings.
* Automated database triggers synchronize new user accounts with public profiles and maintain timestamps.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React (Responsive modern dark-mode UI).
* **Backend & Database:** Supabase (PostgreSQL 15), Supabase Auth (JWT), Supabase Storage (Material lot images).
* **AI & Search:** Custom TF-IDF vectorizer + Cosine Similarity search, RAG document knowledge base, optional Gemini API integration.
* **Testing:** Node.js automated test suites for matching algorithms and environmental formulas.

---

## 💡 What This Project Demonstrates

* **Full-Stack Engineering:** Developed a modular React architecture with custom hooks (`useAuth`), reactive UI modals, and clean service-layer abstractions (`matchingService`, `impactService`, `listingService`).
* **Relational Database Design:** Built a normalized PostgreSQL schema with foreign key cascades, automated triggers, and enterprise-grade Row-Level Security (RLS).
* **Algorithmic Logic:** Designed a multi-attribute weighted scoring algorithm with spatial proximity heuristics and natural language reasoning generation.
* **Information Retrieval (IR) & AI:** Implemented vector indexing, TF-IDF scoring, and RAG context-grounding from scratch.
* **Real-World Domain Modeling:** Handled practical B2B edge cases such as order state synchronization, race-condition avoidance, and GHG Protocol-aligned carbon accounting.

---

## 🚀 Quick Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the Application
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Run Automated Matching & Math Tests
```bash
node scripts/testMatchingWorkflow.js
```
Runs end-to-end verification of the 100% weighted matching formula and carbon impact calculations.

---

## 👥 Contributors

**Team Rocket** — Krutika Chaskar, Pratyush Deshmukh, Ritika Devendra, Rohit Hazra
* *Focus Areas:* Full-Stack Development, Supabase Architecture, Rule-Based Matching Algorithms, Carbon Accounting, and RAG AI.