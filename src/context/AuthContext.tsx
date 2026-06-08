"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (e) {
        console.error("Session check failed", e);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setLoading(false);
        return true;
      } else {
        setError(data.error || "Identifiants incorrects.");
        setLoading(false);
        return false;
      }
    } catch (e) {
      setError("Erreur réseau lors de la connexion.");
      setLoading(false);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        setError(data.error || "Erreur lors de l'inscription.");
        return { success: false, error: data.error };
      }
    } catch (e) {
      setError("Erreur réseau lors de l'inscription.");
      return { success: false, error: "Erreur réseau." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed", e);
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
