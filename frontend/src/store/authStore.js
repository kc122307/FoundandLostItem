import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('lostlink_token') || null,
  isAuthenticated: !!localStorage.getItem('lostlink_token'),
  isLoading: true,

  login: (user, token) => {
    localStorage.setItem('lostlink_token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('lostlink_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  },

  setUser: (user) => set({ user }),

  initialize: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      get().logout();
    }
  }
}));

// Listen to api 401 errors
window.addEventListener('unauthorized_access', () => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
