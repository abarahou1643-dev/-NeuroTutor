// src/pages/Profile.jsx - VERSION COMPLÈTE
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Award, Target, TrendingUp,
  Edit, Save, X, Lock, Bell, Globe, Moon, Sun,
  BookOpen, Clock, CheckCircle, BarChart3
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { useTheme } from '../contexts/ThemeContext';

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditedUser({ ...parsedUser });

      // Charger les statistiques
      const mockStats = {
        completedExercises: 42,
        averageScore: 78,
        totalTime: 1250, // minutes
        currentStreak: 7,
        level: localStorage.getItem('userLevel') || 'BEGINNER',
        rank: 15,
        topicsMastered: ['Algèbre', 'Géométrie', 'Calcul'],
        weakTopics: ['Probabilités', 'Statistiques']
      };

      setStats(mockStats);
    } catch (error) {
      setError('Erreur de chargement des données utilisateur');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedUser.firstName || !editedUser.lastName) {
      alert('Le prénom et le nom sont obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Simuler une mise à jour API
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('user', JSON.stringify(editedUser));
      setUser(editedUser);
      setIsEditing(false);

      alert('Profil mis à jour avec succès !');
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userLevel');
    localStorage.removeItem('diagnosticResult');
    navigate('/login');
  };

  if (loading && !user) {
    return <LoadingSpinner text="Chargement du profil..." />;
  }

  if (error && !user) {
    return <ErrorAlert message={error} onRetry={loadUserData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="h-12 w-12 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 p-2 bg-indigo-500 rounded-full hover:bg-indigo-600 transition">
                    <Edit className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.firstName}
                      onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                      className="bg-transparent border-b border-white/50 text-white placeholder-white/70"
                      placeholder="Prénom"
                    />
                  ) : (
                    user.firstName + ' ' + user.lastName
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-indigo-100">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="h-4 w-4" />
                  <span className="text-yellow-300 font-medium">
                    {stats?.level || 'NON DÉFINI'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
              >
                ← Tableau de bord
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Informations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section informations personnelles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.firstName}
                        onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg">{user.firstName}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.lastName}
                        onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg">{user.lastName}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">{user.email}</div>
                  <p className="text-sm text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg capitalize">{user.role.toLowerCase()}</div>
                </div>
              </div>
            </div>

            {/* Section statistiques */}
            {stats && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5" />
                  Mes statistiques
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.completedExercises}</div>
                    <div className="text-gray-600">Exercices</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                    <div className="text-gray-600">Score moyen</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.floor(stats.totalTime / 60)}h</div>
                    <div className="text-gray-600">Temps total</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.currentStreak} jours</div>
                    <div className="text-gray-600">Série actuelle</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Points forts</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.topicsMastered.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">À améliorer</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.weakTopics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Préférences */}
          <div className="space-y-6">
            {/* Section préférences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5" />
                Préférences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">Mode sombre</p>
                      <p className="text-sm text-gray-500">Activer/désactiver le thème sombre</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      isDark ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-gray-500">Recevoir les notifications</p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Langue</p>
                      <p className="text-sm text-gray-500">Français</p>
                    </div>
                  </div>
                  <select className="border border-gray-300 rounded-lg px-3 py-1">
                    <option>Français</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section progression */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Progression</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Exercices complétés</span>
                  <span className="font-bold">{stats?.completedExercises || 0}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (stats?.completedExercises || 0))}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <span className="text-gray-700">Niveau suivant</span>
                  <span className="font-bold text-indigo-600">
                    {stats?.level === 'BEGINNER' ? 'INTERMÉDIAIRE' :
                     stats?.level === 'INTERMEDIATE' ? 'AVANCÉ' : 'EXPERT'}
                  </span>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('/diagnostic')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition w-full"
                  >
                    Refaire le test de niveau
                  </button>
                </div>
              </div>
            </div>

            {/* Section sécurité */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5" />
                Sécurité
              </h2>

              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                  <p className="font-medium">Changer le mot de passe</p>
                  <p className="text-sm text-gray-500">Mettre à jour votre mot de passe</p>
                </button>

                <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                  <p className="font-medium">Sécurité en deux étapes</p>
                  <p className="text-sm text-gray-500">Ajouter une couche de sécurité</p>
                </button>

                <button className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition text-red-700">
                  <p className="font-medium">Supprimer le compte</p>
                  <p className="text-sm">Cette action est irréversible</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;