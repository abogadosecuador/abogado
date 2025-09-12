import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login action
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // API call simulation - replace with actual API
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          if (!response.ok) throw new Error('Login failed');
          
          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false
          });
          
          localStorage.setItem('authToken', data.token);
          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false,
            isAuthenticated: false 
          });
          return { success: false, error: error.message };
        }
      },

      // Register action
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          
          if (!response.ok) throw new Error('Registration failed');
          
          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false
          });
          
          localStorage.setItem('authToken', data.token);
          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // Logout action
      logout: async () => {
        set({ loading: true });
        try {
          const token = get().token;
          if (token) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`
              }
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('authToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
        }
      },

      // Check auth status
      checkAuth: async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        set({ loading: true });
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error('Auth check failed');

          const data = await response.json();
          set({
            user: data.user,
            token: token,
            isAuthenticated: true,
            loading: false
          });
          return true;
        } catch (error) {
          localStorage.removeItem('authToken');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          });
          return false;
        }
      },

      // Update user profile
      updateProfile: async (updates) => {
        set({ loading: true, error: null });
        try {
          const token = get().token;
          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
          });

          if (!response.ok) throw new Error('Profile update failed');

          const data = await response.json();
          set({
            user: data.user,
            loading: false
          });
          return { success: true, user: data.user };
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          });
          return { success: false, error: error.message };
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage
    }
  )
);

export { useAuthStore };
