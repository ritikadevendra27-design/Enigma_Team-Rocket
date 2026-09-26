import React, { useState, useEffect } from 'react';
import { listingService, MATERIAL_TYPES, CONDITIONS, UNITS, STATUSES } from '../services/listingService';
import { X, UploadCloud, Image as ImageIcon, AlertCircle, Loader2, Check } from 'lucide-react';

export const CreateListingModal = ({ isOpen, onClose, onListingSaved, editListing = null }) => {
  const [materialType, setMaterialType] = useState(MATERIAL_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [condition, setCondition] = useState('Good');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('OPEN');
  
  // Image handling
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editListing) {
      setMaterialType(editListing.material_type || MATERIAL_TYPES[0]);
      setQuantity(editListing.quantity ? String(editListing.quantity) : '');
      setUnit(editListing.unit || 'kg');
      setCondition(editListing.condition || 'Good');
      setLocation(editListing.location || '');
      setDescription(editListing.description || '');
      setStatus(editListing.status || 'OPEN');
      setImageUrl(editListing.image_url || '');
      setImagePreview(editListing.image_url || '');
      setImageFile(null);
    } else {
      setMaterialType(MATERIAL_TYPES[0]);
      setQuantity('');
      setUnit('kg');
      setCondition('Good');
      setLocation('');
      setDescription('');
      setStatus('OPEN');
      setImageUrl('');
      setImagePreview('');
      setImageFile(null);
    }
    setError('');
  }, [editListing, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setError('Quantity must be a positive number greater than 0.');
      return;
    }

    if (!location.trim()) {
      setError('Location is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        material_type: materialType,
        quantity: numQty,
        unit: unit.trim(),
        condition,
        location: location.trim(),
        description: description.trim(),
        status,
        image_url: imageUrl.trim() || undefined,
      };

      let result;
      if (editListing?.id) {
        result = await listingService.updateListing(editListing.id, payload, imageFile);
      } else {
        result = await listingService.createListing(payload, imageFile);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onListingSaved(result.listing);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {editListing ? 'Edit Waste Listing' : 'List Waste / Secondary Material'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish post-industrial or commercial scrap stream for circular re-entry.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Material Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Material Category *
            </label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {MATERIAL_TYPES.map((type) => (
                <option key={type} value={type} className="bg-slate-900 text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Available Quantity (&gt; 0) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u} className="bg-slate-900 text-white">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Material Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Listing Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pickup / Facility Location *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Industrial Area Phase 2, Pune"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Material Description & Specifications
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include moisture content, contamination level, packaging (baled, loose, drums), or purity specifications..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Image Upload (Supabase Storage) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Material Photo (Upload to Supabase Storage)
            </label>
            
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer border border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-950/80 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-300">
                  {imageFile ? imageFile.name : 'Choose file (JPG, PNG, WEBP)'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Max 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-800">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(''); setImageUrl(''); }}
                    className="absolute top-1 right-1 bg-slate-900/80 p-0.5 rounded-full text-rose-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Optional Fallback Image URL */}
            <div className="mt-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (!imageFile) setImagePreview(e.target.value);
                }}
                placeholder="Or paste external image URL (e.g. Unsplash demo)"
                className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl py-1.5 px-3 text-[11px] text-slate-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : editListing ? (
                'Save Changes'
              ) : (
                'Publish Listing'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
