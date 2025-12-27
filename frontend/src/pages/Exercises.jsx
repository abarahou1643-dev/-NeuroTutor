// src/pages/Exercises.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Clock,
  Star,
  Play,
  RefreshCw,
} from "lucide-react";

const API_BASE = "http://localhost:8083/api/v1";

const levelOrder = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2 };

const Exercises = () => {
  const navigate = useNavigate();

  const [userLevel, setUserLevel] = useState("BEGINNER");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI filters
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [topic, setTopic] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    const lvl = localStorage.getItem("userLevel") || "BEGINNER";
    setUserLevel(lvl);

    loadExercises(lvl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadExercises = async (lvl) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // ✅ ton backend supporte déjà ?level=...
      const res = await fetch(
        `${API_BASE}/exercises?level=${encodeURIComponent(lvl)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Erreur chargement exercices");
      }

      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur chargement exercices");
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const allTopics = useMemo(() => {
    const set = new Set();
    exercises.forEach((e) => {
      (e.topics || []).forEach((t) => set.add(t));
    });
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [exercises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return exercises.filter((e) => {
      // Search
      const haystack = [
        e.title,
        e.description,
        e.problemStatement,
        (e.topics || []).join(" "),
        (e.tags || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !haystack.includes(q)) return false;

      // Difficulty
      if (difficulty !== "ALL" && e.difficulty !== difficulty) return false;

      // Topic
      if (topic !== "ALL") {
        const topics = Array.isArray(e.topics) ? e.topics : [];
        if (!topics.includes(topic)) return false;
      }

      return true;
    });
  }, [exercises, query, difficulty, topic]);

  const recommended = useMemo(() => {
    // simple logique : exercices <= niveau user + 1
    const u = levelOrder[userLevel] ?? 0;
    return exercises.filter((e) => {
      const d = levelOrder[e.difficulty] ?? 0;
      return d <= u + 1;
    });
  }, [exercises, userLevel]);

  const handleReset = () => {
    setQuery("");
    setDifficulty("ALL");
    setTopic("ALL");
  };

  const badgeDifficulty = (d) => {
    if (d === "BEGINNER") return "bg-emerald-500 text-white";
    if (d === "INTERMEDIATE") return "bg-amber-500 text-white";
    if (d === "ADVANCED") return "bg-rose-500 text-white";
    return "bg-gray-500 text-white";
  };

  const startExercise = (exercise) => {
    navigate(`/exercise/${exercise.id}`, { state: { exercise } });
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </button>

        <div className="max-w-5xl mx-auto bg-white border rounded-2xl p-6">
          <p className="text-red-600 font-medium">Erreur: {error}</p>
          <button
            onClick={() => loadExercises(userLevel)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour au tableau de bord
      </button>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Exercices Mathématiques
          </h1>
          <p className="text-gray-600 mt-1">
            Améliorez vos compétences avec des exercices adaptés à votre niveau
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Niveau:</span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
              {userLevel}
            </span>
          </div>
        </div>

        {/* Recommended */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              Recommandé pour vous
            </h2>
            <span className="text-sm text-gray-500">
              {recommended.slice(0, 3).length} recommandé(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map((e) => (
              <div
                key={e.id}
                className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeDifficulty(
                      e.difficulty
                    )}`}
                  >
                    Recommandé
                  </span>
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-gray-900">
                      {e.points ?? 0}
                    </span>
                  </div>
                </div>

                <h3 className="mt-3 font-bold text-gray-900">{e.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {e.description}
                </p>

                <button
                  onClick={() => startExercise(e)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:opacity-90"
                >
                  <Play className="h-4 w-4" />
                  Commencer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-96 border rounded-xl px-3 py-2"
                placeholder="Rechercher un exercice..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="border rounded-xl px-3 py-2"
                >
                  <option value="ALL">Difficulté: Tous</option>
                  <option value="BEGINNER">Débutant</option>
                  <option value="INTERMEDIATE">Intermédiaire</option>
                  <option value="ADVANCED">Avancé</option>
                </select>
              </div>

              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border rounded-xl px-3 py-2"
              >
                {allTopics.map((t) => (
                  <option key={t} value={t}>
                    Thème: {t === "ALL" ? "Tous" : t}
                  </option>
                ))}
              </select>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Tous les exercices</h2>
          <span className="text-sm text-gray-500">
            {filtered.length} exercice(s) disponible(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{e.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {e.description}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeDifficulty(
                    e.difficulty
                  )}`}
                >
                  {e.difficulty === "BEGINNER"
                    ? "Débutant"
                    : e.difficulty === "INTERMEDIATE"
                    ? "Intermédiaire"
                    : "Avancé"}
                </span>
              </div>

              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                {e.problemStatement}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(e.topics || []).slice(0, 3).map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{e.estimatedTime ?? 0} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">{e.points ?? 0} pts</span>
                  </div>
                </div>

                <button
                  onClick={() => startExercise(e)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:opacity-90"
                >
                  <Play className="h-4 w-4" />
                  Commencer
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white border rounded-2xl p-6 mt-6 text-gray-600">
            Aucun exercice ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  );
};

export default Exercises;
