"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  Code2,
  BarChart2,
  Link2,
  Plus,
  X,
  ExternalLink,
  Loader2,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Maximize2,
  Trash2,
  UploadCloud,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SchoolType = "college" | "lycee" | "lycee_pro";
type ResourceType = "pdf" | "html_custom" | "streamlit_app" | "link";
type SubjectType = "Mathematiques" | "Sciences Physiques" | "SNT";

interface Resource {
  id: number;
  title: string;
  school_type: SchoolType;
  grade_level: string;
  resource_type: ResourceType;
  subject: SubjectType;
  content_url: string;
  created_by: string;
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Constants — filter hierarchy
// ---------------------------------------------------------------------------
const SCHOOL_LABELS: Record<SchoolType, string> = {
  college: "Collège",
  lycee: "Lycée",
  lycee_pro: "Lycée Pro",
};

const SUBJECT_LABELS: Record<SubjectType, string> = {
  "Mathematiques": "Mathématiques",
  "Sciences Physiques": "Sciences Physiques",
  "SNT": "SNT",
};

const GRADE_LEVELS: Record<SchoolType, string[]> = {
  college: ["6eme", "5eme", "4eme", "3eme"],
  lycee: ["seconde", "premiere", "terminale"],
  lycee_pro: ["seconde_pro", "premiere_pro", "terminale_pro"],
};

const GRADE_LABELS: Record<string, string> = {
  "6eme": "6ème",
  "5eme": "5ème",
  "4eme": "4ème",
  "3eme": "3ème",
  seconde: "Seconde",
  premiere: "Première",
  terminale: "Terminale",
  seconde_pro: "Seconde Pro",
  premiere_pro: "Première Pro",
  terminale_pro: "Terminale Pro",
};

const RESOURCE_TYPE_META: Record<
  ResourceType,
  { label: string; icon: React.ElementType; color: string; bg: string; ring: string }
> = {
  pdf: {
    label: "PDF",
    icon: FileText,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/20",
  },
  html_custom: {
    label: "Page HTML",
    icon: Code2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  streamlit_app: {
    label: "App Streamlit",
    icon: BarChart2,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
  },
  link: {
    label: "Lien externe",
    icon: Link2,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.care-online.fr";

function getInitials(email: string) {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// ---------------------------------------------------------------------------
// Sub-component: Resource Card
// ---------------------------------------------------------------------------
function ResourceCard({
  resource,
  onView,
  onDelete,
}: {
  resource: Resource;
  onView: (r: Resource) => void;
  onDelete: (id: number) => void;
}) {
  const meta = RESOURCE_TYPE_META[resource.resource_type];
  const Icon = meta.icon;

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => onView(resource)}
    >
      {/* Subtle top shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Type badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${meta.bg} ${meta.color} ${meta.ring}`}
          >
            <Icon className="h-3 w-3" />
            {meta.label}
          </div>
          <span className="text-[10px] font-semibold text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
            {SUBJECT_LABELS[resource.subject]}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(resource.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title */}
      <div className="flex-1">
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors duration-200">
          {resource.title}
        </h3>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300">
            {getInitials(resource.created_by)}
          </div>
          <span className="text-[11px] text-slate-500 truncate max-w-[100px]">
            {resource.created_by.split("@")[0]}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 group-hover:text-indigo-400 transition-colors">
          Ouvrir <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Create Modal
// ---------------------------------------------------------------------------
function CreateResourceModal({
  schoolType,
  gradeLevel,
  userEmail,
  onClose,
  onCreated,
}: {
  schoolType: SchoolType;
  gradeLevel: string;
  userEmail: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("pdf");
  const [subject, setSubject] = useState<SubjectType>("Mathematiques");
  const [contentUrl, setContentUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    const needsFileUpload = ["pdf", "html_custom"].includes(resourceType);
    if (needsFileUpload && !file) {
      setError("Veuillez sélectionner ou déposer un fichier.");
      return;
    }
    if (!needsFileUpload && !contentUrl.trim()) {
      setError("L'URL est obligatoire.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let finalUrl = contentUrl.trim();

      // Upload file to Vercel Blob if needed
      if (needsFileUpload && file) {
        console.log("Démarrage de l'upload du fichier vers /api/upload");
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          let errMsg = `Statut HTTP ${uploadRes.status}`;
          try {
            const errText = await uploadRes.text();
            console.error("Détails échec upload :", errText);
            try {
              const errJson = JSON.parse(errText);
              errMsg = errJson.error || errJson.message || errMsg;
            } catch {
              errMsg = `${errMsg} (Réponse brute: ${errText.substring(0, 300)})`;
            }
          } catch (readErr) {
            console.error("Impossible de lire la réponse d'erreur d'upload :", readErr);
          }
          throw new Error(errMsg);
        }
        const blobData = await uploadRes.json();
        finalUrl = blobData.url;
      }

      console.log(`Appel POST vers le backend: ${API_BASE}/api/resources`);
      const res = await fetch(`${API_BASE}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          school_type: schoolType,
          grade_level: gradeLevel,
          resource_type: resourceType,
          subject: subject,
          content_url: finalUrl,
          created_by: userEmail,
        }),
      });
      if (!res.ok) {
        let errMsg = `Statut HTTP ${res.status}`;
        try {
          const errText = await res.text();
          console.error("Détails échec création ressource backend :", errText);
          try {
            const errJson = JSON.parse(errText);
            errMsg = errJson.detail || errJson.error || errJson.message || errMsg;
          } catch {
            errMsg = `${errMsg} (Réponse brute: ${errText.substring(0, 300)})`;
          }
        } catch (readErr) {
          console.error("Impossible de lire la réponse d'erreur du backend :", readErr);
        }
        throw new Error(errMsg);
      }
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    const isValidPDF = resourceType === "pdf" && selectedFile.name.endsWith(".pdf");
    const isValidHTML = resourceType === "html_custom" && (selectedFile.name.endsWith(".html") || selectedFile.name.endsWith(".zip"));
    
    if (!isValidPDF && !isValidHTML) {
      setError(resourceType === "pdf" ? "Veuillez fournir un fichier .pdf valide." : "Veuillez fournir un fichier .html ou .zip valide.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
              <Plus className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ajouter une ressource</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {SCHOOL_LABELS[schoolType]} · {GRADE_LABELS[gradeLevel] ?? gradeLevel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Titre de la ressource *
            </label>
            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Activité TP - La lumière blanche"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          {/* Resource type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Type de ressource *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(RESOURCE_TYPE_META) as [ResourceType, typeof RESOURCE_TYPE_META[ResourceType]][]).map(
                ([type, meta]) => {
                  const Icon = meta.icon;
                  const selected = resourceType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      id={`resource-type-${type}`}
                      onClick={() => setResourceType(type)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                        selected
                          ? `${meta.bg} ${meta.color} border-current ring-1 ${meta.ring}`
                          : "bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {meta.label}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Subject type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Matière *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
            >
              {(Object.entries(SUBJECT_LABELS) as [SubjectType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* File Upload OR URL */}
          {["pdf", "html_custom"].includes(resourceType) ? (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Fichier ({resourceType === "pdf" ? "PDF uniquement" : "HTML ou ZIP"}) *
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept={resourceType === "pdf" ? ".pdf" : ".html,.zip"}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className={`p-3 rounded-full transition-colors ${file ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-400"}`}>
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-indigo-400 truncate max-w-[200px] mx-auto">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-white">Cliquez ou glissez un fichier ici</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {resourceType === "pdf" ? "Fichiers .pdf acceptés" : "Fichiers .html ou .zip acceptés"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                URL / Chemin *
              </label>
              <input
                id="resource-url"
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
          )}

          {/* Pre-filled info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            Ajoutée par{" "}
            <span className="text-slate-400 font-medium">{userEmail}</span> dans{" "}
            <span className="text-slate-400 font-medium">
              {SCHOOL_LABELS[schoolType]} · {GRADE_LABELS[gradeLevel] ?? gradeLevel}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            id="submit-resource"
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              submitting
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {["pdf", "html_custom"].includes(resourceType) && file ? "Téléversement en cours…" : "Enregistrement…"}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Ajouter la ressource
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Viewer Modal (iframe)
// ---------------------------------------------------------------------------
function ViewerModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  const meta = RESOURCE_TYPE_META[resource.resource_type];
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-1.5 rounded-lg ring-1 ${meta.bg} ${meta.ring}`}>
            <Icon className={`h-4 w-4 ${meta.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{resource.title}</p>
            <p className="text-[10px] text-slate-500 truncate">{resource.content_url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={resource.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-all"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Nouvel onglet
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        <iframe
          src={resource.content_url}
          title={resource.title}
          className="w-full h-full border-0"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ResourceHubPage() {
  const { user } = useAuth();

  // --- Filter state ---
  const [schoolType, setSchoolType] = useState<SchoolType>("lycee");
  const [gradeLevel, setGradeLevel] = useState<string>(
    GRADE_LEVELS["lycee"][0]
  );
  const [subjectFilter, setSubjectFilter] = useState<SubjectType>("Mathematiques");

  // --- Data state ---
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- UI state ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewerResource, setViewerResource] = useState<Resource | null>(null);

  // Sync grade to first option when school changes
  const handleSchoolChange = (s: SchoolType) => {
    setSchoolType(s);
    setGradeLevel(GRADE_LEVELS[s][0]);
  };

  // Fetch resources from API
  const fetchResources = useCallback(async () => {
    setLoadingData(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        school_type: schoolType,
        grade_level: gradeLevel,
        subject: subjectFilter,
      });
      const url = `${API_BASE}/api/resources?${params}`;
      console.log("Chargement des ressources depuis :", url);
      const res = await fetch(url);
      if (!res.ok) {
        let errorDetails = `Statut HTTP ${res.status}`;
        try {
          const rawText = await res.text();
          console.error("Réponse d'erreur brute du serveur (fetchResources) :", rawText);
          errorDetails += ` : ${rawText.substring(0, 200)}`;
        } catch {}
        throw new Error(`Erreur serveur (${errorDetails})`);
      }
      const data: Resource[] = await res.json();
      setResources(data);
    } catch (err: unknown) {
      console.error("Erreur lors de fetchResources :", err);
      setFetchError(
        err instanceof Error ? err.message : "Impossible de charger les ressources."
      );
    } finally {
      setLoadingData(false);
    }
  }, [schoolType, gradeLevel, subjectFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Delete a resource
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette ressource définitivement ?")) return;
    try {
      const url = `${API_BASE}/api/resources/${id}`;
      console.log("Suppression de la ressource :", url);
      const res = await fetch(url, {
        method: "DELETE",
      });
      if (!res.ok) {
        let errorDetails = `Statut HTTP ${res.status}`;
        try {
          const rawText = await res.text();
          console.error("Réponse d'erreur brute du serveur (handleDelete) :", rawText);
          errorDetails += ` : ${rawText.substring(0, 200)}`;
        } catch {}
        throw new Error(`Erreur lors de la suppression (${errorDetails})`);
      }
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      console.error("Erreur lors de handleDelete :", err);
      alert(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* ------------------------------------------------------------------ */}
        {/* Page header                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-indigo-400 shrink-0" />
              Hub de Ressources
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Ressources pédagogiques partagées — accessibles à tous les enseignants connectés.
            </p>
          </div>
          <button
            id="open-create-resource"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 active:scale-[0.97] transition-all duration-200 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Ajouter une ressource
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Two-level filter                                                    */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5 space-y-4">
          {/* Level 1 — School type */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Établissement
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(SCHOOL_LABELS) as [SchoolType, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    id={`filter-school-${key}`}
                    onClick={() => handleSchoolChange(key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                      schoolType === key
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Level 2 — Grade level (adapts to school type) */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Niveau de classe
            </p>
            <div className="flex flex-wrap gap-2">
              {GRADE_LEVELS[schoolType].map((grade) => (
                <button
                  key={grade}
                  id={`filter-grade-${grade}`}
                  onClick={() => setGradeLevel(grade)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                    gradeLevel === grade
                      ? "bg-slate-100 text-slate-900 shadow-md"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {GRADE_LABELS[grade] ?? grade}
                </button>
              ))}
            </div>
          </div>

          {/* Level 3 — Subject */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Matière
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(SUBJECT_LABELS) as [SubjectType, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSubjectFilter(key as SubjectType)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                      subjectFilter === key
                        ? "bg-slate-100 text-slate-900 shadow-md"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Resource grid                                                       */}
        {/* ------------------------------------------------------------------ */}
        <div>
          {/* Section heading */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-300">
              {SCHOOL_LABELS[schoolType]} ·{" "}
              <span className="text-indigo-400">
                {GRADE_LABELS[gradeLevel] ?? gradeLevel}
              </span>
            </h2>
            {!loadingData && (
              <span className="text-[11px] text-slate-600">
                {resources.length} ressource{resources.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Loading state */}
          {loadingData && (
            <div className="flex items-center justify-center py-20 text-slate-600">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              <span className="text-sm">Chargement des ressources…</span>
            </div>
          )}

          {/* Error state */}
          {fetchError && !loadingData && (
            <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Impossible de charger les ressources</p>
                <p className="text-xs mt-0.5 text-red-400/70">{fetchError}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loadingData && !fetchError && resources.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-slate-700" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Aucune ressource pour cette sélection.</p>
              <p className="text-xs text-slate-600 mt-1">
                Cliquez sur «&nbsp;Ajouter une ressource&nbsp;» pour en créer une.
              </p>
            </div>
          )}

          {/* Cards grid */}
          {!loadingData && !fetchError && resources.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onView={setViewerResource}
                  onDelete={handleDelete}
                />
              ))}

              {/* Add tile shortcut */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-600/5 transition-all duration-200 min-h-[160px] text-slate-700 hover:text-indigo-400"
              >
                <div className="w-10 h-10 rounded-xl border border-dashed border-slate-700 group-hover:border-indigo-500/40 flex items-center justify-center transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold">Nouvelle ressource</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Create Modal                                                        */}
      {/* ------------------------------------------------------------------ */}
      {showCreateModal && user && (
        <CreateResourceModal
          schoolType={schoolType}
          gradeLevel={gradeLevel}
          userEmail={user.email}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchResources}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Viewer Modal                                                        */}
      {/* ------------------------------------------------------------------ */}
      {viewerResource && (
        <ViewerModal
          resource={viewerResource}
          onClose={() => setViewerResource(null)}
        />
      )}
    </>
  );
}
