// components/exercises/ExerciseList.jsx
import React, { useState, useEffect } from 'react';
import ExerciseCard from '../dashboard/ExerciseCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { Filter, RefreshCw } from 'lucide-react';

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const loadExercises = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8083/api/v1/exercises', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      } else {
        throw new Error('Erreur de chargement des exercices');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les exercices');

      // Données mockées pour développement
      const mockExercises = [
        {
          id: '1',
          title: 'Équations linéaires',
          description: 'Résoudre des équations du premier degré',
          difficulty: 'BEGINNER',
          topics: ['Algèbre', 'Équations'],
          estimatedTime: 10,
          points: 20
        },
        {
          id: '2',
          title: 'Géométrie analytique',
          description: 'Calculer la distance entre deux points',
          difficulty: 'BEGINNER',
          topics: ['Géométrie', 'Coordonnées'],
          estimatedTime: 15,
          points: 25
        }
      ];
      setExercises(mockExercises);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const filteredExercises = selectedDifficulty === 'ALL'
    ? exercises
    : exercises.filter(ex => ex.difficulty === selectedDifficulty);

  const handleStartExercise = (exercise) => {
    console.log('Démarrer exercice:', exercise);
    alert(`🚀 Démarrage de l'exercice: ${exercise.title}`);
  };

  if (loading) {
    return <LoadingSpinner text="Chargement des exercices..." />;
  }

  if (error && exercises.length === 0) {
    return (
      <ErrorAlert
        message={error}
        onRetry={loadExercises}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Exercices disponibles
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredExercises.length} exercice(s) trouvé(s)
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Difficulty Filter */}
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

          {/* Refresh Button */}
          <button
            onClick={loadExercises}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900">Aucun exercice disponible</h3>
          <p className="text-gray-600 mt-2">
            {selectedDifficulty !== 'ALL'
              ? `Aucun exercice de niveau ${selectedDifficulty.toLowerCase()}`
              : 'Créez votre premier exercice'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onStart={handleStartExercise}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseList;