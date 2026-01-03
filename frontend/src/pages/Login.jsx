// src/pages/Login.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain, LogIn, Mail, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, refreshMe } = useAuth();

  const [formData, setFormData] = useState({
    email: "test@neurotutor.com",
    password: "test123",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ particules stables (pas de Math.random à chaque render)
  const particles = useMemo(() => {
    return [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      dur: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const fillTestUser = () => {
    setFormData({ email: "test@neurotutor.com", password: "test123" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(formData.email, formData.password);

    if (!res.success) {
      setError(res.error || "Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    // ✅ user complet via /me
    const me = await refreshMe();

    // si jamais me est null (token invalide)
    if (!me) {
      setError("Impossible de récupérer votre profil. Reconnectez-vous.");
      setLoading(false);
      return;
    }

    // ✅ routing selon diagnostic
    const role = String(me.role || "").toUpperCase().replace("ROLE_", "");
    if (role === "STUDENT" && me.diagnosticCompleted === true) {
      // stocker niveau si dispo
      if (me.level) localStorage.setItem("userLevel", me.level);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/diagnostic", { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: p.left,
              top: p.top,
              animation: `float ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-2xl shadow-purple-500/30 animate-glow">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-display">
            Neuro
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tutor
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <p className="text-lg">Apprentissage adaptatif intelligent</p>
            <Sparkles className="h-4 w-4 text-purple-300" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Connexion</h2>
                <p className="text-slate-300 mt-1">Accédez à votre espace d'apprentissage</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-white placeholder-slate-400 focus:bg-white/10"
                  placeholder="exemple@neurotutor.com"
                />
                <div className="absolute right-3 top-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-white placeholder-slate-400 focus:bg-white/10 pr-12"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-1 hover:bg-white/10 rounded transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
                  {error}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={fillTestUser}
                className="w-full py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 rounded-xl font-medium hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 border border-emerald-500/30 hover:border-emerald-400/50 flex items-center justify-center gap-2 group"
              >
                <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Utiliser le compte de démo
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Se connecter
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center text-slate-400">
              Nouveau sur NeuroTutor ?{" "}
              <Link to="/register" className="text-cyan-300 font-medium hover:text-cyan-200 transition hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">© 2024 NeuroTutor.</p>
          <p className="text-slate-600 text-xs mt-1">IA & pédagogie personnalisée</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
