"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Save, User, Bell, Shield, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Local state for profile inputs
  const [name, setName] = useState(user?.name || "Jean Dupont");
  const [email, setEmail] = useState(user?.email || "prof@care.online");
  const [subject, setSubject] = useState("Mathématiques");
  
  // Notification states
  const [notifyAbsence, setNotifyAbsence] = useState(true);
  const [notifyHomework, setNotifyHomework] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);

  // Status message state
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Paramètres du compte
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gérez vos informations personnelles, vos alertes de cours et vos préférences de notification.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm leading-relaxed animate-fade-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Vos modifications ont été enregistrées avec succès !</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section: Profile */}
        <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-6 md:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-900">
            <User className="h-5 w-5 text-indigo-400" />
            Informations de l'Enseignant
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block" htmlFor="name">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block" htmlFor="email">
                Adresse e-mail de connexion
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block" htmlFor="subject">
                Matière Principale
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Section: Notifications */}
        <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-6 md:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-900">
            <Bell className="h-5 w-5 text-violet-400" />
            Préférences de Notifications
          </h3>
          
          <div className="space-y-3">
            {/* Toggle 1 */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer select-none">
              <div>
                <span className="text-xs font-bold text-white block">Absences et Retards</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Recevoir une alerte immédiate en cas d'absence non justifiée</span>
              </div>
              <input
                type="checkbox"
                checked={notifyAbsence}
                onChange={(e) => setNotifyAbsence(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-950"
              />
            </label>

            {/* Toggle 2 */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer select-none">
              <div>
                <span className="text-xs font-bold text-white block">Soumission de devoirs</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Être notifié quand les élèves soumettent leurs fichiers d'évaluation</span>
              </div>
              <input
                type="checkbox"
                checked={notifyHomework}
                onChange={(e) => setNotifyHomework(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-950"
              />
            </label>

            {/* Toggle 3 */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-colors cursor-pointer select-none">
              <div>
                <span className="text-xs font-bold text-white block">Annonces générales de l'établissement</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Recevoir les newsletters et conseils de classe</span>
              </div>
              <input
                type="checkbox"
                checked={notifySystem}
                onChange={(e) => setNotifySystem(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-950"
              />
            </label>
          </div>
        </div>

        {/* Section: Security info */}
        <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-6 md:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-900">
            <Shield className="h-5 w-5 text-pink-400" />
            Sécurité du compte
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Votre compte enseignant est lié au serveur central de l'établissement scolaire. L'adresse e-mail et le mot de passe ne peuvent être modifiés que par l'administrateur système de la direction. Pour toute demande, veuillez vous rapprocher de la direction des services numériques.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/10 cursor-pointer hover:scale-[1.01]"
          >
            <Save className="h-4 w-4" />
            Enregistrer les préférences
          </button>
        </div>
      </form>
    </div>
  );
}
