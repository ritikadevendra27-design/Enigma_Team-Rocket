import React, { useState } from 'react';
import { MATERIAL_TYPES, CONDITIONS, STATUSES } from '../services/listingService';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export const ListingFilters = ({ filters, onFilterChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-8 space-y-4">
      
      {/* Top Search Bar & Category Pills */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search waste streams, materials, or locations..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Quick Material Category Horizontal Scroller */}
        <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onFilterChange({ ...filters, material_type: 'ALL' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              !filters.material_type || filters.material_type === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Streams
          </button>
          {MATERIAL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange({ ...filters, material_type: type })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filters.material_type === type
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Advanced Filter Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 rounded-xl transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Advanced Filter Dropdowns */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 animate-fadeIn">
          
          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Filter by Location
            </label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
              placeholder="e.g. Mumbai, Bengaluru, Pune..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Condition
            </label>
            <select
              value={filters.condition || 'ALL'}
              onChange={(e) => onFilterChange({ ...filters, condition: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="ALL">All Conditions</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Min & Max Quantity */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Min Quantity
            </label>
            <input
              type="number"
              min="0"
              value={filters.min_quantity || ''}
              onChange={(e) => onFilterChange({ ...filters, min_quantity: e.target.value })}
              placeholder="e.g. 100"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Status
            </label>
            <select
              value={filters.status || 'OPEN'}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="OPEN">OPEN (Available)</option>
              <option value="ALL">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>
      )}

    </div>
  );
};
