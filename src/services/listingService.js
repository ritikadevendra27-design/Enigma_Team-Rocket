import { supabase } from '../lib/supabase.js';
import { storageService } from './storageService.js';

export const MATERIAL_TYPES = [
  'Plastic/PET',
  'Paper/Cardboard',
  'Glass',
  'Metal',
  'Textile/Cotton',
  'Organic/Food Waste',
  'Electronic Waste',
];

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

export const STATUSES = ['OPEN', 'REQUESTED', 'ACCEPTED', 'COMPLETED', 'CLOSED'];

export const UNITS = ['kg', 'tons', 'lbs', 'units', 'bales', 'liters'];

/**
 * Validates listing input fields
 * @param {Object} data 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateListingData = (data) => {
  if (!data) return { valid: false, error: 'Listing data is required.' };

  if (!data.material_type || !MATERIAL_TYPES.includes(data.material_type)) {
    return {
      valid: false,
      error: `Invalid material type. Must be one of: ${MATERIAL_TYPES.join(', ')}`,
    };
  }

  const numQuantity = Number(data.quantity);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    return { valid: false, error: 'Quantity must be a positive number greater than 0.' };
  }

  if (!data.unit || !data.unit.trim()) {
    return { valid: false, error: 'Unit (e.g. kg, tons, units) is required.' };
  }

  if (!data.condition || !CONDITIONS.includes(data.condition)) {
    return {
      valid: false,
      error: `Invalid condition. Must be one of: ${CONDITIONS.join(', ')}`,
    };
  }

  if (!data.location || !data.location.trim()) {
    return { valid: false, error: 'Location is required.' };
  }

  if (data.status && !STATUSES.includes(data.status)) {
    return {
      valid: false,
      error: `Invalid status. Must be one of: ${STATUSES.join(', ')}`,
    };
  }

  return { valid: true };
};

export const listingService = {
  /**
   * CREATE: Create a new waste/material listing
   * @param {Object} listingData
   * @param {string} listingData.material_type
   * @param {number} listingData.quantity
   * @param {string} listingData.unit
   * @param {string} listingData.condition
   * @param {string} [listingData.description]
   * @param {string} listingData.location
   * @param {string} [listingData.image_url]
   * @param {string} [listingData.status]
   * @param {File} [imageFile] Optional image file to upload to Supabase Storage
   * @returns {Promise<{ listing: object|null, error: string|null }>}
   */
  async createListing(listingData, imageFile = null) {
    try {
      // 1. Check authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { listing: null, error: 'You must be logged in to create a listing.' };
      }

      // 2. Validate input fields
      const validation = validateListingData(listingData);
      if (!validation.valid) {
        return { listing: null, error: validation.error };
      }

      // 3. Handle image upload if provided
      let finalImageUrl = listingData.image_url || null;
      if (imageFile) {
        const { publicUrl, error: uploadError } = await storageService.uploadListingImage(
          imageFile,
          user.id
        );
        if (uploadError) {
          return { listing: null, error: `Image upload failed: ${uploadError}` };
        }
        finalImageUrl = publicUrl;
      }

      // 4. Insert into Supabase listings table
      const insertPayload = {
        owner_id: user.id,
        material_type: listingData.material_type,
        quantity: Number(listingData.quantity),
        unit: listingData.unit.trim(),
        condition: listingData.condition,
        description: listingData.description?.trim() || '',
        image_url: finalImageUrl,
        location: listingData.location.trim(),
        status: listingData.status || 'OPEN',
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(insertPayload)
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .single();

      if (error) {
        return { listing: null, error: error.message };
      }

      return { listing: data, error: null };
    } catch (err) {
      return { listing: null, error: err.message || 'Failed to create listing.' };
    }
  },

  /**
   * READ: Get all listings (default OPEN status or custom criteria) with seller profiles
   * @param {Object} [options]
   * @param {number} [options.limit]
   * @param {number} [options.offset]
   * @param {string} [options.status]
   * @returns {Promise<{ listings: Array<object>, count: number, error: string|null }>}
   */
  async getListings(options = {}) {
    try {
      const { limit = 50, offset = 0, status = 'OPEN' } = options;

      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            email,
            role,
            location
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status && status !== 'ALL') {
        query = query.eq('status', status);
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return { listings: [], count: 0, error: error.message };
      }

      return { listings: data || [], count: count || 0, error: null };
    } catch (err) {
      return { listings: [], count: 0, error: err.message || 'Failed to fetch listings.' };
    }
  },

  /**
   * READ: Get a single listing by ID with full owner details
   * @param {string} id 
   * @returns {Promise<{ listing: object|null, error: string|null }>}
   */
  async getListingById(id) {
    try {
      if (!id) return { listing: null, error: 'Listing ID is required.' };

      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { listing: null, error: error.message };
      }

      return { listing: data, error: null };
    } catch (err) {
      return { listing: null, error: err.message || 'Failed to fetch listing.' };
    }
  },

  /**
   * READ: Get listings created by the currently authenticated user
   * @returns {Promise<{ listings: Array<object>, error: string|null }>}
   */
  async getMyListings() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { listings: [], error: 'User must be authenticated.' };
      }

      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { listings: [], error: error.message };
      }

      return { listings: data || [], error: null };
    } catch (err) {
      return { listings: [], error: err.message || 'Failed to fetch your listings.' };
    }
  },

  /**
   * UPDATE: Update an existing listing (database RLS enforces ownership)
   * @param {string} id
   * @param {Object} updates
   * @param {File} [imageFile]
   * @returns {Promise<{ listing: object|null, error: string|null }>}
   */
  async updateListing(id, updates, imageFile = null) {
    try {
      if (!id) return { listing: null, error: 'Listing ID is required.' };

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { listing: null, error: 'User must be authenticated to update listings.' };
      }

      const payload = {};
      if (updates.material_type !== undefined) {
        if (!MATERIAL_TYPES.includes(updates.material_type)) {
          return { listing: null, error: 'Invalid material type.' };
        }
        payload.material_type = updates.material_type;
      }

      if (updates.quantity !== undefined) {
        const q = Number(updates.quantity);
        if (isNaN(q) || q <= 0) {
          return { listing: null, error: 'Quantity must be greater than 0.' };
        }
        payload.quantity = q;
      }

      if (updates.unit !== undefined) payload.unit = updates.unit.trim();
      if (updates.condition !== undefined) {
        if (!CONDITIONS.includes(updates.condition)) {
          return { listing: null, error: 'Invalid condition.' };
        }
        payload.condition = updates.condition;
      }
      if (updates.description !== undefined) payload.description = updates.description.trim();
      if (updates.location !== undefined) payload.location = updates.location.trim();
      if (updates.status !== undefined) {
        if (!STATUSES.includes(updates.status)) {
          return { listing: null, error: 'Invalid status.' };
        }
        payload.status = updates.status;
      }
      if (updates.image_url !== undefined) payload.image_url = updates.image_url;

      // Handle new image upload
      if (imageFile) {
        const { publicUrl, error: uploadError } = await storageService.uploadListingImage(
          imageFile,
          user.id
        );
        if (uploadError) {
          return { listing: null, error: `Image upload failed: ${uploadError}` };
        }
        payload.image_url = publicUrl;
      }

      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('listings')
        .update(payload)
        .eq('id', id)
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .single();

      if (error) {
        return { listing: null, error: error.message };
      }

      return { listing: data, error: null };
    } catch (err) {
      return { listing: null, error: err.message || 'Failed to update listing.' };
    }
  },

  /**
   * DELETE: Delete a listing and its image (database RLS enforces ownership)
   * @param {string} id 
   * @returns {Promise<{ success: boolean, error: string|null }>}
   */
  async deleteListing(id) {
    try {
      if (!id) return { success: false, error: 'Listing ID is required.' };

      // 1. Fetch listing first to check image cleanup
      const { data: existing } = await supabase
        .from('listings')
        .select('id, owner_id, image_url')
        .eq('id', id)
        .single();

      // 2. Perform delete
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // 3. Clean up image from storage asynchronously if present
      if (existing?.image_url) {
        storageService.deleteListingImage(existing.image_url).catch((err) => {
          console.warn('Storage cleanup warning:', err);
        });
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to delete listing.' };
    }
  },

  /**
   * FILTER: Comprehensive filtering support
   * Supports: material type, location, min/max quantity, condition, status, search keyword
   * @param {Object} filters
   * @param {string} [filters.material_type]
   * @param {string} [filters.location]
   * @param {number} [filters.min_quantity]
   * @param {number} [filters.max_quantity]
   * @param {string} [filters.condition]
   * @param {string} [filters.status]
   * @param {string} [filters.search]
   * @returns {Promise<{ listings: Array<object>, count: number, error: string|null }>}
   */
  async filterListings(filters = {}) {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles:owner_id (
            id,
            name,
            email,
            role,
            location
          )
        `, { count: 'exact' });

      // Status filter (defaults to OPEN if not specified or 'ALL')
      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      } else if (!filters.status) {
        query = query.eq('status', 'OPEN');
      }

      // Material Type
      if (filters.material_type && filters.material_type !== 'ALL') {
        query = query.eq('material_type', filters.material_type);
      }

      // Condition
      if (filters.condition && filters.condition !== 'ALL') {
        query = query.eq('condition', filters.condition);
      }

      // Location (Case-insensitive match)
      if (filters.location && filters.location.trim()) {
        query = query.ilike('location', `%${filters.location.trim()}%`);
      }

      // Quantity range
      if (filters.min_quantity !== undefined && filters.min_quantity !== '') {
        const min = Number(filters.min_quantity);
        if (!isNaN(min)) query = query.gte('quantity', min);
      }

      if (filters.max_quantity !== undefined && filters.max_quantity !== '') {
        const max = Number(filters.max_quantity);
        if (!isNaN(max)) query = query.lte('quantity', max);
      }

      // Text Search across description and location
      if (filters.search && filters.search.trim()) {
        const term = filters.search.trim();
        query = query.or(`description.ilike.%${term}%,location.ilike.%${term}%,material_type.ilike.%${term}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        return { listings: [], count: 0, error: error.message };
      }

      return { listings: data || [], count: count || 0, error: null };
    } catch (err) {
      return { listings: [], count: 0, error: err.message || 'Failed to filter listings.' };
    }
  },
};
