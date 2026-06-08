"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, LogIn, LayoutDashboard } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Care<span className="text-indigo-400">Online</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Accueil
            </Link>
            <Link href="/about" className="hover:text-white transition-colors duration-200">
              À propos
            </Link>
            <a href="#features" className="hover:text-white transition-colors duration-200">
              Fonctionnalités
            </a>
          </nav>

          {/* Action Button */}
          <div>
            {user ? (
              <Link
                href="/professeur"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-medium transition-all duration-300 shadow-inner"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                Tableau de bord
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02]"
              >
                <LogIn className="h-4 w-4" />
                Espace Professeur
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Care Online. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-slate-300 transition-colors">
              À propos
            </Link>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Conditions d'utilisation
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
