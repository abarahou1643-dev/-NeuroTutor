// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Brain,
  BookOpen,
  Award,
  TrendingUp,
  LogOut,
  Play,
  Clock,
  Star,
  BarChart3,
  Lightbulb,
  Zap,
  Sparkles,
  Rocket,
  Timer,
  Crown,
  TargetIcon,
  BrainCircuit,
  CheckCircle,
  XCircle,
} from "lucide-react";

const EXERCISE_API = "http://localhost:8083/api/v1";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [userLevel, setUserLevel] = useState("BEGINNER");
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDiagnosticResult, setShowDiagnosticResult] = useState(false);
  const [activeTab, setActiveTab] = useState("recommended");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const level = localStorage.getItem("userLevel") || "BEGINNER";
    setUserLevel(level);

    const diagnostic = localStorage.getItem("diagnosticResult");
    if (diagnostic) setDiagnosticResult(JSON.parse(diagnostic));

    if (location.state?.diagnosticCompleted) {
      setShowDiagnosticResult(true);
      setTimeout(() => setShowDiagnosticResult(false), 5000);
    }

    loadData(parsedUser, level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location]);

  const loadData = async (parsedUser, level) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // ✅ IMPORTANT : on force userId = email (car tes submissions utilisent email)
      const userId = parsedUser?.email || "test@neurotutor.com";
      console.log("Dashboard userId used:", userId);

      // 1) Charger exercices selon le niveau
      const exRes = await fetch(
        `${EXERCISE_API}/exercises?level=${encodeURIComponent(level)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!exRes.ok) throw new Error("Erreur chargement exercices");
      const exData = await exRes.json();
      setExercises(Array.isArray(exData) ? exData : []);

      // 2) Charger submissions de l’utilisateur
      const subRes = await fetch(
        `${EXERCISE_API}/submissions/user/${encodeURIComponent(userId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // si aucun historique -> backend peut renvoyer [] ou 404 selon ton code
      if (subRes.status === 404) {
        setSubmissions([]);
      } else {
        if (!subRes.ok) throw new Error("Erreur chargement tentatives");
        const subData = await subRes.json();
        setSubmissions(Array.isArray(subData) ? subData : []);
      }
    } catch (err) {
      console.error(err);
      // on garde l’app vivante même si une partie échoue
      setExercises([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = (exercise) => {
    navigate(`/exercise/${exercise.id}`, { state: { exercise } });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "BEGINNER":
        return "from-emerald-500 to-green-500";
      case "INTERMEDIATE":
        return "from-amber-500 to-yellow-500";
      case "ADVANCED":
        return "from-rose-500 to-red-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case "BEGINNER":
        return <TargetIcon className="h-5 w-5" />;
      case "INTERMEDIATE":
        return <TrendingUp className="h-5 w-5" />;
      case "ADVANCED":
        return <Rocket className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  // ✅ map exerciseId -> title
  const exerciseTitleById = useMemo(() => {
    const map = {};
    (exercises || []).forEach((e) => {
      map[e.id] = e.title;
    });
    return map;
  }, [exercises]);

  // ✅ Stats calculées à partir de submissions
  const stats = useMemo(() => {
    const total = submissions.length;
    const corrects = submissions.filter((s) => s.correct === true).length;
    const points = submissions.reduce((acc, s) => acc + (s.scoreEarned || 0), 0);

    const successRate = total > 0 ? Math.round((corrects / total) * 100) : 0;
    const avgPoints = total > 0 ? Math.round(points / total) : 0;

    return {
      total,
      corrects,
      points,
      successRate,
      avgPoints,
    };
  }, [submissions]);

  // derniers essais (5)
  const recent = useMemo(() => {
    return (submissions || []).slice(0, 5);
  }, [submissions]);

  const recommendedExercises = useMemo(() => {
    // tu peux améliorer la logique de recommandation ensuite
    return (exercises || []).slice(0, 6);
  }, [exercises]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Utilisateur non trouvé. Reconnecte-toi.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      {/* Notification de résultat diagnostique */}
      {showDiagnosticResult && diagnosticResult && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-2xl p-4 max-w-sm backdrop-blur-sm border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">🎉 Test diagnostique terminé !</h3>
                <p className="text-sm opacity-90">
                  Votre niveau: <span className="font-bold">{userLevel}</span>{" "}
                  ({Math.round((diagnosticResult?.score || 0) * 100)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Neuro
                  <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                    Tutor
                  </span>
                </span>
              </div>

              <div
                className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${getLevelColor(
                  userLevel
                )} text-white flex items-center gap-2 shadow-md`}
              >
                {getLevelIcon(userLevel)}
                <span className="font-medium">{userLevel}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/diagnostic")}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition shadow-md"
                >
                  <TargetIcon className="h-4 w-4" />
                  Refaire le test
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition shadow-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {user.firstName}
                </span>{" "}
                👋
              </h1>
              <p className="text-gray-600 mt-2">
                Bienvenue sur votre espace d'apprentissage adaptatif
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/exercises")}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition shadow-md"
              >
                Voir tous les exercices
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Mon profil
              </button>
            </div>
          </div>

          {/* Diagnostic summary */}
          {diagnosticResult && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-4 border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Score diagnostique</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((diagnosticResult?.score || 0) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {diagnosticResult?.recommendedTopics?.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-600">À travailler</p>
                      <p className="font-medium text-gray-900">
                        {diagnosticResult.recommendedTopics
                          .slice(0, 2)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Progression recommandée
                    </p>
                    <p className="font-medium text-gray-900">
                      {userLevel === "BEGINNER"
                        ? "Algèbre → Géométrie"
                        : userLevel === "INTERMEDIATE"
                        ? "Calcul → Statistiques"
                        : "Analyse → Problèmes complexes"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.total}
              </span>
            </div>
            <h3 className="text-gray-700 font-medium mb-1">
              Exercices complétés
            </h3>
            <p className="text-sm text-gray-500">Total tentatives enregistrées</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-50">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.successRate}%
              </span>
            </div>
            <h3 className="text-gray-700 font-medium mb-1">% réussite</h3>
            <p className="text-sm text-gray-500">
              Corrects : {stats.corrects}/{stats.total}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-50">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.points}
              </span>
            </div>
            <h3 className="text-gray-700 font-medium mb-1">Points cumulés</h3>
            <p className="text-sm text-gray-500">Somme des points gagnés</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-50">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.avgPoints}
              </span>
            </div>
            <h3 className="text-gray-700 font-medium mb-1">Score moyen</h3>
            <p className="text-sm text-gray-500">points / exercice</p>
          </div>
        </div>

        {/* Dernières tentatives */}
        <div className="bg-white rounded-2xl p-6 shadow border mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Dernières tentatives
          </h2>

          {recent.length === 0 ? (
            <p className="text-gray-500">Aucune tentative pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {exerciseTitleById[s.exerciseId] || s.exerciseId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Réponse: <b>{s.answer}</b> • Points:{" "}
                      <b>{s.scoreEarned || 0}</b>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.correct ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">
                          Correct
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-600" />
                        <span className="text-rose-700 font-medium">
                          Faux
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercices recommandés */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="h-6 w-6 text-amber-500" />
                Exercices recommandés
              </h2>
              <p className="text-gray-600 mt-1">
                Sélectionnés spécialement pour votre niveau
              </p>
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              {["recommended", "beginner", "challenge"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-white shadow-md text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "recommended" && "Recommandés"}
                  {tab === "beginner" && "Pour débuter"}
                  {tab === "challenge" && "Défis"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-2xl border shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-600">
                      {exercise.difficulty}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {exercise.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {exercise.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-gray-900">
                      {exercise.points || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{exercise.estimatedTime || 0} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">
                      {exercise.points || 0} pts
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartExercise(exercise)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:opacity-90"
                >
                  <Play className="h-4 w-4" />
                  Commencer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Récompenses */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            Récompenses à débloquer
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "🏆", label: "Premier exercice", locked: stats.total < 1 },
              { icon: "🚀", label: "Série de 5", locked: stats.total < 5 },
              { icon: "⭐", label: "Score parfait", locked: stats.successRate < 100 || stats.total < 3 },
              { icon: "📚", label: "10 exercices", locked: stats.total < 10 },
              { icon: "⚡", label: "Rapide", locked: true },
              { icon: "🎯", label: "Précis", locked: stats.successRate < 80 },
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-4 transition-all ${
                  badge.locked
                    ? "bg-white/50 border border-amber-200 opacity-50"
                    : "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg"
                }`}
              >
                <span className="text-2xl mb-2">{badge.icon}</span>
                <span className="text-xs text-center font-medium">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 to-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">
                  Neuro
                  <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                    Tutor
                  </span>
                </span>
                <p className="text-sm text-slate-400 mt-1">
                  Apprentissage adaptatif intelligent
                </p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-slate-400">© 2024 NeuroTutor. Tous droits réservés.</p>
              <p className="text-sm text-slate-500 mt-1">
                Connecté en tant que {user.email} • Niveau: {userLevel}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
