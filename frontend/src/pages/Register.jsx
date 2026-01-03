// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, UserPlus, Mail, Lock, User, Shield, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { authService, saveSession } from "../services/api";
import { STORAGE_KEYS } from "../config";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "STUDENT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Tous les champs sont obligatoires");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Adresse email invalide");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      });

      // Sauvegarder session (token + user)
      saveSession({
        token: data.token,
        user: {
          id: data.userId,
          userId: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        },
      });

      setSuccess("Compte créé avec succès !");
      navigate("/diagnostic", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: "Faible", color: "text-red-500" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: "Très faible", color: "text-red-500" },
      { text: "Faible", color: "text-orange-500" },
      { text: "Moyen", color: "text-yellow-500" },
      { text: "Fort", color: "text-green-500" },
      { text: "Très fort", color: "text-emerald-500" },
    ];

    return { strength, ...levels[strength] };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Neuro<span className="text-indigo-600">Tutor</span>
          </h1>
          <p className="text-gray-600">Rejoignez notre communauté d'apprentissage</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Créer un compte
              </h2>
              <Link
                to="/login"
                className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
            </div>
            <p className="text-gray-600 mt-2">Démarrez votre parcours d'apprentissage personnalisé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Prénom
                  </div>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="exemple@neurotutor.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </div>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Minimum 6 caractères"
              />

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Force du mot de passe :</span>
                    <span className={`text-sm font-medium ${strength.color}`}>{strength.text}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        strength.strength === 0 ? "bg-red-500 w-1/5" :
                        strength.strength === 1 ? "bg-orange-500 w-2/5" :
                        strength.strength === 2 ? "bg-yellow-500 w-3/5" :
                        strength.strength === 3 ? "bg-green-500 w-4/5" :
                        "bg-emerald-500 w-full"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Retapez votre mot de passe"
              />

              {formData.password && formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Les mots de passe ne correspondent pas</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Rôle
                </div>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="STUDENT">Étudiant</option>
                <option value="TEACHER">Enseignant</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" required className="mt-1" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                J'accepte les{" "}
                <a href="#" className="text-indigo-600 hover:underline">conditions d'utilisation</a>{" "}
                et la{" "}
                <a href="#" className="text-indigo-600 hover:underline">politique de confidentialité</a>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {success}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Création du compte...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 NeuroTutor. Tous droits réservés.</p>
          <p className="mt-1">Plateforme d'apprentissage adaptatif</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
