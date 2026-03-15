"use client";

import { useState, useEffect, useCallback } from "react";
import * as authApi from "@/lib/api/auth";
import type { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await authApi.getSession();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u } = await authApi.login({ email, password });
      setUser(u);
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string, fullName?: string, companyName?: string) => {
      const { user: u } = await authApi.signup({
        email,
        password,
        fullName,
        companyName,
      });
      if (u) setUser(u);
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { url } = await authApi.getGoogleAuthUrl();
    window.location.href = url;
  }, []);

  return {
    user,
    loading,
    refresh,
    login,
    signup,
    logout,
    signInWithGoogle,
    isAuthenticated: !!user,
  };
}
