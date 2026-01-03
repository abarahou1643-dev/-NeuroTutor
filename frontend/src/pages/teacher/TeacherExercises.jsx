import React, { useMemo, useState } from "react";
import {
  createTeacherExercise,
  updateTeacherExercise,
  deleteTeacherExercise,
} from "../../services/teacher";
import { Link } from "react-router-dom";

const empty = {
  title: "",
  description: "",
  problemStatement: "",
  difficulty: "BEGINNER",

  // ✅ on stocke en UI comme "texte" pour simplifier la saisie
  topicsText: "", // ex: "Algèbre, Équations"
  tagsText: "",   // ex: "factorisation, polynomes"
  hintsText: "",  // une hint par ligne
  stepsText: "",  // une étape par ligne

  solution: "",
  responseTypes: ["TEXT"],

  points: 10,
  estimatedTime: 5,
  isPublished: true,
  isApproved: true,
  explanationText: "",
};

const toList = (txt) =>
  String(txt || "")
    .split(/[,;\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);

const toLines = (txt) =>
  String(txt || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export default function TeacherExercises() {
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canUpdateOrDelete = !!saved?.id && !busy;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ✅ Construire le payload final attendu par le backend
  const payload = useMemo(() => {
    return {
      title: form.title?.trim(),
      description: form.description?.trim(),
      problemStatement: form.problemStatement?.trim(),
      difficulty: form.difficulty,

      topics: toList(form.topicsText),
      tags: toList(form.tagsText),
      hints: toLines(form.hintsText),
      steps: toLines(form.stepsText),

      solution: form.solution?.trim(),
      responseTypes: Array.isArray(form.responseTypes) ? form.responseTypes : ["TEXT"],

      points: Number(form.points) || 0,
      estimatedTime: Number(form.estimatedTime) || 0,

      isPublished: !!form.isPublished,
      isApproved: !!form.isApproved,
      explanationText: form.explanationText?.trim() || "",
    };
  }, [form]);

  const validate = () => {
    if (!payload.title) return "Le titre est obligatoire";
    if (!payload.problemStatement) return "L'énoncé est obligatoire";
    if (!payload.solution) return "La solution est obligatoire";
    if (payload.points <= 0) return "Points doit être > 0";
    if (payload.estimatedTime <= 0) return "Temps estimé doit être > 0";
    return "";
  };

  const create = async () => {
    setError("");
    const v = validate();
    if (v) return setError(v);

    setBusy(true);
    try {
      const ex = await createTeacherExercise(payload);

      setSaved(ex);

      // ✅ recharger le formulaire avec ce qui vient du backend
      setForm((f) => ({
        ...f,
        ...empty,
        ...ex,
        topicsText: (ex.topics || []).join(", "),
        tagsText: (ex.tags || []).join(", "),
        hintsText: (ex.hints || []).join("\n"),
        stepsText: (ex.steps || []).join("\n"),
      }));

      alert("✅ Exercice créé");
    } catch (e) {
      setError(e?.message || "Erreur création");
    } finally {
      setBusy(false);
    }
  };

  const update = async () => {
    setError("");
    if (!saved?.id) return setError("Crée un exercice d'abord");

    const v = validate();
    if (v) return setError(v);

    setBusy(true);
    try {
      const ex = await updateTeacherExercise(saved.id, payload);
      setSaved(ex);

      setForm((f) => ({
        ...f,
        ...ex,
        topicsText: (ex.topics || []).join(", "),
        tagsText: (ex.tags || []).join(", "),
        hintsText: (ex.hints || []).join("\n"),
        stepsText: (ex.steps || []).join("\n"),
      }));

      alert("✅ Exercice modifié");
    } catch (e) {
      setError(e?.message || "Erreur modification");
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    setError("");
    if (!saved?.id) return setError("Aucun exercice à supprimer");

    const ok = window.confirm("Supprimer cet exercice ?");
    if (!ok) return;

    setBusy(true);
    try {
      await deleteTeacherExercise(saved.id);
      setSaved(null);
      setForm(empty);
      alert("🗑️ Exercice supprimé");
    } catch (e) {
      setError(e?.message || "Erreur suppression");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercices (Enseignant)</h1>
        <Link className="px-4 py-2 rounded bg-gray-100" to="/teacher">
          Retour
        </Link>
      </div>

      {error && (
        <div className="p-3 border rounded bg-red-50 text-red-700">❌ {error}</div>
      )}

      <div className="bg-white border rounded-xl p-4 space-y-4">
        <input
          className="w-full border rounded p-2"
          placeholder="Titre"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          disabled={busy}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          disabled={busy}
        />

        <textarea
          className="w-full border rounded p-2 h-24"
          placeholder="Énoncé"
          value={form.problemStatement}
          onChange={(e) => set("problemStatement", e.target.value)}
          disabled={busy}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Solution attendue (ex: x=5)"
          value={form.solution}
          onChange={(e) => set("solution", e.target.value)}
          disabled={busy}
        />

        <select
          className="w-full border rounded p-2"
          value={form.difficulty}
          onChange={(e) => set("difficulty", e.target.value)}
          disabled={busy}
        >
          <option value="BEGINNER">BEGINNER</option>
          <option value="INTERMEDIATE">INTERMEDIATE</option>
          <option value="ADVANCED">ADVANCED</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="w-full border rounded p-2"
            type="number"
            min={1}
            placeholder="Points"
            value={form.points}
            onChange={(e) => set("points", e.target.value)}
            disabled={busy}
          />
          <input
            className="w-full border rounded p-2"
            type="number"
            min={1}
            placeholder="Temps estimé (min)"
            value={form.estimatedTime}
            onChange={(e) => set("estimatedTime", e.target.value)}
            disabled={busy}
          />
        </div>

        <input
          className="w-full border rounded p-2"
          placeholder="Topics (séparés par virgule) ex: Algèbre, Équations"
          value={form.topicsText}
          onChange={(e) => set("topicsText", e.target.value)}
          disabled={busy}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Tags (séparés par virgule)"
          value={form.tagsText}
          onChange={(e) => set("tagsText", e.target.value)}
          disabled={busy}
        />

        <textarea
          className="w-full border rounded p-2 h-24"
          placeholder="Hints (1 par ligne)"
          value={form.hintsText}
          onChange={(e) => set("hintsText", e.target.value)}
          disabled={busy}
        />

        <textarea
          className="w-full border rounded p-2 h-24"
          placeholder="Steps (1 par ligne)"
          value={form.stepsText}
          onChange={(e) => set("stepsText", e.target.value)}
          disabled={busy}
        />

        <textarea
          className="w-full border rounded p-2 h-28"
          placeholder="Explication (texte seulement)"
          value={form.explanationText}
          onChange={(e) => set("explanationText", e.target.value)}
          disabled={busy}
        />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
              disabled={busy}
            />
            Publié
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.isApproved}
              onChange={(e) => set("isApproved", e.target.checked)}
              disabled={busy}
            />
            Approuvé
          </label>
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            onClick={create}
            disabled={busy}
          >
            {busy ? "..." : "Créer"}
          </button>

          <button
            className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
            onClick={update}
            disabled={!canUpdateOrDelete}
          >
            Modifier
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
            onClick={del}
            disabled={!canUpdateOrDelete}
          >
            Supprimer
          </button>
        </div>

        {saved?.id && (
          <div className="text-xs text-gray-600">
            ID: <span className="font-mono">{saved.id}</span>
          </div>
        )}
      </div>
    </div>
  );
}
