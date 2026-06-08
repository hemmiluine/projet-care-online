"use client";

import React, { useState } from "react";
import { Search, Filter, Mail, Award, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");

  const students = [
    { name: "Sophie Bernard", class: "Terminale S1", averageGrade: "16.5", attendance: "present", email: "sophie.b@ecole.com" },
    { name: "Lucas Martin", class: "Terminale S1", averageGrade: "12.0", attendance: "absent", email: "lucas.m@ecole.com" },
    { name: "Camille Dubois", class: "Seconde B", averageGrade: "14.8", attendance: "present", email: "camille.d@ecole.com" },
    { name: "Antoine Moreau", class: "Seconde B", averageGrade: "9.5", attendance: "late", email: "antoine.m@ecole.com" },
    { name: "Chloé Petit", class: "Première A", averageGrade: "17.2", attendance: "present", email: "chloe.p@ecole.com" },
    { name: "Thomas Roux", class: "Première A", averageGrade: "11.0", attendance: "present", email: "thomas.r@ecole.com" },
    { name: "Emma Leroy", class: "Terminale S2", averageGrade: "13.4", attendance: "late", email: "emma.l@ecole.com" },
  ];

  // Filtering Logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "All" || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Liste des Élèves
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Suivez la scolarité de vos élèves, leur assiduité et contactez les parents facilement.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/20 border border-slate-900 p-4 rounded-2xl backdrop-blur-sm">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Dropdown Class Filter */}
        <div className="relative w-full sm:w-auto flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="All">Toutes les classes</option>
            <option value="Terminale S1">Terminale S1</option>
            <option value="Terminale S2">Terminale S2</option>
            <option value="Seconde B">Seconde B</option>
            <option value="Première A">Première A</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-3xl bg-slate-900/30 border border-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/20 text-slate-400 text-xs font-semibold">
                <th className="p-4 md:p-5">Nom</th>
                <th className="p-4 md:p-5">Classe</th>
                <th className="p-4 md:p-5">Moyenne Générale</th>
                <th className="p-4 md:p-5">Statut de présence</th>
                <th className="p-4 md:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-900/10 transition-colors">
                    <td className="p-4 md:p-5">
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-slate-500 text-[11px] font-mono select-all mt-0.5">{s.email}</div>
                    </td>
                    <td className="p-4 md:p-5 text-slate-300 font-medium">
                      {s.class}
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Award className="h-4 w-4 text-violet-400" />
                        {s.averageGrade} <span className="text-slate-500 font-normal text-xs">/20</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      {s.attendance === "present" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Présent
                        </span>
                      )}
                      {s.attendance === "late" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                          <AlertCircle className="h-3.5 w-3.5" />
                          En Retard
                        </span>
                      )}
                      {s.attendance === "absent" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-pulse">
                          <XCircle className="h-3.5 w-3.5" />
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="p-4 md:p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href={`mailto:${s.email}`}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Envoyer un e-mail"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                    Aucun élève trouvé avec ces critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
