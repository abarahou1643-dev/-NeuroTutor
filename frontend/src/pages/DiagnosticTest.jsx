import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import { useAuth } from "../contexts/AuthContext";

const DIAG_API = "http://127.0.0.1:8083/api/v1";
const AUTH_API = "/api/api/v1";

const DiagnosticTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, isAuthenticated, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  // ✅ Retake mode: /diagnostic?retake=1
  const allowRetake = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("retake") === "1";
  }, [location.search]);

  // ✅ studentId robuste: userId -> id -> email
  const studentId = useMemo(() => {
    if (!user) return null;
    return user.userId || user.id || user.email || null;
  }, [user]);

  // 1) Si pas connecté => login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // 2) Démarrage automatique
  useEffect(() => {
    const run = async () => {
      setError("");

      if (authLoading) return;
      if (!isAuthenticated) return;

      // Si user pas encore chargé, forcer refresh
      if (!user) {
        setLoading(true);
        await refreshMe();
        setLoading(false);
        return;
      }

      // ✅ Si diagnostic terminé et pas retake -> ne pas démarrer
      const role = String(user.role || "").toUpperCase().replace("ROLE_", "");
      if (role === "STUDENT" && user.diagnosticCompleted === true && !allowRetake) {
        setLoading(false);
        return;
      }

      if (!studentId) {
        setError(
          "Impossible d’identifier l’utilisateur (studentId). Vérifie que /auth/me renvoie userId ou email."
        );
        setLoading(false);
        return;
      }

      await startDiagnostic(studentId);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user, studentId, allowRetake]);

  const startDiagnostic = async (sid) => {
    setLoading(true);
    setStarting(true);
    setError("");
    setTest(null);
    setResult(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${DIAG_API}/diagnostic/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ studentId: sid }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Start diagnostic failed (HTTP ${res.status})`);
      }

      const data = await res.json();
      setTest(data);

      const qLen = Array.isArray(data?.questions) ? data.questions.length : 0;
      setAnswers(new Array(qLen).fill(""));
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur lors du démarrage du diagnostic");
    } finally {
      setStarting(false);
      setLoading(false);
    }
  };

  const setAnswer = (index, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const submitDiagnostic = async () => {
    setError("");

    if (!test?.id) {
      setError("Test introuvable (id manquant). Clique sur Refaire / Démarrer.");
      return;
    }

    const missing = answers.findIndex((a) => !a);
    if (missing !== -1) {
      setError(`Réponds à la question ${missing + 1} avant de soumettre.`);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant (non connecté)");

      const sid = test.studentId || studentId;

      // 1) submit diagnostic (ai-service / diagnostic service)
      const res = await fetch(`${DIAG_API}/diagnostic/submit/${test.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId: sid, answers }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Submit diagnostic failed (HTTP ${res.status})`);
      }

      const diagResult = await res.json();
      setResult(diagResult);

      // ✅ score 0..1 -> % integer
      const scorePct = Math.round((diagResult?.score || 0) * 100);
      const level = diagResult?.levelRecommendation || "BEGINNER";

      // 2) enregistrer côté auth-service ✅ PORT 8081
      const saveRes = await fetch(`${AUTH_API}/auth/diagnostic/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: scorePct, level }),
      });

      if (!saveRes.ok) {
        const txt = await saveRes.text();
        throw new Error(txt || `Save diagnostic failed (HTTP ${saveRes.status})`);
      }

      await refreshMe();
      navigate("/dashboard", { replace: true, state: { diagnosticCompleted: true } });
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur lors de la soumission du diagnostic");
    } finally {
      setSubmitting(false);
    }
  };

  // UI
  if (authLoading || loading) return <LoadingSpinner text="Chargement du diagnostic..." />;

  // ✅ Écran "déjà fait" (et bouton retake)
  const role = String(user?.role || "").toUpperCase().replace("ROLE_", "");
  if (role === "STUDENT" && user?.diagnosticCompleted === true && !allowRetake) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl w-full">
          <h1 className="text-2xl font-bold mb-2">Diagnostic déjà terminé</h1>
          <p className="text-gray-600 mb-4">
            Ton diagnostic est déjà enregistré. Si tu veux le refaire, clique ci-dessous.
          </p>
          <button
            onClick={() => navigate("/diagnostic?retake=1")}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Refaire le diagnostic
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full mt-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Retour Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <ErrorAlert
            message={error}
            onRetry={() => {
              if (studentId) startDiagnostic(studentId);
              else window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (result) {
    const scorePct = Math.round((result?.score || 0) * 100);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl w-full">
          <h1 className="text-2xl font-bold mb-2">Résultat du diagnostic</h1>
          <p className="text-gray-700 mb-2">
            Score : <span className="font-bold">{scorePct}%</span>
          </p>
          <p className="text-gray-700 mb-4">
            Niveau recommandé :{" "}
            <span className="font-bold">{result.levelRecommendation || "BEGINNER"}</span>
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Aller au Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = Array.isArray(test?.questions) ? test.questions : [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-2">Test diagnostique</h1>
        <p className="text-gray-600 mb-6">Répondez aux questions pour déterminer votre niveau.</p>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        {starting && <LoadingSpinner text="Démarrage du test..." />}

        {questions.map((q, idx) => (
          <div key={q.id || idx} className="mb-6 p-4 rounded-lg border border-gray-200">
            <p className="font-semibold mb-3">
              {idx + 1}. {q.questionText}
            </p>

            <div className="space-y-2">
              {(q.options || []).map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={opt}
                    checked={answers[idx] === opt}
                    onChange={() => setAnswer(idx, opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          disabled={submitting || questions.length === 0}
          onClick={submitDiagnostic}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
        >
          {submitting ? "Soumission..." : "Soumettre le diagnostic"}
        </button>
      </div>
    </div>
  );
};

export default DiagnosticTest;
