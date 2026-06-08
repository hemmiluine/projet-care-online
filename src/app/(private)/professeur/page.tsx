"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  GraduationCap, 
  CheckSquare, 
  Clock, 
  ArrowUpRight, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  Bell,
  Upload,
  FileText,
  Brain,
  Download,
  AlertTriangle,
  Key,
  Play
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // API States
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-1.5-flash");
  const [nomEleve, setNomEleve] = useState("");
  const [sujetFile, setSujetFile] = useState<File | null>(null);
  const [corrFile, setCorrFile] = useState<File | null>(null);
  const [copieFile, setCopieFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const stats = [
    { name: "Classes Actives", value: "4", change: "+1 ce trimestre", icon: GraduationCap, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { name: "Total Élèves", value: "92", change: "Suivi individuel actif", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { name: "Taux de Présence", value: "96.4%", change: "+0.8% vs mois dernier", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "Devoirs à corriger", value: "8", change: "Écheance : 3 jours", icon: CheckSquare, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const handleCorrect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copieFile) {
      setError("Veuillez sélectionner au moins le scan de la copie de l'élève.");
      return;
    }
    if (!apiKey) {
      setError("Veuillez renseigner votre clé API Gemini.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("gemini_api_key", apiKey);
    formData.append("model_name", model);
    if (nomEleve) formData.append("nom_eleve", nomEleve);
    if (sujetFile) formData.append("sujet_file", sujetFile);
    if (corrFile) formData.append("correction_file", corrFile);
    formData.append("copie_file", copieFile);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiBaseUrl}/api/correct`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Une erreur s'est produite lors de la communication avec le serveur.");
      }

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        throw new Error(data.detail || "Erreur de correction.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau de connexion à l'API.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result || !result.pdf_data) return;
    const byteCharacters = atob(result.pdf_data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Correction_${nomEleve || result.nom_eleve || "copie"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Bonjour, {user?.name} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Voici le récapitulatif de vos activités pédagogiques pour aujourd'hui.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="rounded-3xl bg-slate-900/40 border border-slate-900 p-6 hover:border-slate-800 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">{stat.name}</span>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{stat.value}</span>
                <p className="text-[11px] font-medium text-slate-500">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Interactive Correction Hub */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Correction form & controls */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/30 border border-slate-900 p-6 relative">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              Correction &amp; Remédiation Socratique
            </h3>
          </div>

          <form onSubmit={handleCorrect} className="space-y-5">
            {/* Clé API et Modèle */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="h-3 w-3 text-indigo-400" /> Clé API Gemini
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Modèle Actif
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Rapide &amp; Éco)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Raisonnement avancé)</option>
                </select>
              </div>
            </div>

            {/* Nom de l'élève */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Nom de l&apos;élève (facultatif, extrait du nom du fichier par défaut)
              </label>
              <input
                type="text"
                placeholder="Ex: Lucas Martin"
                value={nomEleve}
                onChange={(e) => setNomEleve(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Fichiers uploader */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-slate-500">
                  1. Le Sujet (PDF)
                </label>
                <div className="relative border border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-slate-700 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSujetFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-5 w-5 mx-auto text-slate-600 mb-2" />
                  <span className="text-xs text-slate-400 block truncate">
                    {sujetFile ? sujetFile.name : "Déposer le sujet"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-slate-500">
                  2. Le Barème (PDF)
                </label>
                <div className="relative border border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-slate-700 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCorrFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-5 w-5 mx-auto text-slate-600 mb-2" />
                  <span className="text-xs text-slate-400 block truncate">
                    {corrFile ? corrFile.name : "Déposer le barème"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-indigo-400">
                  3. La Copie (PDF / Images) *
                </label>
                <div className="relative border border-dashed border-indigo-900/40 rounded-xl p-4 text-center hover:border-indigo-800/40 transition-colors bg-indigo-950/5">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setCopieFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <Upload className="h-5 w-5 mx-auto text-indigo-400/80 mb-2" />
                  <span className="text-xs text-indigo-300 block truncate font-medium">
                    {copieFile ? copieFile.name : "Déposer le scan"}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                loading
                  ? "bg-slate-800 cursor-not-allowed text-slate-500"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Correction en cours par l&apos;IA...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  Lancer la correction et générer la fiche
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Bell className="h-5 w-5 text-violet-400" />
              Résultat de l&apos;Analyse
            </h3>

            {result ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Élève</span>
                  <p className="text-sm font-bold text-white">{result.nom_eleve}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Note Estimée</span>
                    <span className="text-2xl font-black text-white">{result.note}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
                    <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider block mb-1">Forces</span>
                    <span className="text-xs font-semibold text-slate-200 block truncate">{result.forces}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Axes d&apos;amélioration</span>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                    {result.faiblesses}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 text-slate-600">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucune copie corrigée pour le moment.</p>
                <p className="text-xs mt-1">Remplissez le formulaire de gauche pour lancer le processus.</p>
              </div>
            )}
          </div>

          {result && result.has_pdf && (
            <button
              onClick={downloadPDF}
              className="mt-6 w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Télécharger le PDF d&apos;évaluation
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
