import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../contexts/authContextValue';

/** Access the signed-in user and the login/logout actions. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
