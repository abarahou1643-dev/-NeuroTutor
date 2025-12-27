import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Lightbulb,
  ListChecks,
  Image as ImageIcon,
  Mic,
  Info,
} from "lucide-react";

/* =======================
   Utils
======================= */
function normalizeAnswer(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/–|—/g, "-")
    .trim();
}

function areAnswersEquivalent(user, expected) {
  const u = normalizeAnswer(user);
  const e = normalizeAnswer(expected);

  if (!u || !e) return false;
  if (u === e) return true;

  // si solution contient "=" on accepte aussi la partie droite
  if (e.includes("=")) {
    const rhs = e.split("=").pop();
    if (u === rhs) return true;

    if (u.includes("=")) {
      const urhs = u.split("=").pop();
      if (urhs === rhs) return true;
    }
  }

  // cas "ou" (plusieurs solutions)
  if (e.includes("ou")) {
    const parts = e.split("ou").map((p) => p.trim());
    return parts.some((p) => areAnswersEquivalent(u, p));
  }

  return false;
}

const safeArray = (v) => (Array.isArray(v) ? v : []);
const toUpperList = (arr) =>
  safeArray(arr).map((x) => String(x || "").toUpperCase()).filter(Boolean);

/* =======================
   Component
======================= */
const ExercisePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TEXT answer
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // IMAGE
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // AUDIO
  const [audioFile, setAudioFile] = useState(null);

  // Result correction
  const [result, setResult] = useState(null);

  const expectedAnswer = useMemo(() => exercise?.solution ?? "", [exercise]);

  // ✅ responseTypes depuis backend, fallback TEXT
  const responseTypes = useMemo(() => {
    const rt = toUpperList(exercise?.responseTypes);
    return rt.length ? rt : ["TEXT"];
  }, [exercise]);

  const acceptsText = responseTypes.includes("TEXT");
  const acceptsImage = responseTypes.includes("IMAGE");
  const acceptsAudio = responseTypes.includes("AUDIO");

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:8083/api/v1/exercises/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur chargement exercice");

        const data = await res.json();
        setExercise(data);

        // reset inputs when exercise changes
        setUserAnswer("");
        setResult(null);
        setImageFile(null);
        setImagePreview("");
        setAudioFile(null);
      } catch (e) {
        setError(e.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  // Preview image
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exercise) return;

    // ✅ règles : on garde TEXT obligatoire (même si IMAGE/AUDIO) car la correction est sur la solution
    if (!userAnswer.trim()) {
      setResult({
        isCorrect: false,
        message: "Veuillez entrer une réponse (texte) pour valider.",
        user: userAnswer,
        expected: expectedAnswer,
        earnedPoints: 0,
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // ✅ userId = email
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      const userId =
        userObj?.email || localStorage.getItem("email") || "test@neurotutor.com";

      // ⚠️ backend submissions actuellement accepte seulement { userId, answer }
      // donc on n'envoie pas image/audio pour éviter 400.
      // (on les ajoutera à l'étape suivante quand le backend les supportera)
      const res = await fetch(
        `http://localhost:8083/api/v1/submissions/${exercise.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            answer: userAnswer,
          }),
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }

      const data = await res.json();

      // fallback local
      const fallbackCorrect = areAnswersEquivalent(userAnswer, expectedAnswer);

      const isCorrect =
        typeof data.correct === "boolean" ? data.correct : fallbackCorrect;

      const earnedPoints =
        typeof data.scoreEarned === "number"
          ? data.scoreEarned
          : isCorrect
          ? exercise.points ?? 10
          : 0;

      setResult({
        isCorrect,
        message: isCorrect ? "Bonne réponse ✅" : "Mauvaise réponse ❌",
        user: userAnswer,
        expected: expectedAnswer,
        earnedPoints,
      });
    } catch (err) {
      setResult({
        isCorrect: false,
        message: err?.message || "Erreur",
        user: userAnswer,
        expected: expectedAnswer,
        earnedPoints: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error || !exercise)
    return <div className="p-6 text-red-600">{error}</div>;

  const steps = safeArray(exercise.steps);
  const hints = safeArray(exercise.hints);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux exercices
      </button>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border">
        <h1 className="text-2xl font-semibold">{exercise.title}</h1>
        <p className="text-gray-600">{exercise.description}</p>

        <div className="mt-4 p-4 bg-gray-100 rounded">{exercise.problemStatement}</div>

        {/* ✅ Affichage des types acceptés */}
        <div className="mt-4 flex items-start gap-2 text-sm text-gray-700 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
          <Info className="h-4 w-4 text-indigo-600 mt-0.5" />
          <div>
            <div className="font-semibold">
              Types acceptés :{" "}
              <span className="font-bold">{responseTypes.join(", ")}</span>
            </div>
            <div className="text-gray-600">
              (Le texte sert à la correction. IMAGE/AUDIO servent à expliquer.)
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* TEXT */}
          <label className="block font-medium">
            Votre réponse {acceptsText ? "(texte)" : ""}
          </label>
          <input
            className="w-full border rounded px-3 py-2 mt-2"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Ex: x=5 ou 5"
          />

          {/* IMAGE */}
          {acceptsImage && (
            <div className="mt-5">
              <div className="flex items-center gap-2 font-medium">
                <ImageIcon className="h-4 w-4" />
                Ajouter une image (schéma)
              </div>
              <input
                className="mt-2 block w-full text-sm"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="mt-3 max-h-64 rounded-lg border"
                />
              )}
              <p className="mt-2 text-xs text-gray-500">
                ⚠️ Pour l’instant, l’image n’est pas envoyée au serveur (backend submissions
                ne la supporte pas encore). On l’ajoute à l’étape suivante.
              </p>
            </div>
          )}

          {/* AUDIO */}
          {acceptsAudio && (
            <div className="mt-5">
              <div className="flex items-center gap-2 font-medium">
                <Mic className="h-4 w-4" />
                Ajouter un audio (explication)
              </div>
              <input
                className="mt-2 block w-full text-sm"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
              {audioFile && (
                <audio className="mt-3 w-full" controls src={URL.createObjectURL(audioFile)} />
              )}
              <p className="mt-2 text-xs text-gray-500">
                ⚠️ Pour l’instant, l’audio n’est pas envoyé au serveur (backend submissions
                ne le supporte pas encore). On l’ajoute à l’étape suivante.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {submitting ? "Validation..." : "Valider"}
          </button>
        </form>

        {/* ===== Correction ===== */}
        {result && (
          <div className="mt-6 border p-4 rounded">
            <div className="flex items-center gap-2 font-semibold">
              {result.isCorrect ? (
                <CheckCircle className="text-green-600" />
              ) : (
                <XCircle className="text-red-600" />
              )}
              {result.message}
            </div>

            <div className="mt-2 text-sm">
              <div>
                <b>Votre réponse :</b> {result.user}
              </div>
              <div>
                <b>Réponse attendue :</b> {result.expected}
              </div>
              <div>
                <b>Points gagnés :</b> {result.earnedPoints}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 font-semibold">
                <ListChecks className="h-4 w-4" /> Étapes
              </div>
              {steps.length ? (
                <ol className="list-decimal ml-5 mt-2">
                  {steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500">Aucune étape disponible.</p>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 font-semibold">
                <Lightbulb className="h-4 w-4" /> Indices
              </div>
              {hints.length ? (
                <ul className="list-disc ml-5 mt-2">
                  {hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Aucun indice disponible.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExercisePage;
