// frontend/src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, requireDiagnostic = false, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Gestion des rôles (optionnel)
  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // ✅ Diagnostic uniquement pour STUDENT
  if (requireDiagnostic) {
    if (user?.role === "STUDENT" && user?.diagnosticCompleted === false) {
      return <Navigate to="/diagnostic" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
