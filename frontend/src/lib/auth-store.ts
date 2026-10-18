import { create } from 'zustand';
import { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isStoreAdmin: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isStoreAdmin: false,

  login: (userData: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('klein_access_token', token);
      localStorage.setItem('klein_user', JSON.stringify(userData));
    }
    set({
      user: userData,
      token,
      isAuthenticated: true,
      isStoreAdmin: userData.is_store_admin || userData.role === 'ADMIN',
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('klein_access_token');
      localStorage.removeItem('klein_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isStoreAdmin: false,
    });
  },

  initialize: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('klein_access_token');
    const userJson = localStorage.getItem('klein_user');
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        set({
          user,
          token,
          isAuthenticated: true,
          isStoreAdmin: user.is_store_admin || user.role === 'ADMIN',
        });
      } catch {
        localStorage.removeItem('klein_user');
        localStorage.removeItem('klein_access_token');
      }
    }
  },
}));
