"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Bell
} from "lucide-react";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Tableau de Bord", href: "/professeur", icon: LayoutDashboard },
    { name: "Classes", href: "/professeur/classes", icon: GraduationCap },
    { name: "Élèves", href: "/professeur/students", icon: Users },
    { name: "Paramètres", href: "/professeur/settings", icon: Settings },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900 border-r border-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-900 relative z-10">
            <Link href="/professeur" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-indigo-600">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Care<span className="text-indigo-400">Online</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 relative z-10">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400 transition-colors"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer in Sidebar */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/40 relative z-10">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-slate-900">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400 shrink-0">
                <UserIcon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role === "teacher" ? "Enseignant" : user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-900 border-b border-slate-900 z-40">
          <Link href="/professeur" className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-600">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">CareOnline</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex justify-end">
            <div className="w-72 bg-slate-900 h-full p-6 flex flex-col border-l border-slate-800 animate-slide-in">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
                <span className="font-bold text-lg text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                    <UserIcon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-semibold transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar for Desktop */}
          <header className="hidden md:flex h-16 items-center justify-between px-8 bg-slate-950 border-b border-slate-900/60 shrink-0">
            <h2 className="text-sm font-semibold text-slate-400">
              Espace Sécurisé Enseignant
            </h2>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              </button>
              {/* User badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Session Active
              </div>
            </div>
          </header>

          {/* Page Content Container */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
