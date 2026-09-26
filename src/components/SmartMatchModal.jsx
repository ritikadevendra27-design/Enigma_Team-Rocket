import React, { useState, useEffect } from 'react';
import { matchingService } from '../services/matchingService';
import { exchangeRequestService } from '../services/exchangeRequestService';
import { useAuth } from '../hooks/useAuth';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Zap,
  Tag
} from 'lucide-react';

export const SmartMatchModal = ({ isOpen, onClose, targetListing = null, targetRequirement = null, onRequestSent }) => {
  const { user, role } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Request submission state
  const [requestingMatchId, setRequestingMatchId] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const computeMatches = async () => {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        if (targetListing) {
          const { matches: results, error: mError } = await matchingService.findMatchesForListing(targetListing);
          if (mError) setError(mError);
          else setMatches(results || []);
        } else if (targetRequirement) {
          const { matches: results, error: mError } = await matchingService.findMatchesForRequirement(targetRequirement);
          if (mError) setError(mError);
          else setMatches(results || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to compute matches.');
      } finally {
        setLoading(false);
      }
    };

    computeMatches();
  }, [isOpen, targetListing, targetRequirement]);

  if (!isOpen) return null;

  const handleSendRequest = async (listingId) => {
    if (!user) {
      alert('Please log in to submit exchange requests.');
      return;
    }

    setRequestingMatchId(listingId);
    try {
      const { request, error: rError } = await exchangeRequestService.createExchangeRequest({
        listing_id: listingId,
        message: requestMessage.trim() || 'Requesting circular material exchange for verified processing.',
      });

      if (rError) {
        alert(rError);
      } else {
        setSuccessMessage('Exchange request successfully submitted to generator!');
        if (onRequestSent) onRequestSent(request);
      }
    } catch (err) {
      alert(err.message || 'Failed to send request.');
    } finally {
      setRequestingMatchId(null);
    }
  };

  const getScoreColor = (pct) => {
    if (pct >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (pct >= 70) return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
    if (pct >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Smart Matching Engine
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Rule-Based (100% Weight)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {targetListing
                ? `Evaluating active buyer demands for: ${targetListing.material_type} (${targetListing.quantity} ${targetListing.unit})`
                : `Finding compatible waste streams for: ${targetRequirement?.material_type} requirement`}
            </p>
          </div>
        </div>

        {/* Scoring Matrix Explainer */}
        <div className="my-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] grid grid-cols-5 gap-2 text-center">
          <div className="p-1.5 rounded-lg bg-slate-900/80">
            <div className="text-slate-400 font-medium">Material</div>
            <div className="text-emerald-400 font-bold">40%</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/80">
            <div className="text-slate-400 font-medium">Quantity</div>
            <div className="text-teal-400 font-bold">20%</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/80">
            <div className="text-slate-400 font-medium">Location</div>
            <div className="text-cyan-400 font-bold">20%</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/80">
            <div className="text-slate-400 font-medium">Condition</div>
            <div className="text-blue-400 font-bold">10%</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-900/80">
            <div className="text-slate-400 font-medium">Timing</div>
            <div className="text-purple-400 font-bold">10%</div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Matches List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span>Computing rule-based compatibility matrix...</span>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4 my-4">
            {matches.map((match, idx) => (
              <div
                key={match.requirementId || match.listingId || idx}
                className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3"
              >
                {/* Match Top Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1} Match</span>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {match.buyerName || match.listing?.material_type}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{match.buyerLocation || match.listing?.location}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{match.distance}</span>
                    </div>
                  </div>

                  {/* Overall Percentage Badge */}
                  <div className={`px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 ${getScoreColor(match.matchPercentage)}`}>
                    <span className="text-lg font-black">{match.matchPercentage}%</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Match</span>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] pt-1">
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block">Material</span>
                    <span className="text-white font-bold">{match.scores.materialScore}/40</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block">Quantity</span>
                    <span className="text-white font-bold">{match.scores.quantityScore}/20</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block">Location</span>
                    <span className="text-white font-bold">{match.scores.locationScore}/20</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block">Condition</span>
                    <span className="text-white font-bold">{match.scores.conditionScore}/10</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block">Timing</span>
                    <span className="text-white font-bold">{match.scores.availabilityScore}/10</span>
                  </div>
                </div>

                {/* Human-readable Reason */}
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-400">Match Reason: </span>
                    {match.reason}
                  </div>
                </div>

                {/* Request Button (if viewing from a Buyer's requirement) */}
                {targetRequirement && match.listingId && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleSendRequest(match.listingId)}
                      disabled={requestingMatchId === match.listingId}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
                    >
                      {requestingMatchId === match.listingId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Request Material Stream</span>
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="font-semibold text-white">No Compatible Matches Found</p>
            <p className="mt-1 max-w-sm mx-auto text-slate-500">
              No active buyer requirements or waste listings currently meet the 50% minimum threshold for this material.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
