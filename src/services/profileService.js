import { supabase } from '../lib/supabase';

export const profileService = {
  /**
   * Get profile of the currently logged-in user
   * @returns {Promise<{ profile: object|null, error: string|null }>}
   */
  async getCurrentProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { profile: null, error: userError?.message || 'No authenticated user found.' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile row wasn't created by trigger, create from auth metadata
        if (error.code === 'PGRST116') {
          const fallbackProfile = {
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: user.user_metadata?.role || 'generator',
            location: user.user_metadata?.location || '',
          };
          const { data: inserted, error: insertError } = await supabase
            .from('profiles')
            .upsert(fallbackProfile)
            .select()
            .single();

          if (insertError) {
            return { profile: null, error: insertError.message };
          }
          return { profile: inserted, error: null };
        }
        return { profile: null, error: error.message };
      }

      return { profile: data, error: null };
    } catch (err) {
      return { profile: null, error: err.message || 'Failed to fetch current profile.' };
    }
  },

  /**
   * Fetch any user profile by ID (e.g., listing owner)
   * @param {string} userId 
   * @returns {Promise<{ profile: object|null, error: string|null }>}
   */
  async getProfileById(userId) {
    try {
      if (!userId) {
        return { profile: null, error: 'User ID is required.' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, location, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }
      return { profile: data, error: null };
    } catch (err) {
      return { profile: null, error: err.message || 'Failed to fetch user profile.' };
    }
  },

  /**
   * Update the current user's profile
   * @param {Object} updates
   * @param {string} [updates.name]
   * @param {string} [updates.location]
   * @param {'generator'|'buyer'|'admin'} [updates.role]
   * @returns {Promise<{ profile: object|null, error: string|null }>}
   */
  async updateProfile(updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { profile: null, error: 'User not authenticated.' };
      }

      const payload = {};
      if (updates.name !== undefined) payload.name = updates.name.trim();
      if (updates.location !== undefined) payload.location = updates.location.trim();
      if (updates.role !== undefined) {
        if (!['generator', 'buyer', 'admin'].includes(updates.role)) {
          return { profile: null, error: 'Invalid role provided.' };
        }
        payload.role = updates.role;
      }

      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { profile: null, error: error.message };
      }

      // Also update auth user metadata in sync
      await supabase.auth.updateUser({
        data: payload,
      });

      return { profile: data, error: null };
    } catch (err) {
      return { profile: null, error: err.message || 'Failed to update profile.' };
    }
  },

  /**
   * Helper function to get role directly
   * @returns {Promise<{ role: 'generator'|'buyer'|'admin'|null, error: string|null }>}
   */
  async getUserRole() {
    const { profile, error } = await this.getCurrentProfile();
    if (error || !profile) {
      return { role: null, error };
    }
    return { role: profile.role, error: null };
  },
};
