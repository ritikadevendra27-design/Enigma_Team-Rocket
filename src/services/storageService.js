import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'listing-images';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const storageService = {
  /**
   * Validates an image file before upload
   * @param {File} file 
   * @returns {{ valid: boolean, error?: string }}
   */
  validateImageFile(file) {
    if (!file) {
      return { valid: false, error: 'No image file provided.' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format (${file.type || 'unknown'}). Allowed formats: JPG, JPEG, PNG, WEBP.`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `Image is too large (${sizeMB} MB). Maximum size allowed is 5 MB.`,
      };
    }

    return { valid: true };
  },

  /**
   * Upload an image file for a listing to Supabase Storage
   * @param {File} file 
   * @param {string} [userId] 
   * @returns {Promise<{ publicUrl: string|null, path: string|null, error: string|null }>}
   */
  async uploadListingImage(file, userId = null) {
    try {
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        return { publicUrl: null, path: null, error: validation.error };
      }

      // If userId wasn't provided, fetch authenticated user
      let ownerId = userId;
      if (!ownerId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          return { publicUrl: null, path: null, error: 'User must be authenticated to upload listing images.' };
        }
        ownerId = user.id;
      }

      // Generate clean unique filename: ownerId/timestamp-cleanname.ext
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.[^/.]+$/, '');
      const filePath = `${ownerId}/${Date.now()}-${cleanFileName}.${ext}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { publicUrl: null, path: null, error: error.message };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        publicUrl: publicUrlData.publicUrl,
        path: data.path,
        error: null,
      };
    } catch (err) {
      return {
        publicUrl: null,
        path: null,
        error: err.message || 'An unexpected error occurred during image upload.',
      };
    }
  },

  /**
   * Delete an image from Supabase Storage by public URL or relative path
   * @param {string} imagePathOrUrl 
   * @returns {Promise<{ success: boolean, error: string|null }>}
   */
  async deleteListingImage(imagePathOrUrl) {
    try {
      if (!imagePathOrUrl) {
        return { success: true, error: null };
      }

      // Don't attempt to delete external URLs (e.g., unsplash demo URLs)
      if (!imagePathOrUrl.includes(BUCKET_NAME)) {
        return { success: true, error: null };
      }

      // Extract path after bucket name
      let filePath = imagePathOrUrl;
      const bucketIndex = filePath.indexOf(`${BUCKET_NAME}/`);
      if (bucketIndex !== -1) {
        filePath = filePath.substring(bucketIndex + BUCKET_NAME.length + 1);
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to delete listing image.' };
    }
  },
};
