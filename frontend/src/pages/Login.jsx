// src/pages/Login.jsx - VERSION DESIGN AMÉLIORÉ
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, LogIn, Mail, Lock, User, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'test@neurotutor.com',
    password: 'test123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role
        }));

        // Vérifier si l'utilisateur a déjà passé le test
        const diagnosticResult = await checkDiagnosticStatus(data.userId, data.token);

        if (diagnosticResult) {
          localStorage.setItem('userLevel', diagnosticResult.levelRecommendation);
          localStorage.setItem('diagnosticResult', JSON.stringify(diagnosticResult));
          navigate('/dashboard');
        } else {
          navigate('/diagnostic');
        }

      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur login:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDiagnosticStatus = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8083/api/v1/diagnostic/result/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) return null;
      if (response.ok) return await response.json();
      return null;
    } catch (error) {
      console.error('Erreur vérification diagnostique:', error);
      return null;
    }
  };

  const fillTestUser = () => {
    setFormData({
      email: 'test@neurotutor.com',
      password: 'test123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header avec effet glass */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-2xl shadow-purple-500/30 animate-glow">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-display">
            Neuro<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Tutor</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <p className="text-lg">Apprentissage adaptatif intelligent</p>
            <Sparkles className="h-4 w-4 text-purple-300" />
          </div>
        </div>

        {/* Card avec glass morphism */}
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

            {/* Boutons */}
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

          {/* Info box */}
          <div className="mt-8 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <User className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h4 className="font-medium text-cyan-200">Compte de démonstration :</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-slate-300">
                    <span className="text-cyan-300 font-medium">Email :</span>{' '}
                    <span className="text-white">test@neurotutor.com</span>
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="text-cyan-300 font-medium">Mot de passe :</span>{' '}
                    <span className="text-white">test123</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center text-slate-400">
              Nouveau sur NeuroTutor ?{' '}
              <Link to="/register" className="text-cyan-300 font-medium hover:text-cyan-200 transition hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 NeuroTutor. Plateforme d'apprentissage adaptatif
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Intelligence artificielle & pédagogie personnalisée
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;