"use client";

import React from "react";
import { GraduationCap, Users, Calendar, ArrowUpRight, Award, Flame } from "lucide-react";

export default function ClassesPage() {
  const classes = [
    {
      name: "Terminale S1",
      subject: "Mathématiques Spécialité",
      studentsCount: 28,
      averageGrade: "14.2 / 20",
      presenceRate: "98.2%",
      color: "from-indigo-600 to-indigo-400",
      glowColor: "indigo",
    },
    {
      name: "Seconde B",
      subject: "Mathématiques Générales",
      studentsCount: 32,
      averageGrade: "12.8 / 20",
      presenceRate: "95.5%",
      color: "from-violet-600 to-violet-400",
      glowColor: "violet",
    },
    {
      name: "Première A",
      subject: "Sciences de l'Ingénieur",
      studentsCount: 18,
      averageGrade: "15.1 / 20",
      presenceRate: "97.0%",
      color: "from-pink-600 to-pink-400",
      glowColor: "pink",
    },
    {
      name: "Terminale S2",
      subject: "Soutien Mathématiques",
      studentsCount: 14,
      averageGrade: "11.5 / 20",
      presenceRate: "94.8%",
      color: "from-amber-600 to-amber-400",
      glowColor: "amber",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Gestion des Classes
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Visualisez les performances académiques et gérez l'assiduité par groupe de classe.
          </p>
        </div>
        <button className="sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer">
          Ajouter une classe
        </button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {classes.map((c, i) => (
          <div 
            key={i} 
            className="rounded-3xl bg-slate-900/40 border border-slate-900 p-6 md:p-8 hover:border-slate-800 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
          >
            {/* Top decorative gradient bar */}
            <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${c.color}`} />
            
            {/* Class Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{c.subject}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-900/60 my-6">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Élèves</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-sm font-bold text-white">{c.studentsCount}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Moyenne</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Award className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-sm font-bold text-white">{c.averageGrade}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block">Présence</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Flame className="h-3.5 w-3.5 text-pink-400" />
                    <span className="text-sm font-bold text-white">{c.presenceRate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between mt-2 pt-2">
              <span className="text-[10px] font-semibold text-slate-500">
                Année Scolaire 2025-2026
              </span>
              <button className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/btn cursor-pointer">
                Accéder au suivi
                <ArrowUpRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
