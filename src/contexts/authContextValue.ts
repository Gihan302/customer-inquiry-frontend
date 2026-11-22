import { createContext } from 'react';
import type { User } from '../types';

// Kept separate from AuthContext.tsx so that file only exports a component
// (required for React Fast Refresh during development).

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** True when the user was signed out because the server rejected their token (e.g. it expired). */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
