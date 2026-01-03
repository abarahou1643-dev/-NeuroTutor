import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Award, Play } from "lucide-react";
import { DIFFICULTY_LEVELS } from "../../utils/constants";

const ExerciseCard = ({ exercise }) => {
  const navigate = useNavigate();

  const exerciseId = exercise?.id || exercise?._id;

  const difficulty = useMemo(() => {
    const key = String(exercise?.difficulty || "BEGINNER").toUpperCase();
    return DIFFICULTY_LEVELS[key] || DIFFICULTY_LEVELS.BEGINNER;
  }, [exercise?.difficulty]);

  const points = Number.isFinite(Number(exercise?.points)) ? Number(exercise.points) : 0;
  const estimatedTime = Number.isFinite(Number(exercise?.estimatedTime))
    ? Number(exercise.estimatedTime)
    : 0;

  const topics = Array.isArray(exercise?.topics) ? exercise.topics : [];

  const handleStartExercise = () => {
    if (!exerciseId) return;

    // ✅ IMPORTANT : passer l'exercice complet au lieu de le re-fetch par ID
    navigate(`/exercise/${exerciseId}`, { state: { exercise } });
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900">
              {exercise?.title || "Exercice"}
            </h3>

            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
              {difficulty.label}
            </span>
          </div>

          {exercise?.description && (
            <p className="text-gray-600">{exercise.description}</p>
          )}
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-yellow-600">
            <Award className="h-4 w-4 fill-current" />
            <span className="font-bold">{points}</span>
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.slice(0, 3).map((topic, idx) => (
            <span
              key={`${topic}-${idx}`}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
            >
              {topic}
            </span>
          ))}
          {topics.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{topics.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{estimatedTime} min</span>
          </div>

          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{points} pts</span>
          </div>
        </div>

        <button
          onClick={handleStartExercise}
          disabled={!exerciseId}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          Commencer
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;
