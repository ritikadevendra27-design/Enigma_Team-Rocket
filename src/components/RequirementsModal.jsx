import React, { useState, useEffect } from 'react';
import { requirementService } from '../services/requirementService';
import { MATERIAL_TYPES, CONDITIONS } from '../services/listingService';
import { useAuth } from '../hooks/useAuth';
import { 
  X, 
  PlusCircle, 
  Trash2, 
  Zap, 
  Check, 
  Loader2, 
  AlertCircle, 
  Layers, 
  MapPin, 
  Scale 
} from 'lucide-react';

export const RequirementsModal = ({ isOpen, onClose, onFindMatchesForReq }) => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New requirement form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [materialType, setMaterialType] = useState(MATERIAL_TYPES[0]);
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [selectedConditions, setSelectedConditions] = useState(['Good', 'Excellent']);
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRequirements = async () => {
    setLoading(true);
    setError('');
    try {
      const { requirements: reqs, error: rError } = await requirementService.getMyRequirements();
      if (rError) setError(rError);
      else setRequirements(reqs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch requirements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequirements();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConditionToggle = (cond) => {
    if (selectedConditions.includes(cond)) {
      if (selectedConditions.length > 1) {
        setSelectedConditions(selectedConditions.filter(c => c !== cond));
      }
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { requirement, error: cError } = await requirementService.createRequirement({
        material_type: materialType,
        min_quantity: Number(minQty),
        max_quantity: Number(maxQty),
        acceptable_condition: selectedConditions,
        location: location.trim(),
        active: true,
      });

      if (cError) {
        setError(cError);
      } else {
        setRequirements([requirement, ...requirements]);
        setShowAddForm(false);
        setMinQty('');
        setMaxQty('');
        setLocation('');
      }
    } catch (err) {
      setError(err.message || 'Failed to create requirement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequirement = async (id) => {
    if (!window.confirm('Delete this demand requirement?')) return;
    try {
      const { success, error: dError } = await requirementService.deleteRequirement(id);
      if (dError) alert(dError);
      else setRequirements(requirements.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

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

        {/* Title & Action */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Buyer Sourcing Demand
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify your facility's secondary raw material demand for automated matching.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel' : 'Add Demand'}</span>
          </button>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleCreateRequirement} className="mb-6 p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">New Demand Specification</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Material */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Material Category *</label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Facility Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Navi Mumbai / Bengaluru"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Min & Max Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Min Acceptable (kg) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Max Capacity (kg) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={maxQty}
                  onChange={(e) => setMaxQty(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Acceptable Conditions */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Acceptable Conditions *</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((cond) => {
                  const active = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => handleConditionToggle(cond)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      <span>{cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Buyer Requirement'}
            </button>
          </form>
        )}

        {/* Existing Requirements List */}
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Loading sourcing requirements...</span>
          </div>
        ) : requirements.length > 0 ? (
          <div className="space-y-3">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {req.material_type}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Active Demand
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-teal-400" />
                    <span>{req.min_quantity} – {req.max_quantity} kg</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{req.location || 'Local Area'}</span>
                    <span>•</span>
                    <span>Accepts: {req.acceptable_condition?.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onFindMatchesForReq(req)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Smart Match</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRequirement(req.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            <Layers className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <p className="font-semibold text-slate-300">No Demand Requirements Configured</p>
            <p className="mt-1">Add your secondary raw material specifications above to activate matching.</p>
          </div>
        )}

      </div>
    </div>
  );
};
