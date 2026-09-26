import React, { useState, useEffect } from 'react';
import { exchangeRequestService } from '../services/exchangeRequestService';
import { useAuth } from '../hooks/useAuth';
import { 
  X, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  CheckCheck, 
  Clock, 
  MapPin, 
  Scale, 
  Loader2, 
  AlertCircle,
  Inbox,
  Send
} from 'lucide-react';

export const ExchangeRequestsDrawer = ({ isOpen, onClose, onExchangeUpdated }) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'sent'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAllRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const [incRes, sentRes] = await Promise.all([
        exchangeRequestService.getRequestsForOwner(),
        exchangeRequestService.getRequestsForUser(),
      ]);

      if (incRes.error) setError(incRes.error);
      else setIncomingRequests(incRes.requests || []);

      if (sentRes.error) setError(sentRes.error);
      else setSentRequests(sentRes.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to load exchange requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccept = async (reqId) => {
    setActionLoadingId(reqId);
    try {
      const { request, error: aError } = await exchangeRequestService.acceptRequest(reqId);
      if (aError) alert(aError);
      else {
        await loadAllRequests();
        if (onExchangeUpdated) onExchangeUpdated();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (reqId) => {
    if (!window.confirm('Are you sure you want to reject this exchange request?')) return;
    setActionLoadingId(reqId);
    try {
      const { request, error: rError } = await exchangeRequestService.rejectRequest(reqId);
      if (rError) alert(rError);
      else {
        await loadAllRequests();
        if (onExchangeUpdated) onExchangeUpdated();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (reqId) => {
    if (!window.confirm('Mark this physical material exchange as COMPLETED? This will record the circular impact!')) return;
    setActionLoadingId(reqId);
    try {
      const { request, error: cError } = await exchangeRequestService.completeExchange(reqId);
      if (cError) alert(cError);
      else {
        await loadAllRequests();
        if (onExchangeUpdated) onExchangeUpdated();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending Approval
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            Accepted • In Transit
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Completed • Circulated
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const listToRender = activeTab === 'incoming' ? incomingRequests : sentRequests;

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

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Exchange Transactions Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track requests, approve material pickups, and confirm circular handoffs.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl mb-5 border border-slate-800">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'incoming'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Incoming Requests ({incomingRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'sent'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>My Sourcing Requests ({sentRequests.length})</span>
          </button>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Requests List */}
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Loading transactions...</span>
          </div>
        ) : listToRender.length > 0 ? (
          <div className="space-y-4">
            {listToRender.map((req) => {
              const isActionable = activeTab === 'incoming';
              const isLoadingThis = actionLoadingId === req.id;

              return (
                <div
                  key={req.id}
                  className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {req.listings?.material_type}
                        </span>
                        <span className="text-white font-bold text-sm">
                          ({req.listings?.quantity} {req.listings?.unit})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>
                          {activeTab === 'incoming'
                            ? `Requester: ${req.requester?.name || 'Verified Buyer'}`
                            : `Generator: ${req.listings?.profiles?.name || 'Industrial Generator'}`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {req.listings?.location}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(req.status)}
                  </div>

                  {/* Message */}
                  {req.message && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                      <span className="font-semibold text-slate-400">Note: </span>
                      {req.message}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Generator Controls */}
                    {isActionable && req.status === 'REQUESTED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={isLoadingThis}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAccept(req.id)}
                          disabled={isLoadingThis}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isLoadingThis && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Accept Request</span>
                        </button>
                      </div>
                    )}

                    {/* Complete Button (Available to either party once Accepted) */}
                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleComplete(req.id)}
                        disabled={isLoadingThis}
                        className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isLoadingThis && <Loader2 className="w-3 h-3 animate-spin" />}
                        <CheckCheck className="w-4 h-4" />
                        <span>Confirm Delivery &amp; Complete Exchange</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            <ArrowRightLeft className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <p className="font-semibold text-slate-300">
              No {activeTab === 'incoming' ? 'Incoming' : 'Sent'} Exchange Requests
            </p>
            <p className="mt-1">
              {activeTab === 'incoming'
                ? 'When buyers request your waste materials, transactions will appear here.'
                : 'Use Smart Match or browse listings to send material sourcing requests.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
