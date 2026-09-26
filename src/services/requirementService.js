import { supabase } from '../lib/supabase.js';
import { MATERIAL_TYPES, CONDITIONS } from './listingService.js';

export const validateRequirementData = (data) => {
  if (!data) return { valid: false, error: 'Requirement data is required.' };

  if (!data.material_type || !MATERIAL_TYPES.includes(data.material_type)) {
    return {
      valid: false,
      error: `Invalid material type. Must be one of: ${MATERIAL_TYPES.join(', ')}`,
    };
  }

  const min = Number(data.min_quantity);
  const max = Number(data.max_quantity);

  if (isNaN(min) || min < 0) {
    return { valid: false, error: 'Minimum quantity must be a non-negative number.' };
  }

  if (isNaN(max) || max < min) {
    return { valid: false, error: 'Maximum quantity must be greater than or equal to minimum quantity.' };
  }

  if (!data.acceptable_condition || !Array.isArray(data.acceptable_condition) || data.acceptable_condition.length === 0) {
    return { valid: false, error: 'At least one acceptable condition must be selected.' };
  }

  for (const cond of data.acceptable_condition) {
    if (!CONDITIONS.includes(cond)) {
      return { valid: false, error: `Invalid condition: ${cond}. Must be one of ${CONDITIONS.join(', ')}` };
    }
  }

  return { valid: true };
};

export const requirementService = {
  /**
   * CREATE: Create a new buyer requirement
   * @param {Object} data
   * @param {string} data.material_type
   * @param {number} data.min_quantity
   * @param {number} data.max_quantity
   * @param {string[]} data.acceptable_condition
   * @param {string} [data.location]
   * @param {boolean} [data.active]
   * @returns {Promise<{ requirement: object|null, error: string|null }>}
   */
  async createRequirement(data) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { requirement: null, error: 'You must be logged in to create a requirement.' };
      }

      const validation = validateRequirementData(data);
      if (!validation.valid) {
        return { requirement: null, error: validation.error };
      }

      const payload = {
        buyer_id: user.id,
        material_type: data.material_type,
        min_quantity: Number(data.min_quantity),
        max_quantity: Number(data.max_quantity),
        acceptable_condition: data.acceptable_condition,
        location: data.location?.trim() || '',
        active: data.active !== undefined ? data.active : true,
      };

      const { data: created, error } = await supabase
        .from('requirements')
        .insert(payload)
        .select(`
          *,
          profiles:buyer_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .single();

      if (error) {
        return { requirement: null, error: error.message };
      }

      return { requirement: created, error: null };
    } catch (err) {
      return { requirement: null, error: err.message || 'Failed to create buyer requirement.' };
    }
  },

  /**
   * READ: Get active requirements with buyer profile information
   * @param {Object} [options]
   * @param {string} [options.material_type]
   * @param {boolean} [options.activeOnly=true]
   * @returns {Promise<{ requirements: Array<object>, error: string|null }>}
   */
  async getRequirements(options = {}) {
    try {
      const { material_type, activeOnly = true } = options;

      let query = supabase
        .from('requirements')
        .select(`
          *,
          profiles:buyer_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      if (material_type && material_type !== 'ALL') {
        query = query.eq('material_type', material_type);
      }

      const { data, error } = await query;

      if (error) {
        return { requirements: [], error: error.message };
      }

      return { requirements: data || [], error: null };
    } catch (err) {
      return { requirements: [], error: err.message || 'Failed to fetch requirements.' };
    }
  },

  /**
   * READ: Get all requirements created by currently authenticated buyer
   * @returns {Promise<{ requirements: Array<object>, error: string|null }>}
   */
  async getMyRequirements() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { requirements: [], error: 'User must be authenticated.' };
      }

      const { data, error } = await supabase
        .from('requirements')
        .select(`
          *,
          profiles:buyer_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { requirements: [], error: error.message };
      }

      return { requirements: data || [], error: null };
    } catch (err) {
      return { requirements: [], error: err.message || 'Failed to fetch your requirements.' };
    }
  },

  /**
   * READ: Get single requirement by ID
   * @param {string} id 
   * @returns {Promise<{ requirement: object|null, error: string|null }>}
   */
  async getRequirementById(id) {
    try {
      if (!id) return { requirement: null, error: 'Requirement ID is required.' };

      const { data, error } = await supabase
        .from('requirements')
        .select(`
          *,
          profiles:buyer_id (
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
        return { requirement: null, error: error.message };
      }

      return { requirement: data, error: null };
    } catch (err) {
      return { requirement: null, error: err.message || 'Failed to fetch requirement.' };
    }
  },

  /**
   * UPDATE: Update a requirement (RLS enforced)
   * @param {string} id 
   * @param {Object} updates 
   * @returns {Promise<{ requirement: object|null, error: string|null }>}
   */
  async updateRequirement(id, updates) {
    try {
      if (!id) return { requirement: null, error: 'Requirement ID is required.' };

      const payload = {};
      if (updates.material_type !== undefined) payload.material_type = updates.material_type;
      if (updates.min_quantity !== undefined) payload.min_quantity = Number(updates.min_quantity);
      if (updates.max_quantity !== undefined) payload.max_quantity = Number(updates.max_quantity);
      if (updates.acceptable_condition !== undefined) payload.acceptable_condition = updates.acceptable_condition;
      if (updates.location !== undefined) payload.location = updates.location.trim();
      if (updates.active !== undefined) payload.active = Boolean(updates.active);

      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('requirements')
        .update(payload)
        .eq('id', id)
        .select(`
          *,
          profiles:buyer_id (
            id,
            name,
            email,
            role,
            location
          )
        `)
        .single();

      if (error) {
        return { requirement: null, error: error.message };
      }

      return { requirement: data, error: null };
    } catch (err) {
      return { requirement: null, error: err.message || 'Failed to update requirement.' };
    }
  },

  /**
   * DELETE: Delete a requirement (RLS enforced)
   * @param {string} id 
   * @returns {Promise<{ success: boolean, error: string|null }>}
   */
  async deleteRequirement(id) {
    try {
      if (!id) return { success: false, error: 'Requirement ID is required.' };

      const { error } = await supabase
        .from('requirements')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to delete requirement.' };
    }
  },
};
