// src/components/exercises/ExerciseDetail.jsx
import React, { useMemo, useState } from "react";
import {
  Clock,
  Award,
  Lightbulb,
  CheckCircle,
  XCircle,
  ChevronRight,
  BookOpen,
  Target,
  Zap,
  Send,
  ListChecks,
} from "lucide-react";

import ErrorAlert from "../common/ErrorAlert";
import LoadingSpinner from "../common/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";

// ✅ exercise-service
const EXERCISE_API_BASE = "http://127.0.0.1:8083/api/v1";

const normalizeRole = (r) => String(r || "").toUpperCase().replace("ROLE_", "");

/* =========================
   Helpers (important)
========================= */

// Nettoie texte (utile pour extractions)
const cleanText = (s) =>
  String(s || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// ✅ Extrait une "réponse finale" depuis un raisonnement long
// Exemple: trouve "r = 1" et "r = -2" puis renvoie "r = 1 ou r = -2"
const extractFinalAnswer = (raw) => {
  const text = String(raw || "");

  // Cas 1: l'utilisateur a déjà écrit "r = 1 ou r = -2"
  // On normalise juste un peu
  if (/r\s*=\s*-?\d+/i.test(text) && /\bou\b/i.test(text)) {
    // on récupère toutes les occurrences r=...
    const matches = text.match(/r\s*=\s*-?\d+/gi) || [];
    const uniq = Array.from(new Set(matches.map((m) => cleanText(m))));
    if (uniq.length) return uniq.join(" ou ");
  }

  // Cas 2: chercher les occurrences r=...
  const matches = text.match(/r\s*=\s*-?\d+/gi) || [];
  const uniq = Array.from(new Set(matches.map((m) => cleanText(m))));
  if (uniq.length) return uniq.join(" ou ");

  // Cas 3: chercher juste des nombres (dernier recours)
  // (évite de casser si exercice pas "r=")
  // Ici on renvoie le dernier nombre trouvé si rien d'autre.
  const nums = text.match(/-?\d+(\.\d+)?/g) || [];
  if (nums.length === 1) return nums[0];
  // sinon on ne devine pas: renvoie texte nettoyé
  return cleanText(text);
};

// ✅ Extrait des étapes depuis un texte libre (si l'étudiant a tout collé dans une seule zone)
const extractStepsFromText = (raw) => {
  const text = String(raw || "");
  // on split par lignes d'abord
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // si aucune vraie ligne, tenter de découper sur "**Étape" ou "Étape"
  const fallbackChunks =
    lines.length > 1
      ? lines
      : text
          .split(/(?:\*\*?\s*étape\s*\d+\s*:?\s*\*\*?|étape\s*\d+\s*:)/gi)
          .map((c) => c.trim())
          .filter(Boolean);

  // On garde uniquement les lignes "math" plausibles
  const candidates = fallbackChunks
    .map((l) => l.replace(/\*\*/g, "").trim())
    .filter((l) => l.length >= 3)
    .filter((l) => /[=⇒→]|u_\d|u\d|r\s*=|x\s*=|y\s*=|\d/.test(l));

  // Dédupliquer
  const uniq = [];
  const seen = new Set();
  for (const c of candidates) {
    const k = cleanText(c).toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      uniq.push(cleanText(c));
    }
  }

  // Limiter à 12 étapes max pour éviter payload énorme
  return uniq.slice(0, 12);
};

const ExerciseDetail = ({ exercise, onClose, onSubmit }) => {
  const { token, user } = useAuth();

  // ✅ ID Mongo / normal
  const exerciseId = exercise?.id || exercise?._id;

  const [showSolution, setShowSolution] = useState(false);
  const [mode, setMode] = useState("SIMPLE"); // SIMPLE | STEPS

  // IMPORTANT: userAnswer = zone principale (l'étudiant colle souvent tout ici)
  const [userAnswer, setUserAnswer] = useState("");
  const [stepsText, setStepsText] = useState("");

  const stepsArrayFromBox = useMemo(() => {
    return stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [stepsText]);

  const autoSteps = useMemo(() => extractStepsFromText(userAnswer), [userAnswer]);

  // ✅ stepsArray final: priorité à la box steps, sinon auto-extract depuis userAnswer
  const stepsArray = useMemo(() => {
    return stepsArrayFromBox.length > 0 ? stepsArrayFromBox : autoSteps;
  }, [stepsArrayFromBox, autoSteps]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);

  const getDifficultyColor = (difficulty) => {
    switch (String(difficulty || "").toUpperCase()) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const reset = () => {
    setUserAnswer("");
    setStepsText("");
    setResult(null);
    setApiError("");
    setShowSolution(false);
    setMode("SIMPLE");
  };

  const getUserId = () => {
    if (user?.userId || user?.id || user?.email) return user.userId || user.id || user.email;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.userId || u?.id || u?.email || "test@neurotutor.com";
    } catch {
      return "test@neurotutor.com";
    }
  };

  const buildPayload = () => {
    const userId = getUserId();

    // ✅ On extrait toujours une réponse finale propre
    const final = extractFinalAnswer(userAnswer);

    if (mode === "STEPS") {
      return {
        userId,
        // IMPORTANT: finalAnswer = seulement la réponse finale (pas tout le raisonnement)
        finalAnswer: final,
        // steps = liste d'étapes
        steps: stepsArray,
      };
    }

    // SIMPLE: envoyer answer propre
    return {
      userId,
      answer: final,
    };
  };

  const readServerError = async (resp) => {
    try {
      const txt = await resp.text();
      try {
        const j = JSON.parse(txt);
        if (j?.message) return j.message;
      } catch {}
      return txt || `Erreur serveur (${resp.status})`;
    } catch {
      return `Erreur serveur (${resp.status})`;
    }
  };

  const handleSubmit = async () => {
    setApiError("");

    if (!exerciseId) {
      setApiError("Exercice invalide (id manquant).");
      return;
    }

    if (!userAnswer.trim()) {
      setApiError("Veuillez entrer une réponse.");
      return;
    }

    // ✅ STEPS: on accepte si stepsArray a été auto-extrait
    if (mode === "STEPS" && stepsArray.length === 0) {
      setApiError(
        "Mode Étapes: ajoute au moins une étape (dans la zone Étapes) OU écris des étapes sur plusieurs lignes dans la réponse."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      const resp = await fetch(`${EXERCISE_API_BASE}/submissions/${exerciseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(await readServerError(resp));

      const data = await resp.json();

      const uiResult = {
        correct: !!data.correct,
        scoreEarned: data.scoreEarned ?? 0,
        submissionId: data.submissionId || data.id,
        answer: data.answer,
        stepsFeedback: data.stepsFeedback || [],
        generatedSolutionSteps: data.generatedSolutionSteps || [],
        submittedAt: data.submittedAt,
      };

      setResult(uiResult);

      onSubmit?.({
        exerciseId,
        ...uiResult,
      });
    } catch (e) {
      setApiError(e?.message || "Erreur lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const role = normalizeRole(user?.role);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <BookOpen className="h-5 w-5" />
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    exercise?.difficulty
                  )}`}
                >
                  {exercise?.difficulty || "BEGINNER"}
                </span>

                {role && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                    {role}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold truncate">{exercise?.title || "Exercice"}</h2>
              <p className="text-indigo-100 mt-2">{exercise?.description || ""}</p>
            </div>

            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
              aria-label="Fermer"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Meta */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>{exercise?.estimatedTime ?? 0} minutes</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{exercise?.points ?? 0} points</span>
              </div>

              {Array.isArray(exercise?.topics) && exercise.topics.length > 0 && (
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div className="flex gap-1 flex-wrap">
                    {exercise.topics.slice(0, 3).map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statement */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Énoncé du problème</h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-gray-800 text-lg">{exercise?.problemStatement || ""}</p>
              </div>
            </div>

            {/* Hints */}
            {Array.isArray(exercise?.hints) && exercise.hints.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-bold text-gray-900">Indices</h3>
                </div>

                <div className="space-y-2">
                  {exercise.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200"
                    >
                      <ChevronRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-800">{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Mode de réponse</h3>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setMode("SIMPLE")}
                  disabled={!!result}
                  className={`px-4 py-2 rounded-lg border transition ${
                    mode === "SIMPLE"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  } ${result ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Réponse simple
                </button>

                <button
                  type="button"
                  onClick={() => setMode("STEPS")}
                  disabled={!!result}
                  className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${
                    mode === "STEPS"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  } ${result ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <ListChecks className="h-4 w-4" />
                  Étapes (step-by-step)
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                * Mode Étapes : colle ton raisonnement. Si tu n’utilises pas la zone “Étapes”, on essaie
                d’extraire automatiquement les étapes depuis ton texte.
              </p>
            </div>

            {/* Answer zone */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Votre réponse</h3>

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Entrez votre réponse (tu peux coller ton raisonnement ici)…"
                className="w-full h-28 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={!!result || isSubmitting}
              />

              {mode === "STEPS" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vos étapes (1 ligne = 1 étape) — optionnel si tu as tout écrit au-dessus
                  </label>

                  <textarea
                    value={stepsText}
                    onChange={(e) => setStepsText(e.target.value)}
                    placeholder={`Exemple:\n2x=10\nx=10/2\nx=5`}
                    className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    disabled={!!result || isSubmitting}
                  />

                  <div className="text-xs text-gray-500 mt-2">
                    Étapes détectées : <b>{stepsArray.length}</b>{" "}
                    {stepsText.trim() ? "(depuis la zone Étapes)" : "(auto-extraites depuis ton texte)"}
                  </div>
                </div>
              )}

              {apiError && (
                <div className="mt-4">
                  <ErrorAlert message={apiError} />
                </div>
              )}

              {!result && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !userAnswer.trim() ||
                    (mode === "STEPS" && stepsArray.length === 0)
                  }
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" text={null} />
                      Évaluation en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Soumettre
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Result */}
            {result && (
              <div
                className={`mb-8 p-6 rounded-xl border ${
                  result.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.correct ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold ${
                        result.correct ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.correct ? "Bonne réponse !" : "Réponse incorrecte"}
                    </h3>

                    <p className={`mt-2 ${result.correct ? "text-green-700" : "text-red-700"}`}>
                      Score gagné : <b>{result.scoreEarned}</b>
                    </p>

                    <div className="mt-2 text-sm text-gray-700">
                      <b>Réponse envoyée au serveur :</b>{" "}
                      <span className="font-mono">{extractFinalAnswer(userAnswer)}</span>
                    </div>

                    {/* Steps feedback */}
                    {mode === "STEPS" && result.stepsFeedback?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Correction des étapes</h4>

                        <div className="space-y-2">
                          {result.stepsFeedback.map((sf) => (
                            <div
                              key={sf.index}
                              className={`p-3 rounded-lg border ${
                                sf.correct
                                  ? "bg-green-100 border-green-200"
                                  : "bg-red-100 border-red-200"
                              }`}
                            >
                              <div className="text-sm text-gray-700">
                                <b>Étape {sf.index + 1}:</b> {sf.step}
                              </div>

                              {!sf.correct && sf.hint && (
                                <div className="text-sm text-red-700 mt-1">💡 {sf.hint}</div>
                              )}

                              {!sf.correct && sf.correctedStep && (
                                <div className="text-sm text-gray-800 mt-1">
                                  ✅ Correction: <b>{sf.correctedStep}</b>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Generated steps */}
                    {mode === "STEPS" && result.generatedSolutionSteps?.length > 0 && (
                      <div className="mt-4 p-4 bg-white/60 rounded-xl border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Solution proposée (AI)</h4>
                        <ol className="list-decimal ml-5 space-y-1 text-gray-800">
                          {result.generatedSolutionSteps.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <div className="mt-4 flex gap-3 flex-wrap">
                      <button
                        onClick={() => {
                          setResult(null);
                          setApiError("");
                          setShowSolution(false);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        Réessayer
                      </button>

                      {!showSolution && (
                        <button
                          onClick={() => setShowSolution(true)}
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                        >
                          Voir la solution
                        </button>
                      )}

                      <button
                        onClick={reset}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Revenir à zéro
                      </button>
                    </div>

                    {!result.correct && exercise?.solution && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-gray-700 font-medium">Réponse attendue :</p>
                        <p className="text-gray-900 font-bold mt-1">{exercise.solution}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Solution */}
            {showSolution && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Solution détaillée</h3>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <p className="text-green-800">{exercise?.solution || ""}</p>

                  {Array.isArray(exercise?.steps) && exercise.steps.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-green-900 mb-2">Étapes :</h4>
                      <ol className="space-y-2">
                        {exercise.steps.map((step, idx) => (
                          <li key={idx} className="text-green-800">
                            <span className="font-bold">Étape {idx + 1}:</span> <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
