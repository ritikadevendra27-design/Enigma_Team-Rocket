import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom React Hook to access authentication and user profile state
 * @returns {{
 *   user: object|null,
 *   profile: object|null,
 *   role: 'generator'|'buyer'|'admin'|null,
 *   loading: boolean,
 *   error: string|null,
 *   login: Function,
 *   register: Function,
 *   logout: Function,
 *   updateProfile: Function,
 *   refreshProfile: Function
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
