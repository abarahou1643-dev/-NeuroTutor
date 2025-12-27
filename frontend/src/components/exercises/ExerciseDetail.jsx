// src/components/exercises/ExerciseDetail.jsx
import React, { useState } from 'react';
import {
  Clock, Award, Lightbulb, CheckCircle, XCircle,
  ChevronRight, BookOpen, Target, Zap, Send
} from 'lucide-react';

const ExerciseDetail = ({ exercise, onClose, onSubmit }) => {
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      alert('Veuillez entrer une réponse');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler une soumission à l'AI Service
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Feedback simulé
      const isCorrect = Math.random() > 0.5;
      const mockFeedback = {
        isCorrect,
        score: isCorrect ? 1.0 : 0.3,
        feedback: isCorrect
          ? '✅ Excellent ! Votre réponse est correcte.'
          : '❌ Presque ! Vérifiez votre calcul.',
        hints: isCorrect ? [] : ['Revoyez la formule de distance', 'Vérifiez vos calculs'],
        correctAnswer: !isCorrect ? exercise.solution : null
      };

      setFeedback(mockFeedback);

      if (onSubmit) {
        onSubmit({
          exerciseId: exercise.id,
          answer: userAnswer,
          ...mockFeedback
        });
      }

    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{exercise.title}</h2>
              <p className="text-indigo-100 mt-2">{exercise.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Métadonnées */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>{exercise.estimatedTime} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{exercise.points} points</span>
              </div>
              {exercise.topics && exercise.topics.length > 0 && (
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div className="flex gap-1">
                    {exercise.topics.slice(0, 3).map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Énoncé */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Énoncé du problème</h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-gray-800 text-lg">{exercise.problemStatement}</p>
              </div>
            </div>

            {/* Indices (si disponibles) */}
            {exercise.hints && exercise.hints.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-bold text-gray-900">Indices</h3>
                </div>
                <div className="space-y-2">
                  {exercise.hints.map((hint, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <ChevronRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-800">{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zone de réponse */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Votre réponse</h3>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Entrez votre réponse ici..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={!!feedback}
              />

              {!feedback && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !userAnswer.trim()}
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Évaluation en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Soumettre la réponse
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-8 p-6 rounded-xl border ${feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {feedback.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {feedback.isCorrect ? 'Bonne réponse !' : 'Réponse incorrecte'}
                    </h3>
                    <p className={`mt-2 ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {feedback.feedback}
                    </p>

                    {feedback.hints && feedback.hints.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Suggestions :</h4>
                        <ul className="space-y-1">
                          {feedback.hints.map((hint, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span>{hint}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!feedback.isCorrect && feedback.correctAnswer && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-gray-700 font-medium">Réponse correcte :</p>
                        <p className="text-gray-900 font-bold mt-1">{feedback.correctAnswer}</p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => {
                          setUserAnswer('');
                          setFeedback(null);
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Solution (cachée par défaut) */}
            {showSolution && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Solution détaillée</h3>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <p className="text-green-800">{exercise.solution}</p>
                  {exercise.steps && exercise.steps.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-green-900 mb-2">Étapes :</h4>
                      <ol className="space-y-2">
                        {exercise.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-green-800">
                            <span className="font-bold">Étape {idx + 1}:</span>
                            <span>{step}</span>
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
      </div>
    </div>
  );
};

export default ExerciseDetail;