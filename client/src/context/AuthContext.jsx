import React, { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/apiClient";
import { logoutUser as logoutApi } from "../services/logoutService";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  role: null,
  isValidRole: false,
  loading: true,
  fetchUser: async () => {},
  refetchUser: async () => {},
  setUser: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/api/auth/me");
      setUser(response.data.user || null);
      return response.data.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    isValidRole: !!user?.role,
    loading,
    fetchUser,
    refetchUser: fetchUser,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
