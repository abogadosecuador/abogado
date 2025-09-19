import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { supabase } from '../config/supabase';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      subscription: null,
      
      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          const { user, session } = data;
          
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          const userData = {
            ...user,
            ...profile,
            role: profile?.role || 'user'
          };
          
          set({ 
            user: userData, 
            token: session.access_token,
            isLoading: false 
          });
          
          Cookies.set('token', session.access_token, { expires: 7 });
          
          return { success: true, user: userData };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },
      
      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                full_name: userData.name,
                phone: userData.phone,
              }
            }
          });
          
          if (error) throw error;
          
          const { user, session } = data;
          
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: userData.email,
              full_name: userData.name,
              phone: userData.phone,
              role: 'user',
              subscription_plan: 'free',
              tokens_remaining: 100,
              created_at: new Date().toISOString()
            });
          
          if (profileError) throw profileError;
          
          const newUser = {
            ...user,
            full_name: userData.name,
            phone: userData.phone,
            role: 'user',
            subscription_plan: 'free',
            tokens_remaining: 100
          };
          
          set({ 
            user: newUser, 
            token: session?.access_token,
            isLoading: false 
          });
          
          if (session?.access_token) {
            Cookies.set('token', session.access_token, { expires: 7 });
          }
          
          return { success: true, user: newUser };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },
      
      // Logout
      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, token: null, subscription: null });
          Cookies.remove('token');
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
      
      // Check auth status
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            set({ user: null, token: null, isLoading: false });
            return null;
          }
          
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          const userData = {
            ...user,
            ...profile,
            role: profile?.role || 'user'
          };
          
          const { data: { session } } = await supabase.auth.getSession();
          
          set({ 
            user: userData, 
            token: session?.access_token,
            isLoading: false 
          });
          
          return userData;
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
          return null;
        }
      },
      
      // Update profile
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };
        
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);
          
          if (error) throw error;
          
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser, isLoading: false });
          
          return { success: true, user: updatedUser };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },
      
      // Update subscription
      updateSubscription: async (plan, duration = 'monthly') => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };
        
        set({ isLoading: true, error: null });
        try {
          const expiryDate = new Date();
          if (duration === 'monthly') {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (duration === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }
          
          const tokens = plan === 'basic' ? 500 : plan === 'pro' ? 2000 : plan === 'enterprise' ? -1 : 100;
          
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_plan: plan,
              subscription_expires: expiryDate.toISOString(),
              tokens_remaining: tokens
            })
            .eq('id', user.id);
          
          if (error) throw error;
          
          const updatedUser = {
            ...user,
            subscription_plan: plan,
            subscription_expires: expiryDate.toISOString(),
            tokens_remaining: tokens
          };
          
          set({ user: updatedUser, subscription: { plan, expires: expiryDate }, isLoading: false });
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },
      
      // Use tokens
      useTokens: async (amount) => {
        const { user } = get();
        if (!user) return { success: false, error: 'No user logged in' };
        
        if (user.subscription_plan === 'enterprise') {
          return { success: true }; // Unlimited tokens
        }
        
        if (user.tokens_remaining < amount) {
          return { success: false, error: 'Insufficient tokens' };
        }
        
        try {
          const newTokens = user.tokens_remaining - amount;
          
          const { error } = await supabase
            .from('profiles')
            .update({ tokens_remaining: newTokens })
            .eq('id', user.id);
          
          if (error) throw error;
          
          set({ user: { ...user, tokens_remaining: newTokens } });
          
          return { success: true, remaining: newTokens };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      // Check subscription status
      checkSubscription: () => {
        const { user } = get();
        if (!user) return { active: false, plan: null };
        
        if (user.subscription_plan === 'free') {
          return { active: true, plan: 'free', unlimited: false };
        }
        
        const expires = new Date(user.subscription_expires);
        const now = new Date();
        
        if (expires > now) {
          return {
            active: true,
            plan: user.subscription_plan,
            expires,
            unlimited: user.subscription_plan === 'enterprise'
          };
        }
        
        // Subscription expired, reset to free
        set({
          user: {
            ...user,
            subscription_plan: 'free',
            tokens_remaining: 100
          }
        });
        
        return { active: false, plan: 'free', unlimited: false };
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        subscription: state.subscription
      })
    }
  )
);

export { useAuthStore };
