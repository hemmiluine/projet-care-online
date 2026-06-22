"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Sparkles, Users } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center px-4">
      {/* Icon badge */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-xl shadow-indigo-600/10">
          <BookOpen className="h-10 w-10 text-indigo-400" />
        </div>
        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </span>
      </div>

      {/* Title */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Hub de Ressources Collaboratif
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
          Bienvenue, <span className="text-indigo-400 font-semibold">{user?.name}</span>. 
          Cet espace partagé vous permettra bientôt de centraliser, organiser et accéder 
          à toutes vos ressources pédagogiques en un seul endroit.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { icon: BookOpen, label: "PDFs & Documents" },
          { icon: Sparkles, label: "Apps Streamlit" },
          { icon: Users, label: "Partagé entre collègues" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium"
          >
            <Icon className="h-3.5 w-3.5 text-indigo-400" />
            {label}
          </div>
        ))}
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Interface en cours de construction — Étape 2 à venir
      </div>
    </div>
  );
}
