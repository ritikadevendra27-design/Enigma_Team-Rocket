import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

export const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId, authUser = null) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    try {
      const { profile: userProfile, error: pError } = await profileService.getCurrentProfile();
      if (pError) {
        // Build optimistic profile if available
        if (authUser) {
          const optimisticProfile = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
            role: authUser.user_metadata?.role || 'generator',
            location: authUser.user_metadata?.location || '',
          };
          setProfile(optimisticProfile);
          return optimisticProfile;
        }
      } else {
        setProfile(userProfile);
        return userProfile;
      }
    } catch (err) {
      console.error('Error fetching profile in AuthProvider:', err);
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      return await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // 1. Check initial session
    const initSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Session error:', sessionError);
        }

        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id, currentUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (credentials) => {
    setError(null);
    const result = await authService.login(credentials);
    if (result.error) {
      setError(result.error);
      return result;
    }
    if (result.user) {
      setUser(result.user);
      await fetchProfile(result.user.id, result.user);
    }
    return result;
  };

  const register = async (userData) => {
    setError(null);
    const result = await authService.register(userData);
    if (result.error) {
      setError(result.error);
      return result;
    }
    if (result.user) {
      setUser(result.user);
      await fetchProfile(result.user.id, result.user);
    }
    return result;
  };

  const logout = async () => {
    setError(null);
    const result = await authService.logout();
    if (!result.error) {
      setUser(null);
      setProfile(null);
    }
    return result;
  };

  const updateProfile = async (updates) => {
    const result = await profileService.updateProfile(updates);
    if (!result.error && result.profile) {
      setProfile(result.profile);
    }
    return result;
  };

  const role = profile?.role || user?.user_metadata?.role || 'generator';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
