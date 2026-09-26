import React, { useState, useEffect } from 'react';
import { impactService } from '../services/impactService';
import { 
  X, 
  Leaf, 
  Recycle, 
  Flame, 
  Zap, 
  Building2, 
  Info, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const ImpactDashboardModal = ({ isOpen, onClose }) => {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadImpactData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await impactService.getImpactMetrics();
      if (data.error) setError(data.error);
      else setImpact(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch impact metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadImpactData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Circular Economy &amp; Landfill Diversion Impact
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified metrics calculated strictly from completed physical material exchanges.
            </p>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="my-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-300">Methodology Note: </span>
            Material diverted equals completed exchange quantities. Environmental CO2e and energy values are transparent heuristic estimates for MVP modeling.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span>Aggregating verified circular impact data...</span>
          </div>
        ) : (
          <div className="space-y-5 my-3">
            
            {/* Primary Impact Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Recycle className="w-4 h-4" /> Material Circulated
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {impact?.totalMaterialCirculatedKg?.toLocaleString() || 0} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {(impact?.totalMaterialCirculatedKg / 1000).toFixed(2)} metric tons
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-teal-500/20 bg-teal-500/5">
                <div className="text-[11px] font-semibold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" /> Landfill Footprint
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {impact?.estimates?.landfillDivertedM3 || 0} <span className="text-xs font-normal text-slate-400">m³</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Diverted from dump sites
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
                <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Completed Exchanges
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {impact?.completedExchangeCount || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Closed loop transactions
                </div>
              </div>
            </div>

            {/* Configurable Projections */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Est. Avoided CO2e Emissions</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  ~{impact?.estimates?.co2OffsetKg?.toLocaleString() || 0} <span className="text-xs font-normal text-slate-400">kg CO2e</span>
                </div>
                <span className="text-[9px] uppercase font-mono text-slate-500 mt-0.5 block">
                  *Configurable factor 1.45x
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Est. Conserved Energy</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  ~{impact?.estimates?.energySavedKWh?.toLocaleString() || 0} <span className="text-xs font-normal text-slate-400">kWh</span>
                </div>
                <span className="text-[9px] uppercase font-mono text-slate-500 mt-0.5 block">
                  *Configurable factor 2.75x
                </span>
              </div>
            </div>

            {/* Stream Category Breakdown */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Material Stream Circulation Breakdown
              </h3>

              {impact?.categoryBreakdown && Object.keys(impact.categoryBreakdown).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(impact.categoryBreakdown).map(([cat, data]) => {
                    const pct = impact.totalMaterialCirculatedKg > 0
                      ? Math.round((data.quantity / impact.totalMaterialCirculatedKg) * 100)
                      : 0;

                    return (
                      <div key={cat} className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-white">{cat}</span>
                          <span className="text-slate-400 font-mono">
                            {data.quantity.toLocaleString()} kg ({pct}%) • {data.count} batch{data.count > 1 ? 'es' : ''}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                  No completed exchanges recorded yet. When transactions transition from ACCEPTED to COMPLETED, category distribution will render here.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
