"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Users, 
  ArrowUpRight, 
  Award, 
  Flame, 
  Pencil, 
  Trash2, 
  Plus, 
  X, 
  AlertCircle,
  Loader2
} from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [averageGrade, setAverageGrade] = useState<string>("");
  const [presenceRate, setPresenceRate] = useState<number>(100);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/classes`);
      if (!res.ok) {
        throw new Error("Impossible de récupérer la liste des classes.");
      }
      const data = await res.json();
      setClasses(data);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setName("");
    setDescription("");
    setStudentsCount(0);
    setAverageGrade("");
    setPresenceRate(100);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingClass(c);
    setName(c.name);
    setDescription(c.description || "");
    setStudentsCount(c.students_count);
    setAverageGrade(c.average_grade !== null ? String(c.average_grade) : "");
    setPresenceRate(c.presence_rate);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.")) {
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/classes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Erreur lors de la suppression de la classe.");
      }
      fetchClasses();
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Le nom de la classe est requis.");
      return;
    }
    
    setFormSubmitting(true);
    setFormError(null);

    const payload = {
      name,
      description,
      students_count: Number(studentsCount),
      average_grade: averageGrade.trim() !== "" ? Number(averageGrade) : null,
      presence_rate: Number(presenceRate)
    };

    try {
      let res;
      if (editingClass) {
        res = await fetch(`${apiBaseUrl}/api/classes/${editingClass.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiBaseUrl}/api/classes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Une erreur s'est produite.");
      }

      setModalOpen(false);
      fetchClasses();
    } catch (err: any) {
      setFormError(err.message || "Impossible d'enregistrer la classe.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const colors = [
    { color: "from-indigo-600 to-indigo-400", text: "text-indigo-400", bg: "bg-indigo-500/10" },
    { color: "from-violet-600 to-violet-400", text: "text-violet-400", bg: "bg-violet-500/10" },
    { color: "from-pink-600 to-pink-400", text: "text-pink-400", bg: "bg-pink-500/10" },
    { color: "from-amber-600 to-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8 relative">
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
        <button 
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Ajouter une classe
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Chargement des classes...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-white mb-0.5">Erreur de chargement</h4>
            <p>{error}</p>
          </div>
          <button 
            onClick={fetchClasses}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && classes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
          <GraduationCap className="h-16 w-16 mb-4 text-slate-700 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-white mb-1">Aucune classe pour le moment</h3>
          <p className="text-sm max-w-sm">Commencez par ajouter votre premier groupe de classe à l'aide du bouton ci-dessus.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && classes.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-6">
          {classes.map((c, i) => {
            const style = colors[i % colors.length];
            return (
              <div 
                key={c.id} 
                className="rounded-3xl bg-slate-900/40 border border-slate-900 p-6 md:p-8 hover:border-slate-800 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Top decorative gradient bar */}
                <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${style.color}`} />
                
                {/* Class Header */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-white">{c.name}</h3>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-2 gap-1.5">
                          <button 
                            onClick={() => openEditModal(c)}
                            title="Modifier"
                            className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            title="Supprimer"
                            className="p-1 rounded bg-slate-850 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{c.description || "Aucune matière spécifiée"}</p>
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
                        <span className="text-sm font-bold text-white">{c.students_count}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Moyenne</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Award className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-sm font-bold text-white">
                          {c.average_grade !== null && c.average_grade !== undefined ? `${c.average_grade} / 20` : "-- / 20"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Présence</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Flame className="h-3.5 w-3.5 text-pink-400" />
                        <span className="text-sm font-bold text-white">{c.presence_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between mt-2 pt-2">
                  <span className="text-[10px] font-semibold text-slate-500">
                    Année Scolaire 2025-2026
                  </span>
                  <Link 
                    href={`/professeur/classes/${c.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group/btn cursor-pointer"
                  >
                    Accéder au suivi
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingClass ? "Modifier la classe" : "Ajouter une nouvelle classe"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Nom de la classe *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Terminale S1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Description / Matière
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Mathématiques Spécialité"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Nombre d'élèves
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Taux de présence (%)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    step="0.1"
                    value={presenceRate}
                    onChange={(e) => setPresenceRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Moyenne Générale (/20) (optionnel)
                </label>
                <input 
                  type="number" 
                  min="0"
                  max="20"
                  step="0.1"
                  placeholder="Laisser vide si non définie"
                  value={averageGrade}
                  onChange={(e) => setAverageGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {formSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingClass ? "Sauvegarder" : "Créer la classe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
