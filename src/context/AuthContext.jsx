import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Verificar autenticación al cargar (valida token contra backend)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        // Validar token obteniendo el perfil
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          return;
        }
        const { data } = await res.json();
        const mergedUser = { ...(JSON.parse(localStorage.getItem('user') || '{}')), ...data };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
        setAuthReady(true);
      }
    };
    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'No se pudo iniciar sesión');
      }
      const { user: loggedUser, session } = json.data || json;
      const token = session?.access_token;
      localStorage.setItem('authToken', token);
      // Intentar traer perfil
      let profile = {};
      if (token) {
        const profRes = await fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
        const profileJson = await profRes.json();
        profile = profRes.ok && profileJson?.data ? profileJson.data : {};
      }
      const finalUser = { ...loggedUser, ...profile };
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
      toast.success('¡Bienvenido! Sesión iniciada correctamente');
      return { success: true, user: finalUser };
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para registrarse (usa backend)
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'No se pudo crear la cuenta');
      }
      const { user: createdUser, session } = json.data || json;
      const token = session?.access_token;
      // El registro puede no iniciar sesión automáticamente; solo notificar éxito
      if (token) {
        localStorage.setItem('authToken', token);
      }
      // Intentar traer perfil
      let profile = {};
      if (token) {
        const profRes = await fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
        const profileJson = await profRes.json();
        profile = profRes.ok && profileJson?.data ? profileJson.data : {};
      }
      const finalUser = { ...createdUser, ...profile };
      localStorage.setItem('user', JSON.stringify(finalUser));
      setUser(finalUser);
      toast.success('¡Cuenta creada exitosamente! Revisa tu correo para verificarla.');
      return { success: true, user: finalUser };
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error.message || 'Error al crear cuenta');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
      toast.success('Sesión cerrada correctamente');
    }
  };

  // Función para actualizar usuario
  const updateUser = (updatedUser) => {
    const newUserData = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
    toast.success('Perfil actualizado correctamente');
  };

  const value = {
    user,
    loading,
    authReady,
    login,
    register,
    logout,
    updateUser,
    // API esperado por roleMiddleware
    isAuthenticated: () => !!user,
    hasRole: (role) => {
      if (!user || !role) return false;
      if (user.role === role) return true;
      if (Array.isArray(user.roles)) return user.roles.includes(role);
      return false;
    },
    hasPermission: (permission) => {
      if (!user || !permission) return false;
      if (Array.isArray(user.permissions)) return user.permissions.includes(permission);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
