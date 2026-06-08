"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Lock, Mail, AlertTriangle, Loader2, UserPlus, LogIn, CheckCircle2, User } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup States
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { login, signup, user, error, setError } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/professeur");
    }
    setError(null);
    setSuccessMessage(null);
  }, [user, router, setError]);

  // Clear errors when switching tabs
  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail || !loginPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    // Strict frontend validation
    const emailTrim = loginEmail.toLowerCase().trim();
    if (!emailTrim.endsWith("@care-online.fr")) {
      setError("Accès refusé : Seules les adresses @care-online.fr sont autorisées.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(emailTrim, loginPassword);
      if (success) {
        router.push("/professeur");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!signupName || !signupEmail || !signupPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    // Strict frontend validation
    const emailTrim = signupEmail.toLowerCase().trim();
    if (!emailTrim.endsWith("@care-online.fr")) {
      setError("Inscription impossible : Seules les adresses @care-online.fr sont autorisées.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup(signupName, emailTrim, signupPassword);
      if (result.success) {
        setSuccessMessage(result.message || "Inscription réussie !");
        // Clear signup form
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
        // Switch to login tab after a brief moment or let the user click
        setTimeout(() => {
          setActiveTab("login");
          setLoginEmail(emailTrim); // prefill email for user ease
          setSuccessMessage("Inscription validée. Connectez-vous avec vos identifiants.");
        }, 2500);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo and Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 mb-4">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Espace Enseignant</h2>
          <p className="text-sm text-slate-400 mt-1">Gérez votre portail pédagogique sécurisé</p>
        </div>

        {/* Tabs switcher */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 mb-6">
          <button
            onClick={() => handleTabChange("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-slate-800 text-white shadow-inner"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <LogIn className="h-4 w-4" />
            Connexion
          </button>
          <button
            onClick={() => handleTabChange("signup")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-slate-800 text-white shadow-inner"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Créer un compte
          </button>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl bg-slate-900/40 border border-slate-900 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />
          
          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block" htmlFor="login-email">
                  Adresse e-mail (enseignant)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="login-email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nom@care-online.fr"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-650 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block" htmlFor="login-password">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    id="login-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-650 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Status messages */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-shake">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se Connecter"
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block" htmlFor="signup-name">
                  Nom complet
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="signup-name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="M. Vincent Martin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-650 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block" htmlFor="signup-email">
                  Adresse e-mail académique
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="signup-email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="identifiant@care-online.fr"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-650 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block" htmlFor="signup-password">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    id="signup-password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-650 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Status messages */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-shake">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer un compte"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info Credentials Advice Box */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 text-indigo-300 text-xs space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            Consignes de sécurité (Domaine restreint) :
          </p>
          <div className="text-slate-400 space-y-1">
            <p>1. Seules les adresses se terminant par <span className="text-white font-semibold font-mono">@care-online.fr</span> sont acceptées.</p>
            {activeTab === "login" ? (
              <p>2. Compte de démonstration pré-configuré : <br />
                Email: <span className="text-white font-mono font-bold select-all">vincent@care-online.fr</span> <br />
                Mdp: <span className="text-white font-mono font-bold select-all">password123</span>
              </p>
            ) : (
              <p>2. Vous pouvez créer votre propre compte avec n'importe quelle adresse (ex: <span className="text-slate-300 font-mono">prenom@care-online.fr</span>).</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
