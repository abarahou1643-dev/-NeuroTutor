// src/App.jsx - VERSION FINALE (avec redirection selon rôle + diagnostic) - CORRIGÉE
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DiagnosticTest from "./pages/DiagnosticTest";
import Exercises from "./pages/Exercises";
import ExercisePage from "./pages/ExercisePage";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";

// Style du conteneur principal
const appContainerStyle = {
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  flex: 1,
};

// Style pour le conteneur de page
const pageContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  overflow: "auto",
};

// Style pour la page 404
const notFoundStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  padding: "1rem",
  textAlign: "center",
};

// ✅ Redirection racine basée sur AuthContext (au lieu de localStorage direct)
const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Chargement..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // si user n'est pas encore prêt (rare) -> dashboard
  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Si diagnostic pas fait (seulement STUDENT)
  if (user.role === "STUDENT" && user.diagnosticCompleted === false) {
    return <Navigate to="/diagnostic" replace />;
  }

  // ✅ Redirection par rôle (pour l’instant tout vers dashboard)
  if (user.role === "TEACHER") return <Navigate to="/dashboard" replace />;
  if (user.role === "ADMIN") return <Navigate to="/dashboard" replace />;

  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <div style={appContainerStyle}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Routes publiques */}
              <Route path="/login" element={<div style={pageContainerStyle}><Login /></div>} />
              <Route path="/register" element={<div style={pageContainerStyle}><Register /></div>} />

              {/* ✅ Racine */}
              <Route path="/" element={<RootRedirect />} />

              {/* Routes protégées */}
              <Route
                path="/diagnostic"
                element={
                  <ProtectedRoute requireDiagnostic={false}>
                    <div style={pageContainerStyle}><DiagnosticTest /></div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireDiagnostic={true}>
                    <div style={pageContainerStyle}><Dashboard /></div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/exercises"
                element={
                  <ProtectedRoute requireDiagnostic={true}>
                    <div style={pageContainerStyle}><Exercises /></div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/exercise/:id"
                element={
                  <ProtectedRoute requireDiagnostic={true}>
                    <div style={pageContainerStyle}><ExercisePage /></div>
                  </ProtectedRoute>
                }
              />

              {/* ✅ Profil : je conseille requireDiagnostic={false} */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireDiagnostic={false}>
                    <div style={pageContainerStyle}><Profile /></div>
                  </ProtectedRoute>
                }
              />

              {/* Page 404 */}
              <Route
                path="*"
                element={
                  <div style={notFoundStyle}>
                    <div>
                      <h1
                        style={{
                          fontSize: "3rem",
                          fontWeight: "bold",
                          color: "var(--text-primary, #111827)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        404
                      </h1>
                      <p
                        style={{
                          fontSize: "1.125rem",
                          color: "var(--text-secondary, #4B5563)",
                          marginBottom: "1.5rem",
                        }}
                      >
                        Page non trouvée
                      </p>
                      <a
                        href="/"
                        style={{
                          display: "inline-block",
                          padding: "0.5rem 1rem",
                          backgroundColor: "#2563eb",
                          color: "white",
                          borderRadius: "0.375rem",
                          textDecoration: "none",
                          transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                      >
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
