import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { toast } from 'react-toastify';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login: AuthContextType['login'] = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      return { success: true };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error de autenticación');
      return { success: false, error };
    }
  };

  const register: AuthContextType['register'] = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // Opcional: crear perfil
      if (data.user && name) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: name, email });
      }
      setUser(data.user);
      return { success: true };
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrarse');
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
