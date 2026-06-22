"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  Award, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  GraduationCap, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";

export default function ClassTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.care-online.fr";

  useEffect(() => {
    if (!id) return;
    
    const fetchClassDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/api/classes`);
        if (!res.ok) throw new Error("Impossible de charger les données.");
        const data = await res.json();
        const found = data.find((c: any) => String(c.id) === String(id));
        if (!found) {
          throw new Error("Classe introuvable.");
        }
        setClassInfo(found);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des détails de la classe.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id, apiBaseUrl]);

  // Mock Students Roster for Visual Excellence
  const mockStudents = [
    { name: "Lucas Martin", average: "15.8 / 20", presence: "100%", status: "Excellent", alert: false },
    { name: "Chloé Dubois", average: "14.2 / 20", presence: "98%", status: "Très Bien", alert: false },
    { name: "Emma Bernard", average: "12.5 / 20", presence: "95%", status: "Satisfaisant", alert: false },
    { name: "Thomas Petit", average: "9.2 / 20", presence: "88%", status: "En difficulté", alert: true },
    { name: "Julie Robert", average: "16.1 / 20", presence: "99%", status: "Excellent", alert: false },
    { name: "Hugo Richard", average: "11.0 / 20", presence: "92%", status: "Moyen", alert: false },
  ];

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link 
          href="/professeur/classes" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la gestion des classes
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Chargement des données de la classe...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-white mb-0.5">Erreur</h4>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => router.push("/professeur/classes")}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Retour
          </button>
        </div>
      )}

      {!loading && classInfo && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    Suivi de la classe : {classInfo.name}
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {classInfo.description || "Pas de description spécifiée"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-slate-900/40 border border-slate-900 p-6 hover:border-slate-800 transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-600" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">Élèves inscrits</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">{classInfo.students_count}</span>
            </div>

            <div className="rounded-3xl bg-slate-900/40 border border-slate-900 p-6 hover:border-slate-800 transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-violet-600" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">Moyenne Générale</span>
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">
                {classInfo.average_grade !== null ? `${classInfo.average_grade} / 20` : "-- / 20"}
              </span>
            </div>

            <div className="rounded-3xl bg-slate-900/40 border border-slate-900 p-6 hover:border-slate-800 transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-pink-600" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">Taux de présence</span>
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">{classInfo.presence_rate}%</span>
            </div>
          </div>

          {/* Students Roster */}
          <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Registre des Élèves</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Visualisation de démo</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pt-1">Nom / Prénom</th>
                    <th className="pb-3 pt-1">Moyenne</th>
                    <th className="pb-3 pt-1">Présence</th>
                    <th className="pb-3 pt-1">Statut académique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50 text-sm">
                  {mockStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-slate-950/20 transition-colors">
                      <td className="py-4 text-white font-bold">{student.name}</td>
                      <td className="py-4 text-slate-300">{student.average}</td>
                      <td className="py-4 text-slate-300">{student.presence}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          student.alert 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
