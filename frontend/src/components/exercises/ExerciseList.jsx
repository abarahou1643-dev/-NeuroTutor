// components/exercises/ExerciseList.jsx
import React, { useEffect, useMemo, useState } from "react";
import ExerciseCard from "../dashboard/ExerciseCard";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorAlert from "../common/ErrorAlert";
import { Filter, RefreshCw } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const EXERCISE_API_BASE = "http://127.0.0.1:8083";
const normalizeDifficulty = (d) => String(d || "").toUpperCase();

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

const ExerciseList = () => {
  const { token, isAuthenticated } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");

  const loadExercises = async () => {
    setLoading(true);
    setError("");

    try {
      if (!isAuthenticated || !token) {
        throw new Error("Vous devez être connecté pour charger les exercices.");
      }

      // ✅ ton backend fonctionne avec ?level=BEGINNER
      const lvl = localStorage.getItem("userLevel") || "BEGINNER";
      const url = `${EXERCISE_API_BASE}/api/v1/exercises?level=${encodeURIComponent(lvl)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let msg = `Erreur de chargement (${response.status})`;
        try {
          const data = await response.json();
          if (data?.message) msg = data.message;
        } catch (_) {}
        throw new Error(msg);
      }

      const data = await response.json();
      const list = unwrapList(data);
      setExercises(list);
    } catch (e) {
      console.error("Erreur:", e);
      setError(e?.message || "Impossible de charger les exercices");
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredExercises = useMemo(() => {
    if (selectedDifficulty === "ALL") return exercises;
    return exercises.filter(
      (ex) => normalizeDifficulty(ex.difficulty) === selectedDifficulty
    );
  }, [exercises, selectedDifficulty]);

  if (loading) return <LoadingSpinner text="Chargement des exercices..." />;

  if ((!isAuthenticated || !token) && exercises.length === 0) {
    return (
      <ErrorAlert message="🔒 Vous devez vous connecter pour voir les exercices." />
    );
  }

  if (error && exercises.length === 0) {
    return <ErrorAlert message={error} onRetry={loadExercises} />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Exercices disponibles</h2>
          <p className="text-gray-600 mt-1">
            {filteredExercises.length} exercice(s) trouvé(s)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="ALL">Tous les niveaux</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
            </select>
          </div>

          <button
            onClick={loadExercises}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900">Aucun exercice disponible</h3>
          <p className="text-gray-600 mt-2">
            {selectedDifficulty !== "ALL"
              ? `Aucun exercice de niveau ${selectedDifficulty.toLowerCase()}`
              : "Aucun exercice publié pour le moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id || exercise._id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
