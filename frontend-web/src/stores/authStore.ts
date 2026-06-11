import { create } from 'zustand';
import { api } from '../services/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const user = await api.post<User>('/auth/login', credentials);
      localStorage.setItem('token', user.token);
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = await api.post<User>('/auth/register', data);
      localStorage.setItem('token', user.token);
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, loading: false });
    } catch (err: any) {
      localStorage.removeItem('token');
      set({ user: null, error: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
