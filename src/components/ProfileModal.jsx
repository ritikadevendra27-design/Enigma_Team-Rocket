import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, User, MapPin, Shield, Check, Loader2, AlertCircle } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, role } = useAuth();
  
  const [name, setName] = useState(profile?.name || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [selectedRole, setSelectedRole] = useState(profile?.role || 'generator');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await updateProfile({
        name,
        location,
        role: selectedRole,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-white tracking-tight">Organization Profile</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account credentials, primary location, and circular marketplace role.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Account Email (Supabase Auth)
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl py-2 px-3 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Organization / Contact Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Operating Location / Facility
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State / Industrial Zone"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Platform Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['generator', 'buyer', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    selectedRole === r
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
