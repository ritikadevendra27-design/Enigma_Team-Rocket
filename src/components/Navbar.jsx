import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Recycle, 
  PlusCircle, 
  User, 
  LogOut, 
  Shield, 
  Factory, 
  ShoppingBag, 
  ArrowRightLeft, 
  Leaf, 
  Layers, 
  Zap 
} from 'lucide-react';

export const Navbar = ({
  onOpenAuth,
  onOpenCreateListing,
  onOpenProfile,
  onOpenRequirements,
  onOpenRequests,
  onOpenImpact,
}) => {
  const { user, profile, role, logout } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'buyer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShoppingBag className="w-3 h-3" /> Buyer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Factory className="w-3 h-3" /> Generator
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Recycle className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Circular<span className="text-emerald-400">Ex</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
              Waste &amp; Raw Materials Marketplace
            </span>
          </div>
        </div>

        {/* Center / Feature Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Impact Dashboard Button */}
          <button
            onClick={onOpenImpact}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Circular Impact</span>
          </button>

          {/* Buyer Requirements Button */}
          <button
            onClick={onOpenRequirements}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Buyer Demands</span>
          </button>

          {/* Exchange Requests Hub */}
          {user && (
            <button
              onClick={onOpenRequests}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
              <span>Transactions</span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Impact Quick Button on Mobile */}
          <button
            onClick={onOpenImpact}
            title="View Impact"
            className="lg:hidden p-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            <Leaf className="w-4 h-4" />
          </button>

          {user ? (
            <>
              {/* Transactions on Mobile */}
              <button
                onClick={onOpenRequests}
                title="Exchange Transactions"
                className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                <ArrowRightLeft className="w-4 h-4 text-teal-400" />
              </button>

              {/* Generator / Admin can Post Waste Listings */}
              {(role === 'generator' || role === 'admin') && (
                <button
                  onClick={onOpenCreateListing}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">List Waste Material</span>
                  <span className="sm:hidden">List</span>
                </button>
              )}

              {/* Buyer Demand Button for Buyers */}
              {role === 'buyer' && (
                <button
                  onClick={onOpenRequirements}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Demand Spec</span>
                  <span className="sm:hidden">Demand</span>
                </button>
              )}

              {/* User Dropdown / Profile pill */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-slate-800/60 border border-slate-800/80 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {profile?.name || user.email}
                    </div>
                    {getRoleBadge()}
                  </div>
                </button>

                {/* Logout */}
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
