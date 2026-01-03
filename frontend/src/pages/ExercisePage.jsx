// src/pages/ExercisePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Trash2,
  Square,
  Play,
} from "lucide-react";

/* =======================
   Utils
======================= */
function normalizeAnswer(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, "") // all whitespace
    .replace(/\u00a0/g, "") // nbsp
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

  // if expected has "=" accept rhs
  if (e.includes("=")) {
    const rhs = e.split("=").pop();
    if (u === rhs) return true;

    if (u.includes("=")) {
      const urhs = u.split("=").pop();
      if (urhs === rhs) return true;
    }
  }

  // if expected has "ou"
  if (e.includes("ou")) {
    const parts = e.split("ou").map((p) => p.trim());
    return parts.some((p) => areAnswersEquivalent(u, p));
  }

  return false;
}

const safeArray = (v) => (Array.isArray(v) ? v : []);
const toUpperList = (arr) =>
  safeArray(arr).map((x) => String(x || "").toUpperCase()).filter(Boolean);

// ✅ ton backend exercise-service
const API_BASE = "http://127.0.0.1:8083/api/v1";

/**
 * Essaie d’extraire la réponse finale si l’utilisateur écrit un gros texte
 * Ex: "… (r-1)(r+2)=0 => r=1 ou r=-2" => prend la dernière ligne "r=1 ou r=-2"
 */
function extractFinalAnswer(text) {
  const t = (text || "").trim();
  if (!t) return "";
  const lines = t
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return t;

  // prend la dernière ligne utile
  const last = lines[lines.length - 1];

  // si l'utilisateur écrit "Votre réponse: xxx", prendre ce qui après ":"
  if (last.includes(":")) {
    const after = last.split(":").pop().trim();
    if (after) return after;
  }

  return last;
}

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

  // ✅ STEPS mode
  const [mode, setMode] = useState("SIMPLE"); // SIMPLE | STEPS
  const [stepsText, setStepsText] = useState("");

  const stepsArray = useMemo(() => {
    return stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [stepsText]);

  const [submitting, setSubmitting] = useState(false);

  // IMAGE
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // AUDIO (recorded)
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Result correction
  const [result, setResult] = useState(null);

  const expectedAnswer = useMemo(() => exercise?.solution ?? "", [exercise]);

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

        const res = await fetch(`${API_BASE}/exercises/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setExercise(data);

        // reset inputs
        setUserAnswer("");
        setStepsText("");
        setMode("SIMPLE");
        setResult(null);
        setImageFile(null);
        setImagePreview("");
        clearAudio(true);
      } catch (e) {
        setError(e.message || "Erreur");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Preview audio
  useEffect(() => {
    if (!audioBlob) {
      setAudioPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    setAudioPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const clearAudio = (silent = false) => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch {}
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    stopStream();

    setIsRecording(false);
    setAudioBlob(null);
    setAudioPreviewUrl("");

    if (!silent) {
      setResult((r) =>
        r
          ? r
          : {
              isCorrect: false,
              message: "Audio supprimé.",
              user: userAnswer,
              expected: expectedAnswer,
              earnedPoints: 0,
            }
      );
    }
  };

  /* =======================
     🎙️ Audio Recording
  ======================= */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setResult({
        isCorrect: false,
        message: "Impossible d'accéder au micro. Autorise le micro dans le navigateur.",
        user: userAnswer,
        expected: expectedAnswer,
        earnedPoints: 0,
      });
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    try {
      mediaRecorderRef.current.stop();
    } catch {}
    setIsRecording(false);
  };

  const buildFileUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `http://127.0.0.1:8083${path}`;
  };

  /* =======================
     ✅ SUBMIT
     - SIMPLE : answer
     - STEPS : steps + finalAnswer
     - IMAGE: multipart si endpoint existe, sinon fallback JSON
     - AUDIO: multipart si endpoint existe, sinon ignoré (fallback JSON)
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exercise) return;

    const token = localStorage.getItem("token");
    const baseUrl = `${API_BASE}/submissions`;

    // userId
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userObj?.email || userObj?.userId || userObj?.id || "test@neurotutor.com";

    const text = (userAnswer || "").trim();
    const hasText = !!text;
    const hasImage = !!imageFile;
    const hasAudio = !!audioBlob;

    // ✅ Validation selon types autorisés
    if (acceptsText && !hasText && mode === "SIMPLE" && !acceptsImage) {
      setResult({
        isCorrect: false,
        message: "Le texte est obligatoire pour la correction.",
        user: "",
        expected: expectedAnswer,
        earnedPoints: 0,
      });
      return;
    }

    if (!acceptsText && acceptsImage && !hasImage) {
      setResult({
        isCorrect: false,
        message: "Veuillez ajouter une image pour la correction.",
        user: "",
        expected: expectedAnswer,
        earnedPoints: 0,
      });
      return;
    }

    // ✅ En mode STEPS : finalAnswer obligatoire
    if (mode === "STEPS") {
      if (!hasText) {
        setResult({
          isCorrect: false,
          message: "Écris la réponse finale dans le champ (finalAnswer).",
          user: "",
          expected: expectedAnswer,
          earnedPoints: 0,
        });
        return;
      }
      if (stepsArray.length === 0) {
        setResult({
          isCorrect: false,
          message: "Ajoute au moins 1 étape (1 ligne = 1 étape).",
          user: "",
          expected: expectedAnswer,
          earnedPoints: 0,
        });
        return;
      }
    }

    setSubmitting(true);

    try {
      let data;

      // ✅ 1) Mode STEPS => JSON uniquement (plus stable)
      if (mode === "STEPS") {
        const finalAnswer = extractFinalAnswer(text);

        const res = await fetch(`${baseUrl}/${exercise.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            userId,
            finalAnswer,
            steps: stepsArray,
          }),
        });

        if (!res.ok) throw new Error(await res.text());
        data = await res.json();
      } else {
        // ✅ 2) Mode SIMPLE
        // multipart si image/audio
        if (hasImage || hasAudio) {
          const form = new FormData();
          form.append("userId", userId);
          if (hasText) form.append("answer", text);
          if (hasImage) form.append("image", imageFile);

          if (hasAudio) {
            const audioFile = new File([audioBlob], "record.webm", {
              type: "audio/webm",
            });
            form.append("audio", audioFile);
          }

          const multipartUrl = `${baseUrl}/${exercise.id}/multipart`;

          const res = await fetch(multipartUrl, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
          });

          // ✅ IMPORTANT: si ton backend n'a pas /multipart => fallback JSON
          if (res.status === 404) {
            const cleaned = extractFinalAnswer(text);

            const res2 = await fetch(`${baseUrl}/${exercise.id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                userId,
                answer: (cleaned || text || "").trim(),
              }),
            });

            if (!res2.ok) throw new Error(await res2.text());
            data = await res2.json();
          } else {
            if (!res.ok) throw new Error(await res.text());
            data = await res.json();
          }
        } else {
          // JSON si seulement texte
          const cleaned = extractFinalAnswer(text);

          const res = await fetch(`${baseUrl}/${exercise.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ userId, answer: (cleaned || text || "").trim() }),
          });

          if (!res.ok) throw new Error(await res.text());
          data = await res.json();
        }
      }

      // ✅ Correct fallback côté UI si backend renvoie correct null
      const fallbackCorrect = areAnswersEquivalent(
        mode === "STEPS" ? extractFinalAnswer(text) : text,
        expectedAnswer
      );

      const isCorrect =
        typeof data.correct === "boolean" ? data.correct : fallbackCorrect;

      const points = Number.isFinite(Number(exercise.points)) ? Number(exercise.points) : 10;
      const earnedPoints =
        typeof data.scoreEarned === "number"
          ? data.scoreEarned
          : isCorrect
          ? points
          : 0;

      setResult({
        isCorrect,
        message: isCorrect ? "Bonne réponse ✅" : "Mauvaise réponse ❌",
        user: mode === "STEPS" ? extractFinalAnswer(text) : (text || "(OCR)"),
        expected: expectedAnswer,
        earnedPoints,
        imageUrl: data.imageUrl || null,
        audioUrl: data.audioUrl || null,
        stepsFeedback: data.stepsFeedback || null,
        generatedSolutionSteps: data.generatedSolutionSteps || null,
        aiGlobalScore: data.aiGlobalScore ?? null,
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
  if (error || !exercise) return <div className="p-6 text-red-600">{error || "Erreur"} </div>;

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

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl border">
        <h1 className="text-2xl font-semibold">{exercise.title}</h1>
        <p className="text-gray-600">{exercise.description}</p>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          {exercise.problemStatement}
        </div>

        <div className="mt-4 flex items-start gap-2 text-sm text-gray-700 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
          <Info className="h-4 w-4 text-indigo-600 mt-0.5" />
          <div>
            <div className="font-semibold">
              Types acceptés :{" "}
              <span className="font-bold">{responseTypes.join(", ")}</span>
            </div>
            <div className="text-gray-600">
              ✅ Texte = correction. Image = OCR/Upload si backend supporte. Audio = explication.
            </div>
          </div>
        </div>

        {/* ✅ Mode SIMPLE / STEPS */}
        {acceptsText && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("SIMPLE")}
              className={`px-4 py-2 rounded-lg border ${
                mode === "SIMPLE"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              Réponse simple
            </button>

            <button
              type="button"
              onClick={() => setMode("STEPS")}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                mode === "STEPS"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
            >
              <ListChecks className="h-4 w-4" />
              Étapes (step-by-step)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          {/* TEXT */}
          {acceptsText && (
            <>
              <label className="block font-medium">
                Votre réponse finale (texte)
                <span className="text-red-600"> *</span>
              </label>

              <textarea
                className="w-full border rounded px-3 py-2 mt-2 h-24"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Ex: r = 1 ou r = -2"
              />

              <p className="mt-1 text-xs text-gray-500">
                ✅ Si tu écris une explication longue, le système prendra la **dernière ligne** comme réponse finale.
              </p>
            </>
          )}

          {/* ✅ STEPS big space */}
          {acceptsText && mode === "STEPS" && (
            <div className="mt-5">
              <label className="block font-medium">
                Vos étapes (1 ligne = 1 étape)
                <span className="text-red-600"> *</span>
              </label>

              <textarea
                className="w-full border rounded px-3 py-2 mt-2 h-64"
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                placeholder={`Exemple:\nu2 = u1 r\nu3 = u1 r^2\nu2 + u3 = 2u1\nu1r + u1r^2 = 2u1\nr + r^2 = 2\nr^2 + r - 2 = 0\n(r-1)(r+2)=0\nr = 1 ou r = -2`}
              />

              <div className="text-xs text-gray-500 mt-2">
                Étapes détectées : <b>{stepsArray.length}</b>
              </div>
            </div>
          )}

          {/* IMAGE */}
          {acceptsImage && (
            <div className="mt-6">
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
                ✅ L’image sera envoyée si ton backend a /multipart. Sinon fallback JSON (sans upload).
              </p>
            </div>
          )}

          {/* AUDIO */}
          {acceptsAudio && (
            <div className="mt-6">
              <div className="flex items-center gap-2 font-medium">
                <Mic className="h-4 w-4" />
                Enregistrer un audio (explication)
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="bg-gray-900 text-white px-3 py-2 rounded flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Démarrer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => clearAudio(false)}
                  className="bg-gray-200 px-3 py-2 rounded flex items-center gap-2"
                  disabled={!audioBlob && !isRecording}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>

              {audioPreviewUrl && (
                <audio className="mt-3 w-full" controls src={audioPreviewUrl} />
              )}

              <p className="mt-2 text-xs text-gray-500">
                ✅ Audio envoyé seulement si /multipart existe. Sinon il ne sera pas uploadé.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {submitting ? "Validation..." : "Valider"}
          </button>
        </form>

        {/* Result */}
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
              {result.aiGlobalScore !== null && result.aiGlobalScore !== undefined && (
                <div>
                  <b>Score AI :</b> {String(result.aiGlobalScore)}
                </div>
              )}
            </div>

            {(result.imageUrl || result.audioUrl) && (
              <div className="mt-4">
                <div className="font-semibold">Fichiers sauvegardés</div>

                {result.imageUrl && (
                  <div className="text-sm mt-1">
                    <b>Image :</b>{" "}
                    <a
                      className="text-indigo-600 underline"
                      href={buildFileUrl(result.imageUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {result.imageUrl}
                    </a>
                  </div>
                )}

                {result.audioUrl && (
                  <div className="text-sm mt-1">
                    <b>Audio :</b>{" "}
                    <a
                      className="text-indigo-600 underline"
                      href={buildFileUrl(result.audioUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {result.audioUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* steps feedback backend */}
            {Array.isArray(result.stepsFeedback) && result.stepsFeedback.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Correction des étapes (backend/AI)
                </div>

                <div className="mt-2 space-y-2">
                  {result.stepsFeedback.map((sf) => (
                    <div
                      key={sf.index}
                      className={`p-3 rounded border ${
                        sf.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="text-sm">
                        <b>Étape {sf.index + 1}:</b> {sf.step}
                      </div>
                      {!sf.correct && sf.hint && (
                        <div className="text-sm text-red-700 mt-1">💡 {sf.hint}</div>
                      )}
                      {!sf.correct && sf.correctedStep && (
                        <div className="text-sm mt-1">
                          ✅ Correction: <b>{sf.correctedStep}</b>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps / Hints from exercise */}
            <div className="mt-4">
              <div className="flex items-center gap-2 font-semibold">
                <ListChecks className="h-4 w-4" /> Étapes (exercice)
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
