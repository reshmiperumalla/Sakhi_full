import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getSessionId, resetSessionId } from '../services/api';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(getSessionId());
  const { setLanguage } = useLanguage();

  const initSessionUser = async () => {
    setLoading(true);
    try {
      const userData = await api.getMe();
      setUser(userData);
      if (userData?.preferred_language && !localStorage.getItem('mitra_lang')) {
        setLanguage(userData.preferred_language);
      }
    } catch (err) {
      console.warn('Session init fallback to offline user:', err.message);
      // Fallback guest user for rural women experience if backend is temporarily unreachable
      setUser({
        id: getSessionId(),
        name: "लक्ष्मी देवी (Lakshmi Devi)",
        email: "saheli@mitra.org",
        preferred_language: "hi",
        has_profile_completed: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSessionUser();
  }, []);

  const resetSession = async () => {
    const newId = resetSessionId();
    setSessionId(newId);
    await initSessionUser();
  };

  // Optional legacy login methods retained for backward compatibility
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      const userData = await api.getMe();
      setUser(userData);
      if (userData.preferred_language) {
        setLanguage(userData.preferred_language);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async () => {
    return login('demo@mitra.org', 'demo123');
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      const userDetails = await api.getMe();
      setUser(userDetails);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    resetSession();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sessionId,
      resetSession,
      login,
      loginAsDemo,
      register,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
