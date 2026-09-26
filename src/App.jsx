import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { listingService } from './services/listingService';
import { dashboardService } from './services/dashboardService';
import { Navbar } from './components/Navbar';
import { ListingCard } from './components/ListingCard';
import { ListingFilters } from './components/ListingFilters';
import { AuthModal } from './components/AuthModal';
import { CreateListingModal } from './components/CreateListingModal';
import { ProfileModal } from './components/ProfileModal';
import { SmartMatchModal } from './components/SmartMatchModal';
import { RequirementsModal } from './components/RequirementsModal';
import { ExchangeRequestsDrawer } from './components/ExchangeRequestsDrawer';
import { ImpactDashboardModal } from './components/ImpactDashboardModal';
import { 
  Sparkles, 
  Recycle, 
  Layers, 
  Scale, 
  TrendingUp, 
  PlusCircle, 
  Loader2, 
  AlertCircle,
  PackageOpen,
  Zap,
  ArrowRightLeft,
  Leaf
} from 'lucide-react';

export function App() {
  const { user, profile, role, loading: authLoading } = useAuth();

  // Listings State
  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingListings, setLoadingListings] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Dashboard Aggregates
  const [dashboardMetrics, setDashboardMetrics] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    material_type: 'ALL',
    location: '',
    min_quantity: '',
    max_quantity: '',
    condition: 'ALL',
    status: 'OPEN',
    search: '',
  });

  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  // Developer 2 Modals
  const [isSmartMatchOpen, setIsSmartMatchOpen] = useState(false);
  const [targetMatchListing, setTargetMatchListing] = useState(null);
  const [targetMatchRequirement, setTargetMatchRequirement] = useState(null);

  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);

  // Fetch Listings
  const loadListings = useCallback(async () => {
    setLoadingListings(true);
    setErrorMessage('');
    try {
      const { listings: fetchedListings, count, error } = await listingService.filterListings(filters);
      if (error) {
        setErrorMessage(error);
      } else {
        setListings(fetchedListings || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load listings.');
    } finally {
      setLoadingListings(false);
    }
  }, [filters]);

  const loadMetrics = useCallback(async () => {
    try {
      const { metrics } = await dashboardService.getDashboardMetrics(user?.id);
      if (metrics) setDashboardMetrics(metrics);
    } catch (err) {
      console.warn('Metrics aggregation error:', err);
    }
  }, [user]);

  useEffect(() => {
    loadListings();
    loadMetrics();
  }, [loadListings, loadMetrics]);

  // Handle Edit Listing
  const handleEdit = (listing) => {
    setEditingListing(listing);
    setIsCreateOpen(true);
  };

  // Handle Delete Listing
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const { success, error } = await listingService.deleteListing(id);
      if (error) {
        alert(`Error deleting listing: ${error}`);
      } else {
        setListings((prev) => prev.filter((item) => item.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        loadMetrics();
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Open Smart Match for a Listing
  const handleSmartMatchListing = (listing) => {
    setTargetMatchListing(listing);
    setTargetMatchRequirement(null);
    setIsSmartMatchOpen(true);
  };

  // Open Smart Match for a Requirement
  const handleSmartMatchRequirement = (req) => {
    setIsRequirementsOpen(false);
    setTargetMatchListing(null);
    setTargetMatchRequirement(req);
    setIsSmartMatchOpen(true);
  };

  // Direct Request trigger from Listing Card
  const handleDirectRequest = (listing) => {
    if (!user) {
      setAuthTab('login');
      setIsAuthOpen(true);
      return;
    }
    setTargetMatchListing(listing);
    setTargetMatchRequirement(null);
    setIsSmartMatchOpen(true);
  };

  // Callback when a listing or exchange is updated
  const handleDataRefresh = () => {
    loadListings();
    loadMetrics();
    setEditingListing(null);
  };

  const handleResetFilters = () => {
    setFilters({
      material_type: 'ALL',
      location: '',
      min_quantity: '',
      max_quantity: '',
      condition: 'ALL',
      status: 'OPEN',
      search: '',
    });
  };

  const totalVolume = listings.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const circulatedKg = dashboardMetrics?.global?.totalMaterialCirculatedKg || 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setIsAuthOpen(true);
        }}
        onOpenCreateListing={() => {
          setEditingListing(null);
          setIsCreateOpen(true);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenRequirements={() => setIsRequirementsOpen(true)}
        onOpenRequests={() => setIsRequestsOpen(true)}
        onOpenImpact={() => setIsImpactOpen(true)}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-[#0b0f19]">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            
            {/* Supabase + Hackathon MVP Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Supabase Backend Foundation</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Zap className="w-3.5 h-3.5" />
                <span>Rule-Based Smart Matching (100% Weighted)</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Decentralized <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Waste Exchange</span> &amp; Circular Sourcing
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-6 leading-relaxed">
              Match industrial scrap generators with certified polymer, metal, and fiber upcyclers. Closed-loop verified material exchanges with transparent compatibility scoring.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              
              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Active Listings
                </div>
                <div className="text-xl font-bold text-white mt-1">{totalCount}</div>
              </div>

              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <Scale className="w-3.5 h-3.5 text-teal-400" /> Available Volume
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {totalVolume.toLocaleString()} <span className="text-xs font-normal text-slate-400">units/kg</span>
                </div>
              </div>

              <button
                onClick={() => setIsImpactOpen(true)}
                className="glass-panel p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 transition-all text-left group"
              >
                <div className="text-[11px] text-emerald-400 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5" /> Circulated
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white">View &rarr;</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {circulatedKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
              </button>

              <button
                onClick={() => setIsRequestsOpen(true)}
                className="glass-panel p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-left group"
              >
                <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> Transactions
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white">Hub &rarr;</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  {dashboardMetrics?.global?.totalRequests || 0}
                </div>
              </button>

            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Filters */}
        <ListingFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-200">Supabase Connection Notice: </span>
                {errorMessage.includes('secret') || errorMessage.includes('Forbidden') ? (
                  <span>
                    You pasted the <strong>Secret Key</strong> (<code>sb_secret_...</code>) into <code>.env</code>. In the browser, Supabase requires the <strong>anon (public)</strong> key (starts with <code>eyJ...</code> or <code>sb_anon_...</code>).
                  </span>
                ) : (
                  <span>{errorMessage}</span>
                )}
              </div>
            </div>
            <button
              onClick={loadListings}
              className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl text-rose-200 font-semibold text-xs whitespace-nowrap transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {loadingListings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="glass-card rounded-2xl h-80 animate-pulse bg-slate-900/40 border border-slate-800/80"
              />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSmartMatch={handleSmartMatchListing}
                onRequestExchange={handleDirectRequest}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Listings Found</h3>
            <p className="text-xs text-slate-400 mb-6">
              No waste material matching the current filter criteria was found. Try clearing your filters or publish a new waste listing.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Smart Circular Economy &amp; Waste Exchange Platform • Team Rocket
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Supabase PostgreSQL</span>
            <span>•</span>
            <span>Rule-Based Matching</span>
            <span>•</span>
            <span>RLS Active</span>
            <span>•</span>
            <span>Landfill Diversion Tracker</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
      />

      <CreateListingModal
        isOpen={isCreateOpen}
        editListing={editingListing}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingListing(null);
        }}
        onListingSaved={handleDataRefresh}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Developer 2 Modals */}
      <SmartMatchModal
        isOpen={isSmartMatchOpen}
        targetListing={targetMatchListing}
        targetRequirement={targetMatchRequirement}
        onClose={() => setIsSmartMatchOpen(false)}
        onRequestSent={handleDataRefresh}
      />

      <RequirementsModal
        isOpen={isRequirementsOpen}
        onClose={() => setIsRequirementsOpen(false)}
        onFindMatchesForReq={handleSmartMatchRequirement}
      />

      <ExchangeRequestsDrawer
        isOpen={isRequestsOpen}
        onClose={() => setIsRequestsOpen(false)}
        onExchangeUpdated={handleDataRefresh}
      />

      <ImpactDashboardModal
        isOpen={isImpactOpen}
        onClose={() => setIsImpactOpen(false)}
      />

    </div>
  );
}

export default App;
