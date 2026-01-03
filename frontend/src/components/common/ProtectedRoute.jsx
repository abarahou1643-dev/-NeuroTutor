// src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

// Normalise ROLE_STUDENT -> STUDENT
const normalizeRole = (r) => String(r || "").toUpperCase().replace("ROLE_", "");

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireDiagnostic = false,
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // ⏳ Chargement auth
  if (loading) {
    return <LoadingSpinner text="Chargement..." />;
  }

  // ❌ Pas connecté
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = normalizeRole(user.role);

  // ❌ Rôle non autorisé
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // ❌ Diagnostic requis pour STUDENT
  if (
    requireDiagnostic &&
    role === "STUDENT" &&
    user.diagnosticCompleted === false
  ) {
    return <Navigate to="/diagnostic" replace />;
  }

  // ✅ Autorisé → on affiche la vraie page demandée
  return children;
};

export default ProtectedRoute;
