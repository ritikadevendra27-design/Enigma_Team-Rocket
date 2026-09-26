import { supabase } from '../lib/supabase';

/**
 * Validates email format using standard regex
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim());
};

/**
 * Validates password strength (minimum 6 characters)
 * @param {string} password 
 * @returns {{ valid: boolean, message?: string }}
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
};

/**
 * Friendly error message parser for Supabase Auth errors
 * @param {Error|object} error 
 * @returns {string}
 */
export const formatAuthError = (error) => {
  if (!error) return 'An unknown error occurred.';
  const msg = error.message || error.error_description || String(error);

  if (msg.includes('User already registered') || msg.includes('already registered')) {
    return 'An account with this email address already exists. Please login instead.';
  }
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email address before logging in.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Supabase email limit reached. In Supabase Dashboard -> Authentication -> Providers -> Email, please turn OFF "Confirm email" to enable instant unlimited registrations.';
  }
  return msg;
};

export const authService = {
  /**
   * Register a new user with Supabase Auth and initial profile metadata
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} params.name
   * @param {'generator'|'buyer'|'admin'} params.role
   * @param {string} [params.location]
   * @returns {Promise<{ user: object, session: object, error: string|null }>}
   */
  async register({ email, password, name, role = 'generator', location = '' }) {
    try {
      const cleanEmail = email?.trim().toLowerCase();
      const cleanName = name?.trim();
      const cleanLocation = location?.trim();

      if (!cleanName) {
        return { user: null, session: null, error: 'Full name or company name is required.' };
      }
      if (!isValidEmail(cleanEmail)) {
        return { user: null, session: null, error: 'Please enter a valid email address.' };
      }
      const pwdCheck = validatePassword(password);
      if (!pwdCheck.valid) {
        return { user: null, session: null, error: pwdCheck.message };
      }
      if (!['generator', 'buyer', 'admin'].includes(role)) {
        return { user: null, session: null, error: 'Role must be generator, buyer, or admin.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
            role,
            location: cleanLocation,
          },
        },
      });

      if (error) {
        return { user: null, session: null, error: formatAuthError(error) };
      }

      // Check if user was created but identity already existed without confirmation
      if (data?.user && data?.user?.identities && data.user.identities.length === 0) {
        return {
          user: null,
          session: null,
          error: 'An account with this email address already exists. Please login.',
        };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { user: null, session: null, error: formatAuthError(err) };
    }
  },

  /**
   * Log in an existing user with email and password
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   * @returns {Promise<{ user: object, session: object, error: string|null }>}
   */
  async login({ email, password }) {
    try {
      const cleanEmail = email?.trim().toLowerCase();

      if (!isValidEmail(cleanEmail)) {
        return { user: null, session: null, error: 'Please enter a valid email address.' };
      }
      if (!password) {
        return { user: null, session: null, error: 'Password is required.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { user: null, session: null, error: formatAuthError(error) };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { user: null, session: null, error: formatAuthError(err) };
    }
  },

  /**
   * Logout current user and clear local session
   * @returns {Promise<{ error: string|null }>}
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: formatAuthError(error) };
      }
      return { error: null };
    } catch (err) {
      return { error: formatAuthError(err) };
    }
  },

  /**
   * Get the current authenticated user
   * @returns {Promise<{ user: object|null, error: string|null }>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return { user: null, error: formatAuthError(error) };
      }
      return { user, error: null };
    } catch (err) {
      return { user: null, error: formatAuthError(err) };
    }
  },

  /**
   * Get current auth session
   * @returns {Promise<{ session: object|null, error: string|null }>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        return { session: null, error: formatAuthError(error) };
      }
      return { session, error: null };
    } catch (err) {
      return { session: null, error: formatAuthError(err) };
    }
  },

  /**
   * Subscribe to auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
   * @param {(event: string, session: object|null) => void} callback 
   * @returns {{ unsubscribe: () => void }}
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  },
};
