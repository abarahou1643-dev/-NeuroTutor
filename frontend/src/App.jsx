// src/App.jsx - VERSION FINALE (TEACHER dashboard séparé + redirection rôle + diagnostic STUDENT)
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

// ✅ TEACHER pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherExercises from "./pages/teacher/TeacherExercises";

import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";

// Styles
const appContainerStyle = {
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  flex: 1,
};

const pageContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  overflow: "auto",
};

const notFoundStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  padding: "1rem",
  textAlign: "center",
};

// ✅ IMPORTANT: normaliser le rôle (ROLE_TEACHER -> TEACHER)
const normalizeRole = (r) => String(r || "").toUpperCase().replace("ROLE_", "");

// ✅ Redirection racine basée sur AuthContext
const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingSpinner text="Chargement..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <Navigate to="/login" replace />;

  const role = normalizeRole(user.role);

  // ✅ TEACHER : toujours vers dashboard enseignant
  if (role === "TEACHER") return <Navigate to="/teacher" replace />;

  // ✅ ADMIN : (si tu veux plus tard un admin panel)
  if (role === "ADMIN") return <Navigate to="/dashboard" replace />;

  // ✅ STUDENT : diagnostic obligatoire si pas fait
  if (role === "STUDENT" && user.diagnosticCompleted === false) {
    return <Navigate to="/diagnostic" replace />;
  }

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
              <Route
                path="/login"
                element={
                  <div style={pageContainerStyle}>
                    <Login />
                  </div>
                }
              />
              <Route
                path="/register"
                element={
                  <div style={pageContainerStyle}>
                    <Register />
                  </div>
                }
              />

              {/* ✅ Racine */}
              <Route path="/" element={<RootRedirect />} />

              {/* ✅ Diagnostic (uniquement utile pour STUDENT) */}
              <Route
                path="/diagnostic"
                element={
                  <ProtectedRoute requireDiagnostic={false} allowedRoles={["STUDENT", "ADMIN", "TEACHER"]}>
                    <div style={pageContainerStyle}>
                      <DiagnosticTest />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* =========================
                  ✅ ROUTES TEACHER
                 ========================= */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute requireDiagnostic={false} allowedRoles={["TEACHER"]}>
                    <div style={pageContainerStyle}>
                      <TeacherDashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher/exercises"
                element={
                  <ProtectedRoute requireDiagnostic={false} allowedRoles={["TEACHER"]}>
                    <div style={pageContainerStyle}>
                      <TeacherExercises />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* =========================
                  ✅ ROUTES STUDENT
                 ========================= */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireDiagnostic={true} allowedRoles={["STUDENT", "ADMIN"]}>
                    <div style={pageContainerStyle}>
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/exercises"
                element={
                  <ProtectedRoute requireDiagnostic={true} allowedRoles={["STUDENT", "ADMIN"]}>
                    <div style={pageContainerStyle}>
                      <Exercises />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/exercise/:id"
                element={
                  <ProtectedRoute requireDiagnostic={true} allowedRoles={["STUDENT", "ADMIN"]}>
                    <div style={pageContainerStyle}>
                      <ExercisePage />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* ✅ Profil : accessible sans diagnostic */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireDiagnostic={false} allowedRoles={["STUDENT", "TEACHER", "ADMIN"]}>
                    <div style={pageContainerStyle}>
                      <Profile />
                    </div>
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
