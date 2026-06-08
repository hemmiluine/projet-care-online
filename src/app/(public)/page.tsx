"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Calendar,
  Lock,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  BookOpen,
  FileText,
  Download,
  Clock,
  Star,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Fake course database
───────────────────────────────────────────── */
const COURSES = [
  {
    id: 1,
    title: "Introduction aux Soins Infirmiers",
    description:
      "Découvrez les fondements essentiels des soins infirmiers : éthique professionnelle, relation soignant-soigné, hygiène et premiers gestes de sécurité au quotidien.",
    subject: "Soins de base",
    level: "Niveau 1",
    pages: 48,
    duration: "3h de lecture",
    rating: 4.9,
    downloads: 1243,
    color: "indigo",
    icon: BookOpen,
    href: "/supports/introduction-soins-infirmiers.pdf",
    tag: "Populaire",
  },
  {
    id: 2,
    title: "Pharmacologie Clinique Avancée",
    description:
      "Maîtrisez les classes de médicaments, les interactions médicamenteuses, les voies d'administration et les protocoles d'urgence en milieu hospitalier et ambulatoire.",
    subject: "Pharmacologie",
    level: "Niveau 3",
    pages: 112,
    duration: "7h de lecture",
    rating: 4.7,
    downloads: 876,
    color: "violet",
    icon: FileText,
    href: "/supports/pharmacologie-clinique-avancee.pdf",
    tag: "Avancé",
  },
  {
    id: 3,
    title: "Gestion du Dossier Patient Informatisé",
    description:
      "Apprenez à utiliser les outils numériques de suivi patient, la traçabilité des actes, la protection des données de santé (RGPD) et la communication inter-équipes.",
    subject: "Informatique médicale",
    level: "Niveau 2",
    pages: 64,
    duration: "4h de lecture",
    rating: 4.8,
    downloads: 602,
    color: "pink",
    icon: Calendar,
    href: "/supports/gestion-dossier-patient.pdf",
    tag: "Nouveau",
  },
];

/* ─────────────────────────────────────────────
   Colour maps
───────────────────────────────────────────── */
const colorMap: Record<string, Record<string, string>> = {
  indigo: {
    badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    icon: "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20",
    glow: "group-hover:shadow-indigo-500/10",
    border: "group-hover:border-indigo-500/40",
    btn: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
    tag: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
    star: "text-indigo-400",
  },
  violet: {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    icon: "bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20",
    glow: "group-hover:shadow-violet-500/10",
    border: "group-hover:border-violet-500/40",
    btn: "bg-violet-600 hover:bg-violet-500 shadow-violet-500/25",
    tag: "bg-violet-600/20 text-violet-300 border-violet-500/30",
    star: "text-violet-400",
  },
  pink: {
    badge: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    icon: "bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20",
    glow: "group-hover:shadow-pink-500/10",
    border: "group-hover:border-pink-500/40",
    btn: "bg-pink-600 hover:bg-pink-500 shadow-pink-500/25",
    tag: "bg-pink-600/20 text-pink-300 border-pink-500/30",
    star: "text-pink-400",
  },
};

/* ─────────────────────────────────────────────
   Course Card Component
───────────────────────────────────────────── */
function CourseCard({ course }: { course: (typeof COURSES)[0] }) {
  const [downloading, setDownloading] = useState(false);
  const c = colorMap[course.color];
  const Icon = course.icon;

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    setDownloading(true);
    // Simulate a short download delay then reset
    setTimeout(() => setDownloading(false), 1800);
  };

  return (
    <div
      className={`group relative flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800/80 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${c.glow} ${c.border} backdrop-blur-sm overflow-hidden`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* Top row: Icon + Tag */}
      <div className="flex items-start justify-between mb-5">
        <div className={`p-3.5 rounded-2xl transition-colors duration-300 ${c.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.tag}`}
        >
          {course.tag}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 leading-snug">
        {course.title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">
        {course.description}
      </p>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${c.badge}`}
        >
          <BookOpen className="h-3 w-3" />
          {course.subject}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border bg-slate-800/60 text-slate-400 border-slate-700/50">
          <Shield className="h-3 w-3" />
          {course.level}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border bg-slate-800/60 text-slate-400 border-slate-700/50">
          <Clock className="h-3 w-3" />
          {course.duration}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-5 pt-4 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          <Star className={`h-4 w-4 fill-current ${c.star}`} />
          <span className="text-sm font-semibold text-white">{course.rating}</span>
          <span className="text-xs text-slate-500 ml-1">• {course.pages} pages</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Download className="h-3.5 w-3.5" />
          <span>{course.downloads.toLocaleString("fr-FR")} téléchargements</span>
        </div>
      </div>

      {/* Download Button */}
      <a
        href={course.href}
        onClick={handleDownload}
        className={`relative flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-bold transition-all duration-300 shadow-lg ${c.btn} hover:scale-[1.02] active:scale-[0.98] overflow-hidden`}
      >
        {downloading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Préparation du PDF…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Télécharger le PDF
          </>
        )}
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-pink-600/6 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Hero Section ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 mb-8 select-none">
          <Sparkles className="h-3.5 w-3.5" />
          Bienvenue sur la plateforme Care Online
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
          Simplifiez la gestion de vos classes avec{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Care Online
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Une plateforme moderne conçue spécifiquement pour les enseignants.
          Organisez vos cours, partagez vos supports pédagogiques et suivez la
          progression de vos élèves en toute simplicité.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold transition-all duration-300 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-105"
          >
            Espace Professeurs
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#supports"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold transition-all duration-300"
          >
            Voir les supports
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12 text-sm text-slate-500">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>+120 enseignants actifs</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800">
            <FileText className="h-4 w-4 text-violet-400" />
            <span>+350 supports partagés</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800">
            <Zap className="h-4 w-4 text-pink-400" />
            <span>100% gratuit pour les élèves</span>
          </div>
        </div>
      </section>

      {/* ── Supports de cours Section ── */}
      <section
        id="supports"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-slate-900"
      >
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              Accès libre — aucune connexion requise
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Supports de cours
            </h2>
            <p className="text-slate-400 max-w-xl">
              Retrouvez ici les ressources pédagogiques mises à disposition par
              nos enseignants. Téléchargez librement les PDF de cours ci-dessous.
            </p>
          </div>
          <Link
            href="/login"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-sm font-medium transition-all duration-300"
          >
            <Lock className="h-4 w-4 text-indigo-400" />
            Ajouter un support
          </Link>
        </div>

        {/* Course Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Bottom hint */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Vous êtes enseignant ?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Connectez-vous
          </Link>{" "}
          pour gérer et publier vos propres supports de cours.
        </p>
      </section>

      {/* ── Features Showcase Section ── */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-slate-900"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Tout ce dont un enseignant a besoin au quotidien
          </h2>
          <p className="text-slate-400">
            Une interface intuitive et performante pour vous faire gagner du
            temps sur les tâches administratives.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative rounded-3xl bg-slate-900/40 border border-slate-900 p-8 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 w-fit mb-6 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Tableau de Bord Intuitif
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consultez vos statistiques clés, vos notifications importantes et
              vos cours du jour en un clin d&apos;œil.
            </p>
          </div>

          <div className="group relative rounded-3xl bg-slate-900/40 border border-slate-900 p-8 hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-violet-400 w-fit mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Gestion des Élèves &amp; Classes
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Accédez aux profils complets de vos élèves, gérez les groupes et
              visualisez la répartition globale.
            </p>
          </div>

          <div className="group relative rounded-3xl bg-slate-900/40 border border-slate-900 p-8 hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5 hover:-translate-y-1">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-pink-400 w-fit mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Suivi et Évaluations
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enregistrez l&apos;assiduité, notez les devoirs et suivez la
              progression académique individuelle ou collective.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="relative rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950/40 border border-slate-800 p-8 md:p-12 overflow-hidden text-center">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-60 h-60 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl font-extrabold text-white mb-4">
            Prêt à structurer vos cours ?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Accédez dès maintenant à votre espace privé sécurisé avec votre
            compte enseignant pour publier des supports et gérer vos classes.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all duration-200 hover:scale-105"
          >
            Se Connecter
            <Lock className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
