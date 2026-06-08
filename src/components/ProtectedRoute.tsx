"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute w-6 h-6 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animate-reverse duration-1000"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          Chargement sécurisé...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return <>{children}</>;
}
