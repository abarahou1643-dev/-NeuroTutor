// frontend/src/components/ui/ErrorAlert.jsx
import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ message, onRetry = null, className = "" }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"
          aria-hidden="true"
        />

        <div className="flex-1">
          <p className="text-red-800 font-medium">Erreur</p>
          <p className="text-red-700 text-sm mt-1">
            {String(message)}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
