import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Scale, Clock, Edit2, Trash2, Tag, Zap, ArrowRight } from 'lucide-react';

export const ListingCard = ({ listing, onEdit, onDelete, onSmartMatch, onRequestExchange }) => {
  const { user, role: userRole } = useAuth();

  const isOwner = user && listing.owner_id === user.id;
  const isAdmin = userRole === 'admin';
  const canManage = isOwner || isAdmin;
  const isBuyer = userRole === 'buyer';

  // Condition Badge Color Styling
  const getConditionStyle = (cond) => {
    switch (cond) {
      case 'Excellent':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Good':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Fair':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Poor':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Status Badge Color Styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse';
      case 'REQUESTED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ACCEPTED':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'COMPLETED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CLOSED':
        return 'bg-slate-700 text-slate-400 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Format relative date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800/90 group">
      
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.material_type}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600">
              <Tag className="w-12 h-12 opacity-40" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md ${getStatusStyle(
                listing.status
              )}`}
            >
              {listing.status}
            </span>
          </div>

          {/* Condition Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-md ${getConditionStyle(
                listing.condition
              )}`}
            >
              {listing.condition} Condition
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Material Category & Quantity */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                {listing.material_type}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                {listing.quantity} {listing.unit}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatDate(listing.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {listing.description}
            </p>
          )}

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>

          {/* Seller / Generator Info */}
          {listing.profiles && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[10px] border border-slate-700">
                  {listing.profiles.name?.charAt(0) || 'G'}
                </div>
                <span className="text-slate-300 font-medium line-clamp-1">
                  {listing.profiles.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 capitalize">
                {listing.profiles.role}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Smart Match Trigger */}
        <button
          onClick={() => onSmartMatch(listing)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Smart Match</span>
        </button>

        {/* Contextual Actions */}
        <div className="flex items-center gap-2">
          {/* Buyer can directly request if not owner */}
          {user && !isOwner && listing.status === 'OPEN' && (
            <button
              onClick={() => onRequestExchange(listing)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all"
            >
              <span>Request</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Owner or Admin Controls */}
          {canManage && (
            <>
              <button
                onClick={() => onEdit(listing)}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                title="Edit Listing"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(listing.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete Listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
