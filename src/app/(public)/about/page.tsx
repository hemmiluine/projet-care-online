import React from "react";
import Link from "next/link";
import { Info, Shield, CheckCircle, GraduationCap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative flex-1 flex flex-col py-16 md:py-24">
      {/* Glow Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 mb-6">
            <Info className="h-5 w-5" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            À propos de Care Online
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Découvrez notre vision d'un outil de gestion scolaire simple, efficace et moderne pour les équipes pédagogiques.
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-12">
          {/* Section 1 */}
          <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-8 md:p-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              Notre Mission
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-4">
              Care Online a été pensé pour réduire la charge de travail administrative des enseignants. En centralisant le suivi des élèves, les plannings et les données clés au même endroit, nous vous permettons de vous concentrer sur l'essentiel : l'enseignement et le bien-être de vos élèves.
            </p>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Que vous gériez une seule classe ou plusieurs promotions, notre plateforme s'adapte à vos besoins pour vous offrir une vue d'ensemble claire et réactive.
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card Left */}
            <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-8">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-400" />
                Sécurité & Confidentialité
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Les données scolaires sont sensibles. C'est pourquoi Care Online intègre une séparation stricte des rôles : la partie publique ne révèle aucune information, tandis que l'espace professeur est chiffré et protégé par un portail d'authentification robuste.
              </p>
            </div>

            {/* Card Right */}
            <div className="rounded-3xl bg-slate-900/30 border border-slate-900 p-8">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-pink-400" />
                Simplicité d'utilisation
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Aucune formation complexe n'est nécessaire. Notre design épuré et nos micro-animations guident naturellement l'utilisateur dans ses tâches régulières (appel, consultation des fiches d'élèves, modification des paramètres).
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
